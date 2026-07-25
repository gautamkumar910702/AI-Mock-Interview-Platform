// import { useState, useEffect, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import api from "../services/api";

// import { toast } from "react-toastify";

// import {

//   FaClock,

//   FaArrowLeft,

//   FaArrowRight,

//   FaPaperPlane,

// } from "react-icons/fa";

// import VoiceButton from "../components/VoiceButton";

// import useSpeechRecognition from "../hooks/useSpeechRecognition";

// import "./InterviewRoom.css";

// function InterviewRoom() {

//   const navigate = useNavigate();

//   const { id } = useParams();

//   // ==========================================
//   // Refs
//   // ==========================================

//   const finishProcessingRef = useRef(false);

//   // ==========================================
//   // States
//   // ==========================================

//   const [loading, setLoading] = useState(true);

//   const [interview, setInterview] = useState(null);

//   const [currentQuestion, setCurrentQuestion] = useState(0);

//   const [answer, setAnswer] = useState("");

//   const [timer, setTimer] = useState(0);

//   // ==========================================
//   // Speech Recognition
//   // ==========================================

//   const {

//     transcript,

//     listening,

//     supported,

//     startListening,

//     stopListening,

//     resetTranscript,

//   } = useSpeechRecognition();
//     // ==========================================
//   // Fetch Interview
//   // ==========================================

//   useEffect(() => {

//     loadInterview();

//   }, []);

//   const loadInterview = async () => {

//     try {

//       setLoading(true);

//       const token = localStorage.getItem("token");

//       const response = await api.get(

//         `/interview/${id}`,

//         {

//           headers: {

//             Authorization: `Bearer ${token}`,

//           },

//         }

//       );

//       setInterview(response.data.interview);

//     }

//     catch (error) {

//       console.log(error);

//       toast.error(

//         error.response?.data?.message ||

//         "Unable to load interview."

//       );

//       navigate("/dashboard");

//     }

//     finally {

//       setLoading(false);

//     }

//   };

//   // ==========================================
//   // Save Current Answer
//   // ==========================================

//   const saveAnswer = async () => {

//     if (!interview) return;

//     try {

//       const token = localStorage.getItem("token");

//       await api.post(

//         "/interview/submit-answer",

//         {

//           interviewId: interview._id,

//           questionIndex: currentQuestion,

//           answer: answer.trim(),

//           timeTaken: timer,

//         },

//         {

//           headers: {

//             Authorization: `Bearer ${token}`,

//           },

//         }

//       );

//       setInterview((prev) => {

//         const updated = {

//           ...prev,

//         };

//         updated.questions = [...prev.questions];

//         updated.questions[currentQuestion] = {

//           ...updated.questions[currentQuestion],

//           answer,

//           timeTaken: timer,

//         };

//         return updated;

//       });

//     }

//     catch (error) {

//       console.log(error);

//       toast.error(

//         error.response?.data?.message ||

//         "Unable to save answer."

//       );

//       throw error;

//     }

//   };
//     // ==========================================
//   // Timer
//   // ==========================================

//   useEffect(() => {

//     if (loading || !interview) return;

//     const interval = setInterval(() => {

//       setTimer((prev) => prev + 1);

//     }, 1000);

//     return () => clearInterval(interval);

//   }, [loading, interview, currentQuestion]);

//   // ==========================================
//   // Speech Recognition → Textarea
//   // ==========================================

//   useEffect(() => {

//     if (!transcript) return;

//     setAnswer(transcript);

//   }, [transcript]);

//   // ==========================================
//   // Restore Saved Answer
//   // ==========================================

//   useEffect(() => {

//     if (!interview) return;

//     const question = interview.questions[currentQuestion];

//     if (!question) return;

//     setAnswer(question.answer || "");

//     setTimer(question.timeTaken || 0);

//     resetTranscript();

//   }, [

//     currentQuestion,

//     interview,

//     resetTranscript,

//   ]);

//   // ==========================================
//   // Stop Microphone When Question Changes
//   // ==========================================

//   useEffect(() => {

//     stopListening();

//   }, [currentQuestion]);

//   // ==========================================
//   // Cleanup
//   // ==========================================

//   useEffect(() => {

//     return () => {

//       stopListening();

//       resetTranscript();

//       finishProcessingRef.current = false;

//     };

//   }, []);

//   // ==========================================
//   // Reset Timer For Current Question
//   // ==========================================

//   useEffect(() => {

//     if (!interview) return;

//     const savedTime =

//       interview.questions[currentQuestion]?.timeTaken;

//     setTimer(savedTime || 0);

//   }, [currentQuestion, interview]);
//     // ==========================================
//   // Previous Question
//   // ==========================================

//   const handlePrevious = () => {

//     if (currentQuestion === 0) return;

//     stopListening();

//     resetTranscript();

