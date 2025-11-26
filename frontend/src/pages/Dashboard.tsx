import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      toast({
        title: "Connection Error",
        description: "Showing sample data. Check API connection.",
        variant: "destructive",
      });
      // Set mock data
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
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/session/${sessionId}/export/pdf`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session_${sessionId}.pdf`;
        a.click();
        toast({ title: "PDF downloaded successfully" });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "PDF export feature requires API connection.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Counselor Dashboard</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <h2 className="text-2xl font-bold">Recent Sessions</h2>
            <p className="text-muted-foreground">
              Review and monitor participant sessions
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No sessions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Stress</TableHead>
                  <TableHead>Attention</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedSession(session)}
                  >
                    <TableCell className="font-mono text-sm">
                      {session.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {session.participant_id}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{session.source}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(session.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {session.mood || "-"}
                    </TableCell>
                    <TableCell>
                      {session.stress_score ? `${session.stress_score}/100` : "-"}
                    </TableCell>
                    <TableCell>
                      {session.attention_score ? `${session.attention_score}/100` : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${session.urgency === "Urgent"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary/20 text-secondary-foreground"
                          }`}
                      >
                        {session.urgency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(session.id);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </div>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="glass-card border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Session ID</p>
                  <p className="font-mono text-sm">{selectedSession.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Participant</p>
                  <p className="font-mono text-sm">
                    {selectedSession.participant_id}
                  </p>
                </div>
              </div>

              {selectedSession.stress_score !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Stress Score</p>
                    <p className="text-sm font-semibold">
                      {selectedSession.stress_score}/100
                    </p>
                  </div>
                  <Progress value={selectedSession.stress_score} className="h-3" />
                </div>
              )}

              {selectedSession.attention_score !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Attention Score</p>
                    <p className="text-sm font-semibold">
                      {selectedSession.attention_score}/100
                    </p>
                  </div>
                  <Progress value={selectedSession.attention_score} className="h-3" />
                </div>
              )}

              {selectedSession.mood && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Mood</p>
                  <div className="glass-card rounded-xl p-3 inline-block">
                    <span className="text-lg font-semibold">{selectedSession.mood}</span>
                  </div>
                </div>
              )}

              {selectedSession.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Clinical Notes
                  </p>
                  <div className="glass-card rounded-2xl p-4">
                    <p className="text-sm leading-relaxed">{selectedSession.notes}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleDownloadPDF(selectedSession.id)}
                className="w-full btn-gradient rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
