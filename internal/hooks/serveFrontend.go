package hooks

import (
	"io/fs"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func ServeFrontend(frontendDirectory fs.FS) func(*core.ServeEvent) error {
	return func(se *core.ServeEvent) error {
		se.Router.GET("/*", apis.StaticDirectoryHandler(frontendDirectory, true))
		return nil
	}
}
