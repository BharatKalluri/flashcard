# profiles/views.py
import io

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.utils import timezone
from qrcode.image.pure import PyPNGImage
from qrcode.main import QRCode

from .forms import ProfileUpdateForm
import qrcode
import base64
import vobject


def index(request):
    if request.user.is_authenticated:
        return render(request, "home.html", {
            "qr_image": _get_qr_code_from_vcard(vcard=create_vcard(request.user, should_include_mobile_number=False))
        })

    return render(request, "home.html")


@login_required
def profile_update(request):
    if request.method == "POST":
        form = ProfileUpdateForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("qr_code")
    else:
        form = ProfileUpdateForm(instance=request.user)
    return render(request, "profiles/update_profile.html", {"form": form})


def create_vcard(user, should_include_mobile_number=False):
    # Create a new vCard
    vcard = vobject.vCard()

    # Add name
    vcard.add("n")
    vcard.n.value = vobject.vcard.Name(family=user.last_name, given=user.first_name)

    # Add full name
    vcard.add("fn")
    vcard.fn.value = f"{user.first_name} {user.last_name}"

    # Add title
    if user.title:
        vcard.add("title")
        vcard.title.value = user.title

    # Add organization
    if user.organization:
        vcard.add("org")
        vcard.org.value = [user.organization]

    # Add nickname (using username)
    vcard.add("nickname")
    vcard.nickname.value = user.username

    # Add email addresses
    vcard.add("email")
    vcard.email.type_param = ["INTERNET", "PREF"]
    vcard.email.value = user.email

    if user.work_email:
        work_email = vcard.add("email")
        work_email.type_param = ["INTERNET", "WORK"]
        work_email.value = user.work_email

    # Add phone number
    if should_include_mobile_number and user.mobile_number:
        vcard.add("tel")
        vcard.tel.type_param = ["CELL", "VOICE", "PREF"]
        vcard.tel.value = user.mobile_number

    # Add URLs
    if user.personal_website_url:
        url = vcard.add("url")
        url.type_param = ["Website", "PREF"]
        url.value = user.personal_website_url

    if user.twitter_url:
        url = vcard.add("url")
        url.type_param = ["Twitter"]
        url.value = user.twitter_url

    if user.linkedin_url:
        url = vcard.add("url")
        url.type_param = ["LinkedIn"]
        url.value = user.linkedin_url

    if user.facebook_url:
        url = vcard.add("url")
        url.type_param = ["Facebook"]
        url.value = user.facebook_url

    if user.github_url:
        url = vcard.add("url")
        url.type_param = ["GitHub"]
        url.value = user.github_url

    if user.mastodon_url:
        url = vcard.add("url")
        url.type_param = ["Mastodon"]
        url.value = user.mastodon_url

    # Add bio/note
    if user.bio:
        vcard.add("note")
        vcard.note.value = user.bio

    # Add revision timestamp
    vcard.add("rev")
    vcard.rev.value = timezone.now().isoformat()

    # Generate the VCF string
    return vcard.serialize()


def _get_qr_code_from_vcard(vcard: str) -> str:
    qr = QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=0,
    )
    qr.add_data(vcard)
    qr.make(fit=True)
    img = qr.make_image(image_factory=PyPNGImage)
    buffer = io.BytesIO()
    img.save(buffer)
    qr_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return qr_image


@login_required
def qr_code(request):
    profile = request.user
    vcard = create_vcard(profile, should_include_mobile_number=False)
    return render(
        request, "profiles/qr_code.html", {"qr_image": _get_qr_code_from_vcard(vcard)}
    )


@login_required
def qr_code_with_mobile(request):
    profile = request.user
    vcard = create_vcard(profile, should_include_mobile_number=True)
    return render(
        request, "profiles/qr_code.html", {"qr_image": _get_qr_code_from_vcard(vcard)}
    )
