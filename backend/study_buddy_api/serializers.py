from rest_framework import serializers

from .prompts import ContextEnum, NoteLevelEnum, QuizModeEnum, SummaryTypeEnum, ToneEnum


class ChatSerializer(serializers.Serializer):
    history = serializers.ListField(child=serializers.JSONField(), required=False)
    context = serializers.ChoiceField(
        choices=[(context.value, context.name) for context in ContextEnum],
        default=ContextEnum.STUDY_BUDDY.value,
    )


class BaseContentSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)
    youtube_url = serializers.URLField(required=False)
    text = serializers.CharField(required=False)


class ParaphraseSerializer(BaseContentSerializer):
    tone = serializers.ChoiceField(
        choices=[(tone.value, tone.name) for tone in ToneEnum], required=True
    )


class SummarizeSerializer(BaseContentSerializer):
    summary_type = serializers.ChoiceField(
        choices=[
            (summary_type.value, summary_type.name) for summary_type in SummaryTypeEnum
        ],
        required=True,
    )


class NoteSerializer(BaseContentSerializer):
    level = serializers.ChoiceField(
        choices=[(note_level.value, note_level.name) for note_level in NoteLevelEnum],
        required=True,
    )


class QuizSerializer(BaseContentSerializer):
    mode = serializers.ChoiceField(
        choices=[(quiz_mode.value, quiz_mode.name) for quiz_mode in QuizModeEnum],
        required=True,
    )
    question_count = serializers.IntegerField(min_value=1, max_value=100, required=True)
