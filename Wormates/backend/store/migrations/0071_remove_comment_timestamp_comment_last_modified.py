# Generated by Django 4.2.7 on 2023-12-25 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0070_alter_commentdislike_comment_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='timestamp',
        ),
        migrations.AddField(
            model_name='comment',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
    ]