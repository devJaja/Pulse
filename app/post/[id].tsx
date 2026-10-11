import { View, TouchableOpacity, Platform, Share as RNShare, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, Share } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { usePost, usePosts, usePostTipRewards, useClaimTip } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import type { Comment } from '@/types';
import { toast } from 'sonner-native';
import {
  PostDetailCard,
  PostActions,
  CommentThread,
  CommentInput,
} from '@/components/post';
import { TipModal, BuyTokenModal } from '@/components/feed';
import { LoadingSpinner, ErrorState } from '@/components/common';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: postData, isLoading } = usePost(id || '');
  const post = postData as any;
  const { comments, isLoading: isLoadingComments, createComment, isCreatingComment } = useComments(id || '');
  const { buyToken, isBuyingToken, likePost, unlikePost, tipPost, isTippingPost } = usePosts();
  const { data: tipRewards } = usePostTipRewards(id || '');
  const { mutate: claimTip, isPending: isClaiming } = useClaimTip(id || '');
  const pendingMon = tipRewards?.pendingMon ?? 0;
  const [showTipModal, setShowTipModal] = useState(false);
  const [showBuyTokenModal, setShowBuyTokenModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleBuyToken = (amount: number) => {
    if (!post) return;
    buyToken({ postId: post.id, amount });
    setShowBuyTokenModal(false);
  };

  const handleLike = () => {
    if (!post) return;
    if (post.isLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };

  const handleTip = (amount: number) => {
    if (!post) return;
    tipPost({ postId: post.id, amount });
    setShowTipModal(false);
  };

  const handleCreateComment = (content: string) => {
    if (replyingTo) {
      // Create a reply
      createComment({ content, parentCommentId: replyingTo });
      setReplyingTo(null);
    } else {
      // Create a top-level comment
      createComment({ content });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo(commentId);
    toast.success(`Replying to @${username}`);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const navigateToProfile = (username: string) => {
    router.push(`/(tabs)/profile?username=${username}`);
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      const shareUrl = `https://pulse.app/post/${post.id}`;
      const message = `Check out this post by @${post.author.username} on Pulse!\n\n"${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}"\n\n${shareUrl}`;
      
      await RNShare.share({
        message: Platform.OS === 'ios' ? message : message,
        url: Platform.OS === 'ios' ? shareUrl : undefined,
        title: `Post by @${post.author.username}`,
      });
    } catch (error) {
      toast.error('Failed to share post');
      console.error('Share error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!post) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center border-b border-border bg-card px-4 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </TouchableOpacity>
        </View>
        <ErrorState message="Post not found" onRetry={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border bg-card px-4 pb-4 pt-12">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Post</Text>
        <TouchableOpacity onPress={handleShare}>
          <Icon as={Share} size={24} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
       bottomOffset={100} showsVerticalScrollIndicator={false}
      >
      <PostDetailCard post={post} />

          {/* Post Actions */}
          <PostActions
            isLiked={post.isLiked}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            isTokenized={post.isTokenized}
            onLike={handleLike}
            onComment={() => {}}
            onShare={handleShare}
            onTip={() => setShowTipModal(true)}
            onBuyToken={post.isTokenized ? () => setShowBuyTokenModal(true) : undefined}
          />

          {/* Claimable early-backer rewards */}
          {pendingMon > 0 && (
            <View className="mx-4 mt-3 flex-row items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Early-backer rewards
                </Text>
                <Text className="mt-1 text-xl font-bold text-foreground">
                  {pendingMon.toFixed(4)} MON
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Your share of this post&apos;s tip pool
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => claimTip()}
                disabled={isClaiming}
                className={`rounded-full bg-primary px-5 py-2.5 ${isClaiming ? 'opacity-60' : ''}`}
              >
                <Text className="font-semibold text-primary-foreground">
                  {isClaiming ? 'Claiming...' : 'Claim'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Comments Section Header */}
          <View className="mt-2 bg-card">
            <View className="border-b border-border px-4 py-3">
              <Text className="font-bold">Comments ({post.commentsCount})</Text>
            </View>
          </View>

          {/* Loading or Empty State */}
          {isLoadingComments && <LoadingSpinner />}
          {!isLoadingComments && comments.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">No comments yet</Text>
              <Text className="mt-1 text-sm text-muted-foreground">Be the first to comment!</Text>
            </View>
          )}

          {/* Comments List */}
          {(comments as Comment[]).map((comment: Comment) => (
            <CommentThread
              key={comment.id}
              comment={{
                ...comment,
                isLiked: false, // TODO: Add isLiked to Comment type from backend
              }}
              onLike={() => {}}
              onReply={handleReply}
              onAuthorPress={navigateToProfile}
              isExpanded={expandedComments.has(comment.id)}
              onToggleExpand={() => toggleReplies(comment.id)}
            />
          ))}

        {/* Comment Input */}
        <CommentInput
          onSubmit={handleCreateComment}
          isSubmitting={isCreatingComment}
          replyingTo={replyingTo ? (comments as Comment[]).find((c: Comment) => c.id === replyingTo)?.author.username : undefined}
          onCancelReply={cancelReply}
        />
      </KeyboardAwareScrollView>

      {/* Tip Modal */}
      <TipModal
        visible={showTipModal}
        onClose={() => setShowTipModal(false)}
        onSubmit={handleTip}
        recipientUsername={post.author.username}
        isSubmitting={isTippingPost}
      />

      {/* Buy Token Modal */}
      <BuyTokenModal
        visible={showBuyTokenModal}
        onClose={() => setShowBuyTokenModal(false)}
        onSubmit={handleBuyToken}
        tokenPrice={post.tokenPrice || 0}
        isSubmitting={isBuyingToken}
      />
    </View>
  );
}