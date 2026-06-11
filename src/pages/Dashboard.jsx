import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Layers, ArrowRightLeft, Network, GitMerge, Search, Share2, MapPin } from 'lucide-react';
import './Dashboard.css';

const cards = [
  { path: '/array', title: 'Arrays', icon: Box, desc: 'Linear collection of elements, visualize search and update operations.' },
  { path: '/linked-list', title: 'Linked List', icon: Share2, desc: 'Nodes connected via pointers, visualize insertions and deletions.' },
  { path: '/stack', title: 'Stack', icon: Layers, desc: 'LIFO structure, visualize push and pop operations.' },
  { path: '/queue', title: 'Queue', icon: ArrowRightLeft, desc: 'FIFO structure, visualize enqueue and dequeue operations.' },
  { path: '/bst', title: 'Binary Search Tree', icon: Network, desc: 'Hierarchical tree structure, visualize insertions and traversals.' },
  { path: '/graph', title: 'Graph', icon: Share2, desc: 'Vertices and edges, visualize BFS and DFS.' },
  { path: '/sorting', title: 'Sorting', icon: GitMerge, desc: 'Compare different sorting algorithms like Bubble, Merge, Quick Sort.' },
  { path: '/searching', title: 'Searching', icon: Search, desc: 'Visualize Linear and Binary Search algorithms.' },
  { path: '/city-pathfinding', title: 'City Pathfinding', icon: MapPin, desc: 'Find shortest routes between city landmarks using Dijkstra & A*', badge: 'New' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="accent-text">Master Data Structures</h1>
        <p>Interactive visualizations to help you understand algorithms step-by-step.</p>
      </div>

      <motion.div 
        className="cards-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {cards.map((card) => (
          <motion.div key={card.path} variants={itemVariants}>
            <Link to={card.path} className="ds-card panel">
              <div className="card-icon-wrapper">
                <card.icon size={24} className="card-icon" />
              </div>
              <h3>
                {card.title}
                {card.badge && <span style={{fontSize: '0.6rem', backgroundColor: '#fbbf24', color: '#000', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', verticalAlign: 'middle'}}>{card.badge}</span>}
              </h3>
              <p>{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;
