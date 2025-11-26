import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Complete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold">Session Complete!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for checking in with TeenCare. Your responses have been saved.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Remember: TeenCare is a supportive tool, not a replacement for professional help. If you're experiencing a crisis, please reach out to a trusted adult or mental health professional.
            </p>
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold">Crisis Resources:</p>
              <p className="text-xs">
                National Suicide Prevention Lifeline: 988
                <br />
                Crisis Text Line: Text HOME to 741741
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/mode-select")}
              variant="outline"
              className="flex-1 rounded-2xl h-12"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Another Mode
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="flex-1 btn-gradient rounded-2xl h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Complete;
