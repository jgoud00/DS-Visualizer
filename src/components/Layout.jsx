import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <main className="content-area" style={{ marginLeft: '250px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
