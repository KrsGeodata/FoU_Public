# Environment File Handling

## Retrieve the current env from the VM
1. SSH into the VM and switch to the team folder:
   - `cd /home/team-lambda`
2. Locate and open `.env` (or copy it locally as needed).

## Update `.env` in GitHub Secrets
1. In GitHub, open the repository.
2. Click **Settings** (top right).
3. Go to **Secrets and variables** → **Actions**.
4. Edit the secret **VM_ENV_FILE**.
5. Paste the **entire** `.env` file contents, not just the changed key.
6. Save to overwrite the previous value.

> Important: The whole `.env` is replaced. Always paste the full file, including unchanged keys.

