package main

import (
	"log"
	"os"

	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/johann-vu/online-furniture-storage/internal/hooks"
	"github.com/pocketbase/pocketbase"
)

var frontendDirectory = os.DirFS(config.FrontendDirectory)

func main() {

	cryptoService, err := encryption.NewService(config.GetSecret())
	if err != nil {
		log.Fatalf("starting cryptoservice: %s", err)
		os.Exit(1)
	}

	app := pocketbase.New()

	app.OnBeforeServe().Add(hooks.ServeFrontend(frontendDirectory))

	app.OnBeforeServe().Add(hooks.DeleteOldOffers(app, config.NightlyCronExpression))

	app.OnRecordBeforeCreateRequest(config.CollectionOffers).Add(hooks.EncryptFieldsOnCreate(cryptoService, config.FieldName, config.FieldPhoneNumber))

	app.OnRecordViewRequest(config.CollectionOffers).Add(hooks.DecryptFieldsOnView(cryptoService, config.FieldName, config.FieldPhoneNumber))

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
