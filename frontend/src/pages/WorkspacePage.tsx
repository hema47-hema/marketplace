import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, Star, CheckCircle2, Lock, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Project, User } from '../types';
import { api } from '../api';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { ReviewModal } from '../components/ReviewModal';

interface WorkspacePageProps {
  currentUser: User | null;
  onOpenChat: (userId?: number, projectId?: number, projectTitle?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  currentUser,
  onOpenChat,
  onOpenAuth
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewModalData, setReviewModalData] = useState<{
    projectId: number;
    projectTitle: string;
    revieweeId: number;
    revieweeName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspace = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const allProjects = await api.getProjects();
      // Filter projects relevant to current user: where they are client or hired freelancer
      const userProjects = allProjects.filter(
        (p) => p.client_id === currentUser.id || p.hired_freelancer_id === currentUser.id
      );
      setProjects(userProjects);

      const activeProjId = selectedProjectId || (userProjects.length > 0 ? userProjects[0].id : null);
      if (activeProjId) {
        setSelectedProjectId(activeProjId);
        const detailed = await api.getProject(activeProjId);
        setSelectedProject(detailed);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [currentUser]);

  const selectProject = async (id: number) => {
    setSelectedProjectId(id);
    try {
      const detailed = await api.getProject(id);
      setSelectedProject(detailed);
    } catch {}
  };

  if (!currentUser) {
    return (
      <div className="main-container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <div className="glass-card" style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 2rem' }}>
          <ShieldCheck size={48} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
            Escrow Workspace
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Sign in to manage your active contracts, funded milestones, deliverable submissions, and release payments.
          </p>
          <button className="btn-primary" onClick={() => onOpenAuth('login')}>
            Sign In to Workspace
          </button>
        </div>
      </div>
    );
  }

  const isClient = currentUser.id === selectedProject?.client_id;
  const isFreelancer = currentUser.id === selectedProject?.hired_freelancer_id;

  return (
    <div className="main-container">
      {/* Workspace Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-escrow" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Protected Milestone Workspace
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
            Contract & Escrow Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Active contracts, real-time escrow balances, and deliverable verification.
          </p>
        </div>

        {/* User Escrow Balance Pill */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            textAlign: 'right'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Escrow Protection
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            ${currentUser.escrow_balance.toLocaleString()}
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            You don't have any active contracts right now.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto' }}>
            {currentUser.role === 'client'
              ? 'Post a project in the Marketplace to begin receiving proposals and matching top talent.'
              : 'Browse open projects and submit proposals to get hired on protected milestone contracts.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.4fr', gap: '2rem' }}>
          {/* Contracts Sidebar List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Your Active Contracts ({projects.length})
            </div>

            {projects.map((p) => {
              const isSelected = p.id === selectedProjectId;
              return (
                <div
                  key={p.id}
                  className="glass-card"
                  onClick={() => selectProject(p.id)}
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid #6366f1' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className={`badge ${p.status === 'completed' ? 'badge-escrow' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                      {p.status.toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                      ${p.budget.toLocaleString()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                    {p.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {currentUser.id === p.client_id
                      ? `Contractor: ${p.hired_freelancer?.full_name || 'Assigned'}`
                      : `Client: ${p.client?.full_name || 'Client'}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Contract Detail & Milestones */}
          {selectedProject && (
            <div>
              {/* Project Card Header */}
              <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
                      {selectedProject.category}
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {selectedProject.title}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Collaborating with: <strong>{isClient ? selectedProject.hired_freelancer?.full_name : selectedProject.client?.full_name}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenChat(
                        isClient ? selectedProject.hired_freelancer_id : selectedProject.client_id,
                        selectedProject.id,
                        selectedProject.title
                      )}
                    >
                      <MessageSquare size={16} /> Open Chat
                    </button>

                    {/* Review Button if completed or all milestones released */}
                    {(selectedProject.status === 'completed' || selectedProject.milestones?.every(m => m.status === 'released')) && (
                      <button
                        className="btn-primary"
                        onClick={() => setReviewModalData({
                          projectId: selectedProject.id,
                          projectTitle: selectedProject.title,
                          revieweeId: isClient ? (selectedProject.hired_freelancer_id || 0) : selectedProject.client_id,
                          revieweeName: isClient ? (selectedProject.hired_freelancer?.full_name || 'Contractor') : (selectedProject.client?.full_name || 'Client')
                        })}
                      >
                        <Star size={16} fill="#fbbf24" color="#fbbf24" /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestone Tracker Component */}
              <MilestoneTracker
                milestones={selectedProject.milestones || []}
                currentUser={currentUser}
                isClient={isClient}
                isFreelancer={isFreelancer}
                onRefresh={() => selectProject(selectedProject.id)}
              />
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewModal
          projectId={reviewModalData.projectId}
          projectTitle={reviewModalData.projectTitle}
          revieweeId={reviewModalData.revieweeId}
          revieweeName={reviewModalData.revieweeName}
          onSuccess={() => {
            setReviewModalData(null);
            alert('Review submitted successfully! Rating updated.');
            loadWorkspace();
          }}
          onClose={() => setReviewModalData(null)}
        />
      )}
    </div>
  );
};
