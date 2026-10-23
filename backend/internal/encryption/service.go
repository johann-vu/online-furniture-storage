package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"strings"
)

// prefixGCM marks values encrypted with AES-GCM. Values without a prefix
// were written by the legacy AES-CFB implementation.
const prefixGCM = "v2:"

type Service struct {
	block cipher.Block
	aead  cipher.AEAD
}

func NewService(key string) (*Service, error) {
	if len(key) != 32 {
		return nil, errors.New("the key must be 32 characters long")
	}

	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return nil, err
	}

	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	return &Service{block: block, aead: aead}, nil
}

// Encrypt encrypts the plaintext with AES-GCM.
func (cs *Service) Encrypt(plaintext string) (string, error) {

	nonce := make([]byte, cs.aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := cs.aead.Seal(nonce, nonce, []byte(plaintext), nil)

	return prefixGCM + base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts values written by Encrypt as well as legacy AES-CFB values.
func (cs *Service) Decrypt(ciphertext string) (string, error) {

	if !IsCurrent(ciphertext) {
		return cs.decryptLegacy(ciphertext)
	}

	ciphertextBytes, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(ciphertext, prefixGCM))
	if err != nil {
		return "", err
	}

	nonceSize := cs.aead.NonceSize()
	if len(ciphertextBytes) < nonceSize {
		return "", errors.New("invalid ciphertext")
	}

	plaintext, err := cs.aead.Open(nil, ciphertextBytes[:nonceSize], ciphertextBytes[nonceSize:], nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// IsCurrent reports whether the ciphertext was encrypted with the current scheme.
func IsCurrent(ciphertext string) bool {
	return strings.HasPrefix(ciphertext, prefixGCM)
}

func (cs *Service) decryptLegacy(ciphertext string) (string, error) {

	ciphertextBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	if len(ciphertextBytes) < aes.BlockSize {
		return "", errors.New("invalid ciphertext")
	}

	iv := ciphertextBytes[:aes.BlockSize]
	ciphertextBytes = ciphertextBytes[aes.BlockSize:]

	stream := cipher.NewCFBDecrypter(cs.block, iv)
	stream.XORKeyStream(ciphertextBytes, ciphertextBytes)

	return string(ciphertextBytes), nil
}
