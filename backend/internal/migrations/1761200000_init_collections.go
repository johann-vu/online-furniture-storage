package migrations

import (
	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// offersCollectionId is the id the offers collection had in the legacy schema export.
const offersCollectionId = "jxzniiv2ywk8w8p"

var imageMimeTypes = []string{"image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"}

// Creates the collections on fresh installations. Installations that were
// upgraded from PocketBase v0.22 already have them, PocketBase's own system
// migrations convert those to the new format.
func init() {
	m.Register(func(app core.App) error {
		if _, err := app.FindCollectionByNameOrId(config.CollectionOffers); err == nil {
			return nil
		}

		users, err := app.FindCollectionByNameOrId(config.CollectionUsers)
		if err != nil {
			return err
		}

		// staff members log in with a username, matching the migrated legacy schema
		users.Fields.Add(&core.TextField{
			Name:                "username",
			Required:            true,
			Min:                 3,
			Max:                 150,
			Pattern:             `^[\w][\w\.\-]*$`,
			AutogeneratePattern: "users[0-9]{6}",
		})
		users.AddIndex("idx_users_username", true, "username COLLATE NOCASE", "")
		users.PasswordAuth.IdentityFields = []string{"username"}
		if email, ok := users.Fields.GetByName("email").(*core.EmailField); ok {
			email.Required = false
		}
		users.ListRule = types.Pointer(`@request.auth.id != ""`)
		users.ViewRule = types.Pointer(`@request.auth.id != ""`)
		users.CreateRule = nil
		users.UpdateRule = types.Pointer(`id = @request.auth.id`)
		users.DeleteRule = types.Pointer(`id = @request.auth.id`)

		if err := app.Save(users); err != nil {
			return err
		}

		offers := core.NewBaseCollection(config.CollectionOffers, offersCollectionId)
		offers.ListRule = types.Pointer(`@request.auth.id != ""`)
		offers.ViewRule = types.Pointer(`@request.auth.id != ""`)
		offers.CreateRule = types.Pointer(``)
		offers.UpdateRule = nil
		offers.DeleteRule = types.Pointer(`@request.auth.id != ""`)
		offers.Fields.Add(
			&core.TextField{Name: "title", Max: 32},
			&core.TextField{Name: "size", Max: 32},
			&core.DateField{Name: config.FieldAvailableUntil},
			&core.TextField{Name: config.FieldName, Max: 512},
			&core.TextField{Name: config.FieldPhoneNumber, Max: 512},
			&core.FileField{
				Name:      "photos",
				MaxSelect: 3,
				MaxSize:   5242880,
				MimeTypes: imageMimeTypes,
				Thumbs:    []string{"180x180"},
				Protected: true,
			},
			&core.SelectField{Name: "category", Required: true, MaxSelect: 1, Values: []string{"furniture", "bike"}},
			&core.NumberField{Name: config.FieldNumber},
			&core.TextField{Name: "description", Max: 1024},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		offers.AddIndex("idx_offers_number", true, config.FieldNumber, "")

		if err := app.Save(offers); err != nil {
			return err
		}

		comments := core.NewBaseCollection(config.CollectionComments)
		comments.Fields.Add(
			&core.RelationField{Name: "offer", Required: true, CollectionId: offers.Id, CascadeDelete: true, MaxSelect: 1},
			&core.RelationField{Name: "author", Required: true, CollectionId: users.Id, MaxSelect: 1},
			&core.TextField{Name: "text", Required: true, Max: 512},
			&core.AutodateField{Name: "created", OnCreate: true},
			&core.AutodateField{Name: "updated", OnCreate: true, OnUpdate: true},
		)
		setCommentRules(comments)

		return app.Save(comments)
	}, nil)
}
