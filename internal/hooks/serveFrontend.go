package hooks

import (
	"io/fs"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

const (
	CACHE_CONTROL_HEADER       = "Cache-Control"
	CACHE_CONTROL_HEADER_VALUE = "public, max-age=43200"
)

func ServeFrontend(frontendDirectory fs.FS) func(*core.ServeEvent) error {
	var cacheFunc echo.MiddlewareFunc = func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			err := next(c)
			if err != nil {
				return err
			}
			c.Response().Header().Set(CACHE_CONTROL_HEADER, CACHE_CONTROL_HEADER_VALUE)
			return nil
		}
	}

	return func(se *core.ServeEvent) error {
		se.Router.GET("/*", apis.StaticDirectoryHandler(frontendDirectory, true), cacheFunc)
		return nil
	}
}
