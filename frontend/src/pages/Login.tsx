import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserId, setConsent } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localConsent, setLocalConsent] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      toast({
        title: "Fields Required",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    if (!localConsent) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms to continue.",
        variant: "destructive",
      });
      return;
    }

    // Demo login - generate anonymous ID
    const anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(anonymousId);
    setConsent(true);

    toast({
      title: "Welcome to TeenCare!",
      description: `Logged in as ${username}`,
    });

    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your TeenCare account
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-card border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-card border-border/50"
              />
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-3 glass-card rounded-2xl p-4">
              <Checkbox
                id="consent"
                checked={localConsent}
                onCheckedChange={(checked) => setLocalConsent(checked as boolean)}
              />
              <label
                htmlFor="consent"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I understand this is a demo tool and not a substitute for professional medical advice, diagnosis, or treatment.
              </label>
            </div>

            {/* Demo Note */}
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Demo Mode: Use any username/password to login
              </p>
            </div>

            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full btn-gradient rounded-2xl h-14 text-lg font-semibold"
            >
              Sign In
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
