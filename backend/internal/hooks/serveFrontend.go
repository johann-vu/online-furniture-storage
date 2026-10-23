package hooks

import (
	"io/fs"

	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

const (
	CACHE_CONTROL_HEADER       = "Cache-Control"
	CACHE_CONTROL_HEADER_VALUE = "public, max-age=43200"
)

func ServeFrontend(frontendDirectory fs.FS) func(*core.ServeEvent) error {
	cacheFunc := func(e *core.RequestEvent) error {
		e.Response.Header().Set(CACHE_CONTROL_HEADER, CACHE_CONTROL_HEADER_VALUE)
		return e.Next()
	}

	return func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(frontendDirectory, true)).
			BindFunc(cacheFunc).
			Bind(apis.Gzip())

		return se.Next()
	}
}
