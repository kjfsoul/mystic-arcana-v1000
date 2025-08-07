'use client';
 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import { analyzeCareer, CareerAnalysis } from '@/lib/astrology/CareerAnalyzer';
interface InteractiveCareerInsightsProps {
  birthData: BirthData;
  onBack?: () => void;
}
interface PersonalityTest {
  question: string;
  answers: { text: string; weight: number; category: string }[];
}
const PERSONALITY_QUESTIONS: PersonalityTest[] = [
  {
    question: "What energizes you most in a work environment?",
    answers: [
      { text: "Leading teams and making strategic decisions", weight: 1, category: "leadership" },
      { text: "Solving complex problems independently", weight: 1, category: "analytical" },
      { text: "Creating and innovating new solutions", weight: 1, category: "creative" },
      { text: "Helping others and building relationships", weight: 1, category: "social" }
    ]
  },
  {
    question: "How do you prefer to approach challenges?",
    answers: [
      { text: "Take charge and mobilize resources quickly", weight: 1, category: "leadership" },
      { text: "Research thoroughly before taking action", weight: 1, category: "analytical" },
      { text: "Think outside the box for unique solutions", weight: 1, category: "creative" },
      { text: "Collaborate and seek input from others", weight: 1, category: "social" }
    ]
  },
  {
    question: "What type of work environment appeals to you?",
    answers: [
      { text: "Dynamic, fast-paced with clear hierarchy", weight: 1, category: "leadership" },
      { text: "Quiet, organized with access to information", weight: 1, category: "analytical" },
      { text: "Flexible, inspiring with room for experimentation", weight: 1, category: "creative" },
      { text: "Collaborative, supportive with team interaction", weight: 1, category: "social" }
    ]
  },
  {
    question: "What motivates you most in your career?",
    answers: [
      { text: "Achieving positions of influence and authority", weight: 1, category: "leadership" },
      { text: "Mastering expertise and being recognized for knowledge", weight: 1, category: "analytical" },
      { text: "Expressing originality and leaving a creative mark", weight: 1, category: "creative" },
      { text: "Making a positive impact on people's lives", weight: 1, category: "social" }
    ]
  }
];
export const InteractiveCareerInsights: React.FC<InteractiveCareerInsightsProps> = ({
  birthData,
  onBack
}) => {
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [personalityScores, setPersonalityScores] = useState<Record<string, number>>({
    leadership: 0,
    analytical: 0,
    creative: 0,
    social: 0
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showTest, setShowTest] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'strengths' | 'challenges' | 'paths'>('overview');
 
  useEffect(() => {
    const loadCareerAnalysis = async () => {
      try {
        setLoading(true);
        const analysis = await analyzeCareer(birthData);
        setCareerAnalysis(analysis);
      } catch (error) {
        console.error('Error loading career analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCareerAnalysis();
  }, [birthData]);
  const handleAnswerSelect = (answer: { text: string; weight: number; category: string }) => {
    setPersonalityScores(prev => ({
      ...prev,
      [answer.category]: prev[answer.category] + answer.weight
    }));
    if (currentQuestion < PERSONALITY_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestCompleted(true);
      setShowTest(false);
    }
  };
  const resetTest = () => {
    setPersonalityScores({ leadership: 0, analytical: 0, creative: 0, social: 0 });
    setCurrentQuestion(0);
    setTestCompleted(false);
    setShowTest(true);
  };
  const getPersonalityInsight = () => {
    const maxScore = Math.max(...Object.values(personalityScores));
    const dominantType = Object.entries(personalityScores)
      .find(([, score]) => score === maxScore)?.[0];
    const insights = {
      leadership: "Your astrological profile combined with your responses suggests strong leadership potential. You're drawn to positions where you can guide and influence others.",
      analytical: "Your cosmic blueprint aligns with analytical thinking. You excel at processing complex information and finding logical solutions.",
      creative: "Your birth chart resonates with creative expression. You're naturally inclined toward innovative and artistic pursuits.",
      social: "Your planetary influences emphasize interpersonal connections. You thrive in collaborative environments and helping others."
    };
    return dominantType ? insights[dominantType as keyof typeof insights] : '';
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Analyzing your cosmic career blueprint...</p>
        </div>
      </div>
    );
  }
  if (!careerAnalysis) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Unable to load career analysis. Please try again.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header with Back Button and Personality Test Button */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack || (() => window.history.back())}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Astrology
          </button>
          <h1 className="text-3xl font-bold text-white text-center flex-1">🌟 Career Insights</h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>
        <div className="space-y-6">
          {/* Personality Test Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your Cosmic Career Blueprint</h2>
        <button
          onClick={() => testCompleted ? resetTest() : setShowTest(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          {testCompleted ? 'Retake' : 'Take'} Personality Test
        </button>
      </div>
      {/* Personality Test Modal */}
      <AnimatePresence>
        {showTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Question {currentQuestion + 1} of {PERSONALITY_QUESTIONS.length}
                </h3>
                <button
                  onClick={() => setShowTest(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / PERSONALITY_QUESTIONS.length) * 100}%` }}
                  />
                </div>
                <p className="text-lg text-white mb-6">
                  {PERSONALITY_QUESTIONS[currentQuestion].question}
                </p>
              </div>
              <div className="space-y-3">
                {PERSONALITY_QUESTIONS[currentQuestion].answers.map((answer, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(answer)}
                    className="w-full p-4 text-left bg-gray-800 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500 rounded-lg text-white transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {answer.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Personality Test Results */}
      {testCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Your Personality Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(personalityScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-purple-400">{score}</div>
                <div className="text-sm text-gray-300 capitalize">{category}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-300 text-sm">{getPersonalityInsight()}</p>
        </motion.div>
      )}
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'strengths', label: 'Strengths' },
          { key: 'challenges', label: 'Challenges' },
          { key: 'paths', label: 'Career Paths' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as any)}
            className={`px-4 py-2 font-medium transition-all ${
              selectedTab === key
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">{careerAnalysis.overview}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">Key Placements</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(careerAnalysis.keyPlacements).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-white ml-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {testCompleted && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-400 mb-2">Personality Alignment</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(personalityScores).map(([type, score]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{type}:</span>
                          <span className="text-white">{score}/4</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedTab === 'strengths' && (
            <div className="grid gap-4">
              {careerAnalysis.strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-400">{strength.title}</h4>
                    <div className="flex">
                      {[...Array(strength.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{strength.description}</p>
                </motion.div>
              ))}
            </div>
          )}
          {selectedTab === 'challenges' && (
            <div className="grid gap-4">
              {careerAnalysis.challenges.map((challenge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-orange-400 mb-2">{challenge.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
                  <div className="bg-gray-800/50 rounded p-3">
                    <h5 className="text-purple-400 text-xs font-medium mb-1">Advice:</h5>
                    <p className="text-gray-400 text-xs">{challenge.advice}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {selectedTab === 'paths' && (
            <div className="grid gap-4">
              {careerAnalysis.recommendedPaths.map((path, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-400">{path.title}</h4>
                    <div className="flex">
                      {[...Array(path.compatibility)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{path.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {path.industries.map((industry, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
