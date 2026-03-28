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
  Modal,
  Alert,
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
  Shield,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Pin,
  Edit3,
  CheckCircle,
} from 'lucide-react-native';
import colors from '@/constants/colors';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isPinned?: boolean;
  isVerified?: boolean;
  achievement?: string;
  progress?: {
    metric: string;
    value: string;
    change: string;
  };
}

export default function TrainerCommunityScreen() {
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
      isPinned: true,
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
      isVerified: true,
      progress: {
        metric: 'Weight Loss',
        value: '15 lbs',
        change: 'This Month',
      },
    },
  ]);

  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
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
        author: 'Trainer',
        avatar: 'https://i.pravatar.cc/150?img=10',
        content: newPost,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        isLiked: false,
        isVerified: true,
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const handleAdminAction = (action: string) => {
    if (!selectedPost) return;
    
    switch (action) {
      case 'delete':
        Alert.alert(
          'Delete Post',
          'Are you sure you want to delete this post?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                setPosts(posts.filter(p => p.id !== selectedPost));
                setShowAdminModal(false);
              }
            },
          ]
        );
        break;
      case 'pin':
        setPosts(posts.map(p => 
          p.id === selectedPost ? { ...p, isPinned: !p.isPinned } : p
        ));
        setShowAdminModal(false);
        break;
      case 'warn':
        Alert.alert('Warning Sent', 'User has been notified about community guidelines.');
        setShowAdminModal(false);
        break;
    }
  };

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

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
              <Text style={styles.headerTitle}>Community Hub</Text>
              <Text style={styles.headerSubtitle}>Moderate • Guide • Inspire</Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.adminBadge}>
                <Shield size={16} color={colors.secondary} />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Analytics Section */}
            <View style={styles.analyticsSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Community Analytics</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.analyticsCard}>
                  <LinearGradient
                    colors={['rgba(201, 169, 97, 0.1)', 'rgba(201, 169, 97, 0.05)']}
                    style={styles.analyticsGradient}
                  >
                    <Users size={24} color={colors.secondary} />
                    <Text style={styles.analyticsValue}>2,456</Text>
                    <Text style={styles.analyticsLabel}>Active Members</Text>
                    <Text style={styles.analyticsChange}>+12% this week</Text>
                  </LinearGradient>
                </View>
                <View style={styles.analyticsCard}>
                  <LinearGradient
                    colors={['rgba(0, 208, 132, 0.1)', 'rgba(0, 208, 132, 0.05)']}
                    style={styles.analyticsGradient}
                  >
                    <Trophy size={24} color={colors.success} />
                    <Text style={styles.analyticsValue}>89%</Text>
                    <Text style={styles.analyticsLabel}>Engagement Rate</Text>
                    <Text style={styles.analyticsChange}>+5% this week</Text>
                  </LinearGradient>
                </View>
                <View style={styles.analyticsCard}>
                  <LinearGradient
                    colors={['rgba(0, 122, 255, 0.1)', 'rgba(0, 122, 255, 0.05)']}
                    style={styles.analyticsGradient}
                  >
                    <Award size={24} color={colors.info} />
                    <Text style={styles.analyticsValue}>342</Text>
                    <Text style={styles.analyticsLabel}>Goals Achieved</Text>
                    <Text style={styles.analyticsChange}>This month</Text>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>

            {/* Posts */}
            {sortedPosts.map((post) => (
              <Animated.View
                key={post.id}
                style={[
                  styles.postCard,
                  post.isPinned && styles.pinnedPost,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Pin size={12} color={colors.secondary} />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  <View style={styles.postInfo}>
                    <View style={styles.authorRow}>
                      <Text style={styles.authorName}>{post.author}</Text>
                      {post.isVerified && (
                        <CheckCircle size={16} color={colors.info} style={styles.verifiedIcon} />
                      )}
                    </View>
                    <Text style={styles.timestamp}>{formatTime(post.timestamp)}</Text>
                  </View>
                  {post.achievement && (
                    <View style={styles.achievementBadge}>
                      <Award size={14} color={colors.secondary} />
                      <Text style={styles.achievementText}>{post.achievement}</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.adminButton}
                    onPress={() => {
                      setSelectedPost(post.id);
                      setShowAdminModal(true);
                    }}
                  >
                    <MoreVertical size={20} color={colors.chrome} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {post.progress && (
                  <View style={styles.progressCard}>
                    <LinearGradient
                      colors={['rgba(201, 169, 97, 0.15)', 'rgba(201, 169, 97, 0.05)']}
                      style={styles.progressGradient}
                    >
                      <Trophy size={20} color={colors.secondary} />
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
                  placeholder="Share an announcement..."
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

        {/* Admin Modal */}
        <Modal
          visible={showAdminModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAdminModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAdminModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Admin Actions</Text>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleAdminAction('pin')}
              >
                <Pin size={20} color={colors.text.primary} />
                <Text style={styles.modalOptionText}>
                  {posts.find(p => p.id === selectedPost)?.isPinned ? 'Unpin' : 'Pin'} Post
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleAdminAction('warn')}
              >
                <AlertTriangle size={20} color={colors.warning} />
                <Text style={styles.modalOptionText}>Send Warning</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalOption, styles.deleteOption]}
                onPress={() => handleAdminAction('delete')}
              >
                <Trash2 size={20} color={colors.error} />
                <Text style={[styles.modalOptionText, styles.deleteText]}>Delete Post</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  adminText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  analyticsSection: {
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
  analyticsCard: {
    marginRight: 12,
  },
  analyticsGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    minWidth: 140,
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  analyticsChange: {
    fontSize: 11,
    color: colors.text.tertiary,
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
  pinnedPost: {
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pinnedText: {
    fontSize: 10,
    color: colors.secondary,
    marginLeft: 4,
    fontWeight: '600',
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  verifiedIcon: {
    marginLeft: 6,
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
    marginRight: 8,
  },
  achievementText: {
    fontSize: 11,
    color: colors.secondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  adminButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  deleteText: {
    color: colors.error,
  },
});