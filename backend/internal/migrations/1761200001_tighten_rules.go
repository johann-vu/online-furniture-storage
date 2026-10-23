package migrations

import (
	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func setCommentRules(comments *core.Collection) {
	comments.ListRule = types.Pointer(`@request.auth.id != ""`)
	comments.ViewRule = types.Pointer(`@request.auth.id != ""`)
	comments.CreateRule = types.Pointer(`@request.auth.id != "" && @request.body.author = @request.auth.id`)
	comments.UpdateRule = types.Pointer(`author = @request.auth.id && (@request.body.author:isset = false || @request.body.author = @request.auth.id)`)
	comments.DeleteRule = types.Pointer(`author = @request.auth.id`)
}

// - users can only be created by superusers, the legacy schema allowed public sign up
// - comments can only be written in the own name and edited or deleted by their author
// - the encrypted offer fields get more room, AES-GCM ciphertexts are a little longer
func init() {
	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId(config.CollectionUsers)
		if err != nil {
			return err
		}
		users.CreateRule = nil
		if err := app.Save(users); err != nil {
			return err
		}

		comments, err := app.FindCollectionByNameOrId(config.CollectionComments)
		if err != nil {
			return err
		}
		setCommentRules(comments)
		if err := app.Save(comments); err != nil {
			return err
		}

		offers, err := app.FindCollectionByNameOrId(config.CollectionOffers)
		if err != nil {
			return err
		}
		for _, name := range []string{config.FieldName, config.FieldPhoneNumber} {
			if field, ok := offers.Fields.GetByName(name).(*core.TextField); ok && field.Max < 512 {
				field.Max = 512
			}
		}
		return app.Save(offers)
	}, nil)
}
