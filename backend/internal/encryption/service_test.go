package encryption

import (
	"math/rand"
	"testing"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func randomString(length int) string {

	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = charset[rand.Intn(len(charset))]
	}

	return string(result)
}

func TestService(t *testing.T) {
	key := randomString(32)

	s, err := NewService(key)
	if err != nil {
		t.FailNow()
	}

	text := randomString(40)

	encryptedText, err := s.Encrypt(text)
	if err != nil {
		t.FailNow()
	}

	decryptedText, err := s.Decrypt(encryptedText)
	if err != nil {
		t.FailNow()
	}

	if decryptedText != text {
		t.FailNow()
	}
}

func TestDecryptLegacyCFB(t *testing.T) {
	// written by the AES-CFB implementation used before the PocketBase upgrade
	const legacyCiphertext = "Bil56IhUYwDcQxwA7UEh3PIGonJznhqp3NheQiKo"

	s, err := NewService("e2e-test-secret-0123456789abcdef")
	if err != nil {
		t.Fatal(err)
	}

	decryptedText, err := s.Decrypt(legacyCiphertext)
	if err != nil {
		t.Fatal(err)
	}

	if decryptedText != "Max Mustermann" {
		t.Fatalf("got %q", decryptedText)
	}

	if IsCurrent(legacyCiphertext) {
		t.Fatal("legacy ciphertext reported as current")
	}
}

func TestDecryptDetectsTampering(t *testing.T) {
	s, err := NewService(randomString(32))
	if err != nil {
		t.Fatal(err)
	}

	encryptedText, err := s.Encrypt("+49 170 1234567")
	if err != nil {
		t.Fatal(err)
	}

	if !IsCurrent(encryptedText) {
		t.Fatal("new ciphertext not reported as current")
	}

	tampered := []byte(encryptedText)
	tampered[len(tampered)-3] ^= 1

	if _, err := s.Decrypt(string(tampered)); err == nil {
		t.Fatal("expected tampered ciphertext to be rejected")
	}
}
