import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Check, Maximize2, Minimize2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm here to listen and support you. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [simulate, setSimulate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (simulate) {
        // Simulated response
        setTimeout(() => {
          const responses = [
            "I hear you. That sounds really challenging. Can you tell me more about what's been going on?",
            "Thank you for sharing that with me. It takes courage to open up. How long have you been feeling this way?",
            "I'm here for you. What do you think might help you feel better in this moment?",
            "That's a lot to deal with. Have you been able to talk to anyone else about this?",
          ];
          const response = responses[Math.floor(Math.random() * responses.length)];
          setMessages((prev) => [...prev, { role: "assistant", content: response }]);
          setIsLoading(false);
        }, 1000);
      } else {
        // Real API call
        const response = await fetch("http://localhost:8000/api/llm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            simulate: false,
          }),
        });

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Using simulated mode. Check your API connection.",
        variant: "destructive",
      });
      setSimulate(true);
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: userId,
          source: "chat",
          raw_data: { messages },
          meta: { simulate },
        }),
      });

      if (response.ok) {
        toast({ title: "Session saved successfully" });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Your session will be saved locally.",
        variant: "destructive",
      });
    }

    navigate("/complete");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className={`mx-auto px-4 py-3 flex items-center justify-between transition-all duration-300 ${isExpanded ? 'max-w-full' : 'max-w-4xl'}`}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mode-select")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">TeenCare Chat</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="demo-mode" className="text-sm hidden md:block">
                Demo Mode
              </Label>
              <Switch id="demo-mode" checked={simulate} onCheckedChange={setSimulate} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto px-4 py-8 space-y-6 transition-all duration-300 ${isExpanded ? 'max-w-6xl' : 'max-w-3xl'}`}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className={msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground capitalize">{msg.role}</span>
                </div>
                <div
                  className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/50"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 border border-border/50 rounded-2xl px-5 py-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background p-4">
        <div className={`mx-auto transition-all duration-300 ${isExpanded ? 'max-w-6xl' : 'max-w-3xl'}`}>
          <div className="relative flex items-end gap-2 bg-muted/30 rounded-3xl border border-border/50 p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message TeenCare..."
              className="min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-4 py-3"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full mb-0.5 shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-3 flex justify-center">
            <Button
              onClick={handleFinish}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <Check className="w-3 h-3 mr-1.5" />
              Finish Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
