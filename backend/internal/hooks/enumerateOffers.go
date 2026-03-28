package hooks

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func EnumerateOfferOnCreate(collection, field string, app *pocketbase.PocketBase) func(e *core.RecordRequestEvent) error {

	counter := -1

	return func(e *core.RecordRequestEvent) error {

		if counter < 0 {
			counter = getInitialCounter(app, collection, field)
		}

		counter++
		e.Record.Set(field, counter)
		return nil
	}
}

func getInitialCounter(app *pocketbase.PocketBase, collectionName, field string) int {

	query := app.RecordQuery(collectionName).OrderBy(field + " DESC").Limit(1)

	records := []*core.Record{}
	if err := query.All(&records); err != nil {
		return 0
	}

	if len(records) != 1 {
		return 0
	}

	return records[0].GetInt(field)
}
