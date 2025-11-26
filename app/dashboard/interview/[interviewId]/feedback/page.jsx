"use client";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, House, Trophy, Target, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import NoResultFound from "@/public/NoResultFound.json";
import Lottie from "lottie-react";

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [roundReports, setRoundReports] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback?mockId=${params.interviewId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      const answers = data.feedback || [];

      setFeedbackList(answers);

      // Generate round reports and final report
      await generateRoundReports(answers);
      await generateFinalReport(answers);

      console.log("Feedback data:", answers);
    } catch (error) {
      console.error("Error while fetching Feedback data :", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRoundReports = async (answers) => {
    const reports = [];

    for (let round = 1; round <= 3; round++) {
      const roundAnswers = answers.filter(answer => answer.roundNumber === round);
      if (roundAnswers.length > 0) {
        const avgScore = Math.round(roundAnswers.reduce((sum, ans) => sum + ans.overallScore, 0) / roundAnswers.length);

        let agentType, summaryReport, recommendation, strengths, weaknesses;

        if (round === 1) {
          agentType = 'hiring_manager';
          summaryReport = `Round 1 completed with an average problem-solving score of ${avgScore}/100.`;
          recommendation = avgScore >= 75 ? 'proceed' : 'needs_improvement';
          strengths = avgScore >= 75 ? 'Strong analytical thinking and decision-making skills' : 'Shows potential but needs more practice in problem-solving';
          weaknesses = avgScore < 75 ? 'Could improve in breaking down complex problems and considering edge cases' : 'Minor areas for improvement in problem-solving approach';
        } else if (round === 2) {
          agentType = 'technical_recruiter';
          summaryReport = `Round 2 completed with an average technical score of ${avgScore}/100.`;
          recommendation = avgScore >= 70 ? 'proceed' : 'needs_improvement';
          strengths = avgScore >= 70 ? 'Good technical knowledge and coding skills' : 'Demonstrates basic technical understanding';
          weaknesses = avgScore < 70 ? 'Needs improvement in technical depth and problem-solving efficiency' : 'Could benefit from more advanced technical concepts';
        } else if (round === 3) {
          agentType = 'panel_lead';
          summaryReport = `Round 3 completed with an average communication score of ${avgScore}/100.`;
          recommendation = avgScore >= 75 ? 'proceed' : 'needs_improvement';
          strengths = avgScore >= 75 ? 'Excellent communication and presentation skills' : 'Clear verbal communication skills';
          weaknesses = avgScore < 75 ? 'Could improve confidence and structure in responses' : 'Minor improvements needed in communication clarity';
        }

        const report = {
          mockId: params.interviewId,
          roundNumber: round,
          agentType,
          averageScore: avgScore,
          summaryReport,
          recommendation,
          strengths,
          weaknesses,
          createdAt: new Date().toISOString(),
        };

        reports.push(report);

        // Save to database (you would implement this API endpoint)
        try {
          await fetch('/api/round-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
          });
        } catch (error) {
          console.error('Error saving round report:', error);
        }
      }
    }

    setRoundReports(reports);
  };

  const generateFinalReport = async (answers) => {
    if (answers.length === 0) return;

    const round1Answers = answers.filter(a => a.roundNumber === 1);
    const round2Answers = answers.filter(a => a.roundNumber === 2);
    const round3Answers = answers.filter(a => a.roundNumber === 3);

    const round1Score = round1Answers.length > 0 ? Math.round(round1Answers.reduce((sum, a) => sum + a.overallScore, 0) / round1Answers.length) : 0;
    const round2Score = round2Answers.length > 0 ? Math.round(round2Answers.reduce((sum, a) => sum + a.overallScore, 0) / round2Answers.length) : 0;
    const round3Score = round3Answers.length > 0 ? Math.round(round3Answers.reduce((sum, a) => sum + a.overallScore, 0) / round3Answers.length) : 0;

    const overallScore = Math.round((round1Score + round2Score + round3Score) / 3);

    let hiringDecision, strengths, weaknesses, improvementRoadmap;

    if (overallScore >= 80) {
      hiringDecision = 'hire';
      strengths = 'Excellent performance across all rounds. Strong technical skills, problem-solving abilities, and communication.';
      weaknesses = 'Minor areas for continued growth and development.';
      improvementRoadmap = 'Continue building expertise in emerging technologies and leadership skills.';
    } else if (overallScore >= 70) {
      hiringDecision = 'needs_improvement';
      strengths = 'Good foundation with solid performance in multiple areas.';
      weaknesses = 'Could improve in specific technical areas and communication clarity.';
      improvementRoadmap = 'Focus on deepening technical knowledge and practicing interview communication skills.';
    } else {
      hiringDecision = 'reject';
      strengths = 'Shows potential and basic understanding of concepts.';
      weaknesses = 'Needs significant improvement in technical skills, problem-solving, and communication.';
      improvementRoadmap = 'Build stronger technical foundation, practice coding problems, and work on communication skills through mock interviews.';
    }

    const finalReportData = {
      mockId: params.interviewId,
      userEmail: answers[0]?.userEmail,
      round1Score,
      round2Score,
      round3Score,
      overallScore,
      hiringDecision,
      strengths,
      weaknesses,
      improvementRoadmap,
      createdAt: new Date().toISOString(),
    };

    setFinalReport(finalReportData);

    // Save to database
    try {
      await fetch('/api/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalReportData),
      });
    } catch (error) {
      console.error('Error saving final report:', error);
    }
  };

  const getRoundIcon = (round) => {
    switch (round) {
      case 1: return <Target className="h-5 w-5" />;
      case 2: return <Trophy className="h-5 w-5" />;
      case 3: return <MessageSquare className="h-5 w-5" />;
      default: return null;
    }
  };

  const getRoundTitle = (round) => {
    switch (round) {
      case 1: return '🟦 Round 1 — Hiring Manager (Problem-Solving)';
      case 2: return '🟩 Round 2 — Technical Recruiter (Coding)';
      case 3: return '🟧 Round 3 — Panel Lead (Communication)';
      default: return `Round ${round}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating your comprehensive feedback report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      {feedbackList?.length == 0 ? (
        <div className="flex flex-col justify-center items-center">
          <Lottie
            animationData={NoResultFound}
            loop={true}
            className="w-8/12 h-96"
          />
          <p className="font-bold">No Interview Feedback result found! </p>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-500">
            🎉 Interview Complete!
          </h2>
          <h2 className="font-bold text-2xl mb-2">
            Here is your comprehensive 3-round feedback report
          </h2>

          {/* Final Report Summary */}
          {finalReport && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-8 border-2 border-blue-200">
              <h3 className="text-xl font-bold mb-4">📊 Final Interview Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-blue-600">{finalReport.round1Score}/100</div>
                  <div className="text-sm text-gray-600">Problem-Solving</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-green-600">{finalReport.round2Score}/100</div>
                  <div className="text-sm text-gray-600">Technical</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-purple-600">{finalReport.round3Score}/100</div>
                  <div className="text-sm text-gray-600">Communication</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className={`text-2xl font-bold ${finalReport.overallScore >= 80 ? 'text-green-600' : finalReport.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {finalReport.overallScore}/100
                  </div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Hiring Decision:</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  finalReport.hiringDecision === 'hire' ? 'bg-green-100 text-green-800' :
                  finalReport.hiringDecision === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {finalReport.hiringDecision === 'hire' ? '✅ Hire' :
                   finalReport.hiringDecision === 'needs_improvement' ? '⚠️ Needs Improvement' :
                   '❌ Reject'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">💪 Strengths:</h4>
                  <p className="text-sm">{finalReport.strengths}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">🎯 Areas for Improvement:</h4>
                  <p className="text-sm">{finalReport.weaknesses}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-blue-700">🚀 Improvement Roadmap:</h4>
                <p className="text-sm">{finalReport.improvementRoadmap}</p>
              </div>
            </div>
          )}

          {/* Round Reports */}
          {roundReports.map((report, index) => (
            <div key={index} className="mb-6 border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getRoundIcon(report.roundNumber)}
                <h3 className="text-lg font-semibold">{getRoundTitle(report.roundNumber)}</h3>
                <span className="ml-auto text-lg font-bold">{report.averageScore}/100</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{report.summaryReport}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Strengths:</span> {report.strengths}
                </div>
                <div>
                  <span className="font-medium text-red-700">Weaknesses:</span> {report.weaknesses}
                </div>
              </div>
            </div>
          ))}

          {/* Detailed Question Feedback */}
          <h3 className="text-xl font-bold mb-4">📝 Detailed Question Feedback</h3>
          {feedbackList &&
            feedbackList?.map((item, index) => (
              <Collapsible key={index} className="mt-4">
                <CollapsibleTrigger className="flex justify-between gap-7 items-center p-3 bg-secondary border border-black rounded-lg my-2 text-left w-full hover:bg-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                        Round {item.roundNumber}
                      </span>
                      <span className="text-sm text-gray-600">Question {index + 1}</span>
                    </div>
                    <div className="text-sm">{item?.question}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{item?.overallScore}/100</span>
                    <ChevronsUpDown className="h-5 w-5" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.hiringManagerScore && (
                        <div className="p-3 bg-blue-50 border rounded">
                          <div className="font-medium text-blue-800">Hiring Manager</div>
                          <div className="text-lg font-bold">{item.hiringManagerScore}/100</div>
                          <div className="text-xs text-blue-700 mt-1">{item.hiringManagerFeedback}</div>
                        </div>
                      )}
                      {item.technicalRecruiterScore && (
                        <div className="p-3 bg-green-50 border rounded">
                          <div className="font-medium text-green-800">Technical Recruiter</div>
                          <div className="text-lg font-bold">{item.technicalRecruiterScore}/100</div>
                          <div className="text-xs text-green-700 mt-1">{item.technicalRecruiterFeedback}</div>
                        </div>
                      )}
                      {item.panelLeadScore && (
                        <div className="p-3 bg-purple-50 border rounded">
                          <div className="font-medium text-purple-800">Panel Lead</div>
                          <div className="text-lg font-bold">{item.panelLeadScore}/100</div>
                          <div className="text-xs text-purple-700 mt-1">{item.panelLeadFeedback}</div>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Your Answer:</h4>
                      <div className="p-3 bg-white border rounded text-sm">
                        {item?.userAns}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Expected Answer:</h4>
                      <div className="p-3 bg-green-50 border rounded text-sm">
                        {item?.correctAns}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}
      <div className="flex justify-center items-center">
        <Button
          onClick={() => router.replace("/dashboard")}
          className="flex justify-center items-center gap-2 mt-6"
        >
          <House /> Go Home
        </Button>
      </div>
    </div>
  );
};

export default Feedback;
