# Generated by Django 4.2.1 on 2024-12-07 15:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0030_remove_notificationsettings_notify_favorites_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='library',
            name='view_set',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='tier',
            field=models.CharField(choices=[('normal', 'Normal')], default='normal', max_length=15),
        ),
    ]
