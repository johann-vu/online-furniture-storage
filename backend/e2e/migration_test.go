package e2e

import (
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/johann-vu/online-furniture-storage/internal/encryption"
)

// The tests in this file verify that data created with PocketBase v0.22
// is still usable after the upgrade.

func TestLegacyUserCanLogInWithUsername(t *testing.T) {
	s := startServer(t, legacyDataDir)

	res := s.json(http.MethodPost, "/api/collections/users/auth-with-password", "", map[string]string{
		"identity": legacyUsername,
		"password": legacyPassword,
	})
	expectStatus(t, res, http.StatusOK)

	record := res.body["record"].(map[string]any)
	if record["name"] != "Helga Helper" {
		t.Fatalf("unexpected user record: %v", record)
	}
}

func TestLegacyAdminBecomesSuperuser(t *testing.T) {
	s := startServer(t, legacyDataDir)

	res := s.json(http.MethodPost, "/api/collections/_superusers/auth-with-password", "", map[string]string{
		"identity": "admin@example.com",
		"password": "admin-password-123",
	})
	expectStatus(t, res, http.StatusOK)
}

func TestLegacyOffersAreReencryptedAndDecryptedOnView(t *testing.T) {
	s := startServer(t, legacyDataDir)

	stored, err := s.app.FindRecordById("offers", s.offerID(legacyOfferSofa))
	if err != nil {
		t.Fatal(err)
	}
	for _, field := range []string{"name", "phone"} {
		if !encryption.IsCurrent(stored.GetString(field)) {
			t.Fatalf("%s was not re-encrypted: %q", field, stored.GetString(field))
		}
	}

	token := s.login(legacyUsername, legacyPassword)
	res := s.json(http.MethodGet, "/api/collections/offers/records/"+s.offerID(legacyOfferSofa), token, nil)
	expectStatus(t, res, http.StatusOK)

	if res.body["name"] != "Max Mustermann" || res.body["phone"] != "+49 170 1234567" {
		t.Fatalf("offer was not decrypted: %s", res.raw)
	}
	if res.body["created"] == "" || res.body["title"] != "Sofa" {
		t.Fatalf("offer fields were not migrated: %s", res.raw)
	}
}

func TestLegacyDuplicateOfferNumbersAreResolved(t *testing.T) {
	s := startServer(t, legacyDataDir)

	records, err := s.app.FindAllRecords("offers")
	if err != nil {
		t.Fatal(err)
	}

	seen := map[int]string{}
	for _, r := range records {
		number := r.GetInt("number")
		if other, ok := seen[number]; ok {
			t.Fatalf("offers %q and %q share number %d", other, r.Id, number)
		}
		seen[number] = r.Id
	}

	// the newer of the two offers with number 2 gets the next free number
	table, err := s.app.FindRecordById("offers", s.offerID(legacyOfferTable))
	if err != nil {
		t.Fatal(err)
	}
	if table.GetInt("number") != 4 {
		t.Fatalf("expected the duplicate to be renumbered to 4, got %d", table.GetInt("number"))
	}
}

func TestLegacyProtectedPhotosRequireFileToken(t *testing.T) {
	s := startServer(t, legacyDataDir)

	offer, err := s.app.FindRecordById("offers", s.offerID(legacyOfferSofa))
	if err != nil {
		t.Fatal(err)
	}
	photos := offer.GetStringSlice("photos")
	if len(photos) != 1 {
		t.Fatalf("expected one photo, got %v", photos)
	}
	photoURL := "/api/files/offers/" + s.offerID(legacyOfferSofa) + "/" + photos[0] + "?thumb=180x180"

	expectStatus(t, s.request(http.MethodGet, photoURL, "", nil, ""), http.StatusNotFound)

	token := s.login(legacyUsername, legacyPassword)
	res := s.json(http.MethodPost, "/api/files/token", token, nil)
	expectStatus(t, res, http.StatusOK)

	fileToken := res.body["token"].(string)
	expectStatus(t, s.request(http.MethodGet, photoURL+"&token="+fileToken, "", nil, ""), http.StatusOK)
}

func TestLegacyCommentsKeepTheirAuthor(t *testing.T) {
	s := startServer(t, legacyDataDir)
	token := s.login(legacyUsername, legacyPassword)

	res := s.json(http.MethodGet, `/api/collections/comments/records?expand=author&filter=(offer="`+s.offerID(legacyOfferSofa)+`")`, token, nil)
	expectStatus(t, res, http.StatusOK)

	items := res.body["items"].([]any)
	if len(items) != 1 {
		t.Fatalf("expected one comment, got %s", res.raw)
	}
	author := items[0].(map[string]any)["expand"].(map[string]any)["author"].(map[string]any)
	if author["name"] != "Helga Helper" {
		t.Fatalf("unexpected author: %v", author)
	}
}

func TestDeleteOldOffersRemovesExpiredOffersAndPhotos(t *testing.T) {
	s := startServer(t, legacyDataDir)

	offers, err := s.app.FindCollectionByNameOrId("offers")
	if err != nil {
		t.Fatal(err)
	}
	expired, err := s.app.FindRecordById(offers, s.offerID(legacyOfferExpired))
	if err != nil {
		t.Fatal(err)
	}
	photo := filepath.Join(s.app.DataDir(), "storage", expired.BaseFilesPath(), expired.GetStringSlice("photos")[0])
	if _, err := os.Stat(photo); err != nil {
		t.Fatalf("expected photo of the expired offer to exist: %v", err)
	}

	ran := false
	for _, job := range s.app.Cron().Jobs() {
		if job.Id() == "delete_old_offers" {
			job.Run()
			ran = true
		}
	}
	if !ran {
		t.Fatal("cron job delete_old_offers is not registered")
	}

	if _, err := s.app.FindRecordById("offers", expired.Id); err == nil {
		t.Fatal("expired offer was not deleted")
	}
	// PocketBase deletes the files in the background
	deadline := time.Now().Add(5 * time.Second)
	for {
		if _, err := os.Stat(photo); os.IsNotExist(err) {
			break
		}
		if time.Now().After(deadline) {
			t.Fatal("photo of the expired offer was not deleted")
		}
		time.Sleep(20 * time.Millisecond)
	}
	if _, err := s.app.FindRecordById("offers", s.offerID(legacyOfferSofa)); err != nil {
		t.Fatalf("offer that is still available was deleted: %v", err)
	}
}
