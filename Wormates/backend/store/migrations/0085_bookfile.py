# Generated by Django 4.2.1 on 2024-03-04 17:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0084_alter_book_book_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='BookFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='books/')),
                ('file_type', models.CharField(max_length=10)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='store.book')),
            ],
        ),
    ]