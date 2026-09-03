import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, Calendar, DollarSign, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { Project, User } from '../types';
import { api } from '../api';

interface MarketplacePageProps {
  currentUser: User | null;
  onSelectProject: (projectId: number) => void;
  onOpenPostProject: () => void;
}

const CATEGORIES = [
  'All',
  'Web Development',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'UI/UX Design',
  'Data Engineering'
];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  currentUser,
  onSelectProject,
  onOpenPostProject
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
    if (currentUser?.role === 'freelancer') {
      api.getRecommendedProjects()
        .then(setRecommendedProjects)
        .catch(() => {});
    }
  }, [selectedCategory, currentUser]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: search.trim() || undefined
      });
      setProjects(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  return (
    <div className="main-container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', margin: '1rem 0 3rem' }}>
        <div
          className="badge badge-ai"
          style={{ marginBottom: '1rem', padding: '0.4rem 1rem', fontSize: '0.82rem' }}
        >
          <Sparkles size={14} /> Next-Gen AI Matching & Escrow Protection
        </div>

        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
          Hire World-Class Talent with{' '}
          <span style={{
            background: 'var(--ai-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI Precision
          </span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 640, margin: '0 auto 2rem' }}>
          Instantly match verified full-stack & AI engineers to your project requirements. Track milestones and release payments through mock secure escrow.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            maxWidth: 640,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(19, 27, 46, 0.85)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-full)',
            padding: '0.4rem 0.5rem 0.4rem 1.4rem',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search projects by skills (e.g. FastAPI, React, PyTorch, Docker)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem', borderRadius: 'var(--radius-full)' }}>
            Find Projects
          </button>
        </form>
      </div>

      {/* AI Recommendations Banner for Logged-In Freelancers */}
      {currentUser?.role === 'freelancer' && recommendedProjects.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="#06b6d4" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              AI Recommended for You ({currentUser.full_name})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Matched against your profile skills: {currentUser.skills}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {recommendedProjects.slice(0, 2).map((rec: any) => (
              <div
                key={rec.project.id}
                className="glass-card"
                onClick={() => onSelectProject(rec.project.id)}
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: '1.5px solid rgba(6, 182, 212, 0.4)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>
                    <Sparkles size={12} /> {rec.match_score}% AI Compatibility Match
                  </span>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    ${rec.project.budget.toLocaleString()}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                  {rec.project.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#38bdf8', marginBottom: '0.75rem' }}>
                  {rec.breakdown.reason}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{rec.project.category}</span>
                  <span style={{ color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Apply Now <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
          <Filter size={16} /> Filters:
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: selectedCategory === cat ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: selectedCategory === cat ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
          Active Project Postings ({projects.length})
        </div>
        {currentUser?.role === 'client' && (
          <button className="btn-secondary" onClick={onOpenPostProject} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
            + Create New Job
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading marketplace projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1rem' }}>
            No projects found matching the current search criteria.
          </p>
          {currentUser?.role === 'client' && (
            <button className="btn-primary" onClick={onOpenPostProject}>
              Post the First Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card"
              onClick={() => onSelectProject(project.id)}
              style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
                    style={{ fontSize: '0.7rem' }}
                  >
                    {project.status === 'in_progress' ? 'Contract Active' : project.status.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {project.title}
                </h3>

                {/* Description Excerpt */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {project.description.length > 130
                    ? `${project.description.slice(0, 130)}...`
                    : project.description}
                </p>

                {/* Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {project.required_skills.split(',').map((skill, i) => (
                    <span key={i} className="badge badge-skill">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PROJECT BUDGET</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    ${project.budget.toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DELIVERY</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    {project.deadline_days} Days
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
                  View Details <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
