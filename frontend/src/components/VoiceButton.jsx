import { FaMicrophone, FaStop } from "react-icons/fa";

import "./VoiceButton.css";

function VoiceButton({

  listening,

  supported,

  startListening,

  stopListening,

}) {

  if (!supported) {

    return (

      <button
        className="voice-btn disabled"
        disabled
      >

        Browser Not Supported

      </button>

    );

  }

  return (

    <button

      className={`voice-btn ${
        listening ? "recording" : ""
      }`}

      onClick={
        listening
          ? stopListening
          : startListening
      }

    >

      {

        listening

          ? <FaStop />

          : <FaMicrophone />

      }

      {

        listening

          ? " Stop Recording"

          : " Start Recording"

      }

    </button>

  );

}

export default VoiceButton;