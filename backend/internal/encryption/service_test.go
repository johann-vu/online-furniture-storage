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
