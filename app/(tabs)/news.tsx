import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, User, ChevronRight, Newspaper } from 'lucide-react-native';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  community: string;
  timestamp: string;
  category: string;
  urgent: boolean;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Water Supply Maintenance Notice',
    content: 'Water supply will be temporarily interrupted on December 28th from 10 AM to 2 PM for maintenance work. Please store water in advance.',
    author: 'Admin',
    community: 'Green Valley Residents',
    timestamp: '2024-12-27T10:00:00Z',
    category: 'Announcement',
    urgent: true,
  },
  {
    id: '2',
    title: 'New Community Guidelines',
    content: 'We have updated our community guidelines to ensure a better living environment for all residents. Please review the new rules.',
    author: 'Management',
    community: 'Tech Hub Community',
    timestamp: '2024-12-26T15:30:00Z',
    category: 'Policy',
    urgent: false,
  },
  {
    id: '3',
    title: 'Holiday Celebration Success',
    content: 'Thank you to everyone who participated in our holiday celebration! Over 200 families joined us for a wonderful evening.',
    author: 'Event Committee',
    community: 'Family First Society',
    timestamp: '2024-12-25T18:00:00Z',
    category: 'Event',
    urgent: false,
  },
  {
    id: '4',
    title: 'Security Enhancement Update',
    content: 'New security cameras have been installed at all entry points. Access cards will be required for all visitors starting January 1st.',
    author: 'Security Team',
    community: 'Green Valley Residents',
    timestamp: '2024-12-24T09:15:00Z',
    category: 'Security',
    urgent: true,
  },
];

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refreshing news
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Announcement': return '#F59E0B';
      case 'Policy': return '#8B5CF6';
      case 'Event': return '#10B981';
      case 'Security': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderNewsItem = (item: NewsItem) => (
    <TouchableOpacity key={item.id} style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <View style={styles.newsTitleContainer}>
          <Text style={[styles.newsTitle, item.urgent && styles.urgentTitle]}>
            {item.title}
          </Text>
          {item.urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>
      </View>
      
      <Text style={styles.newsContent}>{item.content}</Text>
      
      <View style={styles.newsFooter}>
        <View style={styles.newsInfo}>
          <View style={styles.infoRow}>
            <User size={14} color="#6B7280" />
            <Text style={styles.infoText}>{item.author}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.infoText}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.communityTag}>
          <Text style={styles.communityText}>{item.community}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Newspaper size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Community News</Text>
            <Text style={styles.headerSubtitle}>Stay updated with your community</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.newsContainer}>
          {news.map(renderNewsItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
  },
  newsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  newsCard: {
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
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  newsTitleContainer: {
    flexShrink: 1,
    marginRight: 8,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  urgentTitle: {
    color: '#EF4444',
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  urgentText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  communityTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  communityText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});