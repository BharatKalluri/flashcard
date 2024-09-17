from flashcard import settings


def analytics_context_processor(request):
    return {"MICROSOFT_CLARITY_PROJECT_ID": settings.MICROSOFT_CLARITY_PROJECT_ID}
