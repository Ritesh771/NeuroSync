"use client";
import React, { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateContent } from "@/utils/GeminiAIModal";
import { Loader } from "lucide-react";
// import { db } from "@/utils/db";
// import { MOCKInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/lib/simpleAuth";
import moment from "moment";
import { useRouter } from "next/navigation";
import { CreateInterview } from "@/app/_Serveractions";
// import { UpdateUserCredits, UpdateCreditsUsed } from "@/app/_Serveractions"; // Commented out for unlimited credits
// import AddNew from "@/public/AddNew.json";
// import Lottie from "lottie-react";
import { UserInfoContext } from "@/context/UserInfoContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AddNewInterview = () => {
  const [Lottie, setLottie] = useState(null);
  const [AddNew, setAddNew] = useState(null);

  useEffect(() => {
    // Dynamically import Lottie and animation data on client side
    import('lottie-react').then((module) => {
      setLottie(() => module.default);
    });
    import('@/public/AddNew.json').then((module) => {
      setAddNew(module.default);
    });
  }, []);
  const { userInfo, setUserInfo } = useContext(UserInfoContext);
  const [openDialog, setOpenDialog] = useState();
  // const [upgradeDialog, setUpgradeDialog] = useState(false); // Commented out for unlimited credits
  const [jobPosition, setJobPosition] = useState();
  const [jobDescription, setJobDescription] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();
  const { user } = useUser();

  //TODO:
  //if userInfo?.credits >0 then only user can create new Interviews
  // to check if userInfo Credits >0 ==> then call the update method to deduct the credits
  const onSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    console.log(jobPosition, jobDescription, jobExperience);

    // Fetch user's resume data for personalized questions
    let resumeData = null;
    try {
      const resumeResponse = await fetch(`/api/resume/data?email=${encodeURIComponent(user?.email)}`);
      if (resumeResponse.ok) {
        const data = await resumeResponse.json();
        resumeData = data.resumeData;
        console.log("Resume data loaded:", resumeData);
      }
    } catch (error) {
      console.log("Could not load resume data:", error);
    }

    // Build personalized prompt based on resume for multi-round interview
    let InputPrompt = `job position: ${jobPosition}, Job Description: ${jobDescription}, Year of Experience: ${jobExperience}.`;

    if (resumeData) {
      InputPrompt += `\n\nCandidate Profile:`;
      if (resumeData.skills) {
        InputPrompt += `\nSkills: ${typeof resumeData.skills === 'string' ? resumeData.skills : JSON.stringify(resumeData.skills)}`;
      }
      if (resumeData.experience) {
        InputPrompt += `\nExperience: ${resumeData.experience.substring(0, 500)}`;
      }
      if (resumeData.projects) {
        InputPrompt += `\nProjects: ${resumeData.projects.substring(0, 500)}`;
      }
      InputPrompt += `\n\nGenerate a complete 3-round interview structure with 5 questions per round:

🟦 ROUND 1 — Hiring Manager Round (Problem-Solving & Scenario Thinking):
- 5 scenario-based problem-solving questions
- Focus: analytical thinking, decision-making, situational judgment

🟩 ROUND 2 — Technical Recruiter Round (Coding + Technical Assessment):
- 5 coding questions (data structures, algorithms, system design, React, backend, SQL)
- Focus: technical depth, coding efficiency, correctness, real-time debugging

🟧 ROUND 3 — Panel Lead Round (Communication & Soft Skills):
- 5 communication-oriented questions
- Focus: clarity, articulation, confidence, presentation

Provide answers in JSON Format with this structure:
{
  "round1": [
    {"question": "...", "answer": "...", "type": "problem_solving"},
    ...
  ],
  "round2": [
    {"question": "...", "answer": "...", "type": "coding"},
    ...
  ],
  "round3": [
    {"question": "...", "answer": "...", "type": "communication"},
    ...
  ]
}`;
    } else {
      InputPrompt += ` Generate a complete 3-round interview structure with 5 questions per round based on the job requirements. Use this JSON format:
{
  "round1": [
    {"question": "...", "answer": "...", "type": "problem_solving"},
    ...
  ],
  "round2": [
    {"question": "...", "answer": "...", "type": "coding"},
    ...
  ],
  "round3": [
    {"question": "...", "answer": "...", "type": "communication"},
    ...
  ]
}`;
    }

    console.log("Generated prompt:", InputPrompt);

    try {
      // Mock response for testing without AI - Multi-round structure
      const MockJsonResp = JSON.stringify({
        "round1": [
          {
            "question": "Describe a challenging project you worked on and how you overcame the obstacles.",
            "answer": "A good answer should demonstrate problem-solving skills, leadership, and learning from challenges.",
            "type": "problem_solving"
          },
          {
            "question": "How would you handle a situation where a project deadline is approaching but the team is behind schedule?",
            "answer": "Should show decision-making, communication, and resource management skills.",
            "type": "problem_solving"
          },
          {
            "question": "Tell me about a time when you had to make a difficult technical decision under pressure.",
            "answer": "Look for analytical thinking, risk assessment, and justification of the decision.",
            "type": "problem_solving"
          },
          {
            "question": "How do you approach debugging a complex issue in a production environment?",
            "answer": "Should demonstrate systematic problem-solving methodology and prioritization.",
            "type": "problem_solving"
          },
          {
            "question": "Describe your process for evaluating new technologies or frameworks for a project.",
            "answer": "Should show research skills, criteria evaluation, and business impact consideration.",
            "type": "problem_solving"
          }
        ],
        "round2": [
          {
            "question": "Implement a function to reverse a linked list.",
            "answer": "Should handle edge cases like empty list, single node, and provide O(n) time solution.",
            "type": "coding"
          },
          {
            "question": "Write a SQL query to find the second highest salary from an employee table.",
            "answer": "Use subquery or window functions, handle ties appropriately.",
            "type": "coding"
          },
          {
            "question": "Explain and implement a React component that manages form state efficiently.",
            "answer": "Should demonstrate understanding of controlled components, state management, and performance optimization.",
            "type": "coding"
          },
          {
            "question": "Design a simple caching system with TTL (time-to-live) functionality.",
            "answer": "Should consider thread safety, eviction policies, and memory management.",
            "type": "coding"
          },
          {
            "question": "Write a function to detect if a string has balanced parentheses.",
            "answer": "Use stack data structure, handle different types of brackets, return early on invalid input.",
            "type": "coding"
          }
        ],
        "round3": [
          {
            "question": "Explain a complex technical concept to a non-technical stakeholder.",
            "answer": "Should demonstrate clarity, simplicity, and ability to adapt communication style.",
            "type": "communication"
          },
          {
            "question": "How do you handle receiving constructive criticism about your work?",
            "answer": "Should show openness, self-reflection, and professional growth mindset.",
            "type": "communication"
          },
          {
            "question": "Describe your approach to mentoring junior team members.",
            "answer": "Should demonstrate patience, teaching skills, and leadership qualities.",
            "type": "communication"
          },
          {
            "question": "How do you ensure effective communication in remote or distributed teams?",
            "answer": "Should address tools, processes, cultural considerations, and proactive communication.",
            "type": "communication"
          },
          {
            "question": "Tell me about a time when you had to persuade others to adopt your idea or approach.",
            "answer": "Should demonstrate confidence, preparation, and ability to handle objections.",
            "type": "communication"
          }
        ]
      });
      console.log(JSON.parse(MockJsonResp));
      setJsonResponse(MockJsonResp || []);

      try {
        if (MockJsonResp) {
          const interviewData = {
            mockId: uuidv4(),
            jsonMockResp: MockJsonResp,
            jobPosition: jobPosition,
            jobDescription: jobDescription,
            jobExperience: jobExperience,
            createdBy: user?.email,
            createdAt: moment().format("DD-MM-YYYY"),
          };

          const resp = await CreateInterview(interviewData);

          console.log("Inserted ID: ", resp);

          if (resp) {
            setOpenDialog(false);
            router.push("/dashboard/interview/" + resp[0]?.mockId);
          }

          //logic to Update Credits
          // await updateCredits(); // Commented out for unlimited credits
          //logic to Update CreditsUsed
          // await updateCreditsUsed(); // Commented out for unlimited credits
        }
      } catch (error) {
        console.error("Error while adding response to Backend : ", error);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error while Generating MockJsonResp : ", error);
      setLoading(false);
    }
  };

  // const updateCredits = async () => {
  //   if (userInfo && userInfo?.credits > 0) {
  //     try {
  //       const newCredits = userInfo?.credits - 2;
  //       const email = user?.email;
  //       const res = await UpdateUserCredits(email, newCredits);
  //       if (res) {
  //         setUserInfo((prevUserInfo) => ({
  //           ...prevUserInfo,
  //           credits: newCredits,
  //         }));

  //         console.log("User credits updated: 🎉🎉🎉", res, newCredits);
  //       } else {
  //         console.log("Unable to Update Credits:", res);
  //       }
  //     } catch (error) {
  //       console.log("Error updating user credits", error);
  //     }
  //   }
  // };

  // const updateCreditsUsed = async () => {
  //   const newUsedCredits = userInfo?.creditsUsed + 2;
  //   const email = user?.email;
  //   const res = await UpdateCreditsUsed(email, newUsedCredits);
  //   if (res) {
  //     setUserInfo((prevUserInfo) => ({
  //       ...prevUserInfo,
  //       creditsUsed: newUsedCredits,
  //     }));
  //     console.log("User creditsUsed updated: 🎉🎉🎉", res, newUsedCredits);
  //   } else {
  //     console.error("Unable to Update CreditsUsed:", res);
  //   }
  // };

  return (
    <div>
      <div
        className="p-10 border-2 border-dashed  border-primary 
      rounded-lg bg-secondary hover:scale-105 hover:shadow-md 
      cursor-pointer transition-all"
        onClick={() => {
          // userInfo?.credits > 0 ? setOpenDialog(true) : setUpgradeDialog(true); // Commented out for unlimited credits
          setOpenDialog(true); // Always allow creating interview
        }}
      >
        <h2 className="flex justify-center items-center font-medium text-lg text-center">
          {Lottie && AddNew ? (
            <Lottie animationData={AddNew} loop={true} className="h-16" />
          ) : (
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
          )}
          Add New
        </h2>
      </div>
      {/* Add new Interview Diaglo */}
      <Dialog open={openDialog}>
        {/* <DialogTrigger></DialogTrigger> */}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell Us more about your interview
            </DialogTitle>
            <DialogDescription>
              Add Details about your job Position/role, job description
              and year of experience
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="mt-7 my-3">
              <label className="font-semibold">Job Role/Position</label>
              <Input
                onChange={(event) => setJobPosition(event.target.value)}
                placeholder="Ex. Full Stack Developer"
                required
              />
            </div>

            <div className="mt-7 my-3">
              <label className="font-semibold">
                Job Description/Tech Stack (In Short)
              </label>
              <Textarea
                onChange={(event) =>
                  setJobDescription(event.target.value)
                }
                required
                placeholder="Ex. React, Angular, Nodejs, MySql"
              />
            </div>
            <div className="mt-7 my-3">
              <label className="font-semibold">Years of Experience</label>
              <Input
                onChange={(event) => setJobExperience(event.target.value)}
                required
                placeholder="EX. 5"
                type="number"
                max="30"
                min="0"
              />
            </div>
            <div className="flex gap-5 justify-end">
              <Button
                onClick={() => setOpenDialog(false)}
                type="button"
                variant="ghost"
                className={`hover:border hover:border-gray-500 ${loading && "hidden"
                  }`}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="animate-spin" /> Generating from AI
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Upgrade Credits Alert Dialog */}
      {/* <AlertDialog open={upgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              You don't have enough Credits left !
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please Upgrade the Credits
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUpgradeDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/dashboard/upgrade")}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */} {/* Commented out for unlimited credits */}
    </div>
  );
};

export default AddNewInterview;
