# Generated by Django 4.2.1 on 2024-03-27 23:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0098_alter_book_volume_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='volume_number',
            field=models.PositiveIntegerField(blank=True, help_text='The number of the book in the series', null=True),
        ),
    ]