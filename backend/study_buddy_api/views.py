from rest_framework import permissions
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .prompts import (
    PARAPHRASE_CONTEXT,
    STUDY_NOTES_CONTEXT,
    SUMMARIZE_CONTEXT,
    QuizModeEnum,
    get_context_string,
    get_note_prompt_template,
    get_paraphrase_prompt_template,
    get_summary_prompt_template,
)
from .serializers import (
    ChatSerializer,
    NoteSerializer,
    ParaphraseSerializer,
    QuizSerializer,
    SummarizeSerializer,
)
from .utils import (
    create_prompt_and_get_response,
    generate_flash_quiz_questions,
    generate_llm_response,
    generate_multi_choice_quiz_questions,
    get_extracted_text_from_sources,
)


class ChatAPI(GenericAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = ChatSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data

        context_message = get_context_string(body["context"])
        prompts = body.get("history", [])
        prompts = [{"role": "system", "content": context_message}] + prompts

        llm_response = generate_llm_response(prompts)

        return Response({"data": llm_response})


class ParaphraseAPI(GenericAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = ParaphraseSerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data

        template = get_paraphrase_prompt_template(body["tone"])
        llm_response, extracted_text = create_prompt_and_get_response(
            PARAPHRASE_CONTEXT,
            body,
            template,
        )

        return Response({"data": llm_response, "extracted_text": extracted_text})


class SummarizeAPI(GenericAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = SummarizeSerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data

        template = get_summary_prompt_template(body["summary_type"])
        llm_response, extracted_text = create_prompt_and_get_response(
            SUMMARIZE_CONTEXT,
            body,
            template,
        )

        return Response({"data": llm_response, "extracted_text": extracted_text})


class NoteAPI(GenericAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = NoteSerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data

        template = get_note_prompt_template(body["level"])
        llm_response, extracted_text = create_prompt_and_get_response(
            STUDY_NOTES_CONTEXT, body, template
        )

        return Response({"data": llm_response, "extracted_text": extracted_text})


class QuizAPI(GenericAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = QuizSerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        body = serializer.validated_data

        mode = body["mode"]
        question_count = body["question_count"]
        topic = get_extracted_text_from_sources(body)

        if mode == QuizModeEnum.MULTIPLE_CHOICE.value:
            llm_response = generate_multi_choice_quiz_questions(topic, question_count)

        if mode == QuizModeEnum.FLASH_CARDS.value:
            llm_response = generate_flash_quiz_questions(topic, question_count)

        return Response({"data": llm_response})
