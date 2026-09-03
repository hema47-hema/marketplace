export type UserRole = 'client' | 'freelancer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  avatar_url?: string;
  title?: string;
  bio?: string;
  skills?: string;
  hourly_rate: number;
  balance: number;
  escrow_balance: number;
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface OTPVerifyResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  email: string;
  needs_verification: boolean;
  dev_otp?: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'funded' | 'submitted' | 'released';
  submission_notes?: string;
  submission_url?: string;
  due_days: number;
  created_at: string;
}

export interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  bid_amount: number;
  estimated_days: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  freelancer?: User;
}

export interface Project {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  required_skills: string;
  deadline_days: number;
  hired_freelancer_id?: number;
  created_at: string;
  client?: User;
  hired_freelancer?: User;
  proposals_count?: number;
  proposals?: Proposal[];
  milestones?: Milestone[];
}

export interface AIMatchScoreBreakdown {
  skill_score: number;
  rate_score: number;
  rating_score: number;
  semantic_score: number;
  matched_skills: string[];
  missing_skills: string[];
  reason: string;
}

export interface AIMatchFreelancer {
  freelancer: User;
  match_score: number;
  breakdown: AIMatchScoreBreakdown;
}

export interface AIMatchResponse {
  project_id: number;
  project_title: string;
  total_candidates_analyzed: number;
  matches: AIMatchFreelancer[];
}

export interface Message {
  id: number;
  project_id?: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Review {
  id: number;
  project_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  tags: string;
  comment: string;
  created_at: string;
  reviewer?: User;
}
