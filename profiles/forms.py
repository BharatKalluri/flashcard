from django.forms import ModelForm

from profiles.models import CustomUser


class ProfileUpdateForm(ModelForm):
    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
            "work_email",
            "title",
            "organization",
            "linkedin_url",
            "github_url",
            "facebook_url",
            "twitter_url",
            "personal_website_url",
            "mobile_number",
            "bio",
        )
        success_url = "/profile/qr-code/"
