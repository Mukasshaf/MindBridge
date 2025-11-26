import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Timer, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface QuizData {
  reactionTimes: number[];
  decisions: string[];
  emotionAccuracy: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useUser();
  const [step, setStep] = useState(0);
  const [quizData, setQuizData] = useState<QuizData>({
    reactionTimes: [],
    decisions: [],
    emotionAccuracy: 0,
  });

  // Task 1: Reaction Time
  const [isWaiting, setIsWaiting] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [trial, setTrial] = useState(0);

  // Task 2: Decision Making
  // Task 2: Decision Making
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    setIsLoadingQuiz(true);
    try {
      const response = await fetch("http://localhost:8000/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "General teen stress" }),
      });
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      } else {
        // Fallback
        setScenarios(fallbackScenarios);
      }
    } catch (error) {
      console.error("Quiz fetch error:", error);
      setScenarios(fallbackScenarios);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const fallbackScenarios = [
    {
      text: "You have a big test tomorrow but your friends are going out tonight.",
      options: [
        { label: "Study at home", type: "Calm" },
        { label: "Go out with friends", type: "Impulsive" },
        { label: "Ignore both", type: "Avoidant" },
      ],
    },
    {
      text: "Someone posts something mean about you online.",
      options: [
        { label: "Talk to them directly", type: "Calm" },
        { label: "Post something back", type: "Impulsive" },
        { label: "Pretend you didn't see it", type: "Avoidant" },
      ],
    },
  ];

  // Task 3: Emotion Recognition
  const [emotionTrial, setEmotionTrial] = useState(0);
  const emotions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😐", label: "Neutral" },
  ];
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const startReactionTest = () => {
    setIsWaiting(true);
    const delay = Math.random() * 1200 + 800;
    setTimeout(() => {
      setIsWaiting(false);
      setShowTarget(true);
      setStartTime(Date.now());
    }, delay);
  };

  const handleReactionClick = () => {
    if (isWaiting) {
      toast({ title: "Too early! Wait for the target.", variant: "destructive" });
      setIsWaiting(false);
      return;
    }
    if (!showTarget) return;

    const reactionTime = Date.now() - startTime;
    setQuizData((prev) => ({
      ...prev,
      reactionTimes: [...prev.reactionTimes, reactionTime],
    }));
    setShowTarget(false);

    if (trial < 4) {
      setTrial(trial + 1);
      setTimeout(startReactionTest, 1000);
    } else {
      setStep(1);
      setTrial(0);
    }
  };

  const handleDecision = (type: string) => {
    setQuizData((prev) => ({
      ...prev,
      decisions: [...prev.decisions, type],
    }));

    if (quizData.decisions.length < scenarios.length - 1) {
      // Move to next scenario
    } else {
      setStep(2);
    }
  };

  const handleEmotionGuess = (guess: string) => {
    const correct = emotions[emotionTrial].label;
    if (guess === correct) {
      setCorrectAnswers(correctAnswers + 1);
    }

    if (emotionTrial < 3) {
      setEmotionTrial(emotionTrial + 1);
    } else {
      const accuracy = ((correctAnswers + (guess === correct ? 1 : 0)) / 4) * 100;
      setQuizData((prev) => ({ ...prev, emotionAccuracy: accuracy }));
      handleSubmit(accuracy);
    }
  };

  const handleSubmit = async (accuracy: number) => {
    const finalData = { ...quizData, emotionAccuracy: accuracy };

    try {
      const response = await fetch("http://localhost:8000/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: userId,
          source: "quiz",
          raw_data: finalData,
          meta: { completed: true },
        }),
      });

      if (response.ok) {
        toast({ title: "Results saved successfully" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Save Failed",
        description: "Your results will be saved locally.",
        variant: "destructive",
      });
    }

    navigate("/complete");
  };

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass-card border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/mode-select")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Mind Games</h1>
            <div className="w-10" />
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="task1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card rounded-3xl p-8 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Timer className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Reaction Time</h2>
                  <p className="text-muted-foreground">
                    Click as fast as you can when you see the target appear!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Trial {trial + 1} of 5
                  </p>
                </div>

                <div
                  onClick={handleReactionClick}
                  className={`h-64 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${showTarget
                    ? "bg-gradient-to-br from-accent to-secondary"
                    : "bg-muted/50"
                    }`}
                >
                  {!isWaiting && !showTarget && (
                    <Button
                      onClick={startReactionTest}
                      size="lg"
                      className="btn-gradient rounded-2xl"
                    >
                      Start Trial
                    </Button>
                  )}
                  {isWaiting && (
                    <p className="text-lg text-muted-foreground">Wait for it...</p>
                  )}
                  {showTarget && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 bg-white rounded-full shadow-glow"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="task2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card rounded-3xl p-8 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Decision Making</h2>
                  <p className="text-muted-foreground">
                    How would you respond to this situation?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <p className="text-lg leading-relaxed">
                      {scenarios[quizData.decisions.length]?.text}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {scenarios[quizData.decisions.length]?.options.map((option) => (
                      <Button
                        key={option.label}
                        onClick={() => handleDecision(option.type)}
                        variant="outline"
                        className="w-full justify-start h-auto py-4 px-6 rounded-2xl text-left"
                      >
                        <span className="text-base">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="task3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card rounded-3xl p-8 space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Emotion Recognition</h2>
                  <p className="text-muted-foreground">
                    What emotion does this represent?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {emotionTrial + 1} of 4
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="text-center">
                    <div className="text-9xl mb-8">{emotions[emotionTrial]?.emoji}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {emotions.map((emotion) => (
                      <Button
                        key={emotion.label}
                        onClick={() => handleEmotionGuess(emotion.label)}
                        variant="outline"
                        className="h-16 rounded-2xl text-lg"
                      >
                        {emotion.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
