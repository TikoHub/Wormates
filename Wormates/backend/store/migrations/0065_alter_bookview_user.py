# Generated by Django 4.2.7 on 2023-11-22 13:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('store', '0064_alter_bookview_unique_together_bookview_ip_address'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bookview',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
