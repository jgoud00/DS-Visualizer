import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import './Controls.css';

const Controls = ({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStep, 
  onStepBack, 
  onReset, 
  onSpeedChange, 
  speed, 
  totalSteps, 
  currentStep 
}) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="controls-panel panel">
      <div className="controls-top">
        <div className="playback-controls">
          <button className="control-btn" onClick={onStepBack} disabled={currentStep === 0 || isPlaying} aria-label="Step Backward">
            <SkipBack size={18} />
          </button>
          
          {isPlaying ? (
            <button className="control-btn primary-btn" onClick={onPause} aria-label="Pause">
              <Pause size={18} />
            </button>
          ) : (
            <button className="control-btn primary-btn" onClick={onPlay} disabled={totalSteps > 0 && currentStep >= totalSteps - 1} aria-label="Play">
              <Play size={18} />
            </button>
          )}

          <button className="control-btn" onClick={onStep} disabled={currentStep >= totalSteps - 1 || isPlaying} aria-label="Step Forward">
            <SkipForward size={18} />
          </button>

          <button className="control-btn" onClick={onReset} aria-label="Reset">
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="speed-control">
          <label htmlFor="speed-slider" className="speed-label">Speed</label>
          <input 
            id="speed-slider"
            type="range" 
            min="1" 
            max="10" 
            value={speed} 
            onChange={(e) => onSpeedChange(Number(e.target.value))} 
            className="slider"
          />
        </div>

        <div className="step-counter">
          Step {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default Controls;
