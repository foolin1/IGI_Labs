# Generated by Django 5.0.6 on 2024-05-13 09:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('AutoCarApp', '0005_alter_parkingspot_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parkingspot',
            name='price',
            field=models.DecimalField(decimal_places=2, max_digits=6),
        ),
    ]
