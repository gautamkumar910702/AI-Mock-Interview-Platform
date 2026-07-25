import { useCallback, useEffect, useRef, useState } from "react";

function useSpeechRecognition() {
  // =====================================================
  // States
  // =====================================================

  const [transcript, setTranscript] = useState("");

  const [interimTranscript, setInterimTranscript] = useState("");

  const [listening, setListening] = useState(false);

  const [supported, setSupported] = useState(true);

  const [speechError, setSpeechError] = useState("");

  // =====================================================
  // Refs
  // =====================================================

  const recognitionRef = useRef(null);

  const finalTranscriptRef = useRef("");

  const shouldRestartRef = useRef(false);

  const isStartingRef = useRef(false);

  // =====================================================
  // Initialize Speech Recognition
  // =====================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // ===================================================
    // Browser Support Check
    // ===================================================

    if (!SpeechRecognition) {
      const task = setTimeout(() => {
        setSupported(false);
        setSpeechError("Speech recognition is not supported in this browser.");
      }, 0);

      return () => clearTimeout(task);
    }

    // ===================================================
    // Create Recognition
    // ===================================================

    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.maxAlternatives = 1;

    // ===================================================
    // Recognition Started
    // ===================================================

    recognition.onstart = () => {
      console.log("Speech Recognition Started");

      isStartingRef.current = false;

      setListening(true);

      setSpeechError("");
    };

    // ===================================================
    // Speech Start
    // ===================================================

    recognition.onspeechstart = () => {
      console.log("Speech Detected");

      setSpeechError("");
    };

    // ===================================================
    // Speech End
    // ===================================================

    recognition.onspeechend = () => {
      console.log("Speech Ended");
    };

    // ===================================================
    // Recognition Result
    // ===================================================

    recognition.onresult = (event) => {
      let finalText = "";

      let interimText = "";

      // =================================================
      // Process New Results Only
      // =================================================

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        const spokenText = result[0]?.transcript || "";

        if (result.isFinal) {
          finalText += spokenText + " ";
        } else {
          interimText += spokenText + " ";
        }
      }

      // =================================================
      // Store Final Transcript
      // =================================================

      if (finalText) {
        finalTranscriptRef.current = (finalTranscriptRef.current + finalText)
          .replace(/\s+/g, " ")
          .trim();
      }

      // =================================================
      // Update Interim Transcript
      // =================================================

      setInterimTranscript(interimText.trim());

      // =================================================
      // Combine Final + Interim
      // =================================================

      const combinedTranscript = [
        finalTranscriptRef.current,
        interimText.trim(),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      setTranscript(combinedTranscript);
    };

    // ===================================================
    // Recognition Error
    // ===================================================

    recognition.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);

      isStartingRef.current = false;

      // =================================================
      // No Speech
      // =================================================

      if (event.error === "no-speech") {
        setSpeechError("No speech detected. Please speak clearly.");

        return;
      }

      // =================================================
      // Audio Capture Error
      // =================================================

      if (event.error === "audio-capture") {
        shouldRestartRef.current = false;

        setListening(false);

        setSpeechError(
          "Microphone not available. Please check your microphone.",
        );

        return;
      }

      // =================================================
      // Permission Denied
      // =================================================

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldRestartRef.current = false;

        setListening(false);

        setSpeechError(
          "Microphone permission denied. Please allow microphone access.",
        );

        return;
      }

      // =================================================
      // Network Error
      // =================================================

      if (event.error === "network") {
        setSpeechError(
          "Speech recognition network error. Please check your internet connection.",
        );

        return;
      }

      // =================================================
      // Aborted
      // =================================================

      if (event.error === "aborted") {
        return;
      }

      setSpeechError("Unable to recognize speech. Please try again.");
    };

    // ===================================================
    // Recognition Ended
    // ===================================================

    recognition.onend = () => {
      console.log("Speech Recognition Ended");

      isStartingRef.current = false;

      setListening(false);

      setInterimTranscript("");

      // =================================================
      // Keep Final Transcript
      // =================================================

      setTranscript(finalTranscriptRef.current);

      // =================================================
      // Auto Restart If User Has Not Pressed Stop
      // =================================================

      if (shouldRestartRef.current) {
        setTimeout(() => {
          try {
            if (shouldRestartRef.current && recognitionRef.current) {
              isStartingRef.current = true;

              recognitionRef.current.start();
            }
          } catch (error) {
            isStartingRef.current = false;

            console.warn("Speech restart error:", error);
          }
        }, 300);
      }
    };

    // ===================================================
    // Save Recognition Instance
    // ===================================================

    recognitionRef.current = recognition;

    // ===================================================
    // Cleanup
    // ===================================================

    return () => {
      shouldRestartRef.current = false;

      isStartingRef.current = false;

      try {
        recognition.onstart = null;

        recognition.onresult = null;

        recognition.onerror = null;

        recognition.onend = null;

        recognition.onspeechstart = null;

        recognition.onspeechend = null;

        recognition.abort();
      } catch (error) {
        console.warn("Speech cleanup error:", error);
      }

      recognitionRef.current = null;
    };
  }, []);

  // =====================================================
  // Start Listening
  // =====================================================

  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) {
      setSpeechError("Speech recognition is not available.");

      return;
    }

    // =================================================
    // Already Listening / Starting
    // =================================================

    if (listening || isStartingRef.current) {
      return;
    }

    try {
      shouldRestartRef.current = true;

      isStartingRef.current = true;

      setSpeechError("");

      recognitionRef.current.start();
    } catch (error) {
      isStartingRef.current = false;

      console.warn("Start Speech Recognition Error:", error);

      // InvalidStateError generally means
      // recognition is already running.

      if (error?.name !== "InvalidStateError") {
        setSpeechError("Unable to start microphone.");
      }
    }
  }, [supported, listening]);

  // =====================================================
  // Stop Listening
  // =====================================================

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;

    isStartingRef.current = false;

    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.warn("Stop Speech Recognition Error:", error);
    }

    setListening(false);
  }, []);

  // =====================================================
  // Reset Transcript
  // =====================================================

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";

    setTranscript("");

    setInterimTranscript("");

    setSpeechError("");
  }, []);

  // =====================================================
  // Set Existing Transcript
  // =====================================================

  const setSpeechTranscript = useCallback((text = "") => {
    const cleanText = String(text).trim();

    finalTranscriptRef.current = cleanText;

    setTranscript(cleanText);

    setInterimTranscript("");
  }, []);

  // =====================================================
  // Return
  // =====================================================

  return {
    transcript,

    interimTranscript,

    listening,

    supported,

    speechError,

    startListening,

    stopListening,

    resetTranscript,

    setSpeechTranscript,
  };
}

export default useSpeechRecognition;
