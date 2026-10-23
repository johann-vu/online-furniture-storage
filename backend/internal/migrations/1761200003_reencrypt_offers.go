package migrations

import (
	"fmt"

	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Re-encrypts the legacy AES-CFB values with AES-GCM. Values that are already
// encrypted with AES-GCM are skipped, so it is safe to run again.
//
// There is no down migration: the old binary can't read AES-GCM values,
// rolling back requires restoring the pb_data backup.
func init() {
	m.Register(func(app core.App) error {
		cryptoService, err := encryption.NewService(config.GetSecret())
		if err != nil {
			return fmt.Errorf("re-encrypting offers: %w", err)
		}

		records, err := app.FindAllRecords(config.CollectionOffers)
		if err != nil {
			return err
		}

		for _, r := range records {
			changed := false

			for _, field := range []string{config.FieldName, config.FieldPhoneNumber} {
				value := r.GetString(field)
				if value == "" || encryption.IsCurrent(value) {
					continue
				}

				plaintext, err := cryptoService.Decrypt(value)
				if err != nil {
					return fmt.Errorf("decrypting %s of offer %q: %w", field, r.Id, err)
				}

				ciphertext, err := cryptoService.Encrypt(plaintext)
				if err != nil {
					return err
				}

				r.Set(field, ciphertext)
				changed = true
			}

			if !changed {
				continue
			}

			// skip validation, legacy records may not satisfy constraints added since
			if err := app.SaveNoValidate(r); err != nil {
				return fmt.Errorf("saving offer %q: %w", r.Id, err)
			}
		}

		return nil
	}, nil)
}
