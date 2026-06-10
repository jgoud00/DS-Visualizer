import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, Layers, ArrowRightLeft, Network, GitMerge, Search, Share2 } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/array', label: 'Arrays', icon: Box },
  { path: '/linked-list', label: 'Linked List', icon: Share2 },
  { path: '/stack', label: 'Stack', icon: Layers },
  { path: '/queue', label: 'Queue', icon: ArrowRightLeft },
  { path: '/bst', label: 'Binary Search Tree', icon: Network },
  { path: '/graph', label: 'Graph', icon: Share2 },
  { path: '/sorting', label: 'Sorting', icon: GitMerge },
  { path: '/searching', label: 'Searching', icon: Search },
];

const Sidebar = () => {
  return (
    <aside className="sidebar panel">
      <div className="sidebar-content">
        <div className="nav-header">Data Structures</div>
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
