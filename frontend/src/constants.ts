export const baseAPIUrl = window.baseAPIURL || "http://127.0.0.1:8000";

export const modes = [
  "study-buddy-mode",
  "create-study-notes-mode",
  "summarize-mode",
  "paraphrase-mode",
  "quiz-me-mode",
];

export const backendModes = ["study_buddy", "study_notes", "summarize"];

export const backendCreateStudyNotesModeRangeTextVals = ["1", "2", "3"];
export const backendSummarizeModeRangeTextVals = ["brief", "detailed"];
export const backendParaphraseModeRangeTextVals = [
  "friendly",
  "neutral",
  "formal",
];
export const backendQuizMeModeRangeTextVals = [
  "multiple_choice",
  "flash_cards",
];
