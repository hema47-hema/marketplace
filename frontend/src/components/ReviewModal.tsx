import React, { useState } from 'react';
import { Star, X, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../api';

interface ReviewModalProps {
  projectId: number;
  projectTitle: string;
  revieweeId: number;
  revieweeName: string;
  onSuccess: () => void;
  onClose: () => void;
}

const PRESET_TAGS = [
  'Lightning Fast Delivery',
  'Outstanding Code Quality',
  'Clear Specifications',
  'Excellent Communication',
  'Deep Technical Expertise',
  'Prompt Payment & Trustworthy'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  projectId,
  projectTitle,
  revieweeId,
  revieweeName,
  onSuccess,
  onClose
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Outstanding Code Quality', 'Excellent Communication']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback on your collaboration experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitReview({
        project_id: projectId,
        reviewee_id: revieweeId,
        rating,
        tags: selectedTags.join(', '),
        comment: comment.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ padding: '2rem', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff' }}>
              Project Review & Rating
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Reviewing <strong>{revieweeName}</strong> for "{projectTitle}"
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating Selector */}
          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Rate your collaboration experience:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    style={{
                      transition: 'transform 0.15s ease',
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                      color: active ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Star size={34} fill={active ? '#fbbf24' : 'transparent'} />
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24' }}>
              {rating === 5 ? '5.0 ★ Outstanding' : `${rating}.0 ★`}
            </div>
          </div>

          {/* Feedback Tag Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="form-label" style={{ marginBottom: '0.5rem' }}>Collaboration Highlights</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1.5px solid #818cf8' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div className="form-group">
            <label className="form-label">Written Feedback</label>
            <textarea
              required
              rows={4}
              placeholder="Share specific details about code quality, communication, punctuality, or architectural craftsmanship..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
            {isSubmitting ? 'Publishing Verified Review...' : 'Publish Verified Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
