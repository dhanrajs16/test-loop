import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { Community } from '@/types';

export interface CommunityData {
  name: string;
  description: string;
  category: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  isPublic: boolean;
  isLegallyRegistered: boolean;
  legalDetails?: {
    registrationNumber: string;
    registrationType: string;
    registrationDate: string;
    registeredAddress: string;
  };
  adminInvites: Array<{ email: string; name: string }>;
  userInvites: Array<{ email: string; name: string }>;
}

// Create a new community
export const createCommunity = async (communityData: CommunityData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Format address as a single location string for backward compatibility
  const locationString = [
    communityData.address.street,
    communityData.address.city,
    communityData.address.state,
    communityData.address.country,
    communityData.address.pincode
  ].filter(Boolean).join(', ');

  // Insert community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .insert({
      name: communityData.name,
      description: communityData.description,
      category: communityData.category,
      location: locationString, // Keep for backward compatibility
      address: communityData.address,
      contact_info: communityData.contactInfo,
      is_legally_registered: communityData.isLegallyRegistered,
      legal_details: communityData.legalDetails,
      created_by: user.id,
      is_public: communityData.isPublic,
      member_count: 1
    })
    .select()
    .single();

  if (communityError) throw communityError;

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('community_members')
    .insert({
      community_id: community.id,
      user_id: user.id,
      role: 'admin'
    });

  if (memberError) throw memberError;

  // Send invitations
  await sendCommunityInvitations(
    community.id,
    user.id,
    communityData.adminInvites,
    communityData.userInvites
  );

  return community;
};

// Send community invitations
export const sendCommunityInvitations = async (
  communityId: string,
  invitedBy: string,
  adminInvites: Array<{ email: string; name: string }>,
  userInvites: Array<{ email: string; name: string }>
) => {
  const allInvites = [
    ...adminInvites.map(invite => ({ ...invite, role: 'admin' })),
    ...userInvites.map(invite => ({ ...invite, role: 'member' }))
  ];

  for (const invite of allInvites) {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', invite.email) // This would need to be email lookup
      .single();

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('community_invitations')
      .insert({
        community_id: communityId,
        invited_by: invitedBy,
        invited_email: invite.email,
        invited_user_id: existingUser?.id || null,
        role: invite.role
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      continue;
    }

    // Send email invitation (mock for now)
    await sendInvitationEmail(invite.email, invite.name, invitation.invitation_token, communityId);
  }
};

// Mock email sending function
const sendInvitationEmail = async (
  email: string,
  name: string,
  token: string,
  communityId: string
) => {
  // TODO: Implement with Supabase Edge Functions
  const inviteLink = `https://your-app.com/invite/${token}`;
  
  console.log(`
    📧 Invitation Email Sent:
    To: ${email}
    Name: ${name}
    Subject: You're invited to join our community!
    
    Hi ${name},
    
    You've been invited to join our community on Community Connect!
    
    Click here to join: ${inviteLink}
    
    If you don't have the app yet, download it first:
    📱 App Store: https://apps.apple.com/app/community-connect
    🤖 Google Play: https://play.google.com/store/apps/details?id=com.communityconnect
    
    This invitation expires in 7 days.
    
    Best regards,
    Community Connect Team
  `);
};

// Get all communities
export const getCommunities = async (searchQuery?: string, pincode?: string, city?: string, country?: string) => {
  let query = supabase
    .from('communities')
    .select(`
      *,
      profiles!created_by(first_name, last_name)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
  }

  if (pincode) {
    query = query.or(`location.ilike.%${pincode}%,address->>pincode.ilike.%${pincode}%`);
  }

  if (city) {
    query = query.or(`location.ilike.%${city}%,address->>city.ilike.%${city}%`);
  }

  if (country) {
    query = query.or(`location.ilike.%${country}%,address->>country.ilike.%${country}%`);
  }

  const { data: rawData, error } = await query;
  if (error) throw error;
  
  // Transform data to match Community interface
  const data = rawData?.map(community => ({
    ...community,
    // Add computed/alias fields for backward compatibility
    members: community.member_count,
    events: community.events_count,
    contactInfo: community.contact_info,
    isLegallyRegistered: community.is_legally_registered,
    // Ensure address is properly structured
    address: community.address || {
      street: '',
      city: community.location || '',
      state: '',
      country: 'India',
      pincode: ''
    }
  }));
  
  return data;
};

// Get community details
export const getCommunityDetails = async (communityId: string) => {
  const { data, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members!inner(
        user_id,
        role,
        joined_at,
        profiles!inner(
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq('id', communityId)
    .single();

  if (error) throw error;
  return data;
};

// Join a community
export const joinCommunity = async (communityId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    throw new Error('Already a member of this community');
  }

  // Add as member
  const { error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member'
    });

  if (error) throw error;
};

// Leave a community
export const leaveCommunity = async (communityId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);

  if (error) throw error;
};

// Get user's communities
export const getUserCommunities = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('community_members')
    .select(`
      role,
      joined_at,
      communities!inner(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};

// Check if user can create events in community
export const canCreateEvents = async (communityId: string) => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single();

  return data?.role === 'admin' || data?.role === 'moderator';
};

// Check if user is already a member of the community
export const isUserMemberOfCommunity = async (communityId: string) => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle();

  return !!data;
};

// Get user's role in community
export const getUserRoleInCommunity = async (communityId: string) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle();

  return data?.role || null;
};