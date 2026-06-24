from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("cms_app", "0004_alter_kommuneconfig_opening_hours"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE cms_app_kommuneconfig
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_gebyr      text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_grunnlag   text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_enhet      text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_enhetspris text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_periode    text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_belop      text NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS tooltip_avgifter_arsbelop   text NOT NULL DEFAULT '';

                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_gebyr      = 'Hva du betaler for, for eksempel renovasjon eller eiendomsskatt.'                                       WHERE tooltip_avgifter_gebyr = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_grunnlag   = 'Verdien eller antallet gebyret beregnes ut fra, for eksempel areal eller antall enheter.'               WHERE tooltip_avgifter_grunnlag = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_enhet      = 'Måleenheten som brukes i beregningen, for eksempel stk, m² eller o/oo.'                                WHERE tooltip_avgifter_enhet = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_enhetspris = 'Pris per enhet i grunnlaget.'                                                                           WHERE tooltip_avgifter_enhetspris = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_periode    = 'Fra- og til-dato for gjeldende gebyrperiode.'                                                           WHERE tooltip_avgifter_periode = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_belop      = 'Løpende beløp for gjeldende periode.'                                                                   WHERE tooltip_avgifter_belop = '';
                UPDATE cms_app_kommuneconfig SET
                    tooltip_avgifter_arsbelop   = 'Estimert total kostnad for ett år.'                                                                     WHERE tooltip_avgifter_arsbelop = '';
            """,
            reverse_sql="""
                ALTER TABLE cms_app_kommuneconfig
                    DROP COLUMN IF EXISTS tooltip_avgifter_gebyr,
                    DROP COLUMN IF EXISTS tooltip_avgifter_grunnlag,
                    DROP COLUMN IF EXISTS tooltip_avgifter_enhet,
                    DROP COLUMN IF EXISTS tooltip_avgifter_enhetspris,
                    DROP COLUMN IF EXISTS tooltip_avgifter_periode,
                    DROP COLUMN IF EXISTS tooltip_avgifter_belop,
                    DROP COLUMN IF EXISTS tooltip_avgifter_arsbelop;
            """,
        ),
    ]
