# Azure VM – Infrastructure Guide

Dette er en guide med ulike retningslinjer for de ulike teamene som skal bruke VM for utvikling og deployment

---

## VM Access

**IP Addresse**  `51.120.9.87` 

**Domene**  `geokrs.no` 

**Subdomene**  `<ditt-team>.geokrs.no` 

Hver gruppe har fått tildelt en egen mappe for deres respektive team som bare dere har tilgang til.

### Exposed Ports

| **80** | HTTP traffic | **Reservert til Traefik** |

| **443** | SSH access | **Reservert for SSH, så https kan ikke benyttes** |



1. **Traefik er permanent infrastruktur** - Containeren skal kjøres hele tiden, den trenger ikke dere å gjøre noe med
2. **Hvert team har et isolert nettverk de benytter** - Bruk `<team>_network`
3. **De ulike teamene kobler gjennom `atlas_network` for Traefik ruting** 

---

## Docker Standarder

### Navnekonvensjoner

For å holde oversikt og unngå rot, så kreves det navnekonvensjoner

#### Container Navn
```yaml
container_name: <team-name>_<service-name>
```
**Examples:**
- `team-lambda_backend`
- `team-pi_frontend`


#### Nettverk Navn
```yaml
networks:
  <team-name>_network:
    external: true
```
**Eksempler:**
- `team-pi_network`
- `team-lambda_network`



Kommando for å sjekke ditt nettverk: :
```bash
docker network inspect <your-team>_network
```



---

## Traefik Routing 

**Ikke inkluder Traefik i docker-compose.yml:**

```yaml
# Ikke gjør dette
services:
  traefik:    
    image: traefik:v3.6
    ...
```

**Why?** Traefik er delt infrastruktur. Når man gjør dette så skjer følgende:
- Stopper Traefik for alle teams når man deployer
- Lager unødvendige avhengigheter
Dersom det ikke er inkludert, så klarer ikke docker å finne riktig image

### Riktig setup

 `docker-compose.yml` skal **bare** innheholde applikasjon tjenester (**services**)

```yaml
services:
  backend:
    build: ./backend
    container_name: <team-name>_backend
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - <team-name>_network    # Deres team nettverk
      - atlas_network          # Koble til Traefik
    labels:
      # Enable Traefik routing
      - "traefik.enable=true"
      
      # Define routing rule
      - "traefik.http.routers.<team-name>-backend.rule=Host(`<team-name>.geokrs.no`) && PathPrefix(`/api/`)"
      - "traefik.http.routers.<team-name>-backend.priority=100"
      - "traefik.http.routers.<team-name>-backend.entrypoints=web"
      
      # Strip path prefix (optional)
      - "traefik.http.middlewares.<team-name>-strip.stripprefix.prefixes=/api/"
      - "traefik.http.routers.<team-name>-backend.middlewares=<team-name>-strip"
      
      # Define service port
      - "traefik.http.services.<team-name>-backend.loadbalancer.server.port=8000"
      
      # Specify network for Traefik to use
      - "traefik.docker.network=atlas_network"

  frontend:
    build: ./frontend
    container_name: <team-name>_frontend
    restart: unless-stopped
    networks:
      - <team-name>_network
      - atlas_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.<team-name>-frontend.rule=Host(`<team-name>.geokrs.no`)"
      - "traefik.http.routers.<team-name>-frontend.entrypoints=web"
      - "traefik.http.services.<team-name>-frontend.loadbalancer.server.port=80"
      - "traefik.docker.network=atlas_network"

networks:
  <team-name>_network:
    external: true
  atlas_network:
    external: true
```

### Bruk av Pre-built Images fra GitHub Container Registry (GHCR)

Dersom deres CI/CD benytter build and push images til GHCR, bruk `image` istedenfor `build`:

```yaml
services:
  backend:
    image: ghcr.io/<github-org>/<repo-name>/backend:latest  # Må inkludere ghcr.io
    container_name: <team-name>_backend
    # ... resten er det sammme
```

**Important:** Images trekt ifra GHCR **MÅ** inkludere `ghcr.io/` i image navnet

- `ghcr.io/krsgeodata/lokal-llm/backend:latest`
- `ghcr.io/myorg/myrepo/frontend:v1.0.0`

### Routing URLs

Etter domene/subdomene er riktig konfigurert, så kan dere nå de på følgende: 

- **Path-based:** `http://51.120.9.87/<team-name>/`
- **Subdomain:** `http://<team-name>.geokrs.no/`


## Nyttige kommandoer

### Docker

```bash
# List containers
docker ps                          # Running containers
docker ps -a                       # All containers

# Logs
docker logs <container>            # View logs
docker logs -f <container>         # Follow logs (live)

# Container management
docker compose up -d               # Start in background
docker compose restart <service>   # Restart specific service
docker compose stop <service>      # Stop (keeps container)
docker compose rm <service>        # Remove stopped container

# Network inspection
docker network ls                  # List networks
docker network inspect <network>   # Detailed network info

