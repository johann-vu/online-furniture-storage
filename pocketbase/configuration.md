# Backend Configuration

## Create an admin user

- `adduser johann`
- `usermod -aG sudo johann`

## Create service user

- `adduser service_user`


## Enable SSH access for admin user

- `cp /root/.ssh/authorized_keys /home/johann/.ssh/`
- You might need to create the .ssh folder first
- `chown johann:johann /home/johann/.ssh/authorized_keys`

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
StandardOutput = append:/home/service_user/errors.log
StandardError  = append:/home/service_user/errors.log
WorkingDirectory = /home/service_user
ExecStart      = /home/service_user/service/furniture-storage/app serve --http="online-moebellager.de:80" --https="online-moebellager.de:443"

[Install]
WantedBy = multi-user.target
```

- Allow Programm to bind to privileged port: sudo setcap CAP_NET_BIND_SERVICE=+eip /path/to/binary

# Deployment

- Stop Service manually with admin user
- Start Deployment using Github Actions
- Allow new File to use ports 80 and 443
- Start Service manually with admin user