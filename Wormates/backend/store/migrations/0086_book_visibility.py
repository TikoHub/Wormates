# Generated by Django 4.2.1 on 2024-03-04 18:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0085_bookfile'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='visibility',
            field=models.CharField(choices=[('public', 'Public'), ('private', 'Private'), ('followers', 'Followers'), ('unlisted', 'Unlisted')], default='public', max_length=10),
        ),
    ]
