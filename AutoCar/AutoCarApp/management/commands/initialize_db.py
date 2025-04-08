from django.core.management.base import BaseCommand
from ...services.seed_data import seed_data

class Command(BaseCommand):
    help = 'Initializes the database with default data if not present'

    def handle(self, *args, **kwargs):
        seed_data()
        self.stdout.write(self.style.SUCCESS('Database initialized successfully.'))
