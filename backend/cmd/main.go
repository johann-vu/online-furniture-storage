package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/johann-vu/online-furniture-storage/internal/app"
	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/johann-vu/online-furniture-storage/internal/encryption"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

//go:embed frontend
var frontendDirectory embed.FS

func main() {

	cryptoService, err := encryption.NewService(config.GetSecret())
	if err != nil {
		log.Fatalf("starting cryptoservice: %s", err)
	}

	pb := pocketbase.New()
	subFS, err := fs.Sub(frontendDirectory, "frontend/browser")
	if err != nil {
		log.Fatalf("creating sub directory: %s", err)
	}

	// schema changes are written as Go migrations in internal/migrations
	migratecmd.MustRegister(pb, pb.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangGo,
		Dir:          "internal/migrations",
	})

	app.Register(pb, cryptoService, subFS)

	if err := pb.Start(); err != nil {
		log.Fatal(err)
	}
}
