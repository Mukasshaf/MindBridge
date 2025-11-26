import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageCircle, TrendingUp, X, Send, LogOut, Maximize2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

interface Session {
  id: string;
  participant_id: string;
  source: string;
  urgency: string;
  created_at: string;
  stress_score?: number;
  attention_score?: number;
  mood?: string;
  notes?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hi! I'm here to listen. How are you feeling today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [stressScore, setStressScore] = useState(45);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Mock mood data for charts
  const moodData = [
    { day: "Mon", stress: 65, mood: 70 },
    { day: "Tue", stress: 55, mood: 75 },
    { day: "Wed", stress: 70, mood: 60 },
    { day: "Thu", stress: 50, mood: 80 },
    { day: "Fri", stress: 45, mood: 85 },
    { day: "Sat", stress: 40, mood: 90 },
    { day: "Sun", stress: 45, mood: 85 },
  ];

  useEffect(() => {
    // Check if first time user or first login today
    const lastLogin = localStorage.getItem("lastLoginDate");
    const today = new Date().toDateString();

    if (!lastLogin || lastLogin !== today) {
      // Show quiz modal automatically
      setTimeout(() => setShowQuizModal(true), 1000);
      localStorage.setItem("lastLoginDate", today);
    }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        // Mock data fallback
        setSessions([
          {
            id: "sess_1",
            participant_id: "anon_abc123",
            source: "chat",
            urgency: "Monitor",
            created_at: new Date().toISOString(),
            stress_score: 65,
            attention_score: 78,
            mood: "Anxious",
            notes: "User discussed academic stress and sleep issues.",
          },
          {
            id: "sess_2",
            participant_id: "anon_xyz789",
            source: "quiz",
            urgency: "Urgent",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            stress_score: 85,
            attention_score: 45,
            mood: "Irritable",
            notes: "Low attention scores and high impulsivity detected.",
          },
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { role: "user", content: inputMessage };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else {
        console.error("API Error");
      }
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  const handleStartQuiz = () => {
    setShowQuizModal(false);
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar showGetStarted={false} />

      <div className="flex-1 flex relative pt-24">
        {/* Main Content - Analytics */}
        <main className={`flex-1 p-6 md:p-12 transition-all duration-300 ${showChatDrawer ? 'mr-0 md:mr-96' : ''}`}>
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">
                  Welcome back! Here's your mental wellness overview.
                </p>
              </motion.div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQuizModal(true)}
                  className="rounded-full border-gray-200 hover:bg-gray-100"
                >
                  <Brain className="w-4 h-4 mr-2 text-blue-600" />
                  Daily Quiz
                </Button>
                <Button
                  onClick={() => setShowChatDrawer(!showChatDrawer)}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Assistant
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stress Level Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Stress Level</h3>
                    <p className="text-sm text-gray-500">Real-time analysis</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-gray-900">{stressScore}%</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${stressScore < 40 ? "bg-green-100 text-green-700" :
                      stressScore < 70 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                      {stressScore < 40 ? "Low" : stressScore < 70 ? "Moderate" : "High"}
                    </span>
                  </div>
                  <Progress value={stressScore} className="h-2 bg-gray-100" indicatorClassName={
                    stressScore < 40 ? "bg-green-500" : stressScore < 70 ? "bg-yellow-500" : "bg-red-500"
                  } />
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {stressScore < 40 ? "You're doing great! Keep maintaining this balance." :
                      stressScore < 70 ? "Take a moment to breathe. Consider a short break." :
                        "High stress detected. We recommend chatting with the assistant."}
                  </p>
                </div>
              </motion.div>

              {/* Mood Analysis Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mood Analysis</h3>
                    <p className="text-sm text-gray-500">Current emotional state</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-3xl font-bold text-gray-900">Calm</h4>
                      <p className="text-sm text-gray-500 mt-1">Dominant emotion</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-purple-600">Positive</span>
                      <p className="text-sm text-gray-500 mt-1">Overall sentiment</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 mb-1">Energy</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-semibold">Stable</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-xs text-gray-500 mb-1">Focus</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-semibold">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Weekly Trends Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Trends</h3>
                  <p className="text-sm text-gray-500">Mood vs. Stress levels</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Stress"
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Mood"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Sessions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
                <p className="text-sm text-gray-500">History of your interactions</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead className="pl-8">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mood</TableHead>
                      <TableHead>Stress</TableHead>
                      <TableHead>Attention</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id} className="hover:bg-gray-50 border-gray-100 transition-colors">
                        <TableCell className="pl-8 font-medium text-gray-900">
                          {new Date(session.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize text-gray-600">{session.source}</TableCell>
                        <TableCell className="text-gray-600">{session.mood || "-"}</TableCell>
                        <TableCell className="text-gray-600">{session.stress_score ? `${session.stress_score}/100` : "-"}</TableCell>
                        <TableCell className="text-gray-600">{session.attention_score ? `${session.attention_score}/100` : "-"}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.urgency === "Urgent"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                            }`}>
                            {session.urgency}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Chat Drawer */}
        <AnimatePresence>
          {showChatDrawer && (
            <>
              {/* Overlay for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChatDrawer(false)}
                className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
              >
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Assistant</h3>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/chat")}
                      className="rounded-full hover:bg-gray-100 text-gray-500"
                      title="Expand Chat"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatDrawer(false)}
                      className="rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar className="w-8 h-8 mt-1 border border-gray-200">
                        <AvatarFallback className={msg.role === "assistant" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}>
                          {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 border border-gray-100"
                          }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="relative flex items-end gap-2 bg-gray-50 rounded-3xl border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="min-h-[44px] max-h-[120px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="h-10 w-10 rounded-full mb-0.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="bg-white border-gray-100 sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">Daily Mind Check</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-center text-gray-600 max-w-sm mx-auto">
              Take a moment to reflect. Our interactive scenarios help you understand your decision-making style.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowQuizModal(false)}
                className="flex-1 rounded-full border-gray-200 hover:bg-gray-50 text-gray-600 h-12"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleStartQuiz}
                className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-md hover:shadow-lg transition-all"
              >
                Start Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
