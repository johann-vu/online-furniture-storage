package hooks

import (
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

const DeleteOldOffersJob = "delete_old_offers"

// DeleteOldOffers deletes all offers whose availability date has passed.
// Deleting through the app also removes the photos and cascades to comments.
func DeleteOldOffers(app core.App, collection, field string) func() {
	return func() {

		filter := dbx.NewExp("["+field+"] < {:today}", dbx.Params{"today": time.Now().Format(time.DateOnly)})

		records, err := app.FindAllRecords(collection, filter)
		if err != nil {
			app.Logger().Error("querying old offers", "error", err)
			return
		}

		failed := 0
		for _, r := range records {
			if err := app.Delete(r); err != nil {
				failed++
				app.Logger().Error("deleting old offer", "id", r.Id, "error", err)
			}
		}

		app.Logger().Info("deleted old offers", "deleted", len(records)-failed, "failed", failed)
	}
}
