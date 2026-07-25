import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Webcam from "react-webcam";

import api from "../services/api";

import {
  uploadInterviewVideo,
} from "../services/interviewVideoApi";

import {
  toast,
} from "react-toastify";

import {
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaPaperPlane,
  FaMicrophone,
  FaStop,
  FaVideo,
  FaCheckCircle,
} from "react-icons/fa";

import useSpeechRecognition
  from "../hooks/useSpeechRecognition";

import "./InterviewRoomV2.css";

function InterviewRoomV2() {

  // =====================================================
  // Router
  // =====================================================

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  // =====================================================
  // Refs
  // =====================================================

  const webcamRef =
    useRef(null);

  const mediaRecorderRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  // Used when finish is waiting
  // for recording upload.

  const finishInterviewRef =
    useRef(false);

  // Prevent multiple finish requests.

  const finishProcessingRef =
    useRef(false);

  // Keeps latest answer available
  // inside recorder callbacks.

  const answerRef =
    useRef("");

  // Keeps latest timer available
  // inside recorder callbacks.

  const timerRef =
    useRef(0);

  // Keeps latest question index.

  const currentQuestionRef =
    useRef(0);

  // Keeps latest interview object.

  const interviewRef =
    useRef(null);

  // Used to detect speech that was
  // already inserted into answer.

  const previousTranscriptRef =
    useRef("");

  // Used to avoid state updates
  // after component unmount.

  const mountedRef =
    useRef(true);

  // =====================================================
  // States
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [savingAnswer, setSavingAnswer] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [interview, setInterview] =
    useState(null);

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [answer, setAnswer] =
    useState("");

  const [timer, setTimer] =
    useState(0);

  const [videoUrl, setVideoUrl] =
    useState("");

  // =====================================================
  // Speech Recognition
  // =====================================================

  const {

    transcript,

    interimTranscript,

    listening,

    supported,

    speechError,

    startListening,

    stopListening,

    resetTranscript,

    setSpeechTranscript,

  } = useSpeechRecognition();

  // =====================================================
  // Keep Refs Synchronized
  // =====================================================

  useEffect(() => {

    answerRef.current =
      answer;

  }, [answer]);

  useEffect(() => {

    timerRef.current =
      timer;

  }, [timer]);

  useEffect(() => {

    currentQuestionRef.current =
      currentQuestion;

  }, [currentQuestion]);

  useEffect(() => {

    interviewRef.current =
      interview;

  }, [interview]);

  // =====================================================
  // Camera Permission
  // =====================================================

  useEffect(() => {

    let permissionStream = null;

    const initializeCamera =
      async () => {

        try {

          // =============================================
          // Browser Support
          // =============================================

          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices
              .getUserMedia
          ) {

            throw new Error(
              "Camera and microphone are not supported."
            );

          }

          // =============================================
          // Ask Permission
          // =============================================

          permissionStream =
            await navigator.mediaDevices
              .getUserMedia({

                video: true,

                audio: true,

              });

          // =============================================
          // Permission Successful
          // =============================================

          if (mountedRef.current) {

            setCameraReady(true);

            setCameraError("");

          }

          // Webcam component will create/use
          // its own stream, so permission-check
          // stream can be stopped.

          permissionStream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );

          permissionStream =
            null;

        }

        catch (error) {

          console.error(
            "Camera Permission Error:",
            error
          );

          if (
            mountedRef.current
          ) {

            setCameraReady(false);

            setCameraError(
              "Camera or microphone permission denied."
            );

          }

          toast.error(
            "Please allow Camera & Microphone permission."
          );

        }

      };

    initializeCamera();

    return () => {

      if (permissionStream) {

        permissionStream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

      }

    };

  }, []);

  // =====================================================
  // Load Interview
  // =====================================================

  const loadInterview =
    useCallback(async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        // =============================================
        // Token Check
        // =============================================

        if (!token) {

          toast.error(
            "Please login again."
          );

          navigate(
            "/login"
          );

          return;

        }

        // =============================================
        // Fetch Interview
        // =============================================

        const response =
          await api.get(

            `/interview/${id}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        const interviewData =
          response.data?.interview;

        // =============================================
        // Validate Interview
        // =============================================

        if (
          !interviewData ||
          !Array.isArray(
            interviewData.questions
          ) ||
          interviewData.questions
            .length === 0
        ) {

          throw new Error(
            "Interview questions not found."
          );

        }

        // =============================================
        // Set Interview
        // =============================================

        setInterview(
          interviewData
        );

        interviewRef.current =
          interviewData;

        // =============================================
        // Restore First Question
        // =============================================

        const firstQuestion =
          interviewData.questions[0];

        const savedAnswer =
          firstQuestion?.answer ||
          "";

        const savedTime =
          Number(
            firstQuestion?.timeTaken
          ) || 0;

        setCurrentQuestion(0);

        currentQuestionRef.current =
          0;

        setAnswer(
          savedAnswer
        );

        answerRef.current =
          savedAnswer;

        setTimer(
          savedTime
        );

        timerRef.current =
          savedTime;

        previousTranscriptRef.current =
          "";

        resetTranscript();

      }

      catch (error) {

        console.error(
          "Load Interview Error:",
          error
        );

        toast.error(

          error.response?.data
            ?.message ||

          error.message ||

          "Unable to load interview."

        );

        navigate(
          "/dashboard"
        );

      }

      finally {

        if (
          mountedRef.current
        ) {

          setLoading(false);

        }

      }

    }, [
      id,
      navigate,
      resetTranscript,
    ]);

  // =====================================================
  // Fetch Interview Once
  // =====================================================

  useEffect(() => {

    const task = setTimeout(loadInterview, 0);

    return () => clearTimeout(task);

  }, [loadInterview]);

  // =====================================================
  // Timer
  // =====================================================

  useEffect(() => {

    // Timer starts only when
    // interview has loaded.

    if (
      loading ||
      !interview
    ) {

      return;

    }

    const interval =
      setInterval(() => {

        setTimer(
          (previousTime) => {

            const newTime =
              previousTime + 1;

            // Keep ref updated immediately.

            timerRef.current =
              newTime;

            return newTime;

          }
        );

      }, 1000);

    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    loading,
    currentQuestion,
  ]);

  // =====================================================
  // Speech Transcript -> Answer
  // =====================================================

  useEffect(() => {

    if (!transcript) {

      return;

    }

    // =============================================
    // Find Only Newly Spoken Text
    // =============================================

    const previousTranscript =
      previousTranscriptRef.current;

    let newSpeech =
      transcript;

    if (
      previousTranscript &&
      transcript.startsWith(
        previousTranscript
      )
    ) {

      newSpeech =
        transcript
          .slice(
            previousTranscript.length
          )
          .trim();

    }

    previousTranscriptRef.current =
      transcript;

    if (!newSpeech) {

      return;

    }

    // =============================================
    // Append Speech Instead Of Replacing Answer
    // =============================================

    setAnswer(
      (previousAnswer) => {

        const updatedAnswer =
          previousAnswer
            ? `${previousAnswer.trim()} ${newSpeech}`
            : newSpeech;

        answerRef.current =
          updatedAnswer;

        return updatedAnswer;

      }
    );

  }, [transcript]);
    // =====================================================
  // Save Current Answer
  // =====================================================

  const saveAnswer =
    useCallback(async () => {

      const currentInterview =
        interviewRef.current;

      if (!currentInterview) {

        throw new Error(
          "Interview is not available."
        );

      }

      const questionIndex =
        currentQuestionRef.current;

      // =================================================
      // Get Latest Answer + Timer From Refs
      // =================================================

      const currentAnswer =
        String(
          answerRef.current || ""
        ).trim();

      const currentTime =
        Number(
          timerRef.current
        ) || 0;

      try {

        setSavingAnswer(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {

          throw new Error(
            "Login session expired. Please login again."
          );

        }

        // =================================================
        // Save Answer To Backend
        // =================================================

        const response =
          await api.post(

            "/interview/submit-answer",

            {

              interviewId:
                currentInterview._id,

              questionIndex,

              answer:
                currentAnswer,

              timeTaken:
                currentTime,

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        // =================================================
        // Debug
        // =================================================

        console.log(
          "Answer Saved Successfully:",
          {
            questionIndex,
            answer: currentAnswer,
            timeTaken: currentTime,
            response:
              response.data,
          }
        );

        // =================================================
        // Update Local Interview State
        // =================================================

        setInterview(
          (previousInterview) => {

            if (
              !previousInterview
            ) {

              return previousInterview;

            }

            const updatedQuestions =
              previousInterview.questions.map(
                (question, index) => {

                  if (
                    index !==
                    questionIndex
                  ) {

                    return question;

                  }

                  return {

                    ...question,

                    answer:
                      currentAnswer,

                    timeTaken:
                      currentTime,

                    answeredAt:
                      new Date().toISOString(),

                  };

                }
              );

            const updatedInterview = {

              ...previousInterview,

              questions:
                updatedQuestions,

            };

            // Keep ref synchronized immediately.

            interviewRef.current =
              updatedInterview;

            return updatedInterview;

          }
        );

        return {

          success: true,

          answer:
            currentAnswer,

          timeTaken:
            currentTime,

          response:
            response.data,

        };

      }

      catch (error) {

        console.error(
          "Save Answer Error:",
          error
        );

        toast.error(

          error.response?.data
            ?.message ||

          error.message ||

          "Unable to save answer."

        );

        throw error;

      }

      finally {

        if (
          mountedRef.current
        ) {

          setSavingAnswer(false);

        }

      }

    }, []);

  // =====================================================
  // Load Specific Question Into UI
  // =====================================================

  const loadQuestion =
    useCallback(
      (questionIndex) => {

        const currentInterview =
          interviewRef.current;

        if (
          !currentInterview ||
          !Array.isArray(
            currentInterview.questions
          )
        ) {

          return;

        }

        const question =
          currentInterview.questions[
            questionIndex
          ];

        if (!question) {

          return;

        }

        // =================================================
        // Stop Current Speech Session
        // =================================================

        stopListening();

        // =================================================
        // Restore Saved Answer
        // =================================================

        const savedAnswer =
          question.answer || "";

        setAnswer(
          savedAnswer
        );

        answerRef.current =
          savedAnswer;

        // =================================================
        // Restore Question Timer
        // =================================================

        const savedTime =
          Number(
            question.timeTaken
          ) || 0;

        setTimer(
          savedTime
        );

        timerRef.current =
          savedTime;

        // =================================================
        // Update Question Index
        // =================================================

        setCurrentQuestion(
          questionIndex
        );

        currentQuestionRef.current =
          questionIndex;

        // =================================================
        // Reset Speech For New Question
        // =================================================

        previousTranscriptRef.current =
          "";

        resetTranscript();

        // Keep hook's internal transcript
        // synchronized with empty state.

        if (
          typeof setSpeechTranscript ===
          "function"
        ) {

          setSpeechTranscript("");

        }

      },
      [
        stopListening,
        resetTranscript,
        setSpeechTranscript,
      ]
    );

  // =====================================================
  // Handle Typed Answer
  // =====================================================

  const handleAnswerChange =
    (event) => {

      const value =
        event.target.value;

      setAnswer(
        value
      );

      // Keep latest answer available
      // to async callbacks immediately.

      answerRef.current =
        value;

    };

  // =====================================================
  // Start / Stop Microphone
  // =====================================================

  const handleMicrophone =
    () => {

      if (!supported) {

        toast.error(
          "Speech recognition is not supported in this browser."
        );

        return;

      }

      // =================================================
      // Stop Microphone
      // =================================================

      if (listening) {

        stopListening();

        return;

      }

      // =================================================
      // Start New Speech Session
      // =================================================

      previousTranscriptRef.current =
        "";

      resetTranscript();

      startListening();

    };

  // =====================================================
  // Previous Question
  // =====================================================

  const handlePrevious =
    async () => {

      if (
        currentQuestionRef.current ===
        0
      ) {

        return;

      }

      if (
        savingAnswer ||
        finishing
      ) {

        return;

      }

      try {

        // =================================================
        // Stop Speech Before Saving
        // =================================================

        stopListening();

        // =================================================
        // Save Current Question First
        // =================================================

        await saveAnswer();

        // =================================================
        // Move To Previous Question
        // =================================================

        const previousIndex =
          currentQuestionRef.current -
          1;

        loadQuestion(
          previousIndex
        );

      }

      catch (error) {

        console.error(
          "Previous Question Error:",
          error
        );

        // saveAnswer already displays toast.

      }

    };

  // =====================================================
  // Next Question
  // =====================================================

  const handleNext =
    async () => {

      const currentInterview =
        interviewRef.current;

      if (!currentInterview) {

        return;

      }

      if (
        savingAnswer ||
        finishing
      ) {

        return;

      }

      const currentIndex =
        currentQuestionRef.current;

      // =================================================
      // Last Question Protection
      // =================================================

      if (
        currentIndex >=
        currentInterview.questions.length -
          1
      ) {

        return;

      }

      try {

        // =================================================
        // Stop Speech
        // =================================================

        stopListening();

        // =================================================
        // Save Current Answer BEFORE Moving
        // =================================================

        await saveAnswer();

        // =================================================
        // Move To Next Question
        // =================================================

        const nextIndex =
          currentIndex + 1;

        loadQuestion(
          nextIndex
        );

      }

      catch (error) {

        console.error(
          "Next Question Error:",
          error
        );

        // Do NOT change question if
        // backend answer saving failed.

      }

    };

  // =====================================================
  // Speech Error Notification
  // =====================================================

  useEffect(() => {

    if (!speechError) {

      return;

    }

    // "no speech" is common and does not
    // need an aggressive error toast.

    if (
      speechError
        .toLowerCase()
        .includes(
          "no speech"
        )
    ) {

      console.warn(
        speechError
      );

      return;

    }

    console.warn(
      "Speech Error:",
      speechError
    );

  }, [speechError]);

  // =====================================================
  // Current Question Validation
  // =====================================================

  useEffect(() => {

    if (!interview) {

      return;

    }

    if (
      currentQuestion < 0 ||
      currentQuestion >=
        interview.questions.length
    ) {

      console.warn(
        "Invalid Question Index:",
        currentQuestion
      );

      loadQuestion(0);

    }

  }, [
    currentQuestion,
    interview,
    loadQuestion,
  ]);
    // =====================================================
  // Start Interview Recording
  // =====================================================

  const startInterviewRecording =
    useCallback(() => {

      // =================================================
      // Basic Checks
      // =================================================

      if (!cameraReady) {

        return;

      }

      if (
        !webcamRef.current ||
        !webcamRef.current.video
      ) {

        return;

      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state ===
          "recording"
      ) {

        return;

      }

      // =================================================
      // Get Webcam Stream
      // =================================================

      const stream =
        webcamRef.current.video.srcObject;

      if (!stream) {

        console.warn(
          "Webcam stream is not ready yet."
        );

        return;

      }

      // =================================================
      // Check MediaRecorder Support
      // =================================================

      if (
        typeof MediaRecorder ===
        "undefined"
      ) {

        toast.error(
          "Video recording is not supported in this browser."
        );

        return;

      }

      try {

        // =================================================
        // Reset Previous Chunks
        // =================================================

        chunksRef.current = [];

        // =================================================
        // Choose Supported MIME Type
        // =================================================

        let mimeType = "";

        if (
          MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
          )
        ) {

          mimeType =
            "video/webm;codecs=vp9,opus";

        }

        else if (
          MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp8,opus"
          )
        ) {

          mimeType =
            "video/webm;codecs=vp8,opus";

        }

        else if (
          MediaRecorder.isTypeSupported(
            "video/webm"
          )
        ) {

          mimeType =
            "video/webm";

        }

        // =================================================
        // Create Recorder
        // =================================================

        const recorder =
          mimeType

            ? new MediaRecorder(
                stream,
                {
                  mimeType,
                }
              )

            : new MediaRecorder(
                stream
              );

        mediaRecorderRef.current =
          recorder;

        // =================================================
        // Recording Started
        // =================================================

        recorder.onstart = () => {

          console.log(
            "🎥 Interview Recording Started"
          );

          if (
            mountedRef.current
          ) {

            setRecording(true);

          }

        };

        // =================================================
        // Collect Video Data
        // =================================================

        recorder.ondataavailable =
          (event) => {

            if (
              event.data &&
              event.data.size > 0
            ) {

              chunksRef.current.push(
                event.data
              );

            }

          };

        // =================================================
        // Recording Error
        // =================================================

        recorder.onerror =
          (event) => {

            console.error(
              "MediaRecorder Error:",
              event
            );

            if (
              mountedRef.current
            ) {

              setRecording(false);

            }

            toast.error(
              "Interview recording encountered an error."
            );

          };

        // =================================================
        // Recording Stopped
        // =================================================

        recorder.onstop =
          async () => {

            console.log(
              "🎥 Interview Recording Stopped"
            );

            if (
              mountedRef.current
            ) {

              setRecording(false);

            }

            // =================================================
            // Get Latest Values From Refs
            // =================================================

            const latestInterview =
              interviewRef.current;

            const latestQuestionIndex =
              currentQuestionRef.current;

            const latestAnswer =
              String(
                answerRef.current ||
                ""
              ).trim();

            const latestTimer =
              Number(
                timerRef.current
              ) || 0;

            // =================================================
            // Interview Check
            // =================================================

            if (!latestInterview) {

              console.error(
                "Interview missing during video upload."
              );

              finishInterviewRef.current =
                false;

              finishProcessingRef.current =
                false;

              if (
                mountedRef.current
              ) {

                setFinishing(false);

              }

              return;

            }

            // =================================================
            // No Recording Data
            // =================================================

            if (
              chunksRef.current.length ===
              0
            ) {

              console.warn(
                "No video chunks were recorded."
              );

              // We should not trap the user on
              // interview page if interview has
              // already successfully finished.

              if (
                finishInterviewRef.current
              ) {

                finishInterviewRef.current =
                  false;

                finishProcessingRef.current =
                  false;

                if (
                  mountedRef.current
                ) {

                  setFinishing(false);

                }

                navigate(
                  `/result/${latestInterview._id}`,
                  {
                    state: {
                      interview:
                        latestInterview,
                      videoUrl:
                        videoUrl || "",
                    },
                  }
                );

              }

              return;

            }

            let previewUrl = "";

            try {

              // =================================================
              // Upload Loader
              // =================================================

              if (
                mountedRef.current
              ) {

                setUploading(true);

              }

              // =================================================
              // Build Blob
              // =================================================

              const recordedMimeType = "video/webm";

              const blob =
                new Blob(
                  chunksRef.current,
                  {
                    type:
                      recordedMimeType,
                  }
                );

              console.log(
                "Recorded Video Size:",
                blob.size
              );

              // =================================================
              // Empty Blob Protection
              // =================================================

              if (
                blob.size === 0
              ) {

                throw new Error(
                  "Recorded video is empty."
                );

              }

              // =================================================
              // Local Preview URL
              // =================================================

              previewUrl =
                URL.createObjectURL(
                  blob
                );

              // =================================================
              // Create FormData
              // =================================================

              const formData =
                new FormData();

              formData.append(
                "video",
                blob,
                `Interview-${Date.now()}.webm`
              );

              formData.append(
                "interviewId",
                latestInterview._id
              );

              // =================================================
              // Last Active Question
              // =================================================

              const latestQuestion =
                latestInterview.questions?.[
                  latestQuestionIndex
                ];

              formData.append(
                "question",
                latestQuestion?.question ||
                  ""
              );

              formData.append(
                "answer",
                latestAnswer
              );

              formData.append(
                "duration",
                String(
                  latestTimer
                )
              );

              // =================================================
              // Upload Recording
              // =================================================

              console.log(
                "Uploading Interview Recording..."
              );

              const response =
                await uploadInterviewVideo(
                  formData
                );

              console.log(
                "Interview Video Upload Response:",
                response
              );

              // =================================================
              // Get Uploaded URL
              // =================================================

              const uploadedVideo =
                response?.videoUrl ||
                response?.interviewVideo
                  ?.videoUrl ||
                previewUrl;

              if (
                mountedRef.current
              ) {

                setVideoUrl(
                  uploadedVideo
                );

              }

              toast.success(
                "Interview recording uploaded successfully."
              );

              // =================================================
              // Navigate After Finish
              // =================================================

              if (
                finishInterviewRef.current
              ) {

                finishInterviewRef.current =
                  false;

                finishProcessingRef.current =
                  false;

                if (
                  mountedRef.current
                ) {

                  setFinishing(false);

                }

                navigate(
                  `/result/${latestInterview._id}`,
                  {
                    state: {
                      interview:
                        latestInterview,
                      videoUrl:
                        uploadedVideo,
                    },
                  }
                );

              }

            }

            catch (error) {

              console.error(
                "Video Upload Error:",
                error
              );

              toast.error(

                error.response?.data
                  ?.message ||

                error.message ||

                "Unable to upload interview recording."

              );

              // =================================================
              // Interview Result Should Still Open
              // =================================================
              // Video upload failure should not force
              // user to click Finish Interview again.

              if (
                finishInterviewRef.current
              ) {

                finishInterviewRef.current =
                  false;

                finishProcessingRef.current =
                  false;

                if (
                  mountedRef.current
                ) {

                  setFinishing(false);

                }

                navigate(
                  `/result/${latestInterview._id}`,
                  {
                    state: {
                      interview:
                        latestInterview,
                      videoUrl: previewUrl,
                    },
                  }
                );

              }

            }

            finally {

              chunksRef.current =
                [];

              if (
                mountedRef.current
              ) {

                setUploading(false);

              }

            }

          };

        // =================================================
        // Start Recorder
        // =================================================

        recorder.start(1000);

      }

      catch (error) {

        console.error(
          "Start Recording Error:",
          error
        );

        if (
          mountedRef.current
        ) {

          setRecording(false);

        }

        toast.error(
          "Unable to start interview recording."
        );

      }

    }, [
      cameraReady,
      navigate,
      videoUrl,
    ]);

  // =====================================================
  // Webcam Ready Handler
  // =====================================================

  const handleWebcamReady =
    useCallback(() => {

      console.log(
        "📷 Webcam is ready."
      );

      setCameraReady(true);

      setCameraError("");

      // =================================================
      // Small Delay So Webcam Stream Becomes Stable
      // =================================================

      setTimeout(() => {

        if (
          mountedRef.current
        ) {

          startInterviewRecording();

        }

      }, 500);

    }, [
      startInterviewRecording,
    ]);

  // =====================================================
  // Webcam Error Handler
  // =====================================================

  const handleWebcamError =
    useCallback(
      (error) => {

        console.error(
          "Webcam Error:",
          error
        );

        setCameraReady(false);

        setCameraError(
          "Unable to access camera or microphone."
        );

        toast.error(
          "Unable to access camera or microphone."
        );

      },
      []
    );

  // =====================================================
  // Auto Start Recording Fallback
  // =====================================================

  useEffect(() => {

    if (
      loading ||
      !interview ||
      !cameraReady
    ) {

      return;

    }

    const timeout =
      setTimeout(() => {

        if (
          !mediaRecorderRef.current ||
          mediaRecorderRef.current
            .state === "inactive"
        ) {

          startInterviewRecording();

        }

      }, 1000);

    return () => {

      clearTimeout(
        timeout
      );

    };

  }, [
    loading,
    interview,
    cameraReady,
    startInterviewRecording,
  ]);

  // =====================================================
  // Stop Interview Recording
  // =====================================================

  const stopInterviewRecording =
    useCallback(() => {

      const recorder =
        mediaRecorderRef.current;

      if (!recorder) {

        return false;

      }

      if (
        recorder.state ===
        "recording"
      ) {

        try {

          // Request any remaining data before stop.

          if (
            typeof recorder.requestData ===
            "function"
          ) {

            recorder.requestData();

          }

        }

        catch (error) {

          console.warn(
            "Recorder requestData Error:",
            error
          );

        }

        try {

          recorder.stop();

          return true;

        }

        catch (error) {

          console.error(
            "Stop Recording Error:",
            error
          );

          return false;

        }

      }

      return false;

    }, []);
      // =====================================================
  // Finish Interview
  // =====================================================

  const handleFinish =
    async () => {

      // =================================================
      // Prevent Multiple Finish Clicks
      // =================================================

      if (
        finishProcessingRef.current ||
        finishing ||
        uploading ||
        savingAnswer
      ) {

        console.log(
          "Finish interview already processing..."
        );

        return;

      }

      const currentInterview =
        interviewRef.current;

      if (!currentInterview) {

        toast.error(
          "Interview information is not available."
        );

        return;

      }

      try {

        // =================================================
        // Lock Finish Button Immediately
        // =================================================

        finishProcessingRef.current =
          true;

        setFinishing(true);

        // =================================================
        // Stop Speech Recognition
        // =================================================

        stopListening();

        // Give speech recognition a very small amount
        // of time to flush its final result.

        await new Promise(
          (resolve) => {

            setTimeout(
              resolve,
              250
            );

          }
        );

        // =================================================
        // Save LAST Question Answer First
        // =================================================

        console.log(
          "Saving final answer before finishing interview..."
        );

        await saveAnswer();

        console.log(
          "Final answer saved successfully."
        );

        // =================================================
        // Get Token
        // =================================================

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {

          throw new Error(
            "Login session expired. Please login again."
          );

        }

        // =================================================
        // Latest Interview
        // =================================================

        const latestInterview =
          interviewRef.current;

        if (!latestInterview) {

          throw new Error(
            "Interview information is unavailable."
          );

        }

        // =================================================
        // Finish Interview API
        // =================================================

        console.log(
          "Finishing interview..."
        );

        const response =
          await api.post(

            "/interview/finish",

            {

              interviewId:
                latestInterview._id,

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          );

        // =================================================
        // Debug Finish Response
        // =================================================

        console.log(
          "Finish Interview Response:",
          response.data
        );

        // =================================================
        // Get Evaluated Interview
        // =================================================

        const evaluatedInterview =
          response.data?.interview ||
          latestInterview;

        // =================================================
        // Update Interview State + Ref
        // =================================================

        setInterview(
          evaluatedInterview
        );

        interviewRef.current =
          evaluatedInterview;

        // =================================================
        // Mark Finish Successful
        // =================================================

        finishInterviewRef.current =
          true;

        toast.success(
          response.data?.message ||
          "Interview completed successfully."
        );

        // =================================================
        // Stop Recording
        // =================================================

        const recordingWasStopped =
          stopInterviewRecording();

        // =================================================
        // Recording Exists
        // =================================================
        // recorder.onstop from Part-3 will:
        //
        // 1. Build video blob
        // 2. Upload video
        // 3. Navigate to result page
        //
        // Therefore DO NOT navigate here
        // when recorder successfully stops.
        // =================================================

        if (
          recordingWasStopped
        ) {

          console.log(
            "Waiting for interview recording upload..."
          );

          return;

        }

        // =================================================
        // No Active Recording
        // =================================================
        // If MediaRecorder was not recording,
        // we should immediately navigate.
        // =================================================

        console.log(
          "No active recording found. Opening result page..."
        );

        finishInterviewRef.current =
          false;

        finishProcessingRef.current =
          false;

        if (
          mountedRef.current
        ) {

          setFinishing(false);

        }

        navigate(
          `/result/${evaluatedInterview._id}`,
          {

            state: {

              interview:
                evaluatedInterview,

              videoUrl:
                videoUrl || "",

            },

          }
        );

      }

      catch (error) {

        console.error(
          "Finish Interview Error:",
          error
        );

        // =================================================
        // Unlock Finish Processing
        // =================================================

        finishInterviewRef.current =
          false;

        finishProcessingRef.current =
          false;

        if (
          mountedRef.current
        ) {

          setFinishing(false);

        }

        // =================================================
        // Error Message
        // =================================================

        const errorMessage =

          error.response?.data
            ?.message ||

          error.message ||

          "Unable to finish interview.";

        toast.error(
          errorMessage
        );

      }

    };

  // =====================================================
  // Retry Camera
  // =====================================================

  const handleRetryCamera =
    async () => {

      try {

        setCameraError("");

        // =================================================
        // Check Browser Support
        // =================================================

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {

          throw new Error(
            "Camera is not supported in this browser."
          );

        }

        // =================================================
        // Request Permission Again
        // =================================================

        const stream =
          await navigator.mediaDevices
            .getUserMedia({

              video: true,

              audio: true,

            });

        // =================================================
        // Permission Success
        // =================================================

        setCameraReady(true);

        // Permission test stream is no longer needed.

        stream
          .getTracks()
          .forEach(
            (track) => {

              track.stop();

            }
          );

        toast.success(
          "Camera and microphone permission granted."
        );

      }

      catch (error) {

        console.error(
          "Retry Camera Error:",
          error
        );

        setCameraReady(false);

        setCameraError(
          "Camera or microphone access is unavailable."
        );

        toast.error(
          "Please allow camera and microphone permission from browser settings."
        );

      }

    };

  // =====================================================
  // Format Timer
  // =====================================================

  const formatTime =
    (totalSeconds) => {

      const safeSeconds =
        Number(
          totalSeconds
        ) || 0;

      const minutes =
        Math.floor(
          safeSeconds / 60
        );

      const seconds =
        safeSeconds % 60;

      return `${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        seconds
      ).padStart(
        2,
        "0"
      )}`;

    };

  // =====================================================
  // Calculate Progress
  // =====================================================

  const calculateProgress =
    () => {

      if (
        !interview ||
        !interview.questions?.length
      ) {

        return 0;

      }

      return Math.round(

        (
          (
            currentQuestion + 1
          ) /
          interview.questions.length
        ) *
        100

      );

    };

  // =====================================================
  // Count Answered Questions
  // =====================================================

  const getAnsweredQuestions =
    () => {

      if (
        !interview ||
        !Array.isArray(
          interview.questions
        )
      ) {

        return 0;

      }

      return interview.questions.filter(
        (question, index) => {

          // =================================================
          // Current Question Uses Current Answer State
          // =================================================

          if (
            index ===
            currentQuestion
          ) {

            return Boolean(
              String(
                answer ||
                ""
              ).trim()
            );

          }

          // =================================================
          // Other Questions Use Saved Answer
          // =================================================

          return Boolean(
            String(
              question.answer ||
              ""
            ).trim()
          );

        }
      ).length;

    };

  // =====================================================
  // Component Cleanup
  // =====================================================

  useEffect(() => {

    mountedRef.current =
      true;

    return () => {

      // =================================================
      // Mark Component Unmounted
      // =================================================

      mountedRef.current =
        false;

      // =================================================
      // Stop Speech Recognition
      // =================================================

      stopListening();

      // =================================================
      // Stop MediaRecorder
      // =================================================

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state ===
          "recording"
      ) {

        try {

          recorder.stop();

        }

        catch (error) {

          console.warn(
            "Recorder Cleanup Error:",
            error
          );

        }

      }

      // =================================================
      // Stop Webcam Tracks
      // =================================================

      const webcamStream =
        webcamRef.current
          ?.video
          ?.srcObject;

      if (
        webcamStream
      ) {

        webcamStream
          .getTracks()
          .forEach(
            (track) => {

              track.stop();

            }
          );

      }

    };

  }, [
    stopListening,
  ]);

  // =====================================================
  // Uploading Screen
  // =====================================================

  if (uploading) {

    return (

      <div className="interview-loading-screen">

        <div className="interview-loader-card">

          <div className="loader-spinner" />

          <h2>
            Uploading Interview Recording
          </h2>

          <p>
            Your interview is complete.
            Please wait while we securely
            upload your recording.
          </p>

          <div className="upload-status">

            <FaVideo />

            <span>
              Processing video...
            </span>

          </div>

        </div>

      </div>

    );

  }

  // =====================================================
  // Finishing / AI Evaluation Screen
  // =====================================================

  if (
    finishing &&
    !uploading
  ) {

    return (

      <div className="interview-loading-screen">

        <div className="interview-loader-card">

          <div className="loader-spinner" />

          <h2>
            Evaluating Your Interview
          </h2>

          <p>
            AI is analyzing your answers,
            technical knowledge,
            communication and confidence.
          </p>

          <div className="upload-status">

            <FaCheckCircle />

            <span>
              Please wait...
            </span>

          </div>

        </div>

      </div>

    );

  }

  // =====================================================
  // Initial Loading Screen
  // =====================================================

  if (
    loading ||
    !interview
  ) {

    return (

      <div className="interview-loading-screen">

        <div className="interview-loader-card">

          <div className="loader-spinner" />

          <h2>
            Preparing Your Interview
          </h2>

          <p>
            Loading interview questions...
          </p>

        </div>

      </div>

    );

  }

  // =====================================================
  // Current Question
  // =====================================================

  const current =
    interview.questions[
      currentQuestion
    ];

  // =====================================================
  // Invalid Current Question
  // =====================================================

  if (!current) {

    return (

      <div className="interview-loading-screen">

        <div className="interview-loader-card">

          <h2>
            Question Not Found
          </h2>

          <p>
            Unable to load the current
            interview question.
          </p>

        </div>

      </div>

    );

  }

  // =====================================================
  // UI Calculations
  // =====================================================

  const progress =
    calculateProgress();

  const answeredQuestions =
    getAnsweredQuestions();

  const totalQuestions =
    interview.questions.length;

  const isLastQuestion =
    currentQuestion ===
    totalQuestions - 1;
      // =====================================================
  // Main Interview UI
  // =====================================================

  return (

    <div className="interview-v2">

      {/* =================================================
          Top Header
      ================================================= */}

      <header className="interview-header">

        {/* ================= Left Header ================= */}

        <div className="interview-header-left">

          <div className="interview-brand-icon">

            🤖

          </div>

          <div>

            <h2>
              AI Mock Interview
            </h2>

            <p>
              Stay confident, speak clearly and
              answer naturally.
            </p>

          </div>

        </div>

        {/* ================= Right Header ================= */}

        <div className="interview-header-right">

          {/* ================= Recording ================= */}

          {

            recording && (

              <div className="recording-badge">

                <span className="recording-dot" />

                REC

              </div>

            )

          }

          {/* ================= Answered ================= */}

          <div className="answered-badge">

            <FaCheckCircle />

            <span>

              {answeredQuestions}
              {" / "}
              {totalQuestions}

              {" Answered"}

            </span>

          </div>

          {/* ================= Timer ================= */}

          <div className="timer-box">

            <FaClock />

            <div>

              <small>
                Question Time
              </small>

              <strong>
                {formatTime(timer)}
              </strong>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          Interview Information Bar
      ================================================= */}

      <div className="interview-info-bar">

        <div className="interview-info-item">

          <span>
            Category
          </span>

          <strong>
            {interview.category}
          </strong>

        </div>

        <div className="interview-info-divider" />

        <div className="interview-info-item">

          <span>
            Difficulty
          </span>

          <strong>
            {interview.difficulty}
          </strong>

        </div>

        <div className="interview-info-divider" />

        <div className="interview-info-item">

          <span>
            Current Question
          </span>

          <strong>

            {currentQuestion + 1}
            {" / "}
            {totalQuestions}

          </strong>

        </div>

        <div className="interview-info-divider" />

        <div className="interview-info-item">

          <span>
            Progress
          </span>

          <strong>
            {progress}%
          </strong>

        </div>

      </div>

      {/* =================================================
          Main Interview Layout
      ================================================= */}

      <main className="interview-main-layout">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="interview-question-section">

          {/* =================================================
              Progress Header
          ================================================= */}

          <div className="question-progress-header">

            <div>

              <span className="question-label">
                INTERVIEW QUESTION
              </span>

              <h3>

                Question
                {" "}
                {currentQuestion + 1}
                {" "}
                of
                {" "}
                {totalQuestions}

              </h3>

            </div>

            <div className="question-progress-percent">

              {progress}%

            </div>

          </div>

          {/* =================================================
              Progress Bar
          ================================================= */}

          <div className="interview-progress-bar">

            <div

              className="interview-progress-fill"

              style={{

                width:
                  `${progress}%`,

              }}

            />

          </div>

          {/* =================================================
              Question Card
          ================================================= */}

          <div className="question-card-v2">

            <div className="question-number">

              Q{currentQuestion + 1}

            </div>

            <div className="question-content">

              <span>
                Your Question
              </span>

              <h2>
                {current.question}
              </h2>

            </div>

          </div>

          {/* =================================================
              Answer Section
          ================================================= */}

          <div className="answer-card-v2">

            {/* ================= Answer Header ================= */}

            <div className="answer-card-header">

              <div>

                <span className="answer-label">
                  YOUR ANSWER
                </span>

                <h3>
                  Type or speak your response
                </h3>

              </div>

              {/* ================= Saving Indicator ================= */}

              {

                savingAnswer && (

                  <div className="saving-answer-badge">

                    Saving...

                  </div>

                )

              }

            </div>

            {/* ================= Textarea ================= */}

            <textarea

              className="answer-box-v2"

              placeholder={
                listening

                  ? "Listening... Start speaking your answer."

                  : "Type your answer here or click Start Speaking..."
              }

              value={answer}

              onChange={
                handleAnswerChange
              }

              disabled={
                savingAnswer ||
                finishing
              }

            />

            {/* =================================================
                Speech Status
            ================================================= */}

            <div className="speech-information">

              <div className="speech-status-area">

                {

                  listening

                    ? (

                      <div className="speech-listening">

                        <span className="speech-pulse" />

                        <span>
                          Listening to your voice...
                        </span>

                      </div>

                    )

                    : (

                      <div className="speech-idle">

                        <FaMicrophone />

                        <span>

                          {

                            supported

                              ? "Microphone ready"

                              : "Speech recognition unavailable"

                          }

                        </span>

                      </div>

                    )

                }

              </div>

              {/* ================= Character Count ================= */}

              <div className="answer-character-count">

                {answer.length}
                {" characters"}

              </div>

            </div>

            {/* =================================================
                Interim Speech
            ================================================= */}

            {

              listening &&
              interimTranscript && (

                <div className="interim-speech-box">

                  <span>
                    Hearing:
                  </span>

                  <p>
                    {interimTranscript}
                  </p>

                </div>

              )

            }

            {/* =================================================
                Speech Error
            ================================================= */}

            {

              speechError && (

                <div className="speech-error-message">

                  {speechError}

                </div>

              )

            }

            {/* =================================================
                Voice Controls
            ================================================= */}

            <div className="voice-control-area">

              <button

                type="button"

                className={

                  listening

                    ? "voice-btn-v2 listening"

                    : "voice-btn-v2"

                }

                onClick={
                  handleMicrophone
                }

                disabled={

                  !supported ||
                  savingAnswer ||
                  finishing

                }

              >

                {

                  listening

                    ? (

                      <>

                        <FaStop />

                        Stop Speaking

                      </>

                    )

                    : (

                      <>

                        <FaMicrophone />

                        Start Speaking

                      </>

                    )

                }

              </button>

              <p className="voice-help-text">

                {

                  listening

                    ? "Speak naturally. Your words will appear in the answer box."

                    : "Click the microphone and start speaking."

                }

              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <aside className="interview-camera-section">

          {/* =================================================
              Camera Card
          ================================================= */}

          <div className="camera-card-v2">

            {/* ================= Camera Header ================= */}

            <div className="camera-card-header">

              <div>

                <span className="camera-label">
                  LIVE CAMERA
                </span>

                <h3>
                  Interview Preview
                </h3>

              </div>

              {

                recording && (

                  <div className="camera-recording">

                    <span />

                    Recording

                  </div>

                )

              }

            </div>

            {/* ================= Webcam ================= */}

            <div className="camera-preview">

              {

                cameraReady

                  ? (

                    <Webcam

                      ref={webcamRef}

                      audio={true}

                      mirrored={true}

                      screenshotFormat="image/jpeg"

                      className="live-camera-v2"

                      onUserMedia={
                        handleWebcamReady
                      }

                      onUserMediaError={
                        handleWebcamError
                      }

                      videoConstraints={{

                        facingMode:
                          "user",

                        width:
                          1280,

                        height:
                          720,

                      }}

                    />

                  )

                  : (

                    <div className="camera-unavailable">

                      <FaVideo />

                      <h3>
                        Camera unavailable
                      </h3>

                      <p>

                        {

                          cameraError ||

                          "Waiting for camera permission..."

                        }

                      </p>

                      <button

                        type="button"

                        onClick={
                          handleRetryCamera
                        }

                      >

                        Retry Camera

                      </button>

                    </div>

                  )

              }

              {/* ================= Camera Overlay ================= */}

              {

                cameraReady && (

                  <div className="camera-overlay">

                    {

                      recording

                        ? (

                          <span className="camera-overlay-recording">

                            <span />

                            REC

                          </span>

                        )

                        : (

                          <span>
                            Camera Ready
                          </span>

                        )

                    }

                  </div>

                )

              }

            </div>

          </div>

          {/* =================================================
              Progress Card
          ================================================= */}

          <div className="side-progress-card">

            <div className="side-progress-header">

              <div>

                <span>
                  INTERVIEW PROGRESS
                </span>

                <h3>
                  Your Progress
                </h3>

              </div>

              <strong>
                {progress}%
              </strong>

            </div>

            <div className="side-progress-bar">

              <div

                className="side-progress-fill"

                style={{

                  width:
                    `${progress}%`,

                }}

              />

            </div>

            <div className="side-progress-details">

              <div>

                <span>
                  Current
                </span>

                <strong>

                  {currentQuestion + 1}
                  {" / "}
                  {totalQuestions}

                </strong>

              </div>

              <div>

                <span>
                  Answered
                </span>

                <strong>

                  {answeredQuestions}
                  {" / "}
                  {totalQuestions}

                </strong>

              </div>

            </div>

          </div>

          {/* =================================================
              Interview Tips
          ================================================= */}

          <div className="interview-tip-card">

            <div className="tip-icon">

              💡

            </div>

            <div>

              <span>
                INTERVIEW TIP
              </span>

              <p>
                Keep your answer structured,
                explain the concept clearly and
                include an example whenever possible.
              </p>

            </div>

          </div>

        </aside>

      </main>

      {/* =================================================
          Bottom Navigation
      ================================================= */}

      <footer className="interview-bottom-controls">

        {/* =================================================
            Left Information
        ================================================= */}

        <div className="bottom-question-info">

          <span>
            Question
          </span>

          <strong>

            {currentQuestion + 1}
            {" of "}
            {totalQuestions}

          </strong>

        </div>

        {/* =================================================
            Navigation Buttons
        ================================================= */}

        <div className="interview-navigation-buttons">

          {/* ================= Previous ================= */}

          <button

            type="button"

            className="previous-btn-v2"

            onClick={
              handlePrevious
            }

            disabled={

              currentQuestion === 0 ||
              savingAnswer ||
              finishing ||
              uploading

            }

          >

            <FaArrowLeft />

            Previous

          </button>

          {/* =================================================
              Finish OR Next
          ================================================= */}

          {

            isLastQuestion

              ? (

                <button

                  type="button"

                  className="finish-btn-v2"

                  onClick={
                    handleFinish
                  }

                  disabled={

                    finishing ||
                    uploading ||
                    savingAnswer

                  }

                >

                  <FaPaperPlane />

                  {

                    finishing

                      ? "Finishing..."

                      : uploading

                        ? "Uploading..."

                        : "Finish Interview"

                  }

                </button>

              )

              : (

                <button

                  type="button"

                  className="next-btn-v2"

                  onClick={
                    handleNext
                  }

                  disabled={

                    savingAnswer ||
                    finishing ||
                    uploading

                  }

                >

                  {

                    savingAnswer

                      ? "Saving..."

                      : "Save & Next"

                  }

                  <FaArrowRight />

                </button>

              )

          }

        </div>

      </footer>

    </div>

  );

}

export default InterviewRoomV2;