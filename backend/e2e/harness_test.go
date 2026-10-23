// Package e2e contains end-to-end tests that run the backend with all hooks and
// migrations against a real HTTP server.
package e2e

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/johann-vu/online-furniture-storage/internal/app"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

const (
	testSecret = "e2e-test-secret-0123456789abcdef"

	// data directory created with PocketBase v0.22.2, see testdata/generate_legacy_fixture.sh
	legacyDataDir = "testdata/legacy_v0.22"

	legacyUsername = "helper"
	legacyPassword = "helper-password-123"

	// titles of offers in the legacy data, the ids change when it is regenerated
	legacyOfferSofa    = "Sofa"
	legacyOfferExpired = "Alter Schrank"
	legacyOfferTable   = "Tisch"
)

type server struct {
	t   testing.TB
	app *tests.TestApp
	url string
}

type response struct {
	status int
	body   map[string]any
	raw    []byte
}

// startServer runs all migrations on a copy of dataDir and serves the app.
// An empty dataDir starts a fresh installation.
func startServer(t testing.TB, dataDir string) *server {
	t.Helper()

	t.Setenv("STORAGE_SECRET", testSecret)

	if dataDir == "" {
		dataDir = t.TempDir()
	}

	testApp, err := tests.NewTestAppWithConfig(core.BaseAppConfig{DataDir: dataDir, EncryptionEnv: "pb_test_env"})
	if err != nil {
		t.Fatalf("creating test app: %v", err)
	}
	t.Cleanup(testApp.Cleanup)

	cryptoService, err := encryption.NewService(testSecret)
	if err != nil {
		t.Fatal(err)
	}

	frontend := fstest.MapFS{"index.html": {Data: []byte("<!doctype html><title>frontend</title>")}}
	app.Register(testApp, cryptoService, frontend)

	router, err := apis.NewRouter(testApp)
	if err != nil {
		t.Fatal(err)
	}

	serveEvent := &core.ServeEvent{App: testApp, Router: router}
	var handler http.Handler
	err = testApp.OnServe().Trigger(serveEvent, func(e *core.ServeEvent) error {
		mux, err := e.Router.BuildMux()
		handler = mux
		return err
	})
	if err != nil {
		t.Fatalf("triggering serve event: %v", err)
	}

	httpServer := httptest.NewServer(handler)
	t.Cleanup(httpServer.Close)

	return &server{t: t, app: testApp, url: httpServer.URL}
}

func (s *server) request(method, path, token string, body io.Reader, contentType string) response {
	s.t.Helper()

	req, err := http.NewRequest(method, s.url+path, body)
	if err != nil {
		s.t.Fatal(err)
	}
	if token != "" {
		req.Header.Set("Authorization", token)
	}
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		s.t.Fatal(err)
	}
	defer res.Body.Close()

	raw, err := io.ReadAll(res.Body)
	if err != nil {
		s.t.Fatal(err)
	}

	r := response{status: res.StatusCode, raw: raw}
	if strings.HasPrefix(res.Header.Get("Content-Type"), "application/json") {
		_ = json.Unmarshal(raw, &r.body)
	}

	return r
}

func (s *server) json(method, path, token string, payload any) response {
	s.t.Helper()

	var body io.Reader
	if payload != nil {
		data, err := json.Marshal(payload)
		if err != nil {
			s.t.Fatal(err)
		}
		body = bytes.NewReader(data)
	}

	return s.request(method, path, token, body, "application/json")
}

// multipart sends a form like the frontend does when creating an offer.
func (s *server) multipart(path string, fields map[string]string, files map[string][]byte) response {
	s.t.Helper()

	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	for k, v := range fields {
		_ = w.WriteField(k, v)
	}
	for name, data := range files {
		part, err := w.CreateFormFile("photos", name)
		if err != nil {
			s.t.Fatal(err)
		}
		_, _ = part.Write(data)
	}
	_ = w.Close()

	return s.request(http.MethodPost, path, "", &buf, w.FormDataContentType())
}

// offerID returns the id of the offer with the given title.
func (s *server) offerID(title string) string {
	s.t.Helper()

	offer, err := s.app.FindFirstRecordByData("offers", "title", title)
	if err != nil {
		s.t.Fatalf("finding offer %q: %v", title, err)
	}

	return offer.Id
}

func (s *server) login(username, password string) string {
	s.t.Helper()

	res := s.json(http.MethodPost, "/api/collections/users/auth-with-password", "", map[string]string{
		"identity": username,
		"password": password,
	})
	if res.status != http.StatusOK {
		s.t.Fatalf("login of %q failed with %d: %s", username, res.status, res.raw)
	}

	return res.body["token"].(string)
}

// createUser creates a staff member directly, sign up via the API is disabled.
func (s *server) createUser(username, password, name string) *core.Record {
	s.t.Helper()

	users, err := s.app.FindCollectionByNameOrId("users")
	if err != nil {
		s.t.Fatal(err)
	}

	user := core.NewRecord(users)
	user.Set("username", username)
	user.Set("name", name)
	user.SetPassword(password)
	if err := s.app.Save(user); err != nil {
		s.t.Fatalf("creating user %q: %v", username, err)
	}

	return user
}

func expectStatus(t testing.TB, res response, status int) {
	t.Helper()

	if res.status != status {
		t.Fatalf("expected status %d, got %d: %s", status, res.status, res.raw)
	}
}

// 1x1 transparent png
var testPhoto = []byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82")

func offerForm(title string) map[string]string {
	return map[string]string{
		"title":           title,
		"size":            "100x50",
		"available_until": "2099-01-01",
		"name":            "Max Mustermann",
		"phone":           "+49 170 1234567",
		"category":        "furniture",
		"description":     "Zu verschenken",
	}
}
