import React, { useState, useEffect, useRef } from 'react';
import './InfoPanel.css';

const InfoPanel = ({ pseudocode = [], activeLine = null, complexity = {}, logs = [] }) => {
  const [activeTab, setActiveTab] = useState('pseudocode');
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  return (
    <div className="info-panel panel">
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'pseudocode' ? 'active' : ''}`}
          onClick={() => setActiveTab('pseudocode')}
        >
          Pseudocode
        </button>
        <button 
          className={`tab-btn ${activeTab === 'complexity' ? 'active' : ''}`}
          onClick={() => setActiveTab('complexity')}
        >
          Complexity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'pseudocode' && (
          <div className="pseudocode-container">
            {pseudocode.map((line, idx) => (
              <div 
                key={idx} 
                className={`code-line ${activeLine === idx ? 'active-line' : ''}`}
              >
                <span className="line-number">{idx + 1}</span>
                <span className="line-content">{line}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="complexity-container">
            <div className="complexity-card">
              <h4>Time Complexity</h4>
              <div className="complexity-val">{complexity.time || 'O(1)'}</div>
            </div>
            <div className="complexity-card">
              <h4>Space Complexity</h4>
              <div className="complexity-val">{complexity.space || 'O(1)'}</div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-container">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-entry ${idx === logs.length - 1 ? 'latest-log' : ''}`}>
                <span className="log-time">Step {idx + 1}:</span> {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
