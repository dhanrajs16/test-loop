import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, Users, Settings, LogOut, CreditCard as Edit3, Save, X, Shield, Calendar, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { getCurrentUser, signOut, AuthUser } from '@/lib/auth';
import { getUserCommunities } from '@/lib/communities';
import { getUserEventRegistrations } from '@/lib/events';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url?: string;
  created_at: string;
  communities: string[];
  eventsAttended: number;
  isAdmin: boolean;
}


export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.replace('/(auth)/login');
        return;
      }

      setUser(currentUser);

      // Load user communities
      const userCommunities = await getUserCommunities();
      setCommunities(userCommunities || []);

      // Load user event registrations
      const registrations = await getUserEventRegistrations();
      setEventRegistrations(registrations || []);

      // Set profile data
      if (currentUser.profile) {
        const profileData = {
          id: currentUser.id,
          first_name: currentUser.profile.first_name || '',
          last_name: currentUser.profile.last_name || '',
          email: currentUser.email,
          phone: currentUser.profile.phone || '',
          location: currentUser.profile.location || '',
          bio: currentUser.profile.bio || '',
          avatar_url: currentUser.profile.avatar_url,
          created_at: currentUser.profile.created_at,
          communities: userCommunities?.map(uc => uc.communities.name) || [],
          eventsAttended: registrations?.length || 0,
          isAdmin: userCommunities?.some(uc => uc.role === 'admin') || false,
        };
        setProfile(profileData);
        setEditingProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update with Supabase
    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleManageEvents = () => {
    Alert.alert('Coming Soon', 'Event management features will be available soon!');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity onPress={loadUserData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editingProfile.first_name}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, first_name: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editingProfile.last_name}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, last_name: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.modalInput}
                value={editingProfile.phone}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, phone: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.modalInput}
                value={editingProfile.location}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, location: text }))}
                multiline
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={styles.modalInput}
                value={editingProfile.bio}
                onChangeText={(text) => setEditingProfile(prev => ({ ...prev, bio: text }))}
                multiline
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#14B8A6']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            {profile.isAdmin && (
              <View style={styles.adminBadge}>
                <Shield size={12} color="#FFFFFF" />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditingProfile({
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                location: profile.location,
                bio: profile.bio,
              });
              setEditModalVisible(true);
            }}
          >
            <Edit3 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Users size={24} color="#2563EB" />
              <Text style={styles.statNumber}>{profile.communities.length}</Text>
              <Text style={styles.statLabel}>Communities</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#10B981" />
              <Text style={styles.statNumber}>{profile.eventsAttended}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Phone size={20} color="#6B7280" />
                <Text style={styles.infoText}>{profile.phone || 'Not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={20} color="#6B7280" />
                <Text style={styles.infoText}>{profile.location || 'Not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar size={20} color="#6B7280" />
                <Text style={styles.infoText}>Joined: {formatDate(profile.created_at)}</Text>
              </View>
              {profile.bio && (
                <View style={styles.infoRow}>
                  <User size={20} color="#6B7280" />
                  <Text style={styles.infoText}>{profile.bio}</Text>
                </View>
              )}
              </View>
          </View>
          </View>

          <View style={styles.communitiesSection}>
            <Text style={styles.sectionTitle}>My Communities</Text>
            {profile.communities.map((community, index) => (
              <View key={index} style={styles.communityCard}>
                <Text style={styles.communityName}>{community}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            
            {profile.isAdmin && (
              <TouchableOpacity style={styles.actionButton} onPress={handleManageEvents}>
                <Shield size={20} color="#6B7280" />
                <Text style={styles.actionText}>Manage Events</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginRight: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  adminText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flexShrink: 1,
  },
  communitiesSection: {
    marginBottom: 24,
  },
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 4,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});