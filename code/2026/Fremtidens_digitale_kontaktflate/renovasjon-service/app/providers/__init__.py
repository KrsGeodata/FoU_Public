from app.providers.base import Provider
from app.providers.norkart import NorkartProvider
from app.providers.oslo import OsloProvider
from app.providers.stavanger import StavangerProvider
from app.providers.avfallsor import AvfallSorProvider
from app.providers.bir import BirProvider

__all__ = [
    "Provider", "NorkartProvider", "OsloProvider",
    "StavangerProvider", "AvfallSorProvider", "BirProvider",
]
