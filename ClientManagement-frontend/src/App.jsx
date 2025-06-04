// src/App.jsx
import React, { useState } from 'react';
import ResponsiveDrawer from './app/components/Drawer';
import ClientBody from './app/components/ClientBody';
import ContactBody from './app/components/ContactBody';

export default function App() {
  const [currentView, setCurrentView] = useState('clientes');

  const handleMenuItemClick = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="container">
      <ResponsiveDrawer onMenuItemClick={handleMenuItemClick} />
      <div className="content">
        {currentView === 'clientes' && <ClientBody />}
        {currentView === 'contatos' && <ContactBody />}
      </div>
    </div>
  );
}