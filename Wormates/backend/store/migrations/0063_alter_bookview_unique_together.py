# Generated by Django 4.2.7 on 2023-11-22 12:52

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('store', '0062_remove_bookview_timestamp_alter_bookview_last_viewed'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='bookview',
            unique_together={('book', 'user')},
        ),
    ]