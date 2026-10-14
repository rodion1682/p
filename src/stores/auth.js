// stores/auth.js
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import { useUserStore } from './user'
import { useCartStore } from './cart'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('auth_session'),
    emailVerified: false,
    authCheckedOnce: false, // Flag to track if auth has been verified with server
  }),

  actions: {
    async getCsrfToken() {
      try {
        await axios({
          baseURL: import.meta.env.VITE_DOMAIN,
          url: '/sanctum/csrf-cookie',
          method: 'GET',
        })
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
        throw error // Re-throw so calling actions can handle failure
      }
    },

    clearError() {
      this.error = null
    },

    // Helper method to clear all auth-related state
    clearAuthState() {
      // Update store state
      this.isAuthenticated = false
      this.emailVerified = false
      this.authCheckedOnce = false // Reset the auth check flag

      // Clear localStorage auth data
      localStorage.removeItem('auth_session')
      localStorage.removeItem('token')

      // Reset related stores
      const userStore = useUserStore()
      userStore.$reset()

      const cartStore = useCartStore()
      cartStore.$reset()
    },

    async checkAuth() {
      this.isLoading = true
      try {
        const response = await axios.get('/auth/me')

        if (response.statusText === 'OK') {
          // User is authenticated according to the server
          this.isAuthenticated = true
          this.emailVerified = response.data.emailVerified
          localStorage.setItem('auth_session', 'true')
        } else {
          // Error response from server
          this.clearAuthState()
        }
        this.authCheckedOnce = true // Mark as checked
      } catch (error) {
        // Network error or other issues
        this.clearAuthState()
        console.error('Error checking auth status:', error)
      } finally {
        this.isLoading = false
      }
    },

    async login(username, password) {
      this.clearError()
      this.isLoading = true

      try {
        // Fetch CSRF token before login
        // await this.getCsrfToken()
        const response = await axios.post('/auth/login', {
          nickname: username,
          password,
        })
        if (response.statusText === 'OK') {
          this.isAuthenticated = true
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('auth_session', 'true')
          return response.data
        } else {
          throw new Error(response.data.message)
        }
      } catch (err) {
        this.error =
          err.response?.data?.message || err.message || 'Authentication failed'
        throw this.error
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.clearError()
      this.isLoading = true

      try {
        // Fetch CSRF token before register
        // await this.getCsrfToken()

        const response = await axios.post('/auth/register', {
          email: userData.email,
          nickname: userData.username,
          password: userData.password,
          passConfirm: userData.passConfirm,
        })
        if (response.statusText === 'Created') {
          this.isAuthenticated = true
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('auth_session', 'true')
          return response.data
        } else {
          throw new Error(response.data.message)
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.clearError()
      this.isLoading = true

      try {
        await axios.post('/logout') // Optional API logout
      } catch (err) {
        this.error = err.response?.data?.message || 'Logout failed'
      } finally {
        this.clearAuthState()
        this.isLoading = false
      }
    },
  },
})
