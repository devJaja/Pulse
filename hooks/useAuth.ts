import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { storage } from '@/lib/storage';
import { useWalletStore } from '@/store/useWalletStore';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

interface SignupData {
  email: string;
  password: string;
  username: string;
}

interface SigninData {
  email: string;
  password: string;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  walletAddress: string;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  tempEmail?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface VerifyResponse {
  message: string;
  user: User;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await storage.getToken();
      if (!token) return null;
      
      api.setToken(token);
      const { data, error, status } = await api.getProfile();
      
      if (data) {
        await storage.saveUser(data);
        return data;
      }

      // Only wipe the session on a definitive auth failure (401/403).
      // Network blips / server errors must NOT log the user out.
      if (status === 401 || status === 403 || String(error || '').toLowerCase().includes('unauthorized') || String(error || '').toLowerCase().includes('invalid token')) {
        await storage.clear();
        api.clearToken();
        return null;
      }

      // Transient failure: keep the session alive using the cached user.
      const cachedUser = await storage.getUser();
      return cachedUser ?? null;
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      // Create (or reuse) the self-custody wallet on this device BEFORE the
      // account exists, then bind it to the account via walletAddress.
      const wallet = await useWalletStore.getState().createWallet();
      const response = await api.signup(data.email, data.password, data.username, wallet.address);
      if (response.error) throw new Error(response.error);
      return response.data as AuthResponse;
    },
    onSuccess: async (data) => {
      await storage.saveToken(data.token);
      await storage.saveUser({ ...data.user, tempEmail: data.user.email });
      api.setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Account created! Check your email for verification code');
      router.push('/auth/verify');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Signin mutation
  const signinMutation = useMutation({
    mutationFn: async (data: SigninData) => {
      const response = await api.signin(data.email, data.password);
      if (response.error) throw new Error(response.error);
      return response.data as AuthResponse;
    },
    onSuccess: async (data) => {
      // If 2FA is enabled, redirect to 2FA verification
      const payload = data as unknown as { requires2FA?: boolean; tempToken?: string; email?: string };
      if (payload.requires2FA) {
        toast.info('Enter your authenticator code');
        router.push({
          pathname: '/auth/2fa-verify',
          params: { email: payload.email, tempToken: payload.tempToken },
        });
        return;
      }

      await storage.saveToken(data.token);
      await storage.saveUser(data.user);
      api.setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      toast.success('Welcome back!');
      router.replace('/(tabs)/feed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      const response = await api.verifyEmail(data.email, data.code);
      if (response.error) throw new Error(response.error);
      return response.data as VerifyResponse;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(['user'], data.user);
      toast.success('Email verified! Let us show you your recovery phrase');
      router.replace('/auth/backup-phrase');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Resend code mutation
  const resendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.resendCode(email);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Verification code sent!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Logout
  const logout = async () => {
    await storage.clear();
    api.clearToken();
    queryClient.clear();
    router.replace('/auth/signin');
    toast.success('Logged out successfully');
  };

  const isFirstTimeUser = () => {}

  const setIsFirstTimeUser = () =>{}

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    signin: signinMutation.mutate,
    isSigningIn: signinMutation.isPending,
    verifyEmail: verifyEmailMutation.mutate,
    isVerifying: verifyEmailMutation.isPending,
    resendCode: resendCodeMutation.mutate,
    isResending: resendCodeMutation.isPending,
    logout,
  };
}
