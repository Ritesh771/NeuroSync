"use client";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import YourCredits from "./_components/YourCredits";
import Profile from "./_components/Profile";

const Dashboard = () => {
  return (
    <div className="p-10">
      <h2 className="font-bold text-2xl">Dashboard</h2>
      <h2 className="text-gray-500">
        Create and Start your AI Mockup Interview
      </h2>

      {/* Profile Section */}
      <div className="my-8">
        <Profile />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-5">
        <AddNewInterview />
        <div></div>
        {/* <YourCredits /> */} {/* Commented out to make credits unlimited */}
      </div>

      {/* List of Interviews */}
      <InterviewList />
    </div>
  );
};

export default Dashboard;

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
