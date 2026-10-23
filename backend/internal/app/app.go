package app

import (
	"io/fs"

	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/johann-vu/online-furniture-storage/internal/hooks"
	"github.com/pocketbase/pocketbase/core"

	// registers the schema migrations
	_ "github.com/johann-vu/online-furniture-storage/internal/migrations"
)

// Register binds all hooks and jobs of the online furniture storage to the app.
func Register(app core.App, cryptoService *encryption.Service, frontend fs.FS) {

	app.OnServe().BindFunc(hooks.ServeFrontend(frontend))

	app.Cron().MustAdd(hooks.DeleteOldOffersJob, config.NightlyCronExpression,
		hooks.DeleteOldOffers(app, config.CollectionOffers, config.FieldAvailableUntil))

	app.OnRecordCreateRequest(config.CollectionOffers).BindFunc(hooks.EncryptFieldsOnCreate(cryptoService, config.FieldName, config.FieldPhoneNumber))

	app.OnRecordCreateExecute(config.CollectionOffers).BindFunc(hooks.EnumerateOfferOnCreate(config.FieldNumber))

	app.OnRecordViewRequest(config.CollectionOffers).BindFunc(hooks.DecryptFieldsOnView(cryptoService, config.FieldName, config.FieldPhoneNumber))
}
