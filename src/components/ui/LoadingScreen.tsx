import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing CareerBoost AI...');

  const loadingSteps = [
    'Initializing CareerBoost AI...',
    'Loading AI Models...',
    'Preparing Resume Builder...',
    'Setting up Interview Coach...',
    'Optimizing User Experience...',
    'Almost Ready...',
    'Welcome to CareerBoost AI!'
  ];

  useEffect(() => {
    const duration = 3000; // 3 seconds total loading time
    const steps = loadingSteps.length;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);
      
      if (currentStep < steps) {
        setLoadingText(loadingSteps[currentStep]);
      }
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="loading-screen">
      <div className="floating-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      
      <div className="loading-container">
        <div className="loading-sphere">
          <div className="sphere-inner" />
        </div>
        
        <h1 className="loading-text">CareerBoost AI</h1>
        <p className="loading-subtitle">AI-Powered Career Tools</p>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="progress-text">
          {Math.round(progress)}% • {loadingText}
        </p>
      </div>
    </div>
  );
};