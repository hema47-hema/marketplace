import React, { useState, useEffect } from 'react';
import { Search, Star, Sparkles, MessageSquare, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface FreelancersPageProps {
  currentUser: User | null;
  onOpenChat: (userId: number) => void;
}

export const FreelancersPage: React.FC<FreelancersPageProps> = ({
  currentUser,
  onOpenChat
}) => {
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadFreelancers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFreelancers({ search: search.trim() || undefined });
      setFreelancers(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFreelancers();
  }, []);

  return (
    <div className="main-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
          <Sparkles size={14} /> Verified Talent Network
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>
          Top Verified Freelancers
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600 }}>
          Specialists in Full-Stack Web, AI Engineering, Cloud Architecture, and Product Design.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 480, marginTop: '1.5rem', display: 'flex', gap: '0.6rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              placeholder="Search by skill (FastAPI, React, PyTorch, Docker)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
          <button className="btn-primary" onClick={loadFreelancers}>
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading talent profiles...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {freelancers.map((f) => (
            <div key={f.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={f.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.email}`}
                    alt={f.full_name}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-accent)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                        {f.full_name}
                      </h3>
                      <CheckCircle2 size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#818cf8', marginTop: '0.15rem' }}>
                      {f.title || 'Technical Specialist'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                      <Star size={14} fill="#fbbf24" />
                      <span style={{ fontWeight: 600 }}>{f.rating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({f.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {f.bio}
                </p>

                {/* Skills Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {f.skills ? (
                    f.skills.split(',').map((skill, i) => (
                      <span key={i} className="badge badge-skill">
                        {skill.trim()}
                      </span>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Bottom Info & Message Button */}
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>HOURLY RATE</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    ${f.hourly_rate}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/hr</span>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => onOpenChat(f.id)}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
                >
                  <MessageSquare size={14} /> Send Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
