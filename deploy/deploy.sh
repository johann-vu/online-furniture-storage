#!/usr/bin/env bash
# Runs on the VM as service_user, started by .github/workflows/deploy.yml after
# the new binary was uploaded as app.new. See docs/server.md for the one-time setup.
set -euo pipefail

SERVICE=furniture-storage
APP_DIR=/home/service_user/service
DATA_DIR=$APP_DIR/pb_data
BACKUP_DIR=$APP_DIR/backups
KEEP_BACKUPS=10
HEALTH_URL=https://online-moebellager.de/api/health

cd "$APP_DIR"

if [ ! -f app.new ]; then
  echo "app.new not found, nothing to deploy"
  exit 1
fi

# refuse to continue if the data is not where we expect it, otherwise the
# backup would be empty and a rollback would wipe the real data
if [ ! -f "$DATA_DIR/data.db" ]; then
  echo "$DATA_DIR/data.db not found, aborting"
  exit 1
fi

# start the service again if anything fails before the new binary is in place
trap 'echo "Deploy failed, starting old version"; sudo systemctl start $SERVICE' ERR

mkdir -p "$BACKUP_DIR"
BACKUP=$BACKUP_DIR/pb_data-$(date +%F-%H%M%S).tar.gz

echo "Stopping $SERVICE"
sudo systemctl stop $SERVICE

# the service is stopped, so the backup is consistent
echo "Creating backup $BACKUP"
tar czf "$BACKUP" -C "$APP_DIR" pb_data
ls -t "$BACKUP_DIR"/pb_data-*.tar.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm

echo "Replacing binary"
if [ -f app ]; then
  mv app app.prev
fi
chmod +x app.new
mv app.new app

trap - ERR

echo "Starting $SERVICE"
sudo systemctl start $SERVICE

for _ in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" > /dev/null; then
    echo "Deploy OK"
    exit 0
  fi
  sleep 2
done

# the migrations can't be undone, so the old binary needs the old data as well
echo "Health check failed, rolling back binary and data"
sudo systemctl stop $SERVICE
if [ -f app.prev ]; then
  mv app.prev app
fi
rm -rf "$DATA_DIR"
tar xzf "$BACKUP" -C "$APP_DIR"
sudo systemctl start $SERVICE
exit 1
