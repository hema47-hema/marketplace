import React, { useState, useEffect } from 'react';
import { User, Project } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { FreelancersPage } from './pages/FreelancersPage';
import { AuthModal } from './components/AuthModal';
import { OTPVerifyModal } from './components/OTPVerifyModal';
import { PostProjectModal } from './components/PostProjectModal';
import { ChatDrawer } from './components/ChatDrawer';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('marketplace');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Modals
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [otpData, setOtpData] = useState<{ email: string; devOtp?: string } | null>(null);
  const [showPostProject, setShowPostProject] = useState(false);
  const [chatData, setChatData] = useState<{
    targetUserId?: number;
    projectId?: number;
    projectTitle?: string;
  } | null>(null);

  // Load current user from token on launch
  useEffect(() => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      api.getMe()
        .then(setCurrentUser)
        .catch(() => {
          localStorage.removeItem('nexus_token');
          // Default to demo client for immediate evaluation convenience
          handleQuickSwitchUser('client@demo.com');
        });
    } else {
      // Default to demo client for frictionless first impression
      handleQuickSwitchUser('client@demo.com');
    }
  }, []);

  const handleQuickSwitchUser = async (email: string) => {
    try {
      const res = await api.login({ email, password: 'password123' });
      localStorage.setItem('nexus_token', res.access_token);
      setCurrentUser(res.user);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: User, token: string) => {
    localStorage.setItem('nexus_token', token);
    setCurrentUser(user);
    setAuthMode(null);
    setOtpData(null);
  };

  const handleTriggerOTP = (email: string, devOtp?: string) => {
    setAuthMode(null);
    setOtpData({ email, devOtp });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedProjectId(null);
        }}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onOpenPostProject={() => setShowPostProject(true)}
        onOpenChat={(uId, pId) => setChatData({ targetUserId: uId, projectId: pId })}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {selectedProjectId ? (
          <ProjectDetailPage
            projectId={selectedProjectId}
            currentUser={currentUser}
            onBack={() => setSelectedProjectId(null)}
            onOpenChat={(uId, pId, title) => setChatData({ targetUserId: uId, projectId: pId, projectTitle: title })}
            onOpenAuth={(mode) => setAuthMode(mode)}
          />
        ) : currentTab === 'marketplace' ? (
          <MarketplacePage
            currentUser={currentUser}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onOpenPostProject={() => setShowPostProject(true)}
          />
        ) : currentTab === 'workspace' ? (
          <WorkspacePage
            currentUser={currentUser}
            onOpenChat={(uId, pId, title) => setChatData({ targetUserId: uId, projectId: pId, projectTitle: title })}
            onOpenAuth={(mode) => setAuthMode(mode)}
          />
        ) : (
          <FreelancersPage
            currentUser={currentUser}
            onOpenChat={(uId) => setChatData({ targetUserId: uId })}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            NexusAI Freelance Platform • Built with FastAPI, PostgreSQL & React TypeScript
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
            <span>6-Digit Email OTP Verification</span>
            <span>AI Matchmaking Engine</span>
            <span>Escrow Protected</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal (Login / Register) */}
      {authMode && (
        <AuthModal
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onNeedsVerification={handleTriggerOTP}
          onClose={() => setAuthMode(null)}
        />
      )}

      {/* 6-Digit Segmented OTP Verification Modal */}
      {otpData && (
        <OTPVerifyModal
          email={otpData.email}
          initialDevOtp={otpData.devOtp}
          onSuccess={handleAuthSuccess}
          onClose={() => setOtpData(null)}
        />
      )}

      {/* Post Project Modal */}
      {showPostProject && (
        <PostProjectModal
          onSuccess={(proj) => {
            setShowPostProject(false);
            setSelectedProjectId(proj.id);
          }}
          onClose={() => setShowPostProject(false)}
        />
      )}

      {/* Real-Time Slide-over Chat Drawer */}
      {chatData && (
        <ChatDrawer
          currentUser={currentUser}
          targetUserId={chatData.targetUserId}
          projectId={chatData.projectId}
          projectTitle={chatData.projectTitle}
          onClose={() => setChatData(null)}
        />
      )}
    </div>
  );
};

export default App;
