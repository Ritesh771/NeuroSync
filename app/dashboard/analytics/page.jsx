"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/simpleAuth";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalInterviews: 0,
        avgOverallScore: 0,
        avgProblemSolving: 0,
        avgTechnicalAccuracy: 0,
        avgCommunication: 0,
        improvement: 0,
    });

    useEffect(() => {
        if (!user) {
            router.push("/sign-in");
            return;
        }
        fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics?email=${encodeURIComponent(user.email)}`);
            if (!response.ok) throw new Error("Failed to fetch analytics");

            const data = await response.json();
            setInterviews(data.interviews || []);
            setStats(data.stats || stats);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">📊 Analytics Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Interviews" value={stats.totalInterviews} />
                    <StatCard title="Avg Overall Score" value={`${stats.avgOverallScore}%`} color="blue" />
                    <StatCard title="Problem Solving" value={`${stats.avgProblemSolving}%`} color="purple" />
                    <StatCard title="Technical Accuracy" value={`${stats.avgTechnicalAccuracy}%`} color="green" />
                </div>

                {/* Performance Overview */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Performance Overview</h2>
                    <div className="space-y-4">
                        <ProgressBar label="👨‍💼 Hiring Manager (Problem-Solving)" value={stats.avgProblemSolving} color="bg-purple-500" />
                        <ProgressBar label="👩‍💻 Technical Recruiter (Accuracy)" value={stats.avgTechnicalAccuracy} color="bg-green-500" />
                        <ProgressBar label="🧑‍🏫 Panel Lead (Communication)" value={stats.avgCommunication} color="bg-blue-500" />
                        <ProgressBar label="📈 Overall Performance" value={stats.avgOverallScore} color="bg-indigo-600" />
                    </div>
                </div>

                {/* Interview History */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-6">Interview History</h2>
                    {interviews.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No interviews completed yet. Start your first interview!</p>
                    ) : (
                        <div className="space-y-4">
                            {interviews.map((interview, idx) => (
                                <InterviewCard key={idx} interview={interview} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4 text-green-600">💪 Strengths</h3>
                        <ul className="space-y-2">
                            {stats.avgCommunication >= stats.avgProblemSolving && stats.avgCommunication >= stats.avgTechnicalAccuracy && (
                                <li className="flex items-center"><span className="mr-2">✓</span> Excellent communication skills</li>
                            )}
                            {stats.avgTechnicalAccuracy >= 75 && (
                                <li className="flex items-center"><span className="mr-2">✓</span> Strong technical knowledge</li>
                            )}
                            {stats.avgProblemSolving >= 75 && (
                                <li className="flex items-center"><span className="mr-2">✓</span> Good problem-solving abilities</li>
                            )}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4 text-orange-600">🎯 Areas for Improvement</h3>
                        <ul className="space-y-2">
                            {stats.avgCommunication < 70 && (
                                <li className="flex items-center"><span className="mr-2">→</span> Work on communication clarity</li>
                            )}
                            {stats.avgTechnicalAccuracy < 70 && (
                                <li className="flex items-center"><span className="mr-2">→</span> Deepen technical understanding</li>
                            )}
                            {stats.avgProblemSolving < 70 && (
                                <li className="flex items-center"><span className="mr-2">→</span> Practice problem-solving approaches</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color = "gray" }) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        gray: "bg-gray-100 text-gray-800",
    };

    return (
        <div className={`rounded-lg shadow-md p-6 ${colorClasses[color]}`}>
            <h3 className="text-sm font-medium opacity-75 mb-2">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function ProgressBar({ label, value, color }) {
    return (
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-medium">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
}

function InterviewCard({ interview }) {
    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-semibold text-lg">{interview.jobPosition}</h4>
                    <p className="text-sm text-gray-500">{interview.createdAt}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{interview.avgScore}%</div>
                    <div className="text-xs text-gray-500">Overall</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-semibold">{interview.problemSolving}%</div>
                    <div className="text-xs text-gray-600">Problem Solving</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold">{interview.technicalAccuracy}%</div>
                    <div className="text-xs text-gray-600">Technical</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold">{interview.communication}%</div>
                    <div className="text-xs text-gray-600">Communication</div>
                </div>
            </div>
        </div>
    );
}
