from django.urls import path

from .views import ChatAPI, NoteAPI, ParaphraseAPI, QuizAPI, SummarizeAPI


urlpatterns = [
    path("chat/", ChatAPI.as_view()),
    path("note/", NoteAPI.as_view()),
    path("paraphrase/", ParaphraseAPI.as_view()),
    path("quiz/", QuizAPI.as_view()),
    path("summarize/", SummarizeAPI.as_view()),
]
