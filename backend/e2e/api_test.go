package e2e

import (
	"net/http"
	"strings"
	"sync"
	"testing"

	"github.com/johann-vu/online-furniture-storage/internal/encryption"
)

func TestCreateOfferEncryptsContactAndAssignsNextNumber(t *testing.T) {
	for name, dataDir := range map[string]string{"fresh": "", "legacy": legacyDataDir} {
		t.Run(name, func(t *testing.T) {
			s := startServer(t, dataDir)

			var before int
			if err := s.app.DB().NewQuery("SELECT COALESCE(MAX(number), 0) FROM offers").Row(&before); err != nil {
				t.Fatal(err)
			}

			form := offerForm("Kommode")
			form["number"] = "1" // must be ignored
			res := s.multipart("/api/collections/offers/records", form, map[string][]byte{"photo.png": testPhoto})
			expectStatus(t, res, http.StatusOK)

			stored, err := s.app.FindRecordById("offers", res.body["id"].(string))
			if err != nil {
				t.Fatal(err)
			}
			if stored.GetInt("number") != before+1 {
				t.Fatalf("expected number %d, got %d", before+1, stored.GetInt("number"))
			}
			if !encryption.IsCurrent(stored.GetString("name")) || !encryption.IsCurrent(stored.GetString("phone")) {
				t.Fatalf("contact details are not encrypted: %q %q", stored.GetString("name"), stored.GetString("phone"))
			}
			if strings.Contains(string(res.raw), "Max Mustermann") {
				t.Fatalf("create response contains the plaintext name: %s", res.raw)
			}
		})
	}
}

func TestConcurrentOffersGetUniqueNumbers(t *testing.T) {
	s := startServer(t, "")

	const count = 5 // stays within the rate limit for guests
	var wg sync.WaitGroup
	statuses := make([]int, count)
	for i := range count {
		wg.Add(1)
		go func() {
			defer wg.Done()
			statuses[i] = s.multipart("/api/collections/offers/records", offerForm("Stuhl"), nil).status
		}()
	}
	wg.Wait()

	for _, status := range statuses {
		if status != http.StatusOK {
			t.Fatalf("expected all creates to succeed, got %v", statuses)
		}
	}

	records, err := s.app.FindAllRecords("offers")
	if err != nil {
		t.Fatal(err)
	}
	seen := map[int]bool{}
	for _, r := range records {
		seen[r.GetInt("number")] = true
	}
	for n := 1; n <= count; n++ {
		if !seen[n] {
			t.Fatalf("expected numbers 1..%d without gaps, got %v", count, seen)
		}
	}
}

func TestOfferCreationIsRateLimited(t *testing.T) {
	s := startServer(t, "")

	for range 5 {
		expectStatus(t, s.multipart("/api/collections/offers/records", offerForm("Regal"), nil), http.StatusOK)
	}
	expectStatus(t, s.multipart("/api/collections/offers/records", offerForm("Regal"), nil), http.StatusTooManyRequests)
}

func TestOffersAreOnlyVisibleToStaff(t *testing.T) {
	s := startServer(t, legacyDataDir)

	res := s.json(http.MethodGet, "/api/collections/offers/records", "", nil)
	expectStatus(t, res, http.StatusOK)
	if res.body["totalItems"].(float64) != 0 {
		t.Fatalf("guests can list offers: %s", res.raw)
	}

	expectStatus(t, s.json(http.MethodGet, "/api/collections/offers/records/"+s.offerID(legacyOfferSofa), "", nil), http.StatusNotFound)
	expectStatus(t, s.json(http.MethodDelete, "/api/collections/offers/records/"+s.offerID(legacyOfferSofa), "", nil), http.StatusNotFound)

	token := s.login(legacyUsername, legacyPassword)
	res = s.json(http.MethodGet, "/api/collections/offers/records?sort=-created", token, nil)
	expectStatus(t, res, http.StatusOK)
	if res.body["totalItems"].(float64) != 4 {
		t.Fatalf("expected staff to see all 4 offers: %s", res.raw)
	}

	expectStatus(t, s.json(http.MethodDelete, "/api/collections/offers/records/"+s.offerID(legacyOfferSofa), token, nil), http.StatusNoContent)
}

func TestPublicSignUpIsDisabled(t *testing.T) {
	s := startServer(t, legacyDataDir)

	res := s.json(http.MethodPost, "/api/collections/users/records", "", map[string]string{
		"username":        "intruder",
		"password":        "intruder-password",
		"passwordConfirm": "intruder-password",
	})
	expectStatus(t, res, http.StatusForbidden)
}

func TestUserCanChangeOwnPassword(t *testing.T) {
	s := startServer(t, legacyDataDir)
	token := s.login(legacyUsername, legacyPassword)

	helper, err := s.app.FindFirstRecordByData("users", "username", legacyUsername)
	if err != nil {
		t.Fatal(err)
	}

	res := s.json(http.MethodPatch, "/api/collections/users/records/"+helper.Id, token, map[string]string{
		"oldPassword":     legacyPassword,
		"password":        "new-helper-password",
		"passwordConfirm": "new-helper-password",
	})
	expectStatus(t, res, http.StatusOK)

	s.login(legacyUsername, "new-helper-password")
}

func TestCommentsCanOnlyBeWrittenInOwnName(t *testing.T) {
	s := startServer(t, legacyDataDir)

	helper, err := s.app.FindFirstRecordByData("users", "username", legacyUsername)
	if err != nil {
		t.Fatal(err)
	}
	other := s.createUser("other", "other-password-123", "Olaf Other")

	helperToken := s.login(legacyUsername, legacyPassword)
	otherToken := s.login("other", "other-password-123")

	// impersonating another author is rejected
	res := s.json(http.MethodPost, "/api/collections/comments/records", otherToken, map[string]string{
		"offer":  s.offerID(legacyOfferSofa),
		"author": helper.Id,
		"text":   "Ich bin Helga",
	})
	expectStatus(t, res, http.StatusBadRequest)

	res = s.json(http.MethodPost, "/api/collections/comments/records", otherToken, map[string]string{
		"offer":  s.offerID(legacyOfferSofa),
		"author": other.Id,
		"text":   "Ich hole es ab",
	})
	expectStatus(t, res, http.StatusOK)
	commentPath := "/api/collections/comments/records/" + res.body["id"].(string)

	// other staff members can read but not change or delete it
	expectStatus(t, s.json(http.MethodGet, commentPath, helperToken, nil), http.StatusOK)
	expectStatus(t, s.json(http.MethodPatch, commentPath, helperToken, map[string]string{"text": "geändert"}), http.StatusNotFound)
	expectStatus(t, s.json(http.MethodDelete, commentPath, helperToken, nil), http.StatusNotFound)

	// the author can't hand the comment over to someone else
	expectStatus(t, s.json(http.MethodPatch, commentPath, otherToken, map[string]string{"author": helper.Id}), http.StatusNotFound)

	expectStatus(t, s.json(http.MethodPatch, commentPath, otherToken, map[string]string{"text": "Ich hole es morgen ab"}), http.StatusOK)
	expectStatus(t, s.json(http.MethodDelete, commentPath, otherToken, nil), http.StatusNoContent)
}

func TestFrontendIsServed(t *testing.T) {
	s := startServer(t, "")

	for _, path := range []string{"/", "/admin/overview"} {
		res := s.request(http.MethodGet, path, "", nil, "")
		expectStatus(t, res, http.StatusOK)
		if !strings.Contains(string(res.raw), "<title>frontend</title>") {
			t.Fatalf("%s did not serve the frontend: %s", path, res.raw)
		}
	}
}
