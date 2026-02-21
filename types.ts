export type Tab = 'feed' | 'marketplace' | 'confessions' | 'messages' | 'profile' | 'notifications' | 'hub' | 'transport' | 'events' | 'resources' | 'legal' | 'chat_detail' | 'assistant' | 'missions' | 'alerts' | 'resto' | 'crush' | 'leaderboard' | 'facematch' | 'edit_profile';

export interface UserProfile {
  name: string;
  phone: string;
  faculty: string;
  level: string;
  residence: string; // 'externe' or specific residence name
  maritalStatus: 'celibataire' | 'en_couple' | 'marie' | 'complique' | 'non_defini';
  avatar: string;
  bio: string;
  vibesReceived: number;
  upPoints: number;
  hasStory: boolean;
  isProfileComplete?: boolean;
  role: 'user' | 'admin';
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  author: string;
  authorTag?: string;
  avatar: string;
  time: string;
  content: string;
  type: 'text' | 'audio' | 'image';
  stats: {
    flames: number;
    comments: number;
    isFlambant?: boolean;
  };
  commentsList?: Comment[];
  image?: string;
  audioData?: string; // Base64 audio data
  audioDuration?: string;
  location?: string;
  hasStory?: boolean;
}

export interface FaceMatchItem {
  id: string;
  image: string;
  name: string;
  faculty: string;
  flames: number;
}

export interface Mission {
  id: string;
  title: string;
  reward: string;
  location: string;
  category: 'achat' | 'aide' | 'transport';
  time: string;
}

export interface CampusAlert {
  id: string;
  text: string;
  type: 'prof' | 'info' | 'urgent';
  time: string;
  votes: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'party' | 'academic' | 'sport' | string;
  organizer: string;
}

export interface StudyResource {
  id: string;
  title: string;
  faculty: string;
  size: string;
  type: string;
  downloads: number;
}

export interface ChatMessage {
  id: string;
  from: string;
  text?: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'location';
  time: string;
  mediaUrl?: string; // Can be Base64 or URL
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  audioDuration?: string;
  createdAt: any;
}

export interface Story {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  content: string; // URL or Base64
  type: 'image' | 'video';
  createdAt: any;
  expiresAt: any;
}