package migrations

import (
	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// The legacy in-memory counter could hand out the same offer number twice.
// Duplicates keep the number of the oldest offer, the others get new numbers,
// then a unique index prevents it from happening again.
func init() {
	m.Register(func(app core.App) error {
		offers, err := app.FindCollectionByNameOrId(config.CollectionOffers)
		if err != nil {
			return err
		}

		if offers.GetIndex("idx_offers_number") != "" {
			return nil
		}

		var maxNumber int
		err = app.DB().
			Select("COALESCE(MAX([[" + config.FieldNumber + "]]), 0)").
			From(offers.Name).
			Row(&maxNumber)
		if err != nil {
			return err
		}

		records, err := app.FindRecordsByFilter(offers, "", "created,id", 0, 0)
		if err != nil {
			return err
		}

		seen := map[int]bool{}
		for _, r := range records {
			number := r.GetInt(config.FieldNumber)
			if number > 0 && !seen[number] {
				seen[number] = true
				continue
			}

			maxNumber++
			app.Logger().Warn("renumbering offer with duplicate number", "id", r.Id, "old", number, "new", maxNumber)

			_, err := app.DB().
				Update(offers.Name, dbx.Params{config.FieldNumber: maxNumber}, dbx.HashExp{"id": r.Id}).
				Execute()
			if err != nil {
				return err
			}
		}

		offers.AddIndex("idx_offers_number", true, config.FieldNumber, "")

		return app.Save(offers)
	}, nil)
}
