# Generated by Django 5.1.7 on 2025-03-17 02:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annonce', '0007_annonce_localisation'),
    ]

    operations = [
        migrations.AddField(
            model_name='annonce',
            name='prix',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=5),
        ),
    ]
