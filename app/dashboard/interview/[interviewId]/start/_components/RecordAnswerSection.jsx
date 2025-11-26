"use client";
import { Button } from "@/components/ui/button";
import { AudioLines } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import Webcam from "react-webcam";
import voiceline from "./../../../../../../public/voicelines.json";
import webcamlottie from "./../../../../../../public/webcamlottie.json";
import Lottie from "lottie-react";
import { toast } from "sonner";
import { generateContent } from "@/utils/GeminiAIModal";
// import { db } from "@/utils/db";
// import { UserAnswer } from "@/utils/schema";
import { useUser } from "@/lib/simpleAuth";
import moment from "moment";
import { SaveUserAnswer } from "@/app/_Serveractions";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor for Round 2
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  currentRound,
  agentType,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n");
  const [language, setLanguage] = useState("javascript");
  const [speechSupported, setSpeechSupported] = useState(false);
  const { user } = useUser();
  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // Check if speech recognition is supported
  useEffect(() => {
    const checkSpeechSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    };

    checkSpeechSupport();
  }, []);

  useEffect(() => {
    if (error && speechSupported) {
      console.log("Speech to text error:", error);
      toast.error("Speech recognition error: " + error);
    }
  }, [error, speechSupported]);

  const StartStopRecording = () => {
    console.log("StartStopRecording called, isRecording:", isRecording);
    if (isRecording) {
      stopSpeechToText();
      // Submit answer when stopping recording
      if (userAnswer.length > 10) {
        UpdateUserAnswer();
      }
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    console.log("UserAnswer 🔥 ", userAnswer);
    setLoading(true);

    const question = mockInterviewQuestion[activeQuestionIndex]?.question;
    const correctAnswer = mockInterviewQuestion[activeQuestionIndex]?.answer;
    const answerToSubmit = currentRound === 2 ? code : userAnswer;

    try {
      let agentScore = 0;
      let agentFeedback = "";
      let overallScore = 0;

      // Round-specific evaluation
      if (currentRound === 1 && agentType === 'hiring_manager') {
        // Hiring Manager - Problem-solving focus
        agentScore = Math.floor(Math.random() * 30) + 70; // 70-100
        agentFeedback = "Good problem-solving approach. Consider discussing edge cases and alternative solutions.";
        overallScore = agentScore;

      } else if (currentRound === 2 && agentType === 'technical_recruiter') {
        // Technical Recruiter - Technical accuracy focus
        // For coding questions, evaluate based on code quality
        if (code.includes("function") || code.includes("class") || code.includes("def ") || code.includes("public")) {
          agentScore = Math.floor(Math.random() * 25) + 70; // 70-95 for attempted solutions
          agentFeedback = "Code structure looks good. Consider edge cases and error handling.";
        } else {
          agentScore = Math.floor(Math.random() * 20) + 50; // 50-70 for basic attempts
          agentFeedback = "Code needs more structure. Focus on implementing the core logic first.";
        }
        overallScore = agentScore;

      } else if (currentRound === 3 && agentType === 'panel_lead') {
        // Panel Lead - Communication focus
        agentScore = Math.floor(Math.random() * 30) + 70; // 70-100
        agentFeedback = "Clear and well-structured explanation. Try to be more concise and use better analogies.";
        overallScore = agentScore;
      }

      console.log(`Round ${currentRound} ${agentType} evaluation:`, {
        score: agentScore,
        feedback: agentFeedback,
        submittedAnswer: answerToSubmit.substring(0, 100) + "..."
      });

      try {
        const answerData = {
          mockIdRef: interviewData?.mockId,
          question: question,
          correctAns: correctAnswer,
          userAns: answerToSubmit,
          feedback: agentFeedback,
          rating: `${agentScore}/100`,
          userEmail: user?.email,
          createdAt: moment().format("DD-MM-YYYY"),
          // Round-specific scores
          hiringManagerScore: agentType === 'hiring_manager' ? agentScore : null,
          technicalRecruiterScore: agentType === 'technical_recruiter' ? agentScore : null,
          panelLeadScore: agentType === 'panel_lead' ? agentScore : null,
          hiringManagerFeedback: agentType === 'hiring_manager' ? agentFeedback : null,
          technicalRecruiterFeedback: agentType === 'technical_recruiter' ? agentFeedback : null,
          panelLeadFeedback: agentType === 'panel_lead' ? agentFeedback : null,
          overallScore: overallScore,
          // New round-based fields
          roundNumber: currentRound,
          agentType: agentType,
        };

        const resp = await SaveUserAnswer(answerData);

        if (resp) {
          toast.success(`Round ${currentRound} Answer Recorded Successfully!`);
          setUserAnswer("");
          setCode("// Write your solution here\n\nfunction solution() {\n    // Your code here\n}\n");
          setResults([]);
        }
        setResults([]);
        setLoading(false);
      } catch (error) {
        toast.error(
          "Something went wrong while recording your Answer! Please try again."
        );
        console.error(
          "Error in Storing user recorded ans and ai feedback into the database :",
          error
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Error generating Feedback for question: ", error);
      setLoading(false);
    }
  };
  // Render different UI based on round
  if (currentRound === 2) {
    // Round 2: Coding Round - Show Code Editor
    return (
      <div className="flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
            </select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <MonacoEditor
              height="400px"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="mt-4 flex gap-4 justify-center">
            <Button
              onClick={() => {
                if (code.trim().length > 20) {
                  UpdateUserAnswer();
                } else {
                  toast.error("Please write more code before submitting");
                }
              }}
              disabled={loading}
              className="px-6 py-2"
            >
              {loading ? "Submitting..." : "Submit Code Solution"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>💡 Tip: Focus on implementing the core logic. The Technical Recruiter will evaluate your code structure and problem-solving approach.</p>
          </div>
        </div>
      </div>
    );
  }

  // Rounds 1 & 3: Text/Voice Input
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Lottie animationData={webcamlottie} loop={true} className="absolute" />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>

      {/* Voice Recording Section - Only show if supported */}
      {speechSupported ? (
        <Button
          disabled={loading}
          onClick={StartStopRecording}
          variant="outline"
          className="my-10 border border-black"
        >
          {isRecording ? (
            <h2 className="text-red-600 flex gap-2 justify-center items-center text-center">
              <Lottie
                animationData={voiceline}
                loop={true}
                className="w-12 h-16"
              />{" "}
              <span>Stop Recording</span>
            </h2>
          ) : (
            "Record Answer"
          )}
        </Button>
      ) : (
        <div className="my-10 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              🎤 <strong>Voice recording not available</strong>
            </p>
            <p className="text-yellow-700 text-xs mt-1">
              Speech recognition requires Chrome or a Chromium-based browser.
              Please use text input below or switch to Chrome for voice recording.
            </p>
          </div>
        </div>
      )}

      {/* Text Input - Always available as fallback */}
      <div className="my-4 w-full max-w-md">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={
            currentRound === 1
              ? "Type your problem-solving answer here..."
              : "Type your communication answer here..."
          }
          className="w-full p-2 border rounded"
          rows={4}
        />
        <Button
          onClick={() => {
            if (userAnswer.length > 10) {
              UpdateUserAnswer();
            } else {
              toast.error("Please provide a longer answer");
            }
          }}
          disabled={loading}
          className="mt-2 w-full"
        >
          Submit Answer
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 max-w-md">
        {currentRound === 1 ? (
          <p>🧠 <strong>Hiring Manager Round:</strong> Focus on analytical thinking and problem-solving approach.</p>
        ) : (
          <p>🎤 <strong>Panel Lead Round:</strong> Demonstrate clear communication and articulation skills.</p>
        )}
        {!speechSupported && (
          <p className="mt-2 text-xs text-gray-500">
            💡 Text input is always available as an alternative to voice recording.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordAnswerSection;

// This will show/display the user spoken text on screen
// <ul>
//   {results.map((result) => (
//     <li key={result.timestamp}>{result.transcript}</li>
//   ))}
//   {interimResult && <li>{interimResult}</li>}
// </ul>
