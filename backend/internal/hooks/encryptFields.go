package hooks

import (
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/pocketbase/pocketbase/core"
)

func EncryptFieldsOnCreate(cryptoService *encryption.Service, fields ...string) func(e *core.RecordRequestEvent) error {
	return func(e *core.RecordRequestEvent) error {

		for _, key := range fields {

			value := e.Record.GetString(key)
			if value == "" {
				continue
			}

			value, err := cryptoService.Encrypt(value)
			if err != nil {
				return err
			}

			e.Record.Set(key, value)
		}

		return nil
	}
}
