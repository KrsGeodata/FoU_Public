from django.conf import settings
from django.urls import path, include, re_path
from django.views.static import serve
from django.views.generic import RedirectView
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.images.api.v2.views import ImagesAPIViewSet
from wagtail.documents.api.v2.views import DocumentsAPIViewSet

from django.http import JsonResponse
from cms_app.views import MunicipalityConfigView


def health_check(request):
    return JsonResponse({"status": "ok"})


# Register API endpoints — pages, images and documents are available via /api/v2/
api_router = WagtailAPIRouter("wagtailapi")
api_router.register_endpoint("pages", PagesAPIViewSet)
api_router.register_endpoint("images", ImagesAPIViewSet)
api_router.register_endpoint("documents", DocumentsAPIViewSet)

urlpatterns = [
    path("health/", health_check),

    # Municipality config endpoint — returns branding and contact info for a kommune
    path("api/v2/municipality-config/<str:municipality_id>/", MunicipalityConfigView.as_view()),

    # Wagtail REST API — used by frontend and backend to fetch kommune content
    path("api/v2/", api_router.urls),

    # Wagtail admin — where editors manage kommune pages
    path("admin/", include(wagtailadmin_urls)),

    # Wagtail document downloads
    path("documents/", include(wagtaildocs_urls)),

    # Wagtail page routing — handles all other URLs
    path("", RedirectView.as_view(url="/admin/", permanent=False)),
    path("", include(wagtail_urls)),

]

# Serve media files in all environments — wagtail-cms is internal only,
# accessed through cms-service proxy, not directly by browsers.
# django.conf.urls.static.static() returns empty list when DEBUG=False,
# so we use re_path + serve directly.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
