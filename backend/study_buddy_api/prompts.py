from enum import Enum


class ContextEnum(Enum):
    STUDY_BUDDY = "study_buddy"
    SUMMARIZE = "summarize"
    STUDY_NOTES = "study_notes"


def get_context_string(context_enum_name: str) -> str:
    """
    Get the context string based on the context enum name.
    """
    return {
        ContextEnum.STUDY_BUDDY.value: STUDY_BUDDY_CONTEXT,
        ContextEnum.SUMMARIZE.value: SUMMARIZE_CONTEXT,
        ContextEnum.STUDY_NOTES.value: STUDY_NOTES_CONTEXT,
    }.get(context_enum_name, STUDY_BUDDY_CONTEXT)


############################### STUDY BUDDY ####################################

STUDY_BUDDY_CONTEXT = (
    "You are a friendly and supportive AI Tutor for university students. "
    "If a question is out of your scope and you are not 100 percent confident in the answer, "
    "immediately tell the student that it is beyond your scope and ACE GPT will be able to help them. "
    "Do not in any scenario tell students to reach out to their university or check its websites."
)

############################### PARAPHRASING ####################################

PARAPHRASE_CONTEXT = (
    "You are a paraphrasing assistant. Your task is to rewrite text in various tones "
    "while maintaining the original meaning. You should only output the paraphrased text "
    "without any introductory or explanatory phrases."
)


class ToneEnum(Enum):
    FRIENDLY = "friendly"
    NEUTRAL = "neutral"
    FORMAL = "formal"


def get_paraphrase_prompt_template(tone: ToneEnum) -> str:
    """
    Get the paraphrase prompt template based on the tone.
    """
    base_template = (
        "Rewrite the text using different words and sentence structures "
        "while keeping the original meaning intact. Do not add any introduction "
        "or extra information; just provide the rewritten text directly."
    )
    tone_instructions = {
        ToneEnum.FRIENDLY.value: "Use a friendly and informal tone:",
        ToneEnum.FORMAL.value: "Use a professional and concise tone:",
    }
    tone_instruction = tone_instructions.get(
        tone, "Maintain the same tone as the original text:"
    )
    return f"{base_template} {tone_instruction}"


############################### SUMMARIZATION ####################################

SUMMARIZE_CONTEXT = (
    "You are a highly skilled summarization assistant. Your role is to distill the key points and main ideas "
    "from the provided text into a clear, concise summary. Focus on maintaining the original meaning while "
    "removing unnecessary details. Your summary should be direct and to the point, with no introductions, "
    "explanations, or filler words—just the essential information."
)


class SummaryTypeEnum(Enum):
    DETAILED = "detailed"
    BRIEF = "brief"
    NEUTRAL = "neutral"


def get_summary_prompt_template(summary_type: SummaryTypeEnum) -> str:
    """
    Get the summary prompt template based on the summary type.
    """
    base_template = (
        "Summarize the following text while preserving the main ideas. "
        "Do not add any introduction or extra information; just provide the summary directly.\n\n"
    )

    summary_instructions = {
        SummaryTypeEnum.DETAILED.value: (
            "Generate a **comprehensive and in-depth** summary of the text. "
            "Cover all key points, examples, and explanations in detail. "
            "Make sure to include supporting information, context, and any relevant subpoints. "
            "The summary should not omit any important aspects of the text and must provide a thorough overview. "
            "Aim for a length of **at least 150 words**, ensuring a full understanding of the material."
        ),
        SummaryTypeEnum.BRIEF.value: (
            "Generate a **very concise** summary of the text. "
            "Focus only on the primary ideas and avoid any supporting details or examples. "
            "The summary should be no more than **50 words** and should only capture the core message "
            "without elaborating on minor points."
        ),
    }

    summary_instruction = summary_instructions.get(
        summary_type, "Provide a neutral summary that balances detail and brevity."
    )

    return f"{base_template} {summary_instruction}"


############################### STUDY NOTES ####################################

STUDY_NOTES_CONTEXT = (
    "You are a study notes assistant. Your task is to help students create concise and organized study notes "
    "from provided materials. Focus on highlighting key concepts, definitions, and important details, "
    "ensuring that the notes are clear and easy to understand. You should provide the notes without "
    "any introductory or explanatory phrases."
)


class NoteLevelEnum(Enum):
    BRIEF = "1"
    KEY_CONCEPTS = "2"
    DETAILED = "3"


def get_note_prompt_template(note_level: NoteLevelEnum) -> str:
    """
    Get the study note prompt template based on the note level.
    """
    base_template = (
        "Create study notes based on the following text. "
        "Ensure to focus on key concepts and actionable takeaways. "
        "Do not add any introduction or extra information; just provide the notes directly."
    )

    note_instructions = {
        NoteLevelEnum.BRIEF.value: "Create brief high-level study notes that include only the most essential points without going into much detail:",
        NoteLevelEnum.KEY_CONCEPTS.value: "Create study notes that focus on key concepts, bullet points, and actionable takeaways for easy review:",
    }

    note_instruction = note_instructions.get(
        note_level,
        "Create detailed study notes that go in-depth on key concepts and actionable takeaways for easy review:",
    )

    return f"{base_template} {note_instruction}"


############################### QUIZ GENERATION ################################


class QuizModeEnum(Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    FLASH_CARDS = "flash_cards"


MULTIPLE_CHOICE_QUESTION_CONTEXT = (
    "You are an expert quiz generator. Your task is to create multiple-choice questions with exactly four answer options. "
    "For each question, only one option should be correct, and you must clearly mark the correct answer. "
    "Follow the given format strictly without adding any introductions, explanations, or extraneous details."
)


MULTIPLE_CHOICE_QUESTION_PROMPT = (
    "Create {question_count} well-structured, multiple-choice quiz questions on the topic: '{topic}'.\n"
    "Each question must be clear, concise, and educational, covering a variety of aspects of the topic. "
    "Ensure questions range from easy to challenging to create a balanced quiz.\n\n"
    "Use this exact format for each question:\n"
    "Question: <Your multiple-choice question here>\n"
    "1. <Answer option 1>\n"
    "2. <Answer option 2>\n"
    "3. <Answer option 3>\n"
    "4. <Answer option 4>\n"
    "Answer: <Correct answer number here>\n\n"
    "Be sure to provide exactly {question_count} questions, each with four unique answer options. "
    "The correct answer must be indicated after each question."
)

FLASHCARD_CONTEXT = (
    "You are an expert question-answer generator. Your task is to create concise question-answer pairs. "
    "For each question, provide a clear and accurate answer directly related to it. "
    "Follow the given format strictly without adding any introductions, explanations, or extraneous details."
)

FLASHCARD_PROMPT = (
    "Generate {question_count} question about {topic}. "
    "Provide exactly one question and one answer in the following format:\n\n"
    "Question: <Insert question here>\n"
    "Answer: <Insert answer here>\n\n"
    "Follow this format strictly for every question and make sure to have exactly {question_count} questions."
)
