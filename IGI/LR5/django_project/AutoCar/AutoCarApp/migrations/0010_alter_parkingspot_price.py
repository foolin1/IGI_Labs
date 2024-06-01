# Generated by Django 5.0.6 on 2024-05-13 09:52

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('AutoCarApp', '0009_alter_parkingspot_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parkingspot',
            name='price',
            field=models.DecimalField(decimal_places=4, max_digits=6, validators=[django.core.validators.MinValueValidator(0.0)]),
        ),
    ]