//     setCurrentQuestion((prev) => prev - 1);

//   };

//   // ==========================================
//   // Next Question
//   // ==========================================

//   const handleNext = async () => {

//     try {

//       stopListening();

//       await saveAnswer();

//       resetTranscript();

//       setCurrentQuestion((prev) => prev + 1);

//     }

//     catch (error) {

//       console.log(error);

//       toast.error(

//         error.response?.data?.message ||

//         "Unable to Save Answer"

//       );

//     }

//   };

//   // ==========================================
//   // Finish Interview
//   // ==========================================

//   const handleFinish = async () => {

//     if (finishProcessingRef.current) {

//       return;

//     }

//     finishProcessingRef.current = true;

//     try {

//       stopListening();

//       await saveAnswer();

//       const token = localStorage.getItem("token");

//       const response = await api.post(

//         "/interview/finish",

//         {

//           interviewId: interview._id,

//         },

//         {

//           headers: {

//             Authorization: `Bearer ${token}`,

//           },

//         }

//       );

//       toast.success(

//         "Interview Completed Successfully"

//       );

//       navigate(

//         `/result/${interview._id}`,

//         {

//           state: {

//             interview: response.data.interview,

//           },

//         }

//       );

//     }

//     catch (error) {

//       console.log(error);

//       finishProcessingRef.current = false;

//       toast.error(

//         error.response?.data?.message ||

//         "Unable to Finish Interview"

//       );

//     }

//   };

//   // ==========================================
//   // Loading Screen
//   // ==========================================

//   if (loading || !interview) {

//     return (

//       <div className="loading-container">

//         <h2>

//           Loading Interview...

//         </h2>

//       </div>

//     );

//   }

//   // ==========================================
//   // Current Question
//   // ==========================================

//   const current =

//     interview.questions[currentQuestion];

//   // ==========================================
//   // Timer Format
//   // ==========================================

//   const minutes = Math.floor(timer / 60);

//   const seconds = timer % 60;
//     return (

//     <div className="interview-room">

//       {/* ==========================================
//           Header
//       ========================================== */}

//       <div className="room-header">

//         <div>

//           <h2>

//             🤖 AI Mock Interview

//           </h2>

//           <p>

//             Answer every question confidently.

//           </p>

//         </div>

//         <div className="timer">

//           <FaClock />

//           <span>

//             {minutes}:{seconds < 10 ? `0${seconds}` : seconds}

//           </span>

//         </div>

//       </div>

//       {/* ==========================================
//           Progress
//       ========================================== */}

//       <div className="progress-box">

//         <h4>

//           Question {currentQuestion + 1}

//           {" / "}

//           {interview.questions.length}

//         </h4>

//       </div>

//       <div className="progress-bar">

//         <div

//           className="progress-fill"

//           style={{

//             width: `${

//               ((currentQuestion + 1) /

//                 interview.questions.length) * 100

//             }%`,

//           }}

//         />

//       </div>

//       {/* ==========================================
//           Question
//       ========================================== */}

//       <div className="question-card">

//         <h3>

//           {current.question}

//         </h3>

//       </div>

//       {/* ==========================================
//           Answer
//       ========================================== */}

//       <textarea

//         className="answer-box"

//         placeholder="Type your answer here or use microphone..."

//         value={answer}

//         onChange={(e) =>

//           setAnswer(e.target.value)

//         }

//       />

//       {/* ==========================================
//           Voice Button
//       ========================================== */}

//       <VoiceButton

//         listening={listening}

//         supported={supported}

//         startListening={startListening}

//         stopListening={stopListening}

//       />

//       {/* ==========================================
//           Navigation Buttons
//       ========================================== */}

//       <div className="button-group">

//         <button

//           className="prev-btn"

//           type="button"

//           disabled={currentQuestion === 0}

//           onClick={handlePrevious}

//         >

//           <FaArrowLeft />

//           Previous

//         </button>

//         {

//           currentQuestion ===

//           interview.questions.length - 1

//           ? (

//             <button

//               className="submit-btn"

//               type="button"

//               onClick={handleFinish}

//               disabled={finishProcessingRef.current}

//             >

//               <FaPaperPlane />

//               {

//                 finishProcessingRef.current

//                 ? "Finishing..."

//                 : "Finish Interview"

//               }

//             </button>

//           )

//           : (

//             <button

//               className="next-btn"

//               type="button"

//               onClick={handleNext}

//             >

//               Next

//               <FaArrowRight />

//             </button>

//           )

//         }

//       </div>
//             {/* ==========================================
//           Footer
//       ========================================== */}

//       <div className="interview-footer">

//         <p>

//           💡 Tip: Speak clearly, give practical examples, and answer confidently.

//         </p>

//       </div>

//     </div>

//   );

// }

// export default InterviewRoom;