# Generated by Django 4.2.1 on 2024-03-29 04:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0102_review_timestamp'),
    ]

    operations = [
        migrations.CreateModel(
            name='Illustration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='illustrations/')),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='illustrations', to='store.book')),
            ],
        ),
    ]