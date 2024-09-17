from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    work_email = models.EmailField(blank=True)
    title = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(max_length=200, blank=True)
    github_url = models.URLField(max_length=200, blank=True)
    facebook_url = models.URLField(max_length=200, blank=True)
    twitter_url = models.URLField(max_length=200, blank=True)
    personal_website_url = models.URLField(max_length=200, blank=True)
    mastodon_url = models.URLField(max_length=200, blank=True)
    mobile_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
