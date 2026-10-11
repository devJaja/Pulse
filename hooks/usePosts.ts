import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner-native';
import type { Post } from '@/types';

export function usePosts() {
  const queryClient = useQueryClient();

  // Get feed with infinite scroll
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingFeed,
    refetch: refetchFeed,
  } = useInfiniteQuery<Post[]>({
    queryKey: ['posts', 'feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getFeed(pageParam as number, 20);
      if (response.error) throw new Error(response.error);
      console.log("Posts",response.data)
      return (response.data || []) as Post[];
    },
    getNextPageParam: (lastPage, pages) => {
      return Array.isArray(lastPage) && lastPage.length === 20 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1 as number,
  });

  // Create post
  const createPostMutation = useMutation({
    mutationFn: async (data: { 
      content: string; 
      images?: string[];
      isTokenized?: boolean;
      tokenSupply?: number;
      tokenPrice?: number;
    }) => {
      const response = await api.createPost(data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      toast.success('Post created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Like post
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.likePost(postId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(['posts', 'feed']);
      const previousPost = queryClient.getQueryData(['posts', postId]);

      // Optimistically update feed
      queryClient.setQueryData(['posts', 'feed'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: Post[]) =>
            page.map((post: Post) =>
              post.id === postId
                ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
                : post
            )
          ),
        };
      });

      // Optimistically update single post
      queryClient.setQueryData(['posts', postId], (old: any) => {
        if (!old) return old;
        return { ...old, isLiked: true, likesCount: old.likesCount + 1 };
      });

      return { previousFeed, previousPost };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
      toast.error('Failed to like post');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Unlike post
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.unlikePost(postId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(['posts', 'feed']);
      const previousPost = queryClient.getQueryData(['posts', postId]);

      // Optimistically update feed
      queryClient.setQueryData(['posts', 'feed'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: Post[]) =>
            page.map((post: Post) =>
              post.id === postId
                ? { ...post, isLiked: false, likesCount: Math.max(0, post.likesCount - 1) }
                : post
            )
          ),
        };
      });

      // Optimistically update single post
      queryClient.setQueryData(['posts', postId], (old: any) => {
        if (!old) return old;
        return { ...old, isLiked: false, likesCount: Math.max(0, old.likesCount - 1) };
      });

      return { previousFeed, previousPost };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
      toast.error('Failed to unlike post');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.deletePost(postId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Buy post token
  const buyTokenMutation = useMutation({
    mutationFn: async ({ postId, amount }: { postId: string; amount: number }) => {
      const response = await api.buyPostToken(postId, amount);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Tokens purchased!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Tip post
  const tipPostMutation = useMutation({
    mutationFn: async ({ postId, amount, message }: { postId: string; amount: number; message?: string }) => {
      const response = await api.tipPost(postId, amount, message);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Tip sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const posts = feedData?.pages.flat() || [];

  return {
    posts,
    isLoadingFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchFeed,
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    buyToken: buyTokenMutation.mutate,
    isBuyingToken: buyTokenMutation.isPending,
    tipPost: tipPostMutation.mutate,
    isTippingPost: tipPostMutation.isPending,
  };
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: async () => {
      const response = await api.getPost(postId);
      if (response.error) throw new Error(response.error);
      console.log("post", response.data)
      return response.data;
    },
    enabled: !!postId,
  });
}

export interface TipRewards {
  postId?: string;
  chatId?: string;
  pendingWei: string;
  pendingMon: number;
}

/**
 * Claimable early-backer rewards for a post's tip pool.
 */
export function usePostTipRewards(postId: string) {
  return useQuery<TipRewards>({
    queryKey: ['posts', postId, 'tip-rewards'],
    queryFn: async () => {
      const response = await api.getPostTipRewards(postId);
      if (response.error) throw new Error(response.error);
      return response.data as TipRewards;
    },
    enabled: !!postId,
    refetchInterval: 15000,
  });
}

/**
 * Claim accrued early-backer rewards for a post.
 */
export function useClaimTip(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.claimPostTip(postId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'tip-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Rewards claimed!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUserPosts(username: string, enabled: boolean = true) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<Post[]>({
    queryKey: ['posts', 'user', username],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getUserPosts(username, pageParam as number, 20);
      if (response.error) throw new Error(response.error);
      console.log('[useUserPosts] Response:', response.data);
      return (response.data || []) as Post[];
    },
    getNextPageParam: (lastPage, pages) => {
      return Array.isArray(lastPage) && lastPage.length === 20 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1 as number,
    enabled: !!username && enabled,
  });

  const posts = data?.pages.flat() || [];
  console.log('[useUserPosts] Posts count:', posts.length);

  return {
    posts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export function useUserComments(username: string, enabled: boolean = true) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['user-comments', username],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getUserComments(username, pageParam as number, 20);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      return Array.isArray(lastPage) && lastPage.length === 20 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1 as number,
    enabled: !!username && enabled,
  });

  const comments = data?.pages.flat() || [];

  return {
    comments,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export function useUserLikes(username: string, enabled: boolean = true) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<Post[]>({
    queryKey: ['user-likes', username],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getUserLikes(username, pageParam as number, 20);
      if (response.error) throw new Error(response.error);
      return response.data as Post[];
    },
    getNextPageParam: (lastPage, pages) => {
      return Array.isArray(lastPage) && lastPage.length === 20 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1 as number,
    enabled: !!username && enabled,
  });

  const posts = data?.pages.flat() || [];

  return {
    posts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
