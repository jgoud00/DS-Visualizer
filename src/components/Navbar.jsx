import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LayoutDashboard, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar panel">
      <div className="navbar-brand">
        <LayoutDashboard className="brand-icon" />
        <Link to="/" className="brand-text accent-text">
          DS Visualizer
        </Link>
      </div>
      
      <div className="navbar-actions">
        <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn" aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
