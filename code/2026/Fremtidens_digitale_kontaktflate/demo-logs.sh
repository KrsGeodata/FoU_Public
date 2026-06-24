#!/bin/bash
# Demo-logging: viser farget dataflyt gjennom mikrotjenestene.
# Bruk: ./demo-logs.sh
# Stopp: Ctrl+C

echo "🎬 Demo-logging aktiv — klikk rundt i Min Eiendom for å se dataflyten"
echo "   Stopp med Ctrl+C"
echo ""

docker compose logs -f --tail=0 --no-log-prefix \
  backend matrikkel-service arkiv-service cms-service renovasjon-service wagtail-cms \
  2>&1 | grep --line-buffered -E "🟦|🟪|🟩|🟧|🟥|🟨"
