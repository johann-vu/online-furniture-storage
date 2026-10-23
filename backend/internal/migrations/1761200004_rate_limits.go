package migrations

import (
	"github.com/johann-vu/online-furniture-storage/internal/config"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Offers can be created without an account, so the rate limiter is enabled
// with PocketBase's defaults plus a stricter rule for creating offers.
func init() {
	m.Register(func(app core.App) error {
		settings := app.Settings()

		label := config.CollectionOffers + ":create"
		if _, ok := settings.RateLimits.FindRateLimitRule([]string{label}); !ok {
			settings.RateLimits.Rules = append([]core.RateLimitRule{
				{Label: label, Audience: core.RateLimitRuleAudienceGuest, MaxRequests: 5, Duration: 60},
			}, settings.RateLimits.Rules...)
		}
		settings.RateLimits.Enabled = true

		return app.Save(settings)
	}, nil)
}
