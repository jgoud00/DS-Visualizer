import { useState, useRef, useCallback } from 'react';

export const useVisualizer = () => {
  const [steps, setSteps] = useState([]);
  const stepsRef = useRef([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // 1 to 10
  
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0 || currentStep >= stepsRef.current.length - 1) return;
    
    setIsPlaying(true);
    clearTimer();

    // Calculate delay based on speed (1-10). 
    // Speed 1: slowest (e.g., 1000ms), Speed 10: fastest (e.g., 100ms)
    // Formula: 1000 - ((speed - 1) * 100) or simply 1000 / speed. Let's use 1000 / speed
    const delay = 1000 / speed;

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= stepsRef.current.length - 1) {
          pause();
          return prev;
        }
        return prev + 1;
      });
    }, delay);
  }, [steps.length, currentStep, speed, pause, clearTimer]);

  const clear = useCallback(() => {
    pause();
    setSteps([]);
    stepsRef.current = [];
    setCurrentStep(0);
  }, [pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
  }, [pause]);

  const stepForward = useCallback(() => {
    pause();
    setCurrentStep(prev => Math.min(prev + 1, stepsRef.current.length - 1));
  }, [steps.length, pause]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, [pause]);

    const loadStepsAndPlay = useCallback((generatorFn, input) => {
    pause();
    const generator = generatorFn(input);
    const collectedSteps = [];
    
    let result = generator.next();
    while (!result.done) {
      collectedSteps.push(result.value);
      result = generator.next();
    }
    
    stepsRef.current = collectedSteps;
    setSteps(collectedSteps);
    setCurrentStep(0);
    
    if (collectedSteps.length > 0) {
      setIsPlaying(true);
      clearTimer();
      const delay = 1000 / speed;
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= collectedSteps.length - 1) {
            pause();
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
  }, [pause, clearTimer, speed]);

  const loadSteps = useCallback((generatorFn, input) => {
    pause();
    const generator = generatorFn(input);
    const collectedSteps = [];
    
    // Evaluate generator until done
    let result = generator.next();
    while (!result.done) {
      collectedSteps.push(result.value);
      result = generator.next();
    }
    
    stepsRef.current = collectedSteps;
    setSteps(collectedSteps);
    setCurrentStep(0);
  }, [pause]);

  // Adjust interval if speed changes while playing
  useCallback(() => {
    if (isPlaying) {
      play();
    }
  }, [speed, isPlaying, play]);

  return {
    steps,
    currentStep,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    reset,
    clear,
    stepForward,
    stepBackward,
    loadSteps,
    loadStepsAndPlay,
    currentStepData: steps[currentStep] || null
  };
};
