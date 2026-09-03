import {
  User, RegisterResponse, OTPVerifyResponse, Project,
  Proposal, Milestone, Message, Review, AIMatchResponse
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errorJson = await res.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (typeof errorJson.detail === 'object' && errorJson.detail.message) {
        errorDetail = errorJson.detail.message;
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      errorDetail = `${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Authentication & OTP
  async register(data: {
    email: string;
    full_name: string;
    password: string;
    role: string;
    title?: string;
    bio?: string;
    skills?: string;
    hourly_rate?: number;
  }): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RegisterResponse>(res);
  },

  async verifyOtp(email: string, code: string): Promise<OTPVerifyResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    return handleResponse<OTPVerifyResponse>(res);
  },

  async resendOtp(email: string): Promise<{ message: string; dev_otp?: string }> {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ message: string; dev_otp?: string }>(res);
  },

  async getLatestOtp(email: string): Promise<{ email: string; code: string }> {
    const res = await fetch(`${API_BASE}/auth/latest-otp?email=${encodeURIComponent(email)}`);
    return handleResponse<{ email: string; code: string }>(res);
  },

  async login(creds: { email: string; password: string }): Promise<OTPVerifyResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    return handleResponse<OTPVerifyResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(res);
  },

  async getDemoAccounts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return handleResponse<any[]>(res);
  },

  // Projects
  async getProjects(params?: {
    search?: string;
    category?: string;
    status?: string;
    client_id?: number;
    freelancer_id?: number;
  }): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.client_id) query.append('client_id', params.client_id.toString());
    if (params?.freelancer_id) query.append('freelancer_id', params.freelancer_id.toString());

    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    return handleResponse<Project[]>(res);
  },

  async getProject(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return handleResponse<Project>(res);
  },

  async createProject(data: {
    title: string;
    description: string;
    category: string;
    budget: number;
    required_skills: string;
    deadline_days: number;
    initial_milestones?: Array<{ title: string; description: string; amount: number; due_days: number }>;
  }): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Project>(res);
  },

  // Proposals
  async submitProposal(data: {
    project_id: number;
    cover_letter: string;
    bid_amount: number;
    estimated_days: number;
  }): Promise<Proposal> {
    const res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Proposal>(res);
  },

  async acceptProposal(proposalId: number): Promise<Proposal> {
    const res = await fetch(`${API_BASE}/proposals/${proposalId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Proposal>(res);
  },

  // AI Recommendation System
  async getAIMatches(projectId: number): Promise<AIMatchResponse> {
    const res = await fetch(`${API_BASE}/ai/recommendations/${projectId}`);
    return handleResponse<AIMatchResponse>(res);
  },

  async getRecommendedProjects(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/ai/recommended-projects`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any[]>(res);
  },

  // Milestones & Mock Escrow
  async getProjectMilestones(projectId: number): Promise<Milestone[]> {
    const res = await fetch(`${API_BASE}/milestones/project/${projectId}`);
    return handleResponse<Milestone[]>(res);
  },

  async fundMilestone(milestoneId: number): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/fund`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Milestone>(res);
  },

  async submitMilestone(milestoneId: number, data: { submission_notes: string; submission_url?: string }): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Milestone>(res);
  },

  async approveMilestone(milestoneId: number): Promise<Milestone> {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Milestone>(res);
  },

  // Messages
  async getMessages(params?: { other_user_id?: number; project_id?: number }): Promise<Message[]> {
    const query = new URLSearchParams();
    if (params?.other_user_id) query.append('other_user_id', params.other_user_id.toString());
    if (params?.project_id) query.append('project_id', params.project_id.toString());

    const res = await fetch(`${API_BASE}/messages?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Message[]>(res);
  },

  async sendMessage(data: { receiver_id: number; content: string; project_id?: number }): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Message>(res);
  },

  // Reviews
  async submitReview(data: {
    project_id: number;
    reviewee_id: number;
    rating: number;
    tags?: string;
    comment: string;
  }): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Review>(res);
  },

  async getUserReviews(userId: number): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews/user/${userId}`);
    return handleResponse<Review[]>(res);
  },

  // Users
  async getFreelancers(params?: { skill?: string; search?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.skill) query.append('skill', params.skill);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/users/freelancers?${query.toString()}`);
    return handleResponse<User[]>(res);
  },

  async getUserProfile(userId: number): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    return handleResponse<User>(res);
  }
};
