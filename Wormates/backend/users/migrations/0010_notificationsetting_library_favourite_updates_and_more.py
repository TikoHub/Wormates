# Generated by Django 4.2.1 on 2024-04-07 23:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_userbookchapternotification'),
    ]

    operations = [
        migrations.AddField(
            model_name='notificationsetting',
            name='library_favourite_updates',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('like', 'Like'), ('comment reply', 'Comment reply'), ('new follower', 'New Follower'), ('review_update', 'Review Update'), ('book_update', 'Book Update'), ('author_update', 'Author Update'), ('new comment', 'New Comment'), ('new_ebook', 'New Ebook')], max_length=30),
        ),
    ]