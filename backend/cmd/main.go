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

	app.OnServe().BindFunc(hooks.ServeFrontend(subFS))

	app.OnServe().BindFunc(hooks.DeleteOldOffers(app, config.NightlyCronExpression))

	app.OnRecordCreateRequest(config.CollectionOffers).BindFunc(hooks.EncryptFieldsOnCreate(cryptoService, config.FieldName, config.FieldPhoneNumber))

	app.OnRecordCreateRequest(config.CollectionOffers).BindFunc(hooks.EnumerateOfferOnCreate(config.CollectionOffers, "number", app))

	app.OnRecordViewRequest(config.CollectionOffers).BindFunc(hooks.DecryptFieldsOnView(cryptoService, config.FieldName, config.FieldPhoneNumber))

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
