# Generated by Django 5.1.1 on 2024-09-09 05:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="mastodon_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="customuser",
            name="organization",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="customuser",
            name="title",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="customuser",
            name="work_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
    ]