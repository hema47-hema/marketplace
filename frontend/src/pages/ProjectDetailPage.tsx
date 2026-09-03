import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, DollarSign, Calendar, MessageSquare, Send, CheckCircle2, Star, Award, Layers } from 'lucide-react';
import { Project, User, AIMatchResponse, Proposal } from '../types';
import { api } from '../api';
import { AIMatchCard } from '../components/AIMatchCard';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { ProposalModal } from '../components/ProposalModal';

interface ProjectDetailPageProps {
  projectId: number;
  currentUser: User | null;
  onBack: () => void;
  onOpenChat: (userId?: number, projectId?: number, projectTitle?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  currentUser,
  onBack,
  onOpenChat,
  onOpenAuth
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [aiMatches, setAiMatches] = useState<AIMatchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_matches' | 'proposals' | 'milestones'>('overview');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projData, aiData] = await Promise.all([
        api.getProject(projectId),
        api.getAIMatches(projectId).catch(() => null)
      ]);
      setProject(projData);
      setAiMatches(aiData);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (isLoading || !project) {
    return (
      <div className="main-container" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading project intelligence...
      </div>
    );
  }

  const isClientOwner = currentUser?.id === project.client_id;
  const isHiredFreelancer = currentUser?.id === project.hired_freelancer_id;
  const hasApplied = project.proposals?.some((p) => p.freelancer_id === currentUser?.id);

  const handleAcceptProposal = async (proposalId: number) => {
    if (!window.confirm('Accept this proposal and initiate milestone contract?')) return;
    try {
      await api.acceptProposal(proposalId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept proposal');
    }
  };

  return (
    <div className="main-container">
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.88rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      {/* Main Project Header Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                {project.category}
              </span>
              <span
                className={`badge ${
                  project.status === 'open'
                    ? 'badge-ai'
                    : project.status === 'in_progress'
                    ? 'badge-warning'
                    : 'badge-escrow'
                }`}
              >
                {project.status === 'in_progress' ? 'Contract Active' : project.status.toUpperCase()}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {project.title}
            </h1>

            {/* Client Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <span>Posted by: <strong>{project.client?.full_name || 'Project Client'}</strong></span>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" />
                <span>{project.client?.rating ? project.client.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span>•</span>
              <span>Posted {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Budget & Primary Action Box */}
          <div
            style={{
              background: 'rgba(9, 14, 26, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.75rem',
              textAlign: 'right',
              minWidth: 240
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED BUDGET</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              ${project.budget.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Delivery in {project.deadline_days} days
            </div>

            {/* Actions depending on role */}
            {currentUser?.role === 'freelancer' && project.status === 'open' && (
              hasApplied ? (
                <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                  <CheckCircle2 size={16} /> Proposal Submitted
                </div>
              ) : (
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowProposalModal(true)}>
                  <Send size={16} /> Apply to Project
                </button>
              )
            )}

            {!currentUser && (
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => onOpenAuth('login')}>
                Sign In to Apply
              </button>
            )}

            {/* Chat Action */}
            {currentUser && (isClientOwner || isHiredFreelancer) && (
              <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                onClick={() => onOpenChat(
                  isClientOwner ? project.hired_freelancer_id : project.client_id,
                  project.id,
                  project.title
                )}
              >
                <MessageSquare size={16} /> Open Project Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem', gap: '0.5rem' }}>
        <button
          className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '0.95rem', padding: '0.75rem 1.25rem' }}
        >
          Project Scope
        </button>

        <button
          className={`nav-link ${activeTab === 'ai_matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai_matches')}
          style={{ fontSize: '0.95rem', padding: '0.75rem 1.25rem', color: activeTab === 'ai_matches' ? '#38bdf8' : undefined }}
        >
          <Sparkles size={16} color="#06b6d4" />
          AI Talent Matchmaker ({aiMatches?.matches.length || 0})
        </button>

        <button
          className={`nav-link ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
          style={{ fontSize: '0.95rem', padding: '0.75rem 1.25rem' }}
        >
          Proposals ({project.proposals?.length || 0})
        </button>

        <button
          className={`nav-link ${activeTab === 'milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('milestones')}
          style={{ fontSize: '0.95rem', padding: '0.75rem 1.25rem' }}
        >
          <ShieldCheck size={16} />
          Milestones & Escrow ({project.milestones?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              Project Specifications
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {project.description}
            </p>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '2rem', marginBottom: '0.75rem' }}>
              Required Technologies
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.required_skills.split(',').map((skill, idx) => (
                <span key={idx} className="badge badge-ai" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
                <ShieldCheck size={20} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Escrow Guarantee</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Payment for this project is divided into trackable milestones. Funds are securely locked in escrow before work begins and only disbursed upon client sign-off.
              </p>
            </div>

            {project.hired_freelancer && (
              <div className="glass-card" style={{ padding: '1.5rem', border: '1.5px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Hired Contractor
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={project.hired_freelancer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${project.hired_freelancer.email}`}
                    alt={project.hired_freelancer.full_name}
                    style={{ width: 44, height: 44, borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{project.hired_freelancer.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.hired_freelancer.title}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: AI Talent Matchmaker */}
      {activeTab === 'ai_matches' && (
        <div>
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#06b6d4" />
                AI Recommendation System Analysis
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Engine analyzed {aiMatches?.total_candidates_analyzed || 0} candidate profiles against "{project.title}" using weighted skill vectors, budget alignment, and ratings.
              </p>
            </div>
            <span className="badge badge-ai">Automated Ranking Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {aiMatches?.matches.map((m) => (
              <AIMatchCard
                key={m.freelancer.id}
                match={m}
                onMessage={(fId) => onOpenChat(fId, project.id, project.title)}
                onInvite={() => {
                  onOpenChat(m.freelancer.id, project.id, project.title);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Proposals */}
      {activeTab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(!project.proposals || project.proposals.length === 0) ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                No proposals submitted yet. Verified talent can apply using the button above.
              </p>
            </div>
          ) : (
            project.proposals.map((proposal) => (
              <div key={proposal.id} className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <img
                      src={proposal.freelancer?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${proposal.freelancer?.email}`}
                      alt={proposal.freelancer?.full_name}
                      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                          {proposal.freelancer?.full_name || 'Freelancer Candidate'}
                        </h4>
                        <span className={`badge ${proposal.status === 'accepted' ? 'badge-escrow' : 'badge-skill'}`}>
                          {proposal.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {proposal.freelancer?.title} • {proposal.freelancer?.rating.toFixed(1)} ★
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      ${proposal.bid_amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      in {proposal.estimated_days} days
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div
                  style={{
                    margin: '1rem 0',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    lineHeight: 1.5
                  }}
                >
                  {proposal.cover_letter}
                </div>

                {/* Client Accept Button */}
                {isClientOwner && project.status === 'open' && proposal.status === 'pending' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenChat(proposal.freelancer_id, project.id, project.title)}
                    >
                      <MessageSquare size={14} /> Message
                    </button>
                    <button
                      className="btn-escrow"
                      onClick={() => handleAcceptProposal(proposal.id)}
                    >
                      <CheckCircle2 size={16} /> Accept Bid & Hire Contractor
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Milestones & Escrow */}
      {activeTab === 'milestones' && (
        <MilestoneTracker
          milestones={project.milestones || []}
          currentUser={currentUser}
          isClient={isClientOwner}
          isFreelancer={isHiredFreelancer}
          onRefresh={loadData}
        />
      )}

      {/* Proposal Submission Modal */}
      {showProposalModal && (
        <ProposalModal
          project={project}
          onSuccess={() => {
            setShowProposalModal(false);
            loadData();
            setActiveTab('proposals');
          }}
          onClose={() => setShowProposalModal(false)}
        />
      )}
    </div>
  );
};
