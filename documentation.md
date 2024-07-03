# Setting Up and Operating the online furniture storage

This guide outlines the steps to set up and operate a web server, which is provided as open source software. The guide is divided into two main sections: Installation and Operation.

## Installation

### Step 1: Prepare the system

#### Create an Admin User

To manage the web server, we first need to create an administrator user. This user is required to perform administrative tasks.

```bash
adduser admin_user
usermod -aG sudo admin_user
```

#### Create Service User

It's recommended to create a separate user for the web server service to enhance security and manage access permissions.

```bash
adduser service_user
```

#### Enable SSH Access for Admin User

To allow the admin user to access the server, SSH access needs to be enabled.

```bash
cp /root/.ssh/authorized_keys /home/admin_user/.ssh/
# You may need to create the .ssh folder first
chown admin_user:admin_user /home/admin_user/.ssh/authorized_keys
```

### Step 2: Install the service

#### Transfer the binary

Copy the binary to the system. Using `scp` for example. Place it somewhere the service_user has access to.

#### Configure Service

The web server service configuration is done via systemd. Open the service configuration file.

```bash
sudo nano /lib/systemd/system/furniture-storage.service
```

Insert the following content and adjust it as needed:

```plaintext
[Unit]
Description = Online Furniture Storage

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

#### Set Permissions for Ports 80 and 443

To allow the web server to listen on the standard HTTP and HTTPS ports, the appropriate permissions need to be set.

```bash
sudo setcap CAP_NET_BIND_SERVICE=+eip /path/to/binary
```

#### Start the service

Enable and start the service.
```bash
sudo systemctl enable furniture-storage
sudo systemctl start furniture-storage
```
The Service should be up and running now. You can access it via HTTPS on port 443.

### Step 3: Configure the service

#### Create an admin user

#### Import the schema

#### Create users

## Operation

### Update

To update the web server, follow these steps:

1. Manually stop the service with the admin user.
   ```bash
   sudo systemctl stop furniture-storage
   ```

2. Replace the binary.

3. Allow new files to use ports 80 and 443.
   ```bash
   sudo setcap CAP_NET_BIND_SERVICE=+eip /path/to/new/binary
   ```

4. Manually start the service with the admin user.
   ```bash
   sudo systemctl start furniture-storage
   ```
