# Generated by Django 4.2.1 on 2024-12-09 00:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0031_library_view_set_profile_tier'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='tos_accepted',
            field=models.BooleanField(default=False),
        ),
    ]