import { supabase } from './supabase';
import { getCurrentUser } from './auth';

export interface EventData {
  title: string;
  description: string;
  communityId: string;
  location: string;
  eventDate: string;
  endDate?: string;
  category: string;
  price: number;
  maxAttendees?: number;
  isPublic: boolean;
  allowGuests: boolean;
  maxGuestsPerRegistration: number;
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
}

export interface Event {
  id: string;
  title: string;
  description: string;
  community_id: string;
  created_by: string;
  event_date: string;
  end_date?: string;
  location: string;
  image_url?: string;
  max_attendees?: number;
  attendee_count: number;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationData {
  eventId: string;
  guestCount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

// Create a new event
export const createEvent = async (eventData: EventData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  console.log('Creating event with data:', eventData);
  console.log('Current user:', user.id);

  // Check if user can create events in this community
  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', eventData.communityId)
    .eq('user_id', user.id)
    .single();

  console.log('User membership:', membership);

  if (!membership || !['admin', 'moderator'].includes(membership.role)) {
    throw new Error('You do not have permission to create events in this community');
  }

  // Insert event
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      description: eventData.description,
      community_id: eventData.communityId,
      created_by: user.id,
      event_date: eventData.eventDate,
      end_date: eventData.endDate,
      location: eventData.location,
      image_url: eventData.imageUrl,
      max_attendees: eventData.maxAttendees,
      category: eventData.category,
      is_public: eventData.isPublic,
      attendee_count: 0,
      price: eventData.price || 0,
      allow_guests: eventData.allowGuests || false,
      max_guests_per_registration: eventData.maxGuestsPerRegistration || 0,
      payment_info: eventData.paymentInfo || null
    })
    .select()
    .single();

  console.log('Event creation result:', { event, error });

  if (error) throw error;
  return event;
};

// Get all events
export const getEvents = async (searchQuery?: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('events')
      .select(`
        *,
        communities!inner(name)
      `)
      .eq('is_public', true)
      .order('event_date', { ascending: true });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data: events, error } = await query;
    if (error) throw error;

    // Get user's registration status for all events
    const eventIds = events?.map(event => event.id) || [];
    const { data: registrations } = await supabase
      .from('event_attendees')
      .select('event_id, guest_count, status')
      .eq('user_id', user.id)
      .in('event_id', eventIds);

    // Add registration status to events
    const eventsWithStatus = events?.map(event => ({
      ...event,
      user_registration: registrations?.find(reg => reg.event_id === event.id) || null
    }));

    return eventsWithStatus;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get user's community IDs
const getUserCommunityIds = async () => {
  const user = await getCurrentUser();
  if (!user) return '';

  const { data } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', user.id);

  return data?.map(m => m.community_id).join(',') || '';
};

// Get user's event registrations for checking registration status
export const getUserEventRegistrationStatus = async (eventIds: string[]) => {
  const user = await getCurrentUser();
  if (!user || eventIds.length === 0) return {};

  const { data, error } = await supabase
    .from('event_attendees')
    .select('event_id, status, guest_count, total_amount, payment_status')
    .eq('user_id', user.id)
    .in('event_id', eventIds);

  if (error) throw error;
  
  // Convert to object for easy lookup
  const registrations: Record<string, any> = {};
  data?.forEach(reg => {
    registrations[reg.event_id] = reg;
  });
  
  return registrations;
};

// Get user's communities where they can create events (admin/moderator)
export const getUserCommunitiesForEvents = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('community_members')
    .select(`
      role,
      communities!inner(
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator']);

  if (error) throw error;
  return data || [];
};

// Register for an event
export const registerForEvent = async (registrationData: EventRegistrationData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if already registered
  const { data: existingRegistration } = await supabase
    .from('event_attendees')
    .select('id')
    .eq('event_id', registrationData.eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingRegistration) {
    throw new Error('Already registered for this event');
  }

  // Get event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('max_attendees, attendee_count')
    .eq('id', registrationData.eventId)
    .single();

  if (eventError) throw eventError;

  // Check capacity
  const totalAttendees = 1 + registrationData.guestCount;
  if (event.max_attendees && event.attendee_count + totalAttendees > event.max_attendees) {
    throw new Error('Not enough spots available');
  }

  // Create registration
  const { error: registrationError } = await supabase
    .from('event_attendees')
    .insert({
      event_id: registrationData.eventId,
      user_id: user.id,
      status: 'registered'
    });

  if (registrationError) throw registrationError;

  // Update attendee count is handled by trigger
  return { success: true };
};

// Get user's event registrations
export const getUserEventRegistrations = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('event_attendees')
    .select(`
      *,
      events!inner(
        title,
        event_date,
        location,
        communities!inner(name)
      )
    `)
    .eq('user_id', user.id)
    .order('registered_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Cancel event registration
export const cancelEventRegistration = async (eventId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  if (error) throw error;
};

// Get event details
export const getEventDetails = async (eventId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      communities!inner(name),
      event_attendees(
        user_id,
        status,
        registered_at,
        profiles!inner(
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  return data;
};