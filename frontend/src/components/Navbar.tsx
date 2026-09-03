import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Wallet, MessageSquare, PlusCircle, LogOut, User as UserIcon, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenPostProject: () => void;
  onOpenChat: (userId?: number, projectId?: number) => void;
  onLogout: () => void;
  onQuickSwitchUser: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenPostProject,
  onOpenChat,
  onLogout,
  onQuickSwitchUser
}) => {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('marketplace')}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <span style={{ color: '#ffffff' }}>Nexus</span>
          <span style={{
            background: 'var(--ai-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginLeft: 2
          }}>AI</span>
          <span style={{ fontSize: '0.75rem', marginLeft: 8, color: 'var(--text-muted)', fontWeight: 500 }}>
            Marketplace
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-links">
        <button
          className={`nav-link ${currentTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setCurrentTab('marketplace')}
        >
          Marketplace
        </button>

        <button
          className={`nav-link ${currentTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setCurrentTab('workspace')}
        >
          <ShieldCheck size={16} />
          Workspace & Escrow
        </button>

        <button
          className={`nav-link ${currentTab === 'freelancers' ? 'active' : ''}`}
          onClick={() => setCurrentTab('freelancers')}
        >
          Top Talent
        </button>

        {currentUser && (
          <button
            className="nav-link"
            onClick={() => onOpenChat()}
            style={{ position: 'relative' }}
          >
            <MessageSquare size={16} />
            Messages
          </button>
        )}
      </nav>

      {/* User Actions & Demo Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Demo Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
            onClick={() => setShowDemoMenu(!showDemoMenu)}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Demo Switcher
            <ChevronDown size={14} />
          </button>

          {showDemoMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 260,
                background: '#11192e',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                padding: '0.5rem',
                zIndex: 100
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0.6rem', fontWeight: 600 }}>
                EVALUATION DEMO ACCOUNTS
              </div>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 6,
                  color: currentUser?.email === 'client@demo.com' ? '#818cf8' : '#e2e8f0',
                  background: currentUser?.email === 'client@demo.com' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}
                onClick={() => {
                  onQuickSwitchUser('client@demo.com');
                  setShowDemoMenu(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Sarah Chen (Client)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VP Product • Posts Projects</div>
                </div>
                {currentUser?.email === 'client@demo.com' && <CheckCircle2 size={16} color="#818cf8" />}
              </button>

              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 6,
                  color: currentUser?.email === 'alex@demo.com' ? '#818cf8' : '#e2e8f0',
                  background: currentUser?.email === 'alex@demo.com' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}
                onClick={() => {
                  onQuickSwitchUser('alex@demo.com');
                  setShowDemoMenu(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Alex Rivera (Freelancer)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI & Full-Stack • Hired on P1</div>
                </div>
                {currentUser?.email === 'alex@demo.com' && <CheckCircle2 size={16} color="#818cf8" />}
              </button>

              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 6,
                  color: currentUser?.email === 'liam@demo.com' ? '#818cf8' : '#e2e8f0',
                  background: currentUser?.email === 'liam@demo.com' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem'
                }}
                onClick={() => {
                  onQuickSwitchUser('liam@demo.com');
                  setShowDemoMenu(false);
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Liam Tanaka (Freelancer)</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UI/UX • Pending Proposal</div>
                </div>
                {currentUser?.email === 'liam@demo.com' && <CheckCircle2 size={16} color="#818cf8" />}
              </button>
            </div>
          )}
        </div>

        {/* Post Project button for clients */}
        {currentUser?.role === 'client' && (
          <button className="btn-primary" onClick={onOpenPostProject} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <PlusCircle size={16} />
            Post Project
          </button>
        )}

        {/* Current User Pill / Login Buttons */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Wallet Balance Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem'
            }}>
              <Wallet size={14} color="#10b981" />
              <span style={{ fontWeight: 600, color: '#34d399' }}>${currentUser.balance.toLocaleString()}</span>
              {currentUser.escrow_balance > 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  (${currentUser.escrow_balance.toLocaleString()} in Escrow)
                </span>
              )}
            </div>

            {/* Profile Avatar & Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                alt={currentUser.full_name}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #6366f1' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.full_name}</span>
                <span className={`badge ${currentUser.role === 'client' ? 'badge-ai' : 'badge-escrow'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                color: 'var(--text-muted)',
                padding: '0.4rem',
                borderRadius: 6,
                transition: 'color 0.2s'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn-secondary" onClick={() => onOpenAuth('login')}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => onOpenAuth('register')}>
              Create Account
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
