from django.apps import AppConfig
from django.db import OperationalError


class AutocarappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AutoCarApp'
