import React from "react";
import { createRoot } from "react-dom/client";
import InterviewReportComponent from "./InterviewReportComponent";

const body = document.querySelector("body");
const rootElement = document.getElementById("root");
if (rootElement && body) {
  body.style.backgroundColor = "#0f0a19";
}

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <InterviewReportComponent />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
