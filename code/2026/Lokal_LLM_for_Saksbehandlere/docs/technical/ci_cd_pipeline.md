# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions to automate building, testing, and deploying both the Backend and Windows Application

## Architecture

```
┌─────────────────┐
│  GitHub Repo    │
│                 │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────┐
│Backend│  │.NET Core │
│CI/CD  │  │Desktop   │
└───┬───┘  └────┬─────┘
    │           │
    ▼           ▼
┌───────────┐  ┌─────────────┐
│   GHCR    │  │GitHub       │
│(Container)│  │Release      │
└─────┬─────┘  └─────────────┘
      │
      ▼
┌────────────┐
│ VM Deploy  │
│  (SSH)     │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Traefik   │
│  Routing   │
└────────────┘
```

---

## Backend CI/CD Pipeline

### File: `.github/workflows/backend.yml`

### Trigger Conditions

The pipeline runs when:
- Push to `master` branch with changes in:
  - `Backend/**`
  - `docker-compose.yml`
  - `.github/workflows/backend.yml`


### Pipeline Stages

#### 1. Build and Push
**Runner**: `ubuntu-latest`  
**Job Name**: `build-and-push`  
**Purpose**: Build a Docker image from the Backend code and push it to GitHub Container Registry

**Steps**:

1. **Checkout repository** (`actions/checkout@v4`)
   - Clones the Git repository to the GitHub Actions runner
   - Provides access to `Backend/` directory and `Dockerfile`
   - Uses default branch that triggered the workflow

2. **Login to GHCR** (GitHub Container Registry)
   - Action: `docker/login-action@v3`
   - Registry: `ghcr.io` (GitHub's built-in container registry)
   - Username: `${{ github.actor }}` (the GitHub user who triggered the workflow)
   - Password: `${{ secrets.GITHUB_TOKEN }}` (automatically provided by GitHub)
   - **What happens**: Authenticates Docker CLI to push images to your GitHub packages
   - **Required permissions**: Package write access (set in workflow with `packages: write`)
   - **For more information**: https://github.com/docker/login-action?tab=readme-ov-file#github-container-registry

3. **Build and push Docker image**
   - Action: `docker/build-push-action@v6`
   - Build context: `./Backend` 
   - **Build process**:
     - Reads `Backend/Dockerfile`
     - Installs necessary dependencies 
     - Builds final image
     - Pushes it to registry
   - **Tags applied**:
     - `ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest` → Always points to most recent build
     - `ghcr.io/krsgeodata/801_26_lokal-llm/backend:${{ github.sha }}` → Specific commit identifier for option to roll back if needed
   - **Result**: Docker image available at `ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest`


#### 2. Deploy to VM
**Job Name**: `deploy`  
**Depends on**: `build-and-push` (waits for image to be available in GHCR)  
**Purpose**: Appleboy connects to the Linux VM via SSH and deploy the newly built container pushed to GHCR

**Steps**:

1. **Checkout repository** (`actions/checkout@v4`)
   - Clones repository again (each github actions job runs in an isolated environment. When 1 job finishes, its entire environment (including the cloned repo) is destroyed). 
   - Needed to access `Backend/deploy.sh` for copying to VM

2. **Write .env file to VM** via SSH
   - Action: `appleboy/ssh-action@v1`
   - **Connection details**:
     - Host: `${{ secrets.VM_HOST }}` (VM IP address or hostname)
     - Port: `443` (custom SSH port, not default 22)
     - User: `${{ secrets.VM_USER }}` (SSH username on VM)
     - Key: `${{ secrets.VM_SSH_KEY }}` (private SSH key for authentication)
     - Passphrase: `${{ secrets.SSH_KEY_PASSPHRASE }}` (decrypts the SSH key)
   - **What happens**:
     - Establishes SSH connection from the GitHub Actions runner to VM
     - Creates directory: `mkdir -p ~/lokal-llm`
     - Writes environment variables from `${{ secrets.VM_ENV_FILE }}` to `~/lokal-llm/.env`
   - **Why**: Allows the backend container to retrieve the necessary API keys

3. **Copy deploy script** via SCP (Secure Copy Protocol)
   - Action: `appleboy/scp-action@v0.1.7`
   - **Source**: `Backend/deploy.sh` (from GitHub repository)
   - **Destination**: `~/lokal-llm/deploy.sh` (on the VM)
   - **Transfer method**: SSH File Transfer Protocol over port 443
   - **What happens**:
     - Authenticates using same SSH credentials
     - Transfers the bash script file
     - `strip_components: 1` removes the `Backend/` prefix from path
   - **Why**: The script contains all deployment logic (pull image, stop old container, start new one)

4. **Run deploy script** via SSH
   - Action: `appleboy/ssh-action@v1` (same SSH connection as step 2)
   - **Commands executed on VM**:
     ```bash
     chmod +x ~/lokal-llm/deploy.sh    # Make script executable
     ~/lokal-llm/deploy.sh              # Run deployment
     ```
   - **What the deploy script does** (see Deploy Script section below for details):
     - Stops the existing `lokal-llm-backend` container
     - Pulls `ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest` from GHCR
     - Generates `docker-compose.yml` with Traefik labels
     - Starts new container: `docker compose up -d`
     - Performs health check
     - Cleans up old Docker images
   - **Output**: Deployment logs printed to GitHub Actions console
   - **Exit code**: 0 = success, non-zero = failure (workflow fails)


### SSH Configuration

All SSH actions use:
- **Host**: `${{ secrets.VM_HOST }}`
- **Username**: `${{ secrets.VM_USER }}`
- **Key**: `${{ secrets.VM_SSH_KEY }}`
- **Passphrase**: `${{ secrets.SSH_KEY_PASSPHRASE }}`
- **Port**: `443`

- All of the different secrets are configured with the account <user>. If there arises any issues related to this, contact <email@email.com>

### Deploy Script (`Backend/deploy.sh`)

The deployment script performs the following:

1. **Setup**
   ```bash
   DEPLOY_DIR="$HOME/lokal-llm"
   IMAGE_NAME="ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest"
   CONTAINER_NAME="lokal-llm-backend"
   ```

2. **Stop existing container**
   ```bash
   docker compose down
   ```

3. **Pull latest image**
   ```bash
   docker pull ghcr.io/krsgeodata/801_26_lokal-llm/backend:latest
   ```

4. **Generate docker-compose.yml**
   - Creates the docker-compose configs
   - Includes Traefik labels for routing

5. **Start new container**
   ```bash
   docker compose up -d
   ```

6. **Health check**
   - Verifies container is running

7. **Cleanup**
   ```bash
   docker image prune -f
   ```

### Traefik Configuration

The backend is exposed via Traefik with:

**Path-based routing**:
- `geokrs.no/lokal-llm/`
- Middleware: `lokal-llm-strip` (removes `/lokal-llm/` prefix)

**Subdomain routing**:
- `lokal-llm.geokrs.no`

**Service**:
- Port: 8000
- Network: `geointernship25_network` (external)

### Access URLs

After successful deployment:
- **Subdomain**: `http://lokal-llm.geokrs.no/`
- **Path-based**: `http://geokrs.no/lokal-llm/`
- **API Docs**: `http://lokal-llm.geokrs.no/docs`
- **Direct (VM)**: `http://<vm-ip>:8001/`

---

## .NET Desktop CI/CD Pipeline

### File: `.github/workflows/dotnet-desktop.yml`

### Trigger Conditions

The pipeline runs when:
- **Push to `master` branch** with changes in:
  - `WindowsApplication/**`
  - `.github/workflows/dotnet-desktop.yml`
- **Push version tags** (e.g., `v1.0.0`, `v0.1.0`)
- **Pull requests** to `master` (same path filters)
- **Manual trigger** via GitHub Actions UI

### Pipeline Stages

#### 1. Build
**Runner**: `windows-latest`  
- Configurations: `[Debug, Release]`
- Platforms: `[x64]`

**Steps**:
1. **Checkout** (`actions/checkout@v4`, fetch-depth: 0)
2. **Setup MSBuild** (`microsoft/setup-msbuild@v2`)
3. **Install .NET Core 8.0** (`actions/setup-dotnet@v4`)
4. **Restore NuGet packages**
   ```powershell
   msbuild WindowsApplication/LocalLLMApp.sln /t:Restore
   ```
5. **Build solution**
   ```powershell
   msbuild WindowsApplication/LocalLLMApp.sln /p:Configuration=Release /p:Platform=x64
   ```
6. **Upload artifacts** (Release builds only)
   - Name: `LocalLLMApp-Release-x64`
   - Path: `WindowsApplication/LocalLLMApp/bin/x64/Release/net8.0-windows10.0.19041.0/`

#### 2. Release
**Runner**: `ubuntu-latest`  
**Condition**: Only when version tag is pushed (`startsWith(github.ref, 'refs/tags/v')`)  
**Depends on**: `build`

**Steps**:
1. **Download Release artifact**
   ```yaml
   name: LocalLLMApp-Release-x64
   path: release-files/
   ```
2. **Zip release files**
   ```bash
   cd release-files
   zip -r ../LocalLLMApp-${{ github.ref_name }}-x64.zip .
   ```
3. **Create GitHub Release**
   - Uses `softprops/action-gh-release@v2`
   - Title: `LocalLLMApp ${{ github.ref_name }}`
   - Attaches: `LocalLLMApp-<version>-x64.zip`
   - Body: Installation instructions

### Creating a Release

To trigger the release pipeline:

```powershell
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build both Debug and Release configurations
2. Create a GitHub Release with the tag name
3. Attach the Release x64 build as a downloadable zip

Do not create release tags using the GitHub GUI, this must be done using git CLI. Using the GitHub GUI will cause potential conflicts for the release jobs. 

---
