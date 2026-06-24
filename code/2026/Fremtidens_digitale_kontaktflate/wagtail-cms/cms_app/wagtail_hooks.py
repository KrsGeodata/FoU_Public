import logging
import os

from wagtail import hooks

demo = logging.getLogger("demo")
logging.basicConfig(level=logging.INFO, format="%(message)s")

# Demo logging is opt-in via DEMO_MODE env flag (see issue #547).
_DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"


@hooks.register("construct_main_menu")
def cms_admin_limit_main_menu(request, menu_items):
    """Keep the admin navigation focused on what editors actually use."""
    allowed = {"snippets", "images"}
    menu_items[:] = [item for item in menu_items if item.name in allowed]


@hooks.register("construct_settings_menu")
def cms_admin_hide_settings_menu(request, menu_items):
    """Remove settings menu items from the sidebar to reduce noise."""
    menu_items[:] = []


@hooks.register("after_edit_snippet")
def demo_log_snippet_edit(request, instance):
    """Log when an admin edits a snippet (e.g. KommuneConfig)."""
    if not _DEMO_MODE:
        return
    model_name = type(instance).__name__
    label = str(instance)
    demo.info("\U0001f7e8 WAGTAIL   \u2713 %s \"%s\" oppdatert", model_name, label)


@hooks.register("after_create_snippet")
def demo_log_snippet_create(request, instance):
    """Log when an admin creates a new snippet."""
    if not _DEMO_MODE:
        return
    model_name = type(instance).__name__
    label = str(instance)
    demo.info("\U0001f7e8 WAGTAIL   \u2713 %s \"%s\" opprettet", model_name, label)
