from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

class IssuesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'issues'

    def ready(self):
        from . import signals 