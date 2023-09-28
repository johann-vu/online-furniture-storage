package hooks

import (
	"io/fs"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func ServeFrontend(frontendDirectory fs.FS) func(*core.ServeEvent) error {
	var cacheFunc echo.MiddlewareFunc = func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Cache-Control", "public, max-age=43200")
			return next(c)
		}
	}

	return func(se *core.ServeEvent) error {
		se.Router.GET("/*", apis.StaticDirectoryHandler(frontendDirectory, true), cacheFunc)
		return nil
	}
}
