import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const ONBOARDING_STORAGE_KEY = "fun_planet_onboarding_completed";

interface OnboardingState {
  completed: boolean;
  role: "kid" | "parent" | "developer" | null;
  completedAt: string | null;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState<"kid" | "parent" | "developer" | null>(null);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = () => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const state: OnboardingState = JSON.parse(stored);
        if (state.completed) {
          setShowOnboarding(false);
          return;
        }
      }
      
      // New user - show onboarding
      setShowOnboarding(true);
    } catch {
      setShowOnboarding(true);
    }
  };

  const startOnboarding = (role: "kid" | "parent" | "developer") => {
    setOnboardingRole(role);
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    const state: OnboardingState = {
      completed: true,
      role: onboardingRole,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    setShowOnboarding(false);
    setOnboardingRole(null);
  };

  const skipOnboarding = () => {
    const state: OnboardingState = {
      completed: true,
      role: null,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    setShowOnboarding(false);
    setOnboardingRole(null);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setShowOnboarding(true);
  };

  const hasCompletedOnboarding = (): boolean => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const state: OnboardingState = JSON.parse(stored);
        return state.completed;
      }
    } catch {
      return false;
    }
    return false;
  };

  return {
    showOnboarding,
    onboardingRole,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    hasCompletedOnboarding
  };
}
