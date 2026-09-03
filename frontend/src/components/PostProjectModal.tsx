import React, { useState, useEffect } from 'react';
import { X, Sparkles, DollarSign, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { Project } from '../types';

interface PostProjectModalProps {
  onSuccess: (project: Project) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Web Development',
  'AI & Machine Learning',
  'Mobile Development',
  'DevOps & Cloud',
  'UI/UX Design',
  'Data Engineering'
];

const SKILL_SUGGESTIONS_MAP: Record<string, string[]> = {
  web: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Node.js'],
  ai: ['Python', 'FastAPI', 'Machine Learning', 'PyTorch', 'PostgreSQL', 'LangChain'],
  cloud: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
  mobile: ['React Native', 'Flutter', 'iOS', 'Android'],
  design: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping']
};

export const PostProjectModal: React.FC<PostProjectModalProps> = ({
  onSuccess,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(2000);
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'FastAPI']);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic AI Skill Suggestions based on Title and Description
  useEffect(() => {
    const text = `${title} ${description}`.toLowerCase();
    const suggestions = new Set<string>();

    if (text.includes('ai') || text.includes('search') || text.includes('model') || text.includes('python')) {
      SKILL_SUGGESTIONS_MAP.ai.forEach((s) => suggestions.add(s));
    }
    if (text.includes('web') || text.includes('react') || text.includes('frontend') || text.includes('dashboard')) {
      SKILL_SUGGESTIONS_MAP.web.forEach((s) => suggestions.add(s));
    }
    if (text.includes('cloud') || text.includes('devops') || text.includes('docker') || text.includes('deploy')) {
      SKILL_SUGGESTIONS_MAP.cloud.forEach((s) => suggestions.add(s));
    }
    if (text.includes('design') || text.includes('figma') || text.includes('ui') || text.includes('ux')) {
      SKILL_SUGGESTIONS_MAP.design.forEach((s) => suggestions.add(s));
    }

    setSuggestedSkills(Array.from(suggestions).filter((s) => !skills.includes(s)));
  }, [title, description, skills]);

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a project title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newProject = await api.createProject({
        title: title.trim(),
        description: description.trim(),
        category,
        budget,
        deadline_days: deadlineDays,
        required_skills: skills.join(', ')
      });
      onSuccess(newProject);
    } catch (err: any) {
      setError(err.message || 'Failed to post project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ padding: '2rem', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                Post a Project
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                AI matchmaker will automatically rank top verified freelancers
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Title */}
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. AI-Powered Analytics Dashboard & Real-Time Ingestion Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Category & Budget Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Budget ($ USD)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label className="form-label">Estimated Delivery Timeline</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="number"
                min={3}
                max={90}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
              <span style={{ position: 'absolute', right: 14, top: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Days
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Scope & Technical Specifications</label>
            <textarea
              required
              rows={4}
              placeholder="Describe deliverables, required architecture, expected user experience, and milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Required Skills & AI Suggestions */}
          <div className="form-group">
            <label className="form-label">Required Skills & Technologies</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
              {skills.map((s) => (
                <span
                  key={s}
                  className="badge badge-ai"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  onClick={() => removeSkill(s)}
                >
                  {s} <X size={12} />
                </span>
              ))}
            </div>

            {/* AI Suggestions Pill Tray */}
            {suggestedSkills.length > 0 && (
              <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px dashed rgba(6, 182, 212, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={12} /> AI Suggested Skills:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {suggestedSkills.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: '#cbd5e1'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing Project...' : 'Publish Project & Run AI Matchmaker'}
          </button>
        </form>
      </div>
    </div>
  );
};
