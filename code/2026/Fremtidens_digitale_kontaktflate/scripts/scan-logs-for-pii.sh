#!/usr/bin/env bash
# scan-logs-for-pii.sh
#
# Greppable guardrail that fails if a log sample contains PII patterns that
# should never appear at INFO/WARNING. See issue #546.
#
# Usage:
#   docker compose logs --tail 500 | ./scripts/scan-logs-for-pii.sh
#   ./scripts/scan-logs-for-pii.sh path/to/captured.log
#   ./scripts/scan-logs-for-pii.sh --self-test
#
# Exit codes:
#   0  clean — no PII patterns matched
#   1  violation — first matching line printed to stderr
#   2  usage / IO error

set -euo pipefail

# Patterns that indicate a PII leak.
# Each entry is a POSIX extended regex used with `grep -E`.
#
# 1. matrikkelnummer dict literal: `{"kommunenummer": ...}` or `{'kommunenummer': ...}`
# 2. Full owner name after the login confirmation label (any non-whitespace content
#    between "Eier funnet: " and the kommune marker — masked form is "Eier funnet (kommune 1234)").
# 3. adresse= followed by a 4-digit postal code (real Norwegian postal codes are
#    exactly 4 digits). Masked form is "adr=***".
# 4. An 11-digit fødselsnummer NOT preceded by `***` (masked form is "***1234").
PATTERNS=(
    '\{["'"'"']kommunenummer["'"'"']'
    'Eier funnet: [^(]'
    'adresse=.*[0-9]{4}'
    '(^|[^*])[0-9]{11}([^0-9]|$)'
)

scan() {
    local source_label="$1"
    shift
    local rc=0
    for pat in "${PATTERNS[@]}"; do
        local match
        if match=$(grep -E -n "$pat" "$@" | head -n 1); then
            if [[ -n "$match" ]]; then
                echo "PII violation in $source_label (pattern: $pat):" >&2
                echo "  $match" >&2
                rc=1
                break
            fi
        fi
    done
    return $rc
}

self_test() {
    local tmpdir
    tmpdir=$(mktemp -d)

    # Known-good sample — should pass.
    cat >"$tmpdir/good.log" <<'EOF'
2026-04-21 12:00:00 INFO  BACKEND ID-porten: innlogging for personnr ***6789
2026-04-21 12:00:01 INFO  BACKEND Eier funnet (kommune 4204)
2026-04-21 12:00:02 INFO  BACKEND GET /hentedager (adr=***)
2026-04-21 12:00:03 INFO  BACKEND POST /innsyn-sok (mnr=4204/1/1)
EOF

    # Known-bad samples — each should fail.
    cat >"$tmpdir/bad_dict.log" <<'EOF'
2026-04-21 12:00:00 INFO BACKEND POST /innsyn-sok ({"kommunenummer": "4204", "gardsnummer": 1, "bruksnummer": 1})
EOF

    cat >"$tmpdir/bad_name.log" <<'EOF'
2026-04-21 12:00:00 INFO BACKEND Eier funnet: Ola Nordmann (kommune 4204)
EOF

    cat >"$tmpdir/bad_address.log" <<'EOF'
2026-04-21 12:00:00 INFO BACKEND GET /hentedager (adresse=Dronningens gate 2, 4610 Kristiansand)
EOF

    cat >"$tmpdir/bad_fnr.log" <<'EOF'
2026-04-21 12:00:00 INFO BACKEND raw fnr 12345678901 leaked
EOF

    local passes=0 fails=0
    if scan "good.log" "$tmpdir/good.log" >/dev/null 2>&1; then
        echo "PASS good.log (exit 0 as expected)" ; passes=$((passes+1))
    else
        echo "FAIL good.log (expected exit 0)" >&2 ; fails=$((fails+1))
    fi

    for bad in bad_dict bad_name bad_address bad_fnr; do
        if scan "$bad.log" "$tmpdir/$bad.log" >/dev/null 2>&1; then
            echo "FAIL $bad.log (expected non-zero exit)" >&2 ; fails=$((fails+1))
        else
            echo "PASS $bad.log (exit 1 as expected)" ; passes=$((passes+1))
        fi
    done

    echo
    echo "Self-test: $passes passed, $fails failed"
    rm -rf "$tmpdir"
    [[ $fails -eq 0 ]]
}

main() {
    case "${1:-}" in
        --self-test)
            self_test
            ;;
        --help|-h)
            sed -n '2,13p' "$0"
            ;;
        "")
            # read stdin
            local tmp
            tmp=$(mktemp)
            trap 'rm -f "$tmp"' EXIT
            cat >"$tmp"
            scan "stdin" "$tmp"
            ;;
        *)
            if [[ ! -r "$1" ]]; then
                echo "error: cannot read '$1'" >&2
                exit 2
            fi
            scan "$1" "$1"
            ;;
    esac
}

main "$@"
