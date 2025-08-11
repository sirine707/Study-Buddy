import { useState, useRef, useEffect } from "react";
import "./App.scss";
import Markdown from "react-markdown";

import ChatbotTypingAnimation from "./components/ChatbotTypingAnimation";
import MultipleChoiceModeView from "./components/MultipleChoiceModeView";
import FlashcardsModeView from "./components/FlashcardsModeView";

import {
  baseAPIUrl,
  modes,
  backendModes,
  backendCreateStudyNotesModeRangeTextVals,
  backendSummarizeModeRangeTextVals,
  backendParaphraseModeRangeTextVals,
  backendQuizMeModeRangeTextVals,
} from "./constants";

const App = () => {
  // STATE
  const chatHistoryRef = useRef(null);
  const userInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadPopoverRef = useRef(null);

  const [selectedModeIdx, setSelectedModeIdx] = useState(0); // ! TODO: CHANGE TO 0
  const [createStudyNotesModeRangeVal, setCreateStudyNotesModeRangeVal] =
    useState(0);
  const [summarizeModeRangeVal, setSummarizeModeRangeVal] = useState(0);
  const [paraphraseModeRangeVal, setParaphraseModeRangeVal] = useState(0);
  const [quizModeRangeVal, setQuizModeRangeVal] = useState(0); // ! TODO: CHANGE TO 0

  const [isYouTubeURLPasted, setIsYouTubeURLPasted] = useState(false);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [userInput, setUserInput] = useState("");

  const [messageList, setMessageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [paraphraseModeInputText, setParaphraseModeInputText] = useState("");
  const [paraphraseModeOutputText, setParaphraseModeOutputText] =
    useState(null);

  const [isFileParaphraseModeLoading, setIsFileParaphraseModeLoading] =
    useState(false);
  const [isTextParaphraseModeLoading, setIsTextParaphraseModeLoading] =
    useState(false);

  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [isModeBaseSelected, setIsModeBaseSelected] = useState(false);
  const [modeBase, setModeBase] = useState(null);
  const [isAwaitingCustomTopic, setIsAwaitingCustomTopic] = useState(false);
  const [customTopic, setCustomTopic] = useState(null);
  const [isAwaitingQuizCount, setIsAwaitingQuizCount] = useState(false);
  const [quizCount, setQuizCount] = useState(null);
  const [quizList, setQuizList] = useState(null); // ! TODO: CHANGE TO null
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isUploadPopoverOpen, setIsUploadPopoverOpen] = useState(false);

  // LOGIC
  const paraphraseModeInputTextWordCount = paraphraseModeInputText.trim()
    ? paraphraseModeInputText.trim().split(" ").length
    : 0;
  const paraphraseModeInputTextCharCount =
    paraphraseModeInputText.trim().length;

  const paraphraseModeOutputTextWordCount = paraphraseModeOutputText?.trim()
    ? paraphraseModeOutputText?.trim().split(" ").length
    : 0;
  const paraphraseModeOutputTextCharCount =
    paraphraseModeOutputText?.trim().length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        uploadPopoverRef.current &&
        !uploadPopoverRef.current.contains(event.target)
      )
        setIsUploadPopoverOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [uploadPopoverRef]);

  const getModeClassName = (modeIdx) => {
    return `${modes[modeIdx]} ${
      modeIdx === selectedModeIdx ? "selected" : ""
    } ${
      modeIdx === selectedModeIdx || modeIdx < selectedModeIdx
        ? "left-aligned"
        : "right-aligned"
    } ${modeIdx === 0 ? "" : "left-margined"}`;
  };

  const getModeStyle = (modeIdx) => {
    return {
      zIndex:
        modeIdx === selectedModeIdx
          ? 5
          : modeIdx < selectedModeIdx
          ? modeIdx
          : 5 - modeIdx,
      cursor: modeIdx === selectedModeIdx ? "default" : "pointer",
    };
  };

  const handleOpenFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!["text/plain", "application/pdf"].includes(file.type))
      alert("Please enter a text or PDF file.");
    else
      setSelectedFile({
        name: file.name,
        type: "file",
        file,
      });

    e.target.value = null;
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleYouTubeURLChange = (e) => {
    const url = e.target.value;

    if (!isYouTubeURLPasted) setYoutubeURL(e.target.value);
    setIsYouTubeURLPasted(false);

    let isValid = true;

    if (url) {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      const match = url.match(regExp);

      isValid = match && match[2].length === 11;
    } else isValid = false;

    setYoutubeURL("");

    if (!isValid) {
      alert("Please enter a valid YouTube URL.");
      return;
    }

    setSelectedFile({
      name: url,
      type: "youtube",
      url,
    });
  };

  const handleStartOver = (mainOnly = false) => {
    if (!mainOnly) {
      // setSelectedModeIdx(0);
      // setCreateStudyNotesModeRangeVal(0);
      // setSummarizeModeRangeVal(0);
      // setParaphraseModeRangeVal(0);
      // setQuizModeRangeVal(0);

      setIsYouTubeURLPasted(false);
      setYoutubeURL("");
      setSelectedFile(null);
    }

    // SWITCH MODE / NEW QUIZ / ERROR
    setUserInput("");
    setMessageList([]);
    setParaphraseModeInputText("");
    setParaphraseModeOutputText(null);
    setIsFileParaphraseModeLoading(false);
    setIsTextParaphraseModeLoading(false);
    setIsLLMLoading(false);
    setIsModeBaseSelected(false);
    setModeBase(null);
    setIsAwaitingCustomTopic(false);
    setCustomTopic(null);
    setIsAwaitingQuizCount(false);
    setQuizCount(null);
    setQuizList(null);
    // setIsTextCopied(false);
    setIsUploadPopoverOpen(false);
  };

  const scrollToChatEnd = () => {
    // TODO: SCROLL TO LAST MESSAGE (DOESN'T MATTER IF WAS FROM USER OR SYSTEM)

    const chat = chatHistoryRef.current;

    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSetSelectedMode = (modeIdx) => {
    setSelectedModeIdx(modeIdx);
    handleStartOver(true);
  };

  // API CALLS
  const handleParaphrase = (option) => {
    if (
      (option === "file" && !selectedFile) ||
      (option === "text" && !paraphraseModeInputTextWordCount)
    )
      return;

    const form = new FormData();
    form.append(
      "tone",
      backendParaphraseModeRangeTextVals[paraphraseModeRangeVal]
    );

    if (option === "file") {
      setIsFileParaphraseModeLoading(true);
      if (selectedFile.type === "file") form.append("file", selectedFile.file);
      if (selectedFile.type === "youtube")
        form.append("youtube_url", selectedFile.url);
    } else {
      setIsTextParaphraseModeLoading(true);
      form.append("text", paraphraseModeInputText);
    }

    const options = {
      method: "POST",
      body: form,
    };

    fetch(`${baseAPIUrl}/study_buddy_api/paraphrase/`, options)
      .then(async (response) => {
        if (!response.ok) {
          const errorResponse = await response.json();
          const errorMessage = errorResponse[0];
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((response) => {
        setParaphraseModeOutputText(response.data);
        setIsFileParaphraseModeLoading(false);
        setIsTextParaphraseModeLoading(false);
      })
      .catch((err) => {
        console.log(err);

        if (err.message.startsWith("PDF contains images")) {
          alert(
            "I'm still learning and can't interact with the images in your file yet :)"
          );
          handleStartOver(true);
          return;
        } else if (
          err.message.startsWith(
            "Failed to extract transcript from YouTube URL"
          )
        ) {
          alert("Please use a YouTube video that includes a transcript!");
          handleStartOver(true);
          return;
        }

        alert("An error occurred.");
        setIsFileParaphraseModeLoading(false);
        setIsTextParaphraseModeLoading(false);
      });
  };

  const sendCreateStudyNotesOrSummarizeMessage = (
    option,
    newMessageList = null
  ) => {
    const form = new FormData();

    const levelArr =
      selectedModeIdx === 1
        ? backendCreateStudyNotesModeRangeTextVals
        : backendSummarizeModeRangeTextVals;

    const level =
      levelArr[
        selectedModeIdx === 1
          ? createStudyNotesModeRangeVal
          : summarizeModeRangeVal
      ];

    form.append(selectedModeIdx === 1 ? "level" : "summary_type", level);

    setIsLLMLoading(true);

    if (option === "file") {
      if (selectedFile.type === "file") form.append("file", selectedFile.file);
      if (selectedFile.type === "youtube")
        form.append("youtube_url", selectedFile.url);
    } else {
      form.append("text", userInput);
    }

    const options = {
      method: "POST",
      body: form,
    };

    fetch(
      `${baseAPIUrl}/study_buddy_api/${
        selectedModeIdx === 1 ? "note" : "summarize"
      }/`,
      options
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorResponse = await response.json();
          const errorMessage = errorResponse[0];
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((response) => {
        setMessageList([
          ...(newMessageList !== null ? newMessageList : messageList),
          {
            role: "system",
            content: response.data,
          },
        ]);

        setIsLLMLoading(false);

        setTimeout(() => {
          scrollToChatEnd();
          userInputRef.current.focus();

          setTimeout(() => {
            setMessageList((messages) => [
              ...messages,
              {
                role: "system",
                content:
                  "Please let me know if you have any questions or would like me to dive into more detail on a specific point!",
              },
            ]);

            setTimeout(() => {
              scrollToChatEnd();
              userInputRef.current.focus();
            }, 100);
          }, 500);
        }, 100);
      })
      .catch((err) => {
        console.log(err);

        if (err.message.startsWith("PDF contains images")) {
          alert(
            "I'm still learning and can't interact with the images in your file yet :)"
          );
          handleStartOver(true);
          return;
        } else if (
          err.message.startsWith(
            "Failed to extract transcript from YouTube URL"
          )
        ) {
          alert("Please use a YouTube video that includes a transcript!");
          handleStartOver(true);
          return;
        }

        alert("An error occurred.");
        setIsLLMLoading(false);
      });
  };

  const handleSendUserMsg = () => {
    if (!userInput.trim()) return;

    const newMessageList = [
      ...messageList,
      {
        role: "user",
        content: userInput,
      },
    ];

    setMessageList(newMessageList);

    if (isAwaitingCustomTopic) {
      setCustomTopic(userInput);
      setIsAwaitingCustomTopic(false);

      setUserInput("");

      if (selectedModeIdx === 1 || selectedModeIdx === 2)
        sendCreateStudyNotesOrSummarizeMessage("text", newMessageList);
      else {
        setTimeout(() => {
          setIsAwaitingQuizCount(true);
        }, 500);
      }
    } else {
      setUserInput("");

      setIsLLMLoading(true);

      const data = {
        history: newMessageList.slice(-10),
        context: backendModes[selectedModeIdx],
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      fetch(`${baseAPIUrl}/study_buddy_api/chat/`, options)
        .then(async (response) => {
          if (!response.ok) {
            const errorResponse = await response.json();
            const errorMessage = errorResponse[0];
            throw new Error(errorMessage);
          }
          return response.json();
        })
        .then((response) => {
          setIsLLMLoading(false);

          setMessageList([
            ...newMessageList,
            {
              role: "system",
              content: response.data,
            },
          ]);

          setTimeout(() => {
            scrollToChatEnd();
            userInputRef.current.focus();
          }, 100);
        })
        .catch((err) => {
          console.error(err);
          //   alert("An error occurred.");
          setIsLLMLoading(false);
        });
    }

    setTimeout(() => {
      scrollToChatEnd();
    }, 100);
  };

  const handleUseUploadedFile = () => {
    if (!selectedFile) return;

    setIsModeBaseSelected(true);
    setModeBase("uploaded_file");
    sendCreateStudyNotesOrSummarizeMessage("file");
  };

  const handleUseCustomTopic = () => {
    setIsModeBaseSelected(true);
    setModeBase("custom_text");
    setIsAwaitingCustomTopic(true);

    const newMessageList = [
      {
        role: "user",
        content: "Custom Topic",
      },
    ];

    setMessageList(newMessageList);

    setTimeout(() => {
      setMessageList([
        ...newMessageList,
        {
          role: "system",
          content: `Great! Please provide the topic you’d like me to ${
            selectedModeIdx === 1
              ? "create study notes"
              : selectedModeIdx === 2
              ? "summarize"
              : "..."
          } on.`,
        },
      ]);
    }, 500);
  };

  const handleUseQuizModeUploadedFile = () => {
    if (!selectedFile) return;

    setIsModeBaseSelected(true);
    setModeBase("uploaded_file");

    setTimeout(() => {
      setIsAwaitingQuizCount(true);
    }, 500);
  };

  const handleUseQuizModeCustomTopic = () => {
    setIsModeBaseSelected(true);
    setModeBase("custom_text");
    setIsAwaitingCustomTopic(true);

    const newMessageList = [
      {
        role: "user",
        content: "Custom Topic",
      },
    ];

    setMessageList(newMessageList);

    setTimeout(() => {
      setMessageList([
        ...newMessageList,
        {
          role: "system",
          content:
            "Great! Please provide the topic you’d like me to quiz you on.",
        },
      ]);
    }, 500);
  };

  const handleSetQuizCount = (count) => {
    setQuizCount(count);
    setIsAwaitingQuizCount(false);

    const form = new FormData();

    form.append("mode", backendQuizMeModeRangeTextVals[quizModeRangeVal]);

    setIsLLMLoading(true);

    if (modeBase === "uploaded_file") {
      if (selectedFile.type === "file") form.append("file", selectedFile.file);
      if (selectedFile.type === "youtube")
        form.append("youtube_url", selectedFile.url);
    } else {
      form.append("text", customTopic);
    }

    form.append("question_count", count);

    const options = {
      method: "POST",
      body: form,
    };

    fetch(`${baseAPIUrl}/study_buddy_api/quiz/`, options)
      .then(async (response) => {
        if (!response.ok) {
          const errorResponse = await response.json();
          const errorMessage = errorResponse[0];
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then((response) => {
        setQuizList(response.data);
        setIsLLMLoading(false);
      })
      .catch((err) => {
        console.log(err);

        if (err.message.startsWith("PDF contains images")) {
          alert(
            "I'm still learning and can't interact with the images in your file yet :)"
          );
          handleStartOver(true);
          return;
        } else if (
          err.message.startsWith(
            "Failed to extract transcript from YouTube URL"
          )
        ) {
          alert("Please use a YouTube video that includes a transcript!");
          handleStartOver(true);
          return;
        }

        alert("An error occurred.");
        setIsLLMLoading(false);
      });
  };

  const handleStartNewQuiz = () => {
    handleStartOver(true);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(paraphraseModeOutputText);

    setIsTextCopied(true);

    setTimeout(() => {
      setIsTextCopied(false);
    }, 2000);
  };

  const handleOpenUploadPopover = () => {
    setIsUploadPopoverOpen(
      (prevIsUploadPopoverOpen) => !prevIsUploadPopoverOpen
    );
  };

  return (
    <div className="container">
      <div className="first-row">
        <div className="welcome">
          <div className="title">
            <p>Hey!</p>
            <img
              src={
                "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804721/ensuite/waving-hand_aqf15n.svg"
              }
              alt="Waving Hand"
            />
          </div>
          <p className="description">
            I’ll be your personal Study Buddy. You can start chatting or{" "}
            <span>select a mode</span>
          </p>

          <div className="mobile-title">
            <p>Hey 👋</p>
          </div>
          <div className="mobile-btns">
            <div
              className="start-over-btn"
              onClick={() => handleStartOver(false)}
            >
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804539/ensuite/start-over_v23n9x.svg"
                }
                alt="Start Over"
              />
              <span>Start Over</span>
            </div>
            <div className="upload-btn" onClick={handleOpenUploadPopover}>
              <span>Upload</span>
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804602/ensuite/upload_xvfyme.svg"
                }
                alt="Upload"
              />
            </div>
          </div>
          {isUploadPopoverOpen && (
            <div className="upload-popover" ref={uploadPopoverRef}>
              <div className="popover-helper" onClick={handleOpenFile}>
                <img
                  src={
                    "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804572/ensuite/upload-file_caqrsr.svg"
                  }
                  alt="Upload File"
                />
                <p>Upload a File</p>
                <p>
                  Click to browse or
                  <br />
                  drag & drop a file here
                </p>
              </div>

              <input
                type="text"
                value={youtubeURL}
                placeholder="Paste YouTube URL..."
                onPaste={() => setIsYouTubeURLPasted(true)}
                onChange={(e) => handleYouTubeURLChange(e)}
              />

              {selectedFile && (
                <div className="attached-file">
                  <p>Attached File</p>

                  <div className="file-item">
                    <img
                      src={
                        "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804687/ensuite/file_o4b3rs.svg"
                      }
                      alt="File"
                    />
                    <p>{selectedFile.name}</p>
                    <img
                      src={
                        "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804724/ensuite/cross_vmuzaz.svg"
                      }
                      alt="Remove File"
                      onClick={handleRemoveSelectedFile}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modes">
          <div
            className={getModeClassName(0)}
            style={getModeStyle(0)}
            onClick={() => selectedModeIdx !== 0 && handleSetSelectedMode(0)}
          >
            <p className="title">Study Buddy</p>
            <p className="description">General Academic Support</p>
          </div>
          <div
            className={getModeClassName(1)}
            style={getModeStyle(1)}
            onClick={() => selectedModeIdx !== 1 && handleSetSelectedMode(1)}
          >
            <p className="title">Create Study Notes</p>

            <div className="range-container">
              <p>Detail</p>

              <input
                type="range"
                min="0"
                max="2"
                value={createStudyNotesModeRangeVal}
                onChange={(e) =>
                  setCreateStudyNotesModeRangeVal(e.target.value)
                }
                disabled={selectedModeIdx !== 1}
              />

              <div>
                <p>1</p>
                <p>2</p>
                <p>3</p>
              </div>
            </div>
          </div>
          <div
            className={getModeClassName(2)}
            style={getModeStyle(2)}
            onClick={() => selectedModeIdx !== 2 && handleSetSelectedMode(2)}
          >
            <p className="title">Summarize</p>

            <div className="range-container">
              <p>Type</p>

              <input
                type="range"
                min="0"
                max="1"
                value={summarizeModeRangeVal}
                onChange={(e) => setSummarizeModeRangeVal(e.target.value)}
                disabled={selectedModeIdx !== 2}
              />

              <div>
                <p>Brief</p>
                <p>Detailed</p>
              </div>
            </div>
          </div>
          <div
            className={getModeClassName(3)}
            style={getModeStyle(3)}
            onClick={() => selectedModeIdx !== 3 && handleSetSelectedMode(3)}
          >
            <p className="title">Paraphrase</p>

            <div className="range-container">
              <p>Tone</p>

              <input
                type="range"
                min="0"
                max="2"
                value={paraphraseModeRangeVal}
                onChange={(e) => setParaphraseModeRangeVal(e.target.value)}
                disabled={selectedModeIdx !== 3}
              />

              <div>
                <p>Friendly</p>
                <p>Neutral</p>
                <p>Formal</p>
              </div>
            </div>
          </div>
          <div
            className={getModeClassName(4)}
            style={getModeStyle(4)}
            onClick={() => selectedModeIdx !== 4 && handleSetSelectedMode(4)}
          >
            <p className="title">Quiz Me</p>

            <div className="range-container">
              <p>Mode</p>

              <input
                type="range"
                min="0"
                max="1"
                value={quizModeRangeVal}
                onChange={(e) => setQuizModeRangeVal(e.target.value)}
                disabled={selectedModeIdx !== 4 || quizList !== null}
              />

              <div>
                <p>Multiple Choice</p>
                <p>Flashcards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="second-row">
        <div className="side-actions">
          <div
            className="start-over-btn"
            onClick={() => handleStartOver(false)}
          >
            <img
              src={
                "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804539/ensuite/start-over_v23n9x.svg"
              }
              alt="Start Over"
            />
            <span>Start Over</span>
          </div>

          <div className="upload-placeholder">
            <div className="helper" onClick={handleOpenFile}>
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804572/ensuite/upload-file_caqrsr.svg"
                }
                alt="Upload File"
              />
              <p className="title">Upload a File</p>
              <p className="description">
                Click to browse or
                <br />
                drag & drop a file here
              </p>
            </div>

            <input
              type="text"
              value={youtubeURL}
              placeholder="Paste YouTube URL..."
              onPaste={() => setIsYouTubeURLPasted(true)}
              onChange={(e) => handleYouTubeURLChange(e)}
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="file-item">
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804687/ensuite/file_o4b3rs.svg"
                }
                alt="File"
              />
              <p>{selectedFile.name}</p>
              <img
                src={
                  "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804724/ensuite/cross_vmuzaz.svg"
                }
                alt="Remove File"
                onClick={handleRemoveSelectedFile}
              />
            </div>
          )}
        </div>

        {[0, 1, 2, 4].includes(selectedModeIdx) && (
          <div className="chat default-mode">
            {!quizList && (
              <>
                <div className="history" ref={chatHistoryRef}>
                  {selectedModeIdx === 0 && (
                    <div className="init-message study-buddy-mode">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />

                      <div>
                        <p>Study Buddy</p>
                        <p>You can ask me questions...</p>
                      </div>
                    </div>
                  )}

                  {selectedModeIdx === 1 && (
                    <div className="init-message other-modes">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />

                      <div>
                        <p>Create Study Notes</p>

                        <p>
                          Do you want me to create study notes based on a file
                          you&apos;ve uploaded or a custom topic?
                        </p>

                        <div className="btns-container">
                          <div
                            className={`${
                              !selectedFile || isModeBaseSelected
                                ? "disabled"
                                : ""
                            }`}
                            onClick={handleUseUploadedFile}
                          >
                            Uploaded File
                          </div>
                          <div
                            className={`${
                              isModeBaseSelected ? "disabled" : ""
                            }`}
                            onClick={handleUseCustomTopic}
                          >
                            Custom Topic
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedModeIdx === 2 && (
                    <div className="init-message other-modes">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />

                      <div>
                        <p>Summarize</p>

                        <p>
                          Do you want me to summarize the file you&apos;ve uploaded
                          or a custom topic?
                        </p>

                        <div className="btns-container">
                          <div
                            className={`${
                              !selectedFile || isModeBaseSelected
                                ? "disabled"
                                : ""
                            }`}
                            onClick={handleUseUploadedFile}
                          >
                            Uploaded File
                          </div>
                          <div
                            className={`${
                              isModeBaseSelected ? "disabled" : ""
                            }`}
                            onClick={handleUseCustomTopic}
                          >
                            Custom Topic
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedModeIdx === 4 && (
                    <div className="init-message other-modes">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />

                      <div>
                        <p>Quiz Mode</p>

                        <p>
                          Would you like me to quiz you on the file you uploaded
                          or a custom topic?
                        </p>

                        <div className="btns-container">
                          <div
                            className={`${
                              !selectedFile || isModeBaseSelected
                                ? "disabled"
                                : ""
                            }`}
                            onClick={handleUseQuizModeUploadedFile}
                          >
                            Uploaded File
                          </div>
                          <div
                            className={`${
                              isModeBaseSelected ? "disabled" : ""
                            }`}
                            onClick={handleUseQuizModeCustomTopic}
                          >
                            Custom Topic
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {messageList.map((message, idx) =>
                    message.role === "user" ? (
                      <div key={idx} className="user-msg">
                        <div>
                          <Markdown>{message.content}</Markdown>
                        </div>
                        <img
                          src={
                            "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804627/ensuite/user-avatar_fulu8b.svg"
                          }
                          alt="User Avatar"
                        />
                      </div>
                    ) : (
                      <div key={idx} className="system-msg">
                        <img
                          src={
                            "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                          }
                          alt="Assistant Avatar"
                        />
                        <div>
                          <Markdown>{message.content}</Markdown>
                        </div>
                      </div>
                    )
                  )}

                  {isLLMLoading && (
                    <div className="system-msg">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />
                      <ChatbotTypingAnimation />
                    </div>
                  )}

                  {isAwaitingQuizCount && quizCount === null && (
                    <div className="quiz-count-request-system-msg">
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                        }
                        alt="Assistant Avatar"
                      />
                      <div>
                        <p>
                          How many{" "}
                          {Number(quizModeRangeVal) === 0
                            ? "questions"
                            : "flashcards"}{" "}
                          would you like me to create?
                        </p>
                        <div className="options">
                          {[5, 10, 15, 20, 25].map((count) => (
                            <p
                              key={count}
                              onClick={() => handleSetQuizCount(count)}
                            >
                              {count}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-input-container">
                  <input
                    type="text"
                    placeholder="Click here to start typing..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendUserMsg();
                    }}
                    disabled={
                      isLLMLoading ||
                      (selectedModeIdx !== 0 && !isModeBaseSelected) ||
                      isAwaitingQuizCount
                    }
                    ref={userInputRef}
                  />

                  <div
                    className={`send-btn ${
                      isLLMLoading ||
                      (selectedModeIdx !== 0 && !isModeBaseSelected) ||
                      isAwaitingQuizCount
                        ? "disabled"
                        : ""
                    }`}
                    onClick={handleSendUserMsg}
                  >
                    <img
                      src={
                        "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804456/ensuite/input-arrow_ro6bkp.svg"
                      }
                      alt="Input Arrow"
                    />
                  </div>
                </div>
              </>
            )}

            {quizList &&
              (Number(quizModeRangeVal) === 0 ? (
                <MultipleChoiceModeView
                  quizList={quizList}
                  handleStartNewQuiz={handleStartNewQuiz}
                />
              ) : (
                <FlashcardsModeView
                  quizList={quizList}
                  handleStartNewQuiz={handleStartNewQuiz}
                />
              ))}
          </div>
        )}

        {selectedModeIdx === 3 && (
          <div className="chat paraphrase-mode">
            <div className="input">
              <div className="first-row">
                <img
                  src={
                    "https://res.cloudinary.com/dgihbgsnz/image/upload/v1751841964/clickup-ai-logo-rect_sxofcz.png"
                  }
                  alt="Assistant Avatar"
                />
                <div>
                  <p>Paraphrase</p>
                  <p>Start typing the text you’d like me to paraphrase.</p>
                </div>
              </div>

              <div className="second-row">
                <textarea
                  name=""
                  id=""
                  placeholder="Click here to start typing..."
                  value={paraphraseModeInputText}
                  onChange={(e) => setParaphraseModeInputText(e.target.value)}
                ></textarea>

                <div className="counts">
                  <p>
                    {paraphraseModeInputTextWordCount} Word
                    {paraphraseModeInputTextWordCount < 2 ? "" : "s"} •{" "}
                    {paraphraseModeInputTextCharCount} Character
                    {paraphraseModeInputTextCharCount < 2 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="third-row">
                <div
                  className={`${
                    !selectedFile || isFileParaphraseModeLoading
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() => handleParaphrase("file")}
                >
                  Paraphrase File{isFileParaphraseModeLoading && "..."}
                </div>
                <div
                  className={`${
                    !paraphraseModeInputTextWordCount ||
                    isTextParaphraseModeLoading
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() => handleParaphrase("text")}
                >
                  Paraphrase Text{isTextParaphraseModeLoading && "..."}
                </div>
              </div>
            </div>

            <div className="output">
              {isFileParaphraseModeLoading || isTextParaphraseModeLoading ? (
                <ChatbotTypingAnimation />
              ) : (
                <>
                  <p className="text">
                    {paraphraseModeOutputText === null ? (
                      "The paraphrased text will appear here"
                    ) : (
                      <Markdown>{paraphraseModeOutputText}</Markdown>
                    )}
                  </p>
                  {paraphraseModeOutputText !== null && (
                    <div className="counts">
                      <p>
                        {paraphraseModeOutputTextWordCount} Word
                        {paraphraseModeOutputTextWordCount < 2
                          ? ""
                          : "s"} • {paraphraseModeOutputTextCharCount} Character
                        {paraphraseModeOutputTextCharCount < 2 ? "" : "s"}
                      </p>
                      <img
                        src={
                          "https://res.cloudinary.com/dgihbgsnz/image/upload/v1727804403/ensuite/copy-text_cyv1lc.svg"
                        }
                        alt="Copy Text"
                        onClick={handleCopyText}
                        className={`${isTextCopied ? "disabled" : ""}`}
                      />
                      <div className={`copied ${isTextCopied ? "show" : ""}`}>
                        Copied
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

