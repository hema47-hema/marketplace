import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Send, Lock, DollarSign, ExternalLink, CreditCard, Sparkles, X, AlertCircle } from 'lucide-react';
import { Milestone, User } from '../types';
import { api } from '../api';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  currentUser: User | null;
  isClient: boolean;
  isFreelancer: boolean;
  onRefresh: () => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones,
  currentUser,
  isClient,
  isFreelancer,
  onRefresh
}) => {
  // Modal states
  const [fundingMilestone, setFundingMilestone] = useState<Milestone | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<Milestone | null>(null);

  // Form states
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [mockCardNum, setMockCardNum] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFundEscrow = async () => {
    if (!fundingMilestone) return;
    setIsProcessing(true);
    setError(null);
    try {
      await api.fundMilestone(fundingMilestone.id);
      setFundingMilestone(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to fund milestone escrow');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingMilestone) return;
    setIsProcessing(true);
    setError(null);
    try {
      await api.submitMilestone(submittingMilestone.id, {
        submission_notes: submissionNotes,
        submission_url: submissionUrl
      });
      setSubmittingMilestone(null);
      setSubmissionNotes('');
      setSubmissionUrl('');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to submit milestone deliverables');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (milestoneId: number) => {
    if (!window.confirm('Are you sure you want to approve this deliverable and release funds from Escrow?')) return;
    try {
      await api.approveMilestone(milestoneId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to release escrow funds');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released':
        return (
          <span className="badge badge-escrow">
            <CheckCircle2 size={13} /> Completed & Paid
          </span>
        );
      case 'submitted':
        return (
          <span className="badge badge-ai">
            <Clock size={13} /> Under Review
          </span>
        );
      case 'funded':
        return (
          <span className="badge badge-warning">
            <Lock size={13} /> Escrow Funded
          </span>
        );
      default:
        return (
          <span className="badge badge-skill">
            <Clock size={13} /> Pending Deposit
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={22} color="#10b981" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Milestone Escrow Pipeline
          </h3>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Funds are protected in Mock Escrow until deliverable approval.
        </div>
      </div>

      {/* Milestones List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {milestones.map((m, index) => (
          <div
            key={m.id}
            className="glass-card"
            style={{
              padding: '1.25rem',
              borderLeft: m.status === 'released' ? '4px solid #10b981' : m.status === 'funded' ? '4px solid #f59e0b' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    PHASE {index + 1}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    {m.title}
                  </h4>
                  {getStatusBadge(m.status)}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 650 }}>
                  {m.description || 'Milestone scope and key deliverables specified for contract execution.'}
                </p>

                {/* If submitted, show deliverable info */}
                {m.submission_notes && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#818cf8', marginBottom: '0.25rem' }}>
                      Freelancer Submission:
                    </div>
                    <div style={{ color: '#e2e8f0' }}>{m.submission_notes}</div>
                    {m.submission_url && (
                      <a
                        href={m.submission_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: '#38bdf8',
                          marginTop: '0.4rem',
                          fontWeight: 500
                        }}
                      >
                        <ExternalLink size={14} /> View Deliverable Artifact
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Amount & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  ${m.amount.toLocaleString()}
                </div>

                {/* Client Actions */}
                {isClient && m.status === 'pending' && (
                  <button
                    className="btn-escrow"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                    onClick={() => setFundingMilestone(m)}
                  >
                    <Lock size={14} />
                    <span>Deposit to Escrow</span>
                  </button>
                )}

                {isClient && m.status === 'submitted' && (
                  <button
                    className="btn-escrow"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                    onClick={() => handleApprove(m.id)}
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Release Funds</span>
                  </button>
                )}

                {/* Freelancer Actions */}
                {isFreelancer && (m.status === 'funded' || m.status === 'pending') && (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                    onClick={() => setSubmittingMilestone(m)}
                  >
                    <Send size={14} />
                    <span>Submit Deliverable</span>
                  </button>
                )}

                {m.status === 'released' && (
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                    Payment Released
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Escrow Funding Payment Modal */}
      {fundingMilestone && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ padding: '2rem', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  Fund Milestone Escrow
                </h3>
              </div>
              <button onClick={() => setFundingMilestone(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Deposit funds into the protected marketplace escrow. Funds will only be transferred to the freelancer once you inspect and approve their completed work.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Milestone:</span>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{fundingMilestone.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Escrow Deposit:</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ${fundingMilestone.amount.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Escrow Fee:</span>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>$0.00 (Free in Demo)</span>
              </div>
            </div>

            {/* Mock Payment Method Card */}
            <div className="form-group">
              <label className="form-label">Mock Payment Method</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: '#090e1a',
                  border: '1.5px solid #6366f1',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <CreditCard size={20} color="#818cf8" />
                <input
                  type="text"
                  value={mockCardNum}
                  onChange={(e) => setMockCardNum(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontFamily: 'var(--font-mono)' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>READY</span>
              </div>
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              className="btn-escrow"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              onClick={handleFundEscrow}
              disabled={isProcessing}
            >
              {isProcessing ? 'Authorizing Mock Deposit...' : `Confirm & Fund Escrow ($${fundingMilestone.amount.toLocaleString()})`}
            </button>
          </div>
        </div>
      )}

      {/* Freelancer Deliverable Submission Modal */}
      {submittingMilestone && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ padding: '2rem', maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                Submit Milestone Work
              </h3>
              <button onClick={() => setSubmittingMilestone(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitWork}>
              <div className="form-group">
                <label className="form-label">Submission Notes / Summary</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the completed deliverables, key achievements, and notes for client verification..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Artifact / Repository / Live Demo URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://demo-app.com"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              {error && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Submitting...' : 'Send Deliverables for Client Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
