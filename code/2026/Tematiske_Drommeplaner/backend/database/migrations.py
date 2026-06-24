"""
Database migration runner.
Runs all SQL files in database/migrations/ in order.
Tracks which migrations have been run in schema_migrations table.
"""

import csv
import os
import sys
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

from database.config import get_required_env


def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(
        host=get_required_env("POSTGRES_HOST"),
        database=get_required_env("POSTGRES_DB"),
        user=get_required_env("POSTGRES_USER"),
        password=get_required_env("POSTGRES_PASSWORD"),
        port=get_required_env("POSTGRES_PORT"),
    )


def ensure_migrations_table(conn):
    """Create schema_migrations table if it doesn't exist."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id BIGSERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)
    conn.commit()


def get_applied_migrations(conn) -> set[str]:
    """Get set of migration names that have been applied."""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT name FROM schema_migrations ORDER BY name")
        return {row["name"] for row in cur.fetchall()}


def get_migration_files() -> list[tuple[str, str]]:
    """Get list of (filename, filepath) for all SQL migrations in order."""
    migrations_dir = Path(__file__).parent / "migrations"
    
    if not migrations_dir.exists():
        print(f"⚠️  Migrations directory not found: {migrations_dir}")
        return []
    
    files = sorted([f for f in migrations_dir.glob("*.sql")])
    return [(f.name, str(f)) for f in files]


def import_planregister_csv(conn):
    """Import planregister data from CSV file."""
    csv_path = Path(__file__).parent / "planregister.csv"
    
    if not csv_path.exists():
        print(f"    ⚠️  CSV file not found: {csv_path}, skipping import")
        return
    
    print(f"    Reading CSV ({csv_path})...", end=" ")
    
    # Read CSV file
    rows = []
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            rows = list(reader)
        print(f"({len(rows)} records)")
    except Exception as e:
        raise Exception(f"Failed to read CSV: {e}")
    
    if not rows:
        print("    No records to import")
        return
    
    # Transform and insert
    print(f"    Inserting {len(rows)} records...", end=" ")
    
    with conn.cursor() as cur:
        for i, row in enumerate(rows):
            try:
                # Parse plan_id (CSV column: PlanId)
                plan_id = row.get('PlanId', '').strip()
                if not plan_id:
                    plan_id = f"MISSING_PLANID_{i}"
                
                # Parse date (CSV column: IKraft)
                ikraft = None
                ikraft_str = row.get('IKraft', '').strip()
                if ikraft_str:
                    try:
                        if '.' in ikraft_str:
                            ikraft = datetime.strptime(ikraft_str, '%d.%m.%Y').date()
                        elif '-' in ikraft_str:
                            ikraft = datetime.strptime(ikraft_str, '%Y-%m-%d').date()
                    except:
                        pass
                
                # Parse IDs
                plantype_id = None
                try:
                    if row.get('PlantypeId'):
                        plantype_id = int(''.join(filter(str.isdigit, row['PlantypeId'])))
                except:
                    pass
                
                planstatus_id = None
                try:
                    if row.get('PlanstatusId'):
                        planstatus_id = int(''.join(filter(str.isdigit, row['PlanstatusId'])))
                except:
                    pass
                
                lovreferanse_id = None
                try:
                    if row.get('LovreferanseId'):
                        lovreferanse_id = int(''.join(filter(str.isdigit, row['LovreferanseId'])))
                except:
                    pass
                
                vertikalniva_id = None
                try:
                    if row.get('VertikalnivåId'):
                        vid_str = row['VertikalnivåId'].replace(' ', '').split(',')[0]
                        if vid_str.isdigit():
                            vertikalniva_id = int(vid_str)
                except:
                    pass
                
                planbestemmelse_id = None
                try:
                    if row.get('PlanBestemmelseId'):
                        planbestemmelse_id = int(''.join(filter(str.isdigit, row['PlanBestemmelseId'])))
                except:
                    pass
                
                # Insert
                cur.execute("""
                    INSERT INTO planregister (
                        plan_id, plannavn, plantype, plantype_id,
                        planstatus, planstatus_id, ikraft, lovreferanse, lovreferanse_id,
                        vertikalniva, vertikalniva_id, planbestemmelse, planbestemmelse_id, is_active
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
                    ON CONFLICT (plan_id) DO UPDATE SET
                        plannavn = EXCLUDED.plannavn,
                        plantype = EXCLUDED.plantype,
                        plantype_id = EXCLUDED.plantype_id,
                        planstatus = EXCLUDED.planstatus,
                        planstatus_id = EXCLUDED.planstatus_id,
                        ikraft = EXCLUDED.ikraft,
                        lovreferanse = EXCLUDED.lovreferanse,
                        lovreferanse_id = EXCLUDED.lovreferanse_id,
                        vertikalniva = EXCLUDED.vertikalniva,
                        vertikalniva_id = EXCLUDED.vertikalniva_id,
                        planbestemmelse = EXCLUDED.planbestemmelse,
                        planbestemmelse_id = EXCLUDED.planbestemmelse_id
                """, (
                    plan_id,
                    row.get('Plannavn', 'Ukjent plannavn').strip() or 'Ukjent plannavn',
                    row.get('Plantype', '').strip() or None,
                    plantype_id,
                    row.get('Planstatus', '').strip() or None,
                    planstatus_id,
                    ikraft,
                    row.get('Lovreferanse', '').strip() or None,
                    lovreferanse_id,
                    row.get('Vertikalnivå', '').strip() or None,
                    vertikalniva_id,
                    row.get('PlanBestemmelse', '').strip() or None,
                    planbestemmelse_id
                ))
            except Exception as e:
                raise Exception(f"Failed to insert row {i}: {e}")
    
    conn.commit()
    print("✓")


def run_migrations():
    """Run all pending migrations."""
    try:
        conn = get_db_connection()
        ensure_migrations_table(conn)
        
        applied = get_applied_migrations(conn)
        pending = [(name, path) for name, path in get_migration_files() if name not in applied]
        
        if not pending and applied:
            print("✅ Database is up to date (0 pending migrations)")
            # Still import CSV if not done yet
            if "csv_imported" not in applied:
                print("  Importing CSV data...", end=" ")
                import_planregister_csv(conn)
                print("✓")
            return True
        
        print(f"🔄 Found {len(pending)} pending migrations")
        
        for name, path in pending:
            print(f"  Applying {name}...", end=" ")
            
            try:
                # Standard SQL migration
                with open(path, "r") as f:
                    sql = f.read()
                
                with conn.cursor() as cur:
                    cur.execute(sql)
                    
                    # Record migration as applied
                    cur.execute(
                        "INSERT INTO schema_migrations (name) VALUES (%s)",
                        (name,)
                    )
                
                conn.commit()
                print("✓")
                
            except Exception as e:
                conn.rollback()
                print(f"✗ FAILED")
                print(f"    Error: {e}")
                return False
        
        # Always import CSV after SQL migrations
        print("  Importing CSV data...", end=" ")
        import_planregister_csv(conn)
        print("✓")
        
        print(f"✅ Successfully applied {len(pending)} migrations")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False


if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1)
