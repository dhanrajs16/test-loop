export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  pincode?: string;
  familySize?: number;
  createdAt: string;
  isAdmin?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  location?: string; // Keep for backward compatibility
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  contact_info: {
    email: string;
    phone: string;
    website?: string;
  };
  created_by: string;
  member_count: number;
  is_public: boolean;
  is_legally_registered: boolean;
  legalDetails?: {
    registrationNumber: string;
    registrationType: 'Society' | 'Trust' | 'Company' | 'Cooperative' | 'Other';
    registrationDate: string;
    registeredAddress: string;
  };
  rating: number;
  events_count: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  // Additional computed fields
  adminIds?: string[];
  members?: number; // alias for member_count
  events?: number; // alias for events_count
  contactInfo?: { // alias for contact_info
    email: string;
    phone: string;
    website?: string;
  };
  isLegallyRegistered?: boolean; // alias for is_legally_registered
}

export interface CommunityInvitation {
  id: string;
  communityId: string;
  invitedBy: string;
  invitedEmail: string;
  invitedUserId?: string; // If user exists in database
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  role: 'member' | 'admin' | 'moderator';
  invitationToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  communityId: string;
  createdBy: string;
  location: string;
  eventDate: string;
  endDate?: string;
  price: number;
  maxAttendees?: number;
  attendeeCount: number;
  category: string;
  isPublic: boolean;
  allowGuests: boolean;
  maxGuestsPerRegistration?: number;
  paymentInfo?: {
    method: 'free' | 'paypal' | 'bank_transfer' | 'cash';
    paypalEmail?: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      ifscCode: string;
      upiId?: string;
    };
    instructions?: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  guestCount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  paymentReference?: string;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
}
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  category: string;
  isUrgent: boolean;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CommunityMembership {
  id: string;
  userId: string;
  communityId: string;
  joinedAt: string;
  role: 'member' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}