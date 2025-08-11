import re
from functools import lru_cache
from typing import Any

import fitz
import ollama
from rest_framework.exceptions import ValidationError
from youtube_transcript_api import YouTubeTranscriptApi

from .prompts import (
    FLASHCARD_CONTEXT,
    FLASHCARD_PROMPT,
    MULTIPLE_CHOICE_QUESTION_CONTEXT,
    MULTIPLE_CHOICE_QUESTION_PROMPT,
)


def generate_llm_response(messages: list, model: str = "llama3.1") -> dict:
    """
    Generate a response from the AI model based on the provided messages.
    """
    llm_response = ollama.chat(model=model, messages=messages)
    return llm_response["message"]["content"].strip()


def extract_youtube_video_id(url: str) -> str:
    regex = r"(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|(?:www\.)?youtube\.com\/(?:(?:v|e(?:mbed)?)\/|(?:.*[?&]v=)|(?:.*[?&]list=.*[?&]v=)|(?:.*[?&]v=)|(?:.*[?&]vi=)))([a-zA-Z0-9_-]{11})"
    match = re.search(regex, url)
    return match[1] if match else None


@lru_cache(maxsize=128)
def extract_transcript_from_youtube_url(youtube_url: str) -> str:
    """
    Extracts the transcript from a YouTube video URL.
    """
    try:
        video_id = extract_youtube_video_id(youtube_url)
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([entry["text"] for entry in transcript])
    except Exception as e:
        raise ValidationError(
            f"Failed to extract transcript from YouTube URL: {e}"
        ) from e


def extract_text_from_file(file_obj: Any, file_extension: str) -> str:
    """
    Extracts text from a file-like object in memory.

    Args:
        file_obj: A file-like object for .txt or .pdf files.
        file_extension (str): The extension of the file (either '.txt' or '.pdf').

    Returns:
        str: The extracted text.

    Raises:
        UnsupportedFileTypeError: If the file extension is unsupported.
        ValidationError: If a PDF contains images.
    """
    file_extension = file_extension.lower()

    if file_extension == "txt":
        return file_obj.read().decode("utf-8")

    elif file_extension == "pdf":
        file_obj = file_obj.read()
        pdf_document = fitz.open(stream=file_obj, filetype="pdf")
        all_text = ""

        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            if page.get_images(full=True):
                raise ValidationError("PDF contains images")
            text = page.get_text("text")
            all_text += text

        return all_text

    raise ValidationError(f"Unsupported file extension: {file_extension}")


def get_extracted_text_from_sources(body: dict) -> str:
    """
    Get the extracted text from the sources provided in the request body.
    Supported sources include file uploads, YouTube URLs, and text input.

    Args:
        body (dict): The request body containing the sources.

    Returns:
        str: The extracted text from the sources.

    Note:
        The body must be inherited from BaseContentSerializer
    """
    extracted_text = ""

    if file := body.get("file"):
        file_extension = file.name.split(".")[-1]
        extracted_text += extract_text_from_file(file, file_extension)

    if youtube_url := body.get("youtube_url"):
        extracted_text += extract_transcript_from_youtube_url(youtube_url)

    if text := body.get("text"):
        extracted_text += text

    return extracted_text


def create_prompt_and_get_response(context: str, body: dict, template: str) -> tuple:
    """
    Create a prompt for the AI model and get the response.
    """
    extracted_text = get_extracted_text_from_sources(body)
    user_message = f"{template}\n{extracted_text}"

    prompts = [
        {"role": "system", "content": context},
        {"role": "user", "content": user_message},
    ]

    return generate_llm_response(prompts), extracted_text


def convert_multi_choice_quiz_to_question_dict(
    input_string: str, question_count: int
) -> list:
    """
    Convert the input string containing quiz questions to a list of dictionaries.
    """
    questions = []

    raw_questions = re.split(r"Question:", input_string.strip())[1:]

    for raw_question in raw_questions:
        if question_text_match := re.search(r"(.+?)\n1\.", raw_question, re.DOTALL):
            question_text = question_text_match[1].strip()
        else:
            continue

        # Extract the answer options
        options_match = re.findall(r"(\d)\.\s(.+)", raw_question)
        options = dict(options_match)

        # Extract the correct answer
        correct_answer_match = re.search(r"Answer:\s*(\d)", raw_question)
        correct_answer = (
            correct_answer_match[1].strip() if correct_answer_match else None
        )

        questions.append(
            {
                "question": question_text,
                "options": options,
                "correct_answer": correct_answer,
            }
        )

    if len(questions) > question_count:
        questions = questions[:question_count]

    return questions


def generate_multi_choice_quiz_questions(
    topic: str,
    question_count: int,
    context: str = MULTIPLE_CHOICE_QUESTION_CONTEXT,
    prompt: str = MULTIPLE_CHOICE_QUESTION_PROMPT,
    extra_questions: int = 1,
) -> list:
    """
    Generate quiz questions based on the provided mode and topic.
    Note:
        extra_questions is used to generate more questions than requested to ensure
        that the final list contains the required number of questions after filtering.
    """
    system_message = {
        "role": "system",
        "content": context,
    }
    user_message = prompt.format(
        question_count=question_count + extra_questions, topic=topic
    )
    llm_response = generate_llm_response(
        [system_message, {"role": "user", "content": user_message}]
    )
    return convert_multi_choice_quiz_to_question_dict(llm_response, question_count)


def extract_flashcards(flashcard_text: str, question_count: int) -> list:
    """
    Extract flashcards from the provided text.
    """
    pattern = r"Question: (.*?)\nAnswer: (.*?)(?=\n\n|\Z)"
    matches = re.findall(pattern, flashcard_text, re.DOTALL)

    result = [
        {"Question": question.strip(), "Answer": answer.strip()}
        for question, answer in matches
    ]

    if len(result) > question_count:
        result = result[:question_count]

    return result


def generate_flash_quiz_questions(
    topic: str,
    question_count: int,
    context: str = FLASHCARD_CONTEXT,
    prompt: str = FLASHCARD_PROMPT,
    extra_questions: int = 1,
) -> list:
    """
    Generate quiz questions based on the provided mode and topic.
    """
    system_message = {
        "role": "system",
        "content": context,
    }
    user_message = prompt.format(
        question_count=question_count + extra_questions, topic=topic
    )
    llm_response = generate_llm_response(
        [system_message, {"role": "user", "content": user_message}]
    )
    return extract_flashcards(llm_response, question_count)
