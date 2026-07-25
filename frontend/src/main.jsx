import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import "./index.css";

import ThemeProvider from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <BrowserRouter>

      <ThemeProvider>

        <App />

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

      </ThemeProvider>

    </BrowserRouter>

  </React.StrictMode>
);