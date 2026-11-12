import React from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const AppLayout = ({ children, currentPage, onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={onNavigate} currentPage={currentPage} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main style={{
          flex: 1,
          padding: '32px 36px',
          maxWidth: '1380px',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
