import React, { useState } from 'react';
import { Sparkles, Star, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MessageSquare, DollarSign, Award, ArrowRight } from 'lucide-react';
import { AIMatchFreelancer } from '../types';

interface AIMatchCardProps {
  match: AIMatchFreelancer;
  onInvite?: (freelancerId: number) => void;
  onMessage?: (freelancerId: number) => void;
}

export const AIMatchCard: React.FC<AIMatchCardProps> = ({
  match,
  onInvite,
  onMessage
}) => {
  const [expanded, setExpanded] = useState(false);
  const { freelancer, match_score, breakdown } = match;

  // Compute color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#06b6d4'; // Cyan
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 70) return '#818cf8'; // Indigo
    return '#f59e0b'; // Amber
  };

  const scoreColor = getScoreColor(match_score);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle AI gradient glow bar on top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'var(--ai-gradient)'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Freelancer Info */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <img
            src={freelancer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${freelancer.email}`}
            alt={freelancer.full_name}
            style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--border-accent)', objectFit: 'cover' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {freelancer.full_name}
              </h3>
              <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>
                <Sparkles size={12} /> Verified Talent
              </span>
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
              {freelancer.title || 'Technical Specialist'}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" />
                <span style={{ fontWeight: 600 }}>{freelancer.rating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({freelancer.reviews_count} reviews)</span>
              </div>
              <div>•</div>
              <div style={{ color: '#f8fafc', fontWeight: 600 }}>
                ${freelancer.hourly_rate}/hr
              </div>
            </div>
          </div>
        </div>

        {/* AI Match Score Badge */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 182, 212, 0.12)',
              border: `1.5px solid ${scoreColor}`,
              boxShadow: `0 0 20px ${scoreColor}40`
            }}
          >
            <Sparkles size={16} color={scoreColor} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {match_score}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: scoreColor, textTransform: 'uppercase' }}>
              AI Match
            </span>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>{expanded ? 'Hide Analysis' : 'Why this match?'}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Rationale Summary */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.65rem 0.85rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderLeft: `3px solid ${scoreColor}`,
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.84rem',
          color: '#cbd5e1'
        }}
      >
        <strong>AI Assessment:</strong> {breakdown.reason}
      </div>

      {/* Skills Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
        {breakdown.matched_skills.map((skill, idx) => (
          <span
            key={idx}
            className="badge"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              textTransform: 'none',
              fontSize: '0.75rem'
            }}
          >
            <CheckCircle size={12} /> {skill}
          </span>
        ))}

        {breakdown.missing_skills.map((skill, idx) => (
          <span
            key={idx}
            className="badge badge-skill"
            style={{ opacity: 0.6, textTransform: 'none', fontSize: '0.75rem' }}
          >
            {skill} (Not listed)
          </span>
        ))}
      </div>

      {/* Expanded Breakdown Accordion */}
      {expanded && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease-in'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multi-Factor AI Scoring Breakdown
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {/* Skill Fit */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skill Overlap</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                {breakdown.skill_score}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Direct & synonym fit</div>
            </div>

            {/* Rate Fit */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget-Rate Fit</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '0.2rem' }}>
                {breakdown.rate_score}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Within project budget</div>
            </div>

            {/* Rating Fit */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Track Record</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.2rem' }}>
                {breakdown.rating_score}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stars & completed jobs</div>
            </div>

            {/* Semantic Fit */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semantic Relevance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc', marginTop: '0.2rem' }}>
                {breakdown.semantic_score}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Brief-to-Bio alignment</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
        {onMessage && (
          <button
            className="btn-secondary"
            onClick={() => onMessage(freelancer.id)}
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
          >
            <MessageSquare size={14} /> Message
          </button>
        )}

        {onInvite && (
          <button
            className="btn-ai"
            onClick={() => onInvite(freelancer.id)}
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <span>Invite to Project</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
