# Generated by Django 4.2.1 on 2024-10-24 16:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_delete_temporaryregistration'),
    ]

    operations = [
        migrations.DeleteModel(
            name='TemporaryPasswordStorage',
        ),
    ]