package config

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

const (
	FieldName             = "name"
	FieldPhoneNumber      = "phone"
	FieldNumber           = "number"
	FieldAvailableUntil   = "available_until"
	CollectionOffers      = "offers"
	CollectionComments    = "comments"
	CollectionUsers       = "users"
	NightlyCronExpression = "0 3 * * *"
)

func GetSecret() string {
	return os.Getenv("STORAGE_SECRET")
}
