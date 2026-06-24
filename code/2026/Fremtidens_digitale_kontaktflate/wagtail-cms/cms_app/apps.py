from django.apps import AppConfig


class CmsAppConfig(AppConfig):
    # Use BigAutoField as the default primary key type for all models in this app
    default_auto_field = "django.db.models.BigAutoField"
    name = "cms_app"
