# Generated by Django 4.2.1 on 2024-04-17 21:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0109_remove_review_rating_review_likes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookfile',
            name='file_type',
            field=models.CharField(choices=[('fb2', 'FB2'), ('epub', 'EPUB'), ('docx', 'DOCX'), ('txt', 'TXT'), ('pdf', 'PDF'), ('xml', 'XML')], max_length=10),
        ),
    ]