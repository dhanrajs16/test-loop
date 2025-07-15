import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Calendar, Clock, Users, DollarSign, ChevronRight, Plus, Info } from 'lucide-react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveStyles } from '@/styles/responsive';
import { RefreshControl } from 'react-native';
import ResponsiveGrid from '@/components/ui/ResponsiveGrid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CreateEventModal from '@/components/events/CreateEventModal';
import EventRegistrationModal from '@/components/events/EventRegistrationModal';
import EventManagementModal from '@/components/events/EventManagementModal';
import { getEvents, createEvent, registerForEvent, getUserCommunitiesForEvents, Event } from '@/lib/events';
import { getCurrentUser } from '@/lib/auth';
import { useCurrency } from '@/hooks/useCurrency';


export default function EventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [userCommunitiesForEvents, setUserCommunitiesForEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isTablet } = useResponsive();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    loadEvents();
    loadUserCommunitiesForEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCommunitiesForEvents = async () => {
    try {
      const data = await getUserCommunitiesForEvents();
      console.log('User communities for events:', data);
      setUserCommunitiesForEvents(data || []);
    } catch (error) {
      console.error('Error loading user communities for events:', error);
    }
  };

  const handleSearch = () => {
    const search = async () => {
      try {
        setLoading(true);
        const data = await getEvents(searchQuery.trim() || undefined);
        setEvents(data || []);
      } catch (error) {
        console.error('Error searching events:', error);
        Alert.alert('Error', 'Failed to search events');
      } finally {
        setLoading(false);
      }
    };
    search();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadEvents();
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegisterEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await createEvent(eventData);
      setShowCreateModal(false);
      Alert.alert('Success', 'Event created successfully!');
      await loadEvents(); // Refresh the list
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create event');
    }
  };

  const handleEventRegistration = async (registrationData: any) => {
    try {
      await registerForEvent(registrationData);
      setShowRegistrationModal(false);
      Alert.alert('Success', 'Registration successful! You will receive a confirmation email.');
      await loadEvents(); // Refresh the list
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to register for event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCommunityName = (communityId: string) => {
    const community = userCommunitiesForEvents.find(uc => uc.communities.id === communityId);
    return community?.communities?.name || 'Community Event';
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id}>
      <View style={ResponsiveStyles.cardHeader}>
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventCommunity}>{getCommunityName(event.community_id)}</Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          {!event.is_public && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateText}>Members Only</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={ResponsiveStyles.cardContent}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDate(event.event_date)} • {formatTime(event.event_date)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Users size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {event.attendee_count}{event.max_attendees ? `/${event.max_attendees}` : ''} registered
          </Text>
        </View>
        {event.price && event.price > 0 && (
          <View style={styles.infoRow}>
            <DollarSign size={16} color="#6B7280" />
            <Text style={styles.infoText}>{formatAmount(event.price)}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.description}>{event.description}</Text>
      
      <View style={ResponsiveStyles.cardFooter}>
        {event.max_attendees && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(event.attendee_count / event.max_attendees) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((event.attendee_count / event.max_attendees) * 100)}% filled
            </Text>
          </View>
        )}
        
        {event.user_registration ? (
          <View style={styles.registeredContainer}>
            <View style={styles.registeredBadge}>
              <Text style={styles.registeredText}>✓ Registered</Text>
            </View>
            {event.user_registration.guest_count > 0 && (
              <Text style={styles.guestInfo}>
                +{event.user_registration.guest_count} guest{event.user_registration.guest_count > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        ) : (
          <Button
            title="Register"
            variant="secondary"
            size={isTablet ? "lg" : "md"}
            onPress={() => handleRegisterEvent(event)}
            icon={<ChevronRight size={16} color="#FFFFFF" />}
            disabled={event.max_attendees ? event.attendee_count >= event.max_attendees : false}
          />
        )}
        
        {/* Show manage button for event creators */}
        {userCommunitiesForEvents.some(uc => 
          uc.communities.id === event.community_id && 
          ['admin', 'moderator'].includes(uc.role)
        ) && (
          <Button
            title="Manage"
            variant="outline"
            size="sm"
            onPress={() => handleManageEvent(event)}
            icon={<Settings size={16} color="#2563EB" />}
            style={styles.manageButton}
          />
        )}
      </View>
    </Card>
  );

  const handleManageEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowManagementModal(true);
  };
  return (
    <SafeAreaView style={ResponsiveStyles.safeContainer}>
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        style={ResponsiveStyles.headerContainer}
      >
        <View style={ResponsiveStyles.headerContent}>
          <View style={ResponsiveStyles.headerText}>
            <Text style={styles.headerTitle}>Events</Text>
            <Text style={styles.headerSubtitle}>Discover and join community events</Text>
          </View>
          {userCommunitiesForEvents.length > 0 ? (
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={styles.createButton}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.noCommunitiesHint}>
              <Text style={styles.noCommunitiesText}>
                {userCommunitiesForEvents.length === 0 ? 'Need admin/moderator role to create events' : 'Loading...'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={ResponsiveStyles.searchContainer}>
        <View style={ResponsiveStyles.searchRow}>
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={20} color="#6B7280" />}
            style={ResponsiveStyles.searchInput}
          />
        </View>
        
        <Button
          title="Search"
          variant="primary"
          onPress={handleSearch}
        />
      </View>

      <ScrollView 
        style={ResponsiveStyles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && events.length === 0 && (
          <View style={ResponsiveStyles.emptyState}>
            <Text style={styles.emptyStateText}>Loading events...</Text>
          </View>
        )}
        
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        >
          {events.map(renderEventCard)}
        </ResponsiveGrid>
        
        {!loading && events.length === 0 && (
          <View style={ResponsiveStyles.emptyState}>
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        communityId={selectedCommunity || userCommunitiesForEvents[0]?.communities?.id || ''}
        communityName={userCommunitiesForEvents[0]?.communities?.name || 'Select Community'}
      />

      <EventRegistrationModal
        visible={showRegistrationModal}
        event={selectedEvent}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleEventRegistration}
      />

      <EventManagementModal
        visible={showManagementModal}
        event={selectedEvent}
        onClose={() => setShowManagementModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FEF3C7',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCommunitiesHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noCommunitiesText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontStyle: 'italic',
  },
  eventTitleContainer: {
    flexShrink: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  eventCommunity: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  privateBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  privateText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flexShrink: 1,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  registeredContainer: {
    alignItems: 'flex-end',
  },
  registeredBadge: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  registeredText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  guestInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});