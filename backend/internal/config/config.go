package config

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

const (
	FieldName             = "name"
	FieldPhoneNumber      = "phone"
	CollectionOffers      = "offers"
	NightlyCronExpression = "0 3 * * *"
	FrontendDirectory     = "./frontend"
)

func GetSecret() string {
	return os.Getenv("STORAGE_SECRET")
}
