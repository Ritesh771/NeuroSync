"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/simpleAuth";

const Profile = () => {
  const { user } = useUser();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumeData();
    }
  }, [user]);

  const fetchResumeData = async () => {
    try {
      const response = await fetch("/api/resume/get");
      if (response.ok) {
        const data = await response.json();
        console.log("Resume data received:", data); // Debug log
        console.log("Debug info:", data.debug); // Additional debug log
        setResumeData(data);
      } else {
        console.log("Failed to fetch resume data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching resume data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        <p className="text-gray-500 mb-4">No resume data found. Please upload your resume.</p>
        <a
          href="/resume-upload"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Resume
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Profile</h3>
        <a
          href="/resume-upload"
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Re-upload Resume
        </a>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? (
              resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 italic">No skills extracted. Make sure your resume has a clear "Skills" or "Technical Skills" section.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
          <p className="text-gray-600">
            {resumeData.experience && resumeData.experience !== "No work experience information found" && resumeData.experience.trim()
              ? resumeData.experience
              : "No experience extracted. Make sure your resume has a clear \"Experience\" or \"Work Experience\" section."
            }
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Education</h4>
          <p className="text-gray-600">
            {resumeData.education && resumeData.education !== "No education information found" && resumeData.education.trim()
              ? resumeData.education
              : "No education extracted. Make sure your resume has a clear \"Education\" section."
            }
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Projects</h4>
          <p className="text-gray-600">
            {resumeData.projects && resumeData.projects !== "No projects information found" && resumeData.projects.trim()
              ? resumeData.projects
              : "No projects extracted. Make sure your resume has a clear \"Projects\" section."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;