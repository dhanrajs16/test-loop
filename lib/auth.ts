import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
  role?: 'user' | 'admin' | 'moderator';
}

// Authentication functions
export const signUp = async (email: string, password: string, userData: {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        location: userData.location,
      }
    }
  });

  // If user was created successfully, create their profile
  if (data.user && !error) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        location: userData.location || '',
        bio: '',
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Note: We don't throw here to avoid breaking the signup flow
      // The profile can be created later if needed
    }
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log('SignIn function called with:', { email, password: password ? '***' : 'empty' });
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('Supabase signIn response:', { 
    user: data?.user ? 'User found' : 'No user',
    session: data?.session ? 'Session created' : 'No session',
    error: error ? error.message : 'No error'
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear any local storage or cached data
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
};

export const resendConfirmation = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/(tabs)`
    }
  });

  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('Error getting current user:', error);
    return null;
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error getting user profile:', profileError);
  }

  // If no profile exists, create one from auth metadata
  if (!profile && user.user_metadata) {
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        first_name: user.user_metadata.first_name || '',
        last_name: user.user_metadata.last_name || '',
        phone: user.user_metadata.phone || null,
        location: user.user_metadata.location || '',
        bio: '',
      });

    if (createError) {
      console.error('Error creating profile:', createError);
    } else {
      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email!,
        profile: newProfile || null,
      };
    }
  }

  return {
    id: user.id,
    email: user.email!,
    profile: profile || null,
  };
};

// User access level functions
export const getUserCommunityRole = async (userId: string, communityId: string) => {
  const { data, error } = await supabase
    .from('community_members')
    .select('role')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .single();

  if (error) return null;
  return data?.role || 'member';
};

export const isUserCommunityAdmin = async (userId: string, communityId: string) => {
  const role = await getUserCommunityRole(userId, communityId);
  return role === 'admin';
};

export const isUserCommunityModerator = async (userId: string, communityId: string) => {
  const role = await getUserCommunityRole(userId, communityId);
  return role === 'admin' || role === 'moderator';
};

// Community access functions
export const canUserCreateEvent = async (userId: string, communityId: string) => {
  return await isUserCommunityModerator(userId, communityId);
};

export const canUserCreateNews = async (userId: string, communityId: string) => {
  return await isUserCommunityModerator(userId, communityId);
};

export const canUserManageCommunity = async (userId: string, communityId: string) => {
  return await isUserCommunityAdmin(userId, communityId);
};