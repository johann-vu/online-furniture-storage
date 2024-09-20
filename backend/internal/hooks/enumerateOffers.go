package hooks

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func EnumerateOfferOnCreate(collection, field string, app *pocketbase.PocketBase) func(e *core.RecordCreateEvent) error {

	counter := -1

	return func(e *core.RecordCreateEvent) error {

		if counter < 0 {
			counter = getInitialCounter(app, collection, field)
		}

		counter++
		e.Record.Set(field, counter)
		return nil
	}
}

func getInitialCounter(app *pocketbase.PocketBase, collectionName, field string) int {

	query := app.Dao().RecordQuery(collectionName).OrderBy(field + " DESC").Limit(1)

	records := []*models.Record{}
	if err := query.All(&records); err != nil {
		return 0
	}

	if len(records) != 1 {
		return 0
	}

	return records[0].GetInt(field)
}
