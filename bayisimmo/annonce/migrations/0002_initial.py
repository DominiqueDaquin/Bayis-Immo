# Generated by Django 5.1.7 on 2025-03-13 01:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('annonce', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='annonce',
            name='creer_par',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='discussion',
            name='createur1',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='discussions_initiees', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='discussion',
            name='createur2',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='discussion_recues', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='annonce',
            name='photos',
            field=models.ManyToManyField(to='annonce.media'),
        ),
        migrations.AddField(
            model_name='discussion',
            name='messages',
            field=models.ManyToManyField(to='annonce.message'),
        ),
    ]
