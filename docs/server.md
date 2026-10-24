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

Copy the binary to `/home/service_user/service/app`, using `scp` for example. PocketBase stores its data next to the binary in `/home/service_user/service/pb_data`. The `.env` file containing `STORAGE_SECRET` is read from the working directory `/home/service_user`.

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
Type             = simple
User             = service_user
Restart          = always
RestartSec       = 5s
WorkingDirectory = /home/service_user
ExecStart        = /home/service_user/service/app serve --http="online-moebellager.de:80" --https="online-moebellager.de:443"
# allows listening on ports 80 and 443 without setcap
AmbientCapabilities = CAP_NET_BIND_SERVICE

[Install]
WantedBy = multi-user.target
```

The logs are written to the journal, which rotates them automatically:

```bash
sudo journalctl -u furniture-storage -f
```

#### Start the service

Enable and start the service.
```bash
sudo systemctl enable furniture-storage
sudo systemctl start furniture-storage
```
The Service should be up and running now. You can access it via HTTPS on port 443.

If you changed an existing unit file, reload it first with `sudo systemctl daemon-reload`.

### Step 2b: Enable automatic deployments

Every push to `main` builds the binary, uploads it as `app.new` and runs [`deploy/deploy.sh`](../deploy/deploy.sh) on the VM. The script backs up `pb_data`, replaces the binary, restarts the service and rolls back binary and data if the health check fails.

#### Allow the service user to restart the service

```bash
sudo visudo -f /etc/sudoers.d/furniture-storage
```

Insert this single line, it allows nothing but stopping and starting this service:

```plaintext
service_user ALL=(root) NOPASSWD: /usr/bin/systemctl stop furniture-storage, /usr/bin/systemctl start furniture-storage
```

Check the path with `which systemctl`. Make sure `curl` is installed (`sudo apt install curl`).

#### Create an SSH key for GitHub

On your local machine create a key without passphrase and allow it to log in as `service_user`:

```bash
ssh-keygen -t ed25519 -f furniture-deploy -N "" -C "github-deploy"
ssh-copy-id -i furniture-deploy.pub service_user@<VM_IP>
```

#### Configure GitHub

In the repository go to *Settings → Environments → production* and add:

| Type     | Name              | Value                                    |
|----------|-------------------|------------------------------------------|
| Variable | `VM_IP`           | IP address of the VM                     |
| Variable | `VM_USER`         | `service_user`                           |
| Secret   | `SSH_PRIVATE_KEY` | content of `furniture-deploy`            |
| Secret   | `SSH_KNOWN_HOSTS` | output of `ssh-keyscan <VM_IP>`          |

`SSH_KNOWN_HOSTS` makes sure GitHub only talks to your VM. Delete the local private key afterwards.

### Step 3: Configure the service

#### Create a superuser

On the first start PocketBase prints a link to create the first superuser. Alternatively create one on the command line:

```bash
STORAGE_SECRET=... ./app superuser create admin@example.com <password>
```

The admin dashboard is available at `https://online-moebellager.de/_/`.

#### Schema

The collections are created and updated by the Go migrations in `backend/internal/migrations`, they run automatically when the service starts. There is no schema to import.

#### Create users

Staff members can't sign up themselves. Create them in the admin dashboard in the `users` collection with a `username` and a password.

## Operation

### Update

Merge into `main`. The *Build and Deploy* workflow runs the tests, builds the binary and deploys it. If it fails, GitHub sends a mail and the log of the *Deploy* step shows what happened.

To deploy manually, copy the binary to `/home/service_user/service/app.new` and run the script as `service_user`:

```bash
bash deploy/deploy.sh
```

### Rollback

Every deployment keeps the previous binary as `app.prev` and a backup of `pb_data` in `/home/service_user/service/backups` (the last 10). The script rolls back automatically if the health check fails. To roll back by hand:

```bash
cd /home/service_user/service
sudo systemctl stop furniture-storage
mv app.prev app
rm -rf pb_data && tar xzf backups/<latest backup>.tar.gz
sudo systemctl start furniture-storage
```

Restore binary and data together, a newer binary may have migrated the data so that the old one can't read it.

### Backup

Each deployment creates a backup automatically. For a manual backup stop the service and copy the `pb_data` directory and the `.env` file containing `STORAGE_SECRET`. Without the secret the names and phone numbers of the offers can't be decrypted. Keep a copy outside the VM.

```bash
sudo systemctl stop furniture-storage
sudo tar czf /home/admin_user/pb_data-$(date +%F).tar.gz -C /home/service_user service/pb_data .env
sudo systemctl start furniture-storage
```

### One-time upgrade from PocketBase v0.22

The release that upgrades PocketBase from v0.22 to v0.40 migrates the existing data automatically on the first start:

- admins become superusers (`_superusers` collection), their logins stay the same
- users keep logging in with their username
- names and phone numbers of offers are re-encrypted with AES-GCM
- offers that share a number get new numbers, the oldest one keeps its number (see the log)
- public sign up for users is disabled, comments can only be changed by their author
- the rate limiter is enabled

**The upgrade can't be undone.** The old binary can't read the migrated data.

1. Rehearse: copy the production `pb_data` to a local machine and start the new binary with the production `STORAGE_SECRET` against the copy (`./app serve --dir ./pb_data-copy`). Log in as a staff member, open an offer, check name, phone and photos, write a comment and submit a new offer.
2. Create a backup as described above and keep the old binary.
3. Deploy the new binary as described under *Update* and check the log for errors and renumbered offers.
4. Repeat the checks from the rehearsal.

To roll back, stop the service and restore **both** the backed-up `pb_data` and the old binary.
