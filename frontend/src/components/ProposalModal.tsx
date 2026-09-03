import React, { useState } from 'react';
import { X, Send, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { api } from '../api';
import { Project, Proposal } from '../types';

interface ProposalModalProps {
  project: Project;
  onSuccess: (proposal: Proposal) => void;
  onClose: () => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  project,
  onSuccess,
  onClose
}) => {
  const [bidAmount, setBidAmount] = useState(project.budget);
  const [estimatedDays, setEstimatedDays] = useState(project.deadline_days || 7);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter explaining your technical approach.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const proposal = await api.submitProposal({
        project_id: project.id,
        bid_amount: bidAmount,
        estimated_days: estimatedDays,
        cover_letter: coverLetter.trim()
      });
      onSuccess(proposal);
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ padding: '2rem', maxWidth: 540 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Submit Proposal
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Applying to: <span style={{ color: '#818cf8' }}>{project.title}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bid & Delivery Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Your Bid Amount ($ USD)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Days</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(Number(e.target.value))}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="form-group">
            <label className="form-label">Cover Letter & Technical Approach</label>
            <textarea
              required
              rows={5}
              placeholder="Outline your architectural solution, past relevant projects, and milestones you plan to deliver..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="form-textarea"
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Application...' : 'Send Proposal to Client'}
          </button>
        </form>
      </div>
    </div>
  );
};
