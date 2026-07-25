import { FaFilePdf } from "react-icons/fa";
import "./PDFButton.css";
import generatePDF from "../utils/generatePDF";

function PDFButton({ interview, user }) {

  const handleDownload = () => {

    generatePDF(interview, user);

  };

  return (

    <button
      className="pdf-btn"
      onClick={handleDownload}
    >

      <FaFilePdf />

      Download PDF Report

    </button>

  );

}

export default PDFButton;