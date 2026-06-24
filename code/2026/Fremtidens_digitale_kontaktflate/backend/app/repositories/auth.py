# Standard library
import json

# Third-party
from sqlalchemy import text
from sqlalchemy.orm import Session


def get_owner_login_profile_by_personnr(db: Session, personnr: str) -> dict | None:
    """Find a property owner profile by personnummer using JSONB owner entries.

    Returns:
        dict | None: {"full_name", "first_name", "bostedkommunenr"} or None if not found.
    """
    row = db.execute(
        text(
            """
            SELECT owner_entry->>'NAVN'             AS full_name,
                   owner_entry->>'BOSTEDKOMMUNENR'  AS bostedkommunenr
            FROM matrikkel_eiendommer AS m,
                 LATERAL jsonb_array_elements(m.data->'eierforhold') AS owner_entry
            WHERE owner_entry->>'PERSONNR' = :personnr
            LIMIT 1
            """
        ),
        {"personnr": personnr},
    ).fetchone()
    if not row:
        return None

    full_name = row[0]
    bostedkommunenr = row[1]
    first_name = None
    if isinstance(full_name, str) and full_name.strip():
        first_name = full_name.strip().split()[0]

    return {
        "full_name": full_name,
        "first_name": first_name,
        "bostedkommunenr": bostedkommunenr,
    }


def get_properties_by_personnr(db: Session, personnr: str) -> list[dict]:
    """Find all properties where the given personnummer appears as an owner.

    Returns:
        list[dict]: List of dicts with kommunenr, address, gnr, bnr, fnr, snr.
    """
    rows = db.execute(
        text(
            """
            SELECT data->>'KOMMUNENR' AS kommunenr,
                   data->>'VEGADRESSE' AS address,
                   gnr, bnr, fnr, snr
            FROM matrikkel_eiendommer
            WHERE data->'eierforhold' @> CAST(:personnr_filter AS jsonb)
            """
        ),
        {"personnr_filter": json.dumps([{"PERSONNR": personnr}])},
    ).fetchall()
    return [
        {
            "kommunenr": r[0],
            "address": r[1],
            "gnr": r[2],
            "bnr": r[3],
            "fnr": r[4],
            "snr": r[5],
        }
        for r in rows
    ]


def get_roles_by_personnr(db: Session, personnr: str) -> list[dict]:
    """Build available roles for a person (private + orgs where they are representative)."""
    roles: list[dict] = []

    profile = get_owner_login_profile_by_personnr(db, personnr)
    label = profile.get("full_name") if profile else None
    roles.append(
        {
            "type": "PERSON",
            "id": personnr,
            "label": label or "Privatperson",
        }
    )

    rows = db.execute(
        text(
            """
            SELECT DISTINCT
                org_entry->>'ORGNR' AS orgnr,
                org_entry->>'NAVN' AS orgname
            FROM matrikkel_eiendommer AS m,
                 LATERAL jsonb_array_elements(m.data->'eierforhold') AS org_entry
            WHERE org_entry->>'TYPE' = 'ORG'
              AND org_entry->'REPRESENTANTER' @> CAST(:rep_filter AS jsonb)
            """
        ),
        {"rep_filter": json.dumps([{"PERSONNR": personnr}])},
    ).fetchall()

    for orgnr, orgname in rows:
        if not orgnr:
            continue
        roles.append(
            {
                "type": "ORG",
                "id": orgnr,
                "label": orgname or orgnr,
            }
        )

    return roles


def get_properties_by_orgnr(db: Session, orgnr: str) -> list[dict]:
    """Find all properties where the given organization number appears as owner.

    Returns:
        list[dict]: List of dicts with kommunenr, address, gnr, bnr, fnr, snr.
    """
    rows = db.execute(
        text(
            """
            SELECT data->>'KOMMUNENR' AS kommunenr,
                   data->>'VEGADRESSE' AS address,
                   gnr, bnr, fnr, snr
            FROM matrikkel_eiendommer
            WHERE data->'eierforhold' @> CAST(:org_filter AS jsonb)
            """
        ),
        {"org_filter": json.dumps([{"ORGNR": orgnr}])},
    ).fetchall()

    return [
        {
            "kommunenr": r[0],
            "address": r[1],
            "gnr": r[2],
            "bnr": r[3],
            "fnr": r[4],
            "snr": r[5],
        }
        for r in rows
    ]
