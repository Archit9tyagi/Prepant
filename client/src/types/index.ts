export type Role = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: {
    url: string;
    publicId: string;
  };
  timezone: string;
  country?: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MentorCardData {
  slug: string;
  name: string;
  avatar?: string;
  headline: string;
  subjects: string[];
  ratingAvg: number;
  ratingCount: number;
  sessionsTaught: number;
  hourlyRatePaise: number;
  trialPricePaise?: number;
  trialEnabled: boolean;
  badges: string[];
  bio: string;
  languages: { code: string; level: string }[];
  country: string;
  timezone: string;
}

export interface ReviewData {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  mentorReply?: {
    text: string;
    at: string;
  };
}

export interface CategoryData {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  subjectCount?: number;
}
