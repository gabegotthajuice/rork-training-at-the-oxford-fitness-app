import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  MessageCircle,
  Heart,
  Share2,
  Send,
  Trophy,
  TrendingUp,
  Users,
  Award,
  Zap,
  Star,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useClient } from '@/providers/ClientProvider';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  achievement?: string;
  progress?: {
    metric: string;
    value: string;
    change: string;
  };
}

export default function CommunityScreen() {
  const { clientData } = useClient();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'Just hit my 30-day streak! The journey continues 💪',
      timestamp: new Date(Date.now() - 3600000),
      likes: 42,
      comments: 8,
      isLiked: false,
      achievement: '30 Day Streak',
    },
    {
      id: '2',
      author: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?img=2',
      content: 'Down 15 lbs this month! Consistency is everything.',
      timestamp: new Date(Date.now() - 7200000),
      likes: 89,
      comments: 15,
      isLiked: true,
      progress: {
        metric: 'Weight Loss',
        value: '15 lbs',
        change: 'This Month',
      },
    },
    {
      id: '3',
      author: 'Emma Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=3',
      content: 'Morning workout complete! Who else is crushing their goals today?',
      timestamp: new Date(Date.now() - 10800000),
      likes: 56,
      comments: 12,
      isLiked: false,
    },
  ]);

  const [newPost, setNewPost] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: clientData.name || 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
        content: newPost,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        isLiked: false,
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Community</Text>
              <Text style={styles.headerSubtitle}>Connect • Inspire • Achieve</Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.statBadge}>
                <Users size={16} color={colors.secondary} />
                <Text style={styles.statText}>2.4k</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.secondary}
              />
            }
          >
            {/* Trending Section */}
            <View style={styles.trendingSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Trending Achievements</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Weight Goal', '100 Day Streak', 'Elite Member'].map((achievement, index) => (
                  <View key={index} style={styles.trendingCard}>
                    <LinearGradient
                      colors={['rgba(201, 169, 97, 0.1)', 'rgba(201, 169, 97, 0.05)']}
                      style={styles.trendingGradient}
                    >
                      <Trophy size={24} color={colors.secondary} />
                      <Text style={styles.trendingText}>{achievement}</Text>
                      <Text style={styles.trendingCount}>{Math.floor(Math.random() * 50 + 10)} today</Text>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Posts */}
            {posts.map((post, index) => (
              <Animated.View
                key={post.id}
                style={[
                  styles.postCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  <View style={styles.postInfo}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.timestamp}>{formatTime(post.timestamp)}</Text>
                  </View>
                  {post.achievement && (
                    <View style={styles.achievementBadge}>
                      <Award size={14} color={colors.secondary} />
                      <Text style={styles.achievementText}>{post.achievement}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {post.progress && (
                  <View style={styles.progressCard}>
                    <LinearGradient
                      colors={['rgba(201, 169, 97, 0.15)', 'rgba(201, 169, 97, 0.05)']}
                      style={styles.progressGradient}
                    >
                      <Zap size={20} color={colors.secondary} />
                      <View style={styles.progressInfo}>
                        <Text style={styles.progressMetric}>{post.progress.metric}</Text>
                        <Text style={styles.progressValue}>{post.progress.value}</Text>
                        <Text style={styles.progressChange}>{post.progress.change}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(post.id)}
                  >
                    <Heart 
                      size={20} 
                      color={post.isLiked ? colors.error : colors.chrome}
                      fill={post.isLiked ? colors.error : 'transparent'}
                    />
                    <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageCircle size={20} color={colors.chrome} />
                    <Text style={styles.actionText}>{post.comments}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={20} color={colors.chrome} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Post Input */}
          <View style={styles.inputContainer}>
            <BlurView intensity={80} style={styles.inputBlur}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Share your progress..."
                  placeholderTextColor={colors.titanium}
                  value={newPost}
                  onChangeText={setNewPost}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendButton, newPost.trim() && styles.sendButtonActive]}
                  onPress={handlePost}
                  disabled={!newPost.trim()}
                >
                  <Send size={20} color={newPost.trim() ? colors.secondary : colors.titanium} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerStats: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  statText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  trendingSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 8,
  },
  trendingCard: {
    marginRight: 12,
  },
  trendingGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    minWidth: 120,
  },
  trendingText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  trendingCount: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 4,
  },
  postCard: {
    backgroundColor: colors.glass.dark,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.glass.border,
  },
  postInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 97, 0.2)',
  },
  achievementText: {
    fontSize: 11,
    color: colors.secondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  progressCard: {
    marginBottom: 12,
  },
  progressGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  progressInfo: {
    marginLeft: 12,
  },
  progressMetric: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginVertical: 2,
  },
  progressChange: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginLeft: 6,
  },
  likedText: {
    color: colors.error,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputBlur: {
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: colors.glass.dark,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sendButton: {
    marginLeft: 12,
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderColor: colors.secondary,
  },
});