import React from 'react';
import InfoPanel from '../InfoPanel/InfoPanel';
import Controls from '../Controls/Controls';
import './VisualizerLayout.css';

const VisualizerLayout = ({ title, children, infoPanelProps, controlsProps }) => {
  return (
    <div className="viz-layout">
      <div className="viz-main">
        <div className="viz-header">
          <h2 className="viz-title">{title}</h2>
        </div>
        
        <div className="viz-canvas panel">
          {children}
        </div>
        
        <div className="viz-controls-wrapper">
          <Controls {...controlsProps} />
        </div>
      </div>
      
      <div className="viz-sidebar">
        <InfoPanel {...infoPanelProps} />
      </div>
    </div>
  );
};

export default VisualizerLayout;
