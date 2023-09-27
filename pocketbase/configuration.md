# Backend Configuration

## Create an admin user
- `adduser johann`
- `usermod -aG sudo johann`
## Enable SSH access for admin user
- `cp /root/.ssh/authorized_keys /home/johann/.ssh/`
- You might need to create the .ssh folder first
- `chown johann:johann /home/johann/.ssh/authorized_keys`
## Pocketbase installieren
- Download and unzip the latest release
- Copy the executable into the services directory (e.g. `pb`)
## Service konfigurieren
- In `/lib/systemd/system` wechseln
- `sudo nano furniture-storage.service`
```
[Unit]
Description = online furniture storage

[Service]
Type           = simple
User           = service_user
Restart        = always
RestartSec     = 5s
StandardOutput = append:/home/service_user/service/errors.log
StandardError  = append:/home/service_user/service/errors.log
ExecStart      = /home/service_user/service/app serve --http="online-moebellager.de:80" --https="online-moebellager.de:443"

[Install]
WantedBy = multi-user.target
```
- 