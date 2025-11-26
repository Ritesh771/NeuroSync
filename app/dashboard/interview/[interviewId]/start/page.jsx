"use client";
import React, { useEffect, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const StartInterview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [currentRound, setCurrentRound] = useState(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [roundCompleted, setRoundCompleted] = useState(false);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  // Get Interview Details by mockId/Interview ID
  const GetInterviewDetails = async () => {
    try {
      const response = await fetch(`/api/interview-details?mockId=${params.interviewId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview details');
      }
      const data = await response.json();
      const interview = data.interview;
      setInterviewData(interview);

      const jsonMockResp = JSON.parse(interview.jsonMockResp);
      console.log(jsonMockResp);
      setMockInterviewQuestion(jsonMockResp);
    } catch (error) {
      console.error("Error Fetching UserInterview Details: ", error);
    }
  };

  const getCurrentRoundQuestions = () => {
    if (!mockInterviewQuestion) return [];
    const roundKey = `round${currentRound}`;
    return mockInterviewQuestion[roundKey] || [];
  };

  const getCurrentRoundAgent = () => {
    switch (currentRound) {
      case 1: return 'hiring_manager';
      case 2: return 'technical_recruiter';
      case 3: return 'panel_lead';
      default: return 'hiring_manager';
    }
  };

  const getCurrentRoundTitle = () => {
    switch (currentRound) {
      case 1: return '🟦 Round 1 — Hiring Manager (Problem-Solving)';
      case 2: return '🟩 Round 2 — Technical Recruiter (Coding)';
      case 3: return '🟧 Round 3 — Panel Lead (Communication)';
      default: return 'Interview Round';
    }
  };

  const handleNextQuestion = () => {
    const currentRoundQuestions = getCurrentRoundQuestions();
    if (activeQuestionIndex < currentRoundQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      // Round completed
      setRoundCompleted(true);
    }
  };

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setActiveQuestionIndex(0);
      setRoundCompleted(false);
    }
  };

  const isLastRound = currentRound === 3;
  const currentRoundQuestions = getCurrentRoundQuestions();

  if (roundCompleted && !isLastRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{getCurrentRoundTitle()} Completed!</h2>
          <p className="text-gray-600 mb-6">
            Great job completing Round {currentRound}. Click below to proceed to the next round.
          </p>
          <Button onClick={handleNextRound} className="px-8 py-3">
            Start Round {currentRound + 1}
          </Button>
        </div>
      </div>
    );
  }

  if (roundCompleted && isLastRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">🎉 Interview Completed!</h2>
          <p className="text-gray-600 mb-6">
            Congratulations! You've completed all 3 rounds of the interview.
          </p>
          <Link href={"/dashboard/interview/" + interviewData?.mockId + "/feedback"}>
            <Button className="px-8 py-3">View Final Report</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">{getCurrentRoundTitle()}</h2>
        <p className="text-gray-600">Question {activeQuestionIndex + 1} of {currentRoundQuestions.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Questions */}
        <QuestionsSection
          mockInterviewQuestion={currentRoundQuestions}
          activeQuestionIndex={activeQuestionIndex}
          currentRound={currentRound}
        />
        {/* Video/Audio Recording */}
        <RecordAnswerSection
          mockInterviewQuestion={currentRoundQuestions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          currentRound={currentRound}
          agentType={getCurrentRoundAgent()}
        />
      </div>

      <div className="flex justify-end gap-6 mt-6">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            className="flex gap-2 justify-center items-center"
          >
            <ArrowLeft /> Previous Question
          </Button>
        )}
        {activeQuestionIndex < currentRoundQuestions.length - 1 && (
          <Button
            onClick={handleNextQuestion}
            className="flex gap-2 justify-center items-center"
          >
            Next Question <ArrowRight />
          </Button>
        )}
        {activeQuestionIndex === currentRoundQuestions.length - 1 && (
          <Button
            onClick={handleNextQuestion}
            className="flex gap-2 justify-center items-center"
          >
            Complete Round {currentRound}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
