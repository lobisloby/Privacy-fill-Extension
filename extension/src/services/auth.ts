// ============================================
// AUTHENTICATION SERVICE
// ============================================

import type { User } from '@/types';
import { storage } from '@/utils/storage';
import { GOOGLE_CLIENT_ID, API_BASE_URL } from '@/utils/constants';

class AuthService {
  // ============================================
  // GOOGLE SIGN IN
  // ============================================

  async signInWithGoogle(): Promise<User> {
    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUrl);
      authUrl.searchParams.set('response_type', 'token');
      authUrl.searchParams.set('scope', 'email profile');
      authUrl.searchParams.set('prompt', 'select_account');

      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl.toString(),
        interactive: true
      });

      if (!responseUrl) {
        throw new Error('Authentication cancelled');
      }

      // Parse access token from response
      const url = new URL(responseUrl);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Get user info from Google
      const userInfo = await this.getUserInfo(accessToken);
      
      const user: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        createdAt: new Date().toISOString()
      };

      // Save user to storage
      await storage.setUser(user);

      // Register user with backend
      await this.registerUser(user);

      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // ============================================
  // GET USER INFO FROM GOOGLE
  // ============================================

  private async getUserInfo(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
  }> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    return response.json();
  }

  // ============================================
  // REGISTER USER WITH BACKEND
  // ============================================

  private async registerUser(user: User): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/registerUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name
        })
      });

      if (!response.ok) {
        console.error('Failed to register user with backend');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      // Don't throw - user can still use the app
    }
  }

  // ============================================
  // SIGN OUT
  // ============================================

  async signOut(): Promise<void> {
    await storage.removeUser();
    await storage.remove('subscription');
    
    // Optionally clear cached auth tokens
    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      await chrome.identity.launchWebAuthFlow({
        url: `https://accounts.google.com/logout?continue=${encodeURIComponent(redirectUrl)}`,
        interactive: false
      });
    } catch {
      // Ignore errors when clearing tokens
    }
  }

  // ============================================
  // GET CURRENT USER
  // ============================================

  async getCurrentUser(): Promise<User | null> {
    return storage.getUser();
  }

  // ============================================
  // CHECK AUTH STATUS
  // ============================================

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}

export const authService = new AuthService();
export default authService;