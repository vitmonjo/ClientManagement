'use client';

import React, { useState } from 'react';
import ResponsiveDrawer from './components/Drawer';
import ClientBody from './components/ClientBody';
import ContactBody from './components/ContactBody';

export default function Home() {
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