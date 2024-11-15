# Generated by Django 4.2.1 on 2024-04-01 21:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_delete_illustration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('like', 'Like'), ('comment reply', 'Comment reply'), ('follow', 'Follow'), ('review_update', 'Review Update'), ('book_update', 'Book Update'), ('author_update', 'Author Update'), ('new comment', 'New Comment')], max_length=30),
        ),
    ]
