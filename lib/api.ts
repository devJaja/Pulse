const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pulse-jzjb.onrender.com/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const message = (data && data.message) || 'Something went wrong';
        return {
          error: Array.isArray(message) ? message.join(', ') : message,
          status: response.status,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== Auth ====================
  async signup(email: string, password: string, username: string, walletAddress?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, walletAddress }),
    });
  }

  async signin(email: string, password: string) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendCode(email: string) {
    return this.request('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // ==================== Users ====================
  async updateProfile(data: { name?: string; bio?: string; avatar?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateLanguage(language: string) {
    return this.request('/users/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  }

  async getUserByUsername(username: string) {
    return this.request(`/users/username/${username}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async searchUsers(query: string, limit: number = 20) {
    return this.request(`/users?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async searchPosts(query: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async searchTokens(query: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/search/tokens?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // ==================== Posts ====================
  async createPost(data: { 
    content: string; 
    images?: string[]; 
    isTokenized?: boolean;
    tokenSupply?: number;
    tokenPrice?: number;
  }) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeed(page: number = 1, limit: number = 20) {
    return this.request(`/posts/feed?page=${page}&limit=${limit}`);
  }

  async getUserPosts(username: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/user/${username}?page=${page}&limit=${limit}`);
  }

  async getUserComments(username: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/user/${username}/comments?page=${page}&limit=${limit}`);
  }

  async getUserLikes(username: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/user/${username}/likes?page=${page}&limit=${limit}`);
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, { method: 'DELETE' });
  }

  async likePost(id: string) {
    return this.request(`/posts/${id}/like`, { method: 'POST' });
  }

  async unlikePost(id: string) {
    return this.request(`/posts/${id}/like`, { method: 'DELETE' });
  }

  async createComment(postId: string, content: string, parentCommentId?: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async getComments(postId: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  }

  async getReplies(commentId: string, page: number = 1, limit: number = 10) {
    return this.request(`/posts/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  }

  async likeComment(commentId: string) {
    return this.request(`/posts/comments/${commentId}/like`, { method: 'POST' });
  }

  async unlikeComment(commentId: string) {
    return this.request(`/posts/comments/${commentId}/like`, { method: 'DELETE' });
  }

  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10) {
    return this.request(`/posts/comments/${commentId}/replies?page=${page}&limit=${limit}`);
  }

  // ==================== Follows ====================
  async followUser(userId: string) {
    return this.request(`/follows/${userId}`, { method: 'POST' });
  }

  async unfollowUser(userId: string) {
    return this.request(`/follows/${userId}`, { method: 'DELETE' });
  }

  async getFollowers(userId?: string, page: number = 1, limit: number = 20) {
    const endpoint = userId 
      ? `/follows/followers/${userId}?page=${page}&limit=${limit}`
      : `/follows/followers?page=${page}&limit=${limit}`;
    return this.request(endpoint);
  }

  async getFollowing(userId?: string, page: number = 1, limit: number = 20) {
    const endpoint = userId
      ? `/follows/following/${userId}?page=${page}&limit=${limit}`
      : `/follows/following?page=${page}&limit=${limit}`;
    return this.request(endpoint);
  }

  async checkIfFollowing(userId: string) {
    return this.request(`/follows/check/${userId}`);
  }

  async getFollowStats(userId: string) {
    return this.request(`/follows/stats/${userId}`);
  }

  // ==================== Wallet ====================
  async getBalance() {
    return this.request('/wallet/balance');
  }
  async getSeekerBalance() {
    return this.request('/wallet/seeker-balance');
  }

  async getTransactions(page: number = 1, limit: number = 20) {
    return this.request(`/wallet/transactions?page=${page}&limit=${limit}`);
  }

  async sendMon(toAddress: string, amount: number, memo?: string) {
    return this.request('/wallet/send', {
      method: 'POST',
      body: JSON.stringify({ toAddress, amount, memo }),
    });
  }

  async exportLegacyKey() {
    return this.request('/wallet/export-key', {
      method: 'POST',
    });
  }

  async getTransactionDetails(signature: string) {
    return this.request(`/wallet/transactions/${signature}`);
  }

  // ==================== Chats ====================
  async createChat(participantId: string) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  }

  async getChats() {
    return this.request('/chats');
  }

  async getChat(chatId: string) {
    return this.request(`/chats/${chatId}`);
  }

  async getMessages(chatId: string, page: number = 1, limit: number = 50) {
    return this.request(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(chatId: string, content: string, type: string = 'text') {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async sendTip(chatId: string, amount: number) {
    return this.request(`/chats/${chatId}/tip`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async sendPrivateTip(chatId: string, amount: number) {
    return this.request(`/chats/${chatId}/private-tip`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getChatTipRewards(chatId: string) {
    return this.request(`/chats/${chatId}/tip-rewards`);
  }

  async claimChatTip(chatId: string) {
    return this.request(`/chats/${chatId}/claim-tip`, { method: 'POST' });
  }

  async markChatAsRead(chatId: string) {
    return this.request(`/chats/${chatId}/read`, { method: 'PUT' });
  }

  // ==================== Payments ====================
  async sendPayment(recipient: string, amount: number, memo?: string) {
    return this.request('/payments/send', {
      method: 'POST',
      body: JSON.stringify({ recipient, amount, memo }),
    });
  }

  async getPaymentHistory(page: number = 1, limit: number = 20) {
    return this.request(`/payments/history?page=${page}&limit=${limit}`);
  }

  async generatePaymentQR(amount?: number) {
    const endpoint = amount ? `/payments/qr?amount=${amount}` : '/payments/qr';
    return this.request(endpoint);
  }

  async requestPayment(fromUsername: string, amount: number, memo?: string) {
    return this.request('/payments/request', {
      method: 'POST',
      body: JSON.stringify({ fromUsername, amount, memo }),
    });
  }

  // ==================== Post Tokens ====================
  async buyPostToken(postId: string, amount: number) {
    return this.request(`/posts/${postId}/buy-token`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async tipPost(postId: string, amount: number, message?: string) {
    return this.request(`/posts/${postId}/tip`, {
      method: 'POST',
      body: JSON.stringify({ amount, message }),
    });
  }

  async getPostTips(postId: string, page: number = 1, limit: number = 20) {
    return this.request(`/posts/${postId}/tips?page=${page}&limit=${limit}`);
  }

  async getPostTipRewards(postId: string) {
    return this.request(`/posts/${postId}/tip-rewards`);
  }

  async claimPostTip(postId: string) {
    return this.request(`/posts/${postId}/claim-tip`, { method: 'POST' });
  }

  async getUserPortfolio(userId: string) {
    return this.request(`/posts/portfolio/${userId}`);
  }

  // ==================== Notifications ====================
  async getNotifications(page: number = 1, limit: number = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  async registerPushToken(pushToken: string) {
    return this.request('/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    });
  }

  // ==================== Upload ====================
  async uploadImage(image: string) {
    return this.request('/upload/image', {
      method: 'POST',
      body: JSON.stringify({ image }),
    });
  }

  async uploadImages(images: string[]) {
    return this.request('/upload/images', {
      method: 'POST',
      body: JSON.stringify({ images }),
    });
  }

  // ==================== Mini Apps ====================
  async playSpin(betAmount: number) {
    return this.request('/mini-apps/spin/play', {
      method: 'POST',
      body: JSON.stringify({ betAmount }),
    });
  }

  async playCoinFlip(betAmount: number, choice: 'heads' | 'tails') {
    return this.request('/mini-apps/coinflip/play', {
      method: 'POST',
      body: JSON.stringify({ betAmount, choice }),
    });
  }

  async playDice(betAmount: number, prediction: 'over' | 'under', targetNumber: number) {
    return this.request('/mini-apps/dice/play', {
      method: 'POST',
      body: JSON.stringify({ betAmount, prediction, targetNumber }),
    });
  }

  async swapTokens(
    fromToken: string, 
    toToken: string, 
    fromAmount: number,
    toAmount?: number,
    rate?: number,
    priceImpact?: number
  ) {
    return this.request('/mini-apps/swap', {
      method: 'POST',
      body: JSON.stringify({ 
        fromToken, 
        toToken, 
        fromAmount,
        toAmount,
        rate,
        priceImpact
      }),
    });
  }
  async getSwapHistory(page: number = 1, limit: number = 20) {
    return this.request(`/mini-apps/swap/history?page=${page}&limit=${limit}`);
  }

  async getAirdropStatus() {
    return this.request('/mini-apps/airdrop/status');
  }

  async claimAirdrop() {
    return this.request('/mini-apps/airdrop/claim', {
      method: 'POST',
    });
  }

  // ==================== Health ====================
  async checkHealth() {
    return this.request('/health');
  }

  async checkDetailedHealth() {
    return this.request('/health/detailed');
  }

  // ==================== Two-Factor Authentication ====================
  async setup2FA(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return this.request('/auth/2fa/setup', {
      method: 'POST',
    });
  }

  async verify2FA(data: { code: string }): Promise<ApiResponse<{ success: boolean; recoveryCodes?: string[] }>> {
    return this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async disable2FA(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/auth/2fa/disable', {
      method: 'POST',
    });
  }

  async verify2FALogin(data: { email: string; tempToken: string; code: string; isRecoveryCode: boolean }): Promise<ApiResponse<{ token: string; user: { id: string; email: string; username: string } }>> {
    return this.request('/auth/2fa/verify-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resend2FACode(data: { email: string }) {
    return this.request('/auth/2fa/resend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Password Recovery ====================
  async requestPasswordReset(data: { email: string }) {
    return this.request('/auth/password/reset-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { token: string; password: string }) {
    // Backend expects { token (6-digit code), password }
    return this.request('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}

export const api = new ApiClient();
