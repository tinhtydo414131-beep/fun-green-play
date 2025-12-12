import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useHarvestHavenStore } from '@/stores/harvestHavenStore';

interface TutorialModalProps {
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Harvest Haven! 🌾',
    description: 'You are the new village chief! Your mission is to grow a small farm into a thriving metropolis.',
    emoji: '🏡',
    tip: 'Start small and expand as you level up!',
  },
  {
    title: 'Building Your Farm 🔨',
    description: 'Tap the Build button to place fields, animal pens, and production buildings. Each building helps you grow!',
    emoji: '🏗️',
    tip: 'Start with a few crop fields to get resources.',
  },
  {
    title: 'Growing Crops 🌱',
    description: 'Tap on a field to plant crops. Wait for them to grow, then tap to harvest and collect!',
    emoji: '🌾',
    tip: 'Different crops take different times to grow.',
  },
  {
    title: 'Raising Animals 🐄',
    description: 'Build animal pens to raise chickens, cows, and more! They produce valuable goods over time.',
    emoji: '🐔',
    tip: 'Don\'t forget to collect animal products!',
  },
  {
    title: 'Fulfilling Orders 📦',
    description: 'Villagers will request items. Deliver what they need to earn coins and XP!',
    emoji: '🚚',
    tip: 'Complete orders quickly for bonus rewards.',
  },
  {
    title: 'Expand & Prosper 🏙️',
    description: 'Level up to unlock new buildings, zones, and features. Build your dream metropolis!',
    emoji: '✨',
    tip: 'Reach level 50 to become a Metropolis Mayor!',
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete }) => {
  const { tutorialStep, completeTutorialStep, dismissTutorial } = useHarvestHavenStore();
  
  const currentStep = TUTORIAL_STEPS[tutorialStep];
  const isLastStep = tutorialStep >= TUTORIAL_STEPS.length - 1;
  
  const handleNext = () => {
    if (isLastStep) {
      dismissTutorial();
      onComplete();
    } else {
      completeTutorialStep();
    }
  };
  
  const handleBack = () => {
    if (tutorialStep > 0) {
      useHarvestHavenStore.setState({ tutorialStep: tutorialStep - 1 });
    }
  };
  
  const handleSkip = () => {
    dismissTutorial();
    onComplete();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        key={tutorialStep}
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Decorative Header */}
        <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  y: [null, '-20%'],
                  opacity: [0.5, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
          
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Main emoji */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="text-7xl mb-4"
          >
            {currentStep.emoji}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentStep.title}
          </h2>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === tutorialStep
                    ? 'bg-white w-6'
                    : index < tutorialStep
                    ? 'bg-white/80'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center text-lg mb-4">
            {currentStep.description}
          </p>
          
          {/* Tip box */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm">
              <span className="font-bold">Pro Tip: </span>
              {currentStep.tip}
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="p-4 border-t border-gray-100 flex justify-between">
          <button
            onClick={handleBack}
            disabled={tutorialStep === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
              tutorialStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
          >
            {isLastStep ? (
              <>
                Start Playing!
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
