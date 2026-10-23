package hooks

import (
	"sync"

	"github.com/pocketbase/pocketbase/core"
)

// EnumerateOfferOnCreate assigns the next consecutive number to a new record.
//
// It runs right before the record is written, after validation passed, so failed
// creates don't skip numbers. The lock serializes number assignment and insert,
// the unique index on the field guards against anything that bypasses it.
func EnumerateOfferOnCreate(field string) func(e *core.RecordEvent) error {

	var mu sync.Mutex

	return func(e *core.RecordEvent) error {
		mu.Lock()
		defer mu.Unlock()

		var current int
		err := e.App.DB().
			Select("COALESCE(MAX([[" + field + "]]), 0)").
			From(e.Record.Collection().Name).
			Row(&current)
		if err != nil {
			return err
		}

		e.Record.Set(field, current+1)

		return e.Next()
	}
}
