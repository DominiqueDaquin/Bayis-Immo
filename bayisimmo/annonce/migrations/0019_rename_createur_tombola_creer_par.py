# Generated by Django 5.1.7 on 2025-03-20 07:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('annonce', '0018_alter_publicite_options_tombola_description_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tombola',
            old_name='createur',
            new_name='creer_par',
        ),
    ]
