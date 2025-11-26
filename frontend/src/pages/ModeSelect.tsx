import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Brain, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const ModeSelect = () => {
  const navigate = useNavigate();

  const modes = [
    {
      icon: MessageCircle,
      title: "Chat Support",
      description: "Talk to our supportive AI assistant in a safe, judgment-free space",
      gradient: "from-primary to-accent",
      route: "/chat",
    },
    {
      icon: Brain,
      title: "Quiz",
      description: "Play quick cognitive games to check in with your focus and emotions",
      gradient: "from-secondary to-primary",
      route: "/quiz",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive z-50"
        onClick={() => navigate("/")}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </Button>
      <div className="w-full max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold">Choose Your Path</h1>
          <p className="text-lg text-muted-foreground">
            How would you like to check in today?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-3xl p-8 cursor-pointer group"
              onClick={() => navigate(mode.route)}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <mode.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{mode.title}</h2>
              <p className="text-muted-foreground mb-6">{mode.description}</p>
              <Button className="w-full btn-gradient rounded-xl">
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/home")}
            >
              Back to Home
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Counselor Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeSelect;
