from django.db import migrations


class Migration(migrations.Migration):
    """Ensure the opening_hours column exists with the correct type and clear
    any old incompatible JSON. The column may be missing entirely if the DB
    was initialized before this field was added to the initial migration."""

    dependencies = [
        ('cms_app', '0002_add_property_info_tooltips'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE cms_app_kommuneconfig
                ADD COLUMN IF NOT EXISTS opening_hours jsonb NOT NULL DEFAULT '[]'::jsonb;
                UPDATE cms_app_kommuneconfig SET opening_hours = '[]'::jsonb;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
