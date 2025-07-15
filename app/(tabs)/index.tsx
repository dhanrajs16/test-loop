import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Users, Star, ChevronRight, Plus, Info } from 'lucide-react-native';
import { Settings } from 'lucide-react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveStyles } from '@/styles/responsive';
import { RefreshControl } from 'react-native';
import ResponsiveGrid from '@/components/ui/ResponsiveGrid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import CommunityDetailsModal from '@/components/community/CommunityDetailsModal';
import CommunityManagementModal from '@/components/community/CommunityManagementModal';
import { getCommunities, createCommunity, joinCommunity } from '@/lib/communities';
import { isUserMemberOfCommunity, getUserRoleInCommunity } from '@/lib/communities';
import { getCurrentUser } from '@/lib/auth';
import { Community } from '@/types';


export default function CommunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userMemberships, setUserMemberships] = useState<{[key: string]: string}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isTablet } = useResponsive();

  useEffect(() => {
    loadCommunities();
  }, [searchQuery, pincode, city, country]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const data = await getCommunities(searchQuery, pincode, city, country);
      setCommunities(data || []);
      
      // Check user membership for each community
      if (data) {
        const memberships: {[key: string]: string} = {};
        for (const community of data) {
          const role = await getUserRoleInCommunity(community.id);
          if (role) {
            memberships[community.id] = role;
          }
        }
        setUserMemberships(memberships);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      Alert.alert('Error', 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const search = async () => {
      try {
        setLoading(true);
        const data = await getCommunities(searchQuery.trim() || undefined, pincodeFilter.trim() || undefined);
        setCommunities(data || []);
      } catch (error) {
        console.error('Error searching communities:', error);
        Alert.alert('Error', 'Failed to search communities');
      } finally {
        setLoading(false);
      }
    };
    search();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadCommunities();
    } catch (error) {
      console.error('Error refreshing communities:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinCommunity = (community: Community) => {
    // Check if user is already a member
    if (userMemberships[community.id]) {
      Alert.alert('Already a Member', `You are already a ${userMemberships[community.id]} of this community.`);
      return;
    }

    Alert.alert(
      'Join Community',
      `Would you like to join ${community.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: async () => {
            try {
              await joinCommunity(community.id);
              Alert.alert('Success', 'Successfully joined the community!');
              await loadCommunities(); // Refresh the list
            } catch (error) {
              console.error('Error joining community:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join community');
            }
          }
        },
      ]
    );
  };

  const handleCreateCommunity = async (communityData: any) => {
    try {
      await createCommunity(communityData);
      setShowCreateModal(false);
      Alert.alert('Success', 'Community created successfully!');
      await loadCommunities(); // Refresh the list
    } catch (error) {
      console.error('Error creating community:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create community');
    }
  };

  const handleViewDetails = (community: Community) => {
    setSelectedCommunity(community);
    setShowDetailsModal(true);
  };

  const handleManageCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setShowManagementModal(true);
  };
  const renderCommunityCard = (community: Community) => {
    const userRole = userMemberships[community.id];
    const isMember = !!userRole;
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator';

    return (
      <Card key={community.id}>
        <View style={ResponsiveStyles.cardHeader}>
          <Text style={styles.communityName}>{community.name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => handleViewDetails(community)}
              style={styles.infoButton}
            >
              <Info size={16} color="#6B7280" />
            </TouchableOpacity>
            {isMember && (
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>
                  {isAdmin ? 'Admin' : isModerator ? 'Moderator' : 'Member'}
                </Text>
              </View>
            )}
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{community.rating}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryBadge}>{community.category}</Text>
          {community.isLegallyRegistered && (
            <Text style={styles.legalBadge}>Legally Registered</Text>
          )}
        </View>
        
        <View style={ResponsiveStyles.cardContent}>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {community.address?.city || community.location || 'Location not specified'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.infoText}>{community.member_count} members</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{community.description}</Text>
        
        <View style={ResponsiveStyles.cardFooter}>
          <Text style={styles.eventCount}>
            {community.events_count || 0} events
          </Text>
          {!isMember ? (
            <Button
              title="Join"
              variant="secondary"
              size={isTablet ? "lg" : "md"}
              onPress={() => handleJoinCommunity(community)}
              icon={<ChevronRight size={16} color="#FFFFFF" />}
            />
          ) : isAdmin ? (
            <Button
              title="Manage"
              variant="primary"
              size={isTablet ? "lg" : "md"}
              onPress={() => handleManageCommunity(community)}
              icon={<Settings size={16} color="#FFFFFF" />}
            />
          ) : (
            <Button
              title="View"
              variant="outline"
              size={isTablet ? "lg" : "md"}
              onPress={() => handleViewDetails(community)}
              icon={<ChevronRight size={16} color="#2563EB" />}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={ResponsiveStyles.safeContainer}>
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
        style={ResponsiveStyles.headerContainer}
      >
        <View style={ResponsiveStyles.headerContent}>
          <View style={ResponsiveStyles.headerText}>
            <Text style={styles.headerTitle}>Communities</Text>
            <Text style={styles.headerSubtitle}>Find and join local communities</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={ResponsiveStyles.searchContainer}>
        <View style={ResponsiveStyles.searchRow}>
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={20} color="#6B7280" />}
            style={ResponsiveStyles.searchInput}
          />
          <Input
            placeholder="Pincode"
            value={pincodeFilter}
            onChangeText={setPincodeFilter}
            keyboardType="numeric"
            icon={<MapPin size={20} color="#6B7280" />}
            style={ResponsiveStyles.filterInput}
          />
        </View>
        
        {/* Location Filters */}
        <View style={styles.filterRow}>
          <View style={styles.filterInput}>
            <Input
              placeholder="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />
          </View>
          <View style={styles.filterInput}>
            <Input
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              style={styles.input}
            />
          </View>
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
        {loading && communities.length === 0 && (
          <View style={ResponsiveStyles.emptyState}>
            <Text style={styles.emptyStateText}>Loading communities...</Text>
          </View>
        )}
        
        <ResponsiveGrid
          columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        >
          {communities.map(renderCommunityCard)}
        </ResponsiveGrid>
        
        {!loading && communities.length === 0 && (
          <View style={ResponsiveStyles.emptyState}>
            <Text style={styles.emptyStateText}>No communities found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateCommunityModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCommunity}
      />

      <CommunityDetailsModal
        visible={showDetailsModal}
        community={selectedCommunity}
        onClose={() => setShowDetailsModal(false)}
      />

      <CommunityManagementModal
        visible={showManagementModal}
        community={selectedCommunity}
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
    color: '#E5E7EB',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterInput: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flexShrink: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    padding: 4,
  },
  memberBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#EBF8FF',
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legalBadge: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  communityInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCount: {
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
});