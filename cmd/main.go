package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/johann-vu/online-furniture-storage/internal/hooks"
	"github.com/pocketbase/pocketbase"
)

//go:embed frontend
var frontendDirectory embed.FS

func main() {

	cryptoService, err := encryption.NewService(config.GetSecret())
	if err != nil {
		log.Fatalf("starting cryptoservice: %s", err)
	}

	app := pocketbase.New()
	subFS, err := fs.Sub(frontendDirectory, "frontend/browser")
	if err != nil {
		log.Fatalf("creating sub directory: %s", err)
	}

	app.OnBeforeServe().Add(hooks.ServeFrontend(subFS))

	app.OnBeforeServe().Add(hooks.DeleteOldOffers(app, config.NightlyCronExpression))

	app.OnRecordBeforeCreateRequest(config.CollectionOffers).Add(hooks.EncryptFieldsOnCreate(cryptoService, config.FieldName, config.FieldPhoneNumber))

	app.OnRecordBeforeCreateRequest(config.CollectionOffers).Add(hooks.EnumerateOfferOnCreate(config.CollectionOffers, "number", app))

	app.OnRecordViewRequest(config.CollectionOffers).Add(hooks.DecryptFieldsOnView(cryptoService, config.FieldName, config.FieldPhoneNumber))

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
