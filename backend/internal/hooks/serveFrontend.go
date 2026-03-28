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
	var cacheFunc = func(e *core.RequestEvent) error {
		e.Response.Header().Set(CACHE_CONTROL_HEADER, CACHE_CONTROL_HEADER_VALUE)
		return nil
	}

	return func(se *core.ServeEvent) error {
		route := se.Router.GET("/*", apis.Static(frontendDirectory, true))
		route.BindFunc(cacheFunc)
		route.Bind(apis.Gzip())
		return nil
	}
}
