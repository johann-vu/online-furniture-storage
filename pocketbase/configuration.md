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
- `sudo nano pocketbase.service`
```
[Unit]
Description = pocketbase

[Service]
Type           = simple
User           = root
Group          = root
LimitNOFILE    = 4096
Restart        = always
RestartSec     = 5s
StandardOutput = append:/root/pb/errors.log
StandardError  = append:/root/pb/errors.log
ExecStart      = /root/pb/pocketbase serve --http="yourdomain.com:80" --https="yourdomain.com:443"

[Install]
WantedBy = multi-user.target
```
- 