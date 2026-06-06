package hooks

import (
	"log"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

func DeleteOldOffers(app *pocketbase.PocketBase, cronExpr string) func(*core.ServeEvent) error {

	return func(se *core.ServeEvent) error {
		scheduler := cron.New()

		scheduler.MustAdd("delete_old_offers", cronExpr, func() {

			records, err := app.FindRecordsByFilter("offers", "available_until < {:today}", "", -1, 0, dbx.Params{"today": time.Now().Format(time.DateOnly)})

			if err != nil {
				log.Printf("querying offers: %v\n", err)
				log.Println("exiting cron job")
				return
			}

			for _, r := range records {

				err = app.Delete(r)
				if err != nil {
					log.Printf("deleting offer %q: %v\n", r.Id, err)
					return
				}

				log.Printf("deleting offer %q: success\n", r.Id)
			}
		})

		scheduler.Start()
		se.Next()

		return nil
	}
}
