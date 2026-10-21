import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
import { useCartStore } from './cart'
import { useUserStore } from './user'

const AUTH_SESSION_KEY = 'auth_session'
const AUTH_TOKEN_KEY = 'token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false,
    error: null,
    isAuthenticated: Boolean(localStorage.getItem(AUTH_SESSION_KEY)),
    emailVerified: false,
    authCheckedOnce: false,
  }),

  actions: {
    clearError() {
      this.error = null
    },

    async getCsrfToken() {
      try {
        await axios({
          baseURL: import.meta.env.VITE_DOMAIN,
          url: '/sanctum/csrf-cookie',
          method: 'GET',
        })
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
        throw error
      }
    },

    setAuthenticatedSession(token = null, emailVerified = false) {
      this.isAuthenticated = true
      this.emailVerified = Boolean(emailVerified)
      this.authCheckedOnce = true

      localStorage.setItem(AUTH_SESSION_KEY, 'true')

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      }
    },

    clearAuthState() {
      this.isAuthenticated = false
      this.emailVerified = false
      this.authCheckedOnce = true

      localStorage.removeItem(AUTH_SESSION_KEY)
      localStorage.removeItem(AUTH_TOKEN_KEY)

      const userStore = useUserStore()
      const cartStore = useCartStore()

      userStore.$reset()
      cartStore.$reset()
    },

    async checkAuth() {
      this.isLoading = true

      try {
        const response = await axios.get('/auth/me')

        if (response.status >= 200 && response.status < 300) {
          this.setAuthenticatedSession(
            response.data?.token || null,
            response.data?.emailVerified,
          )

          return true
        }

        this.clearAuthState()
        return false
      } catch (error) {
        this.clearAuthState()

        if (error?.response?.status !== 401) {
          console.error('Error checking auth status:', error)
        }

        return false
      } finally {
        this.authCheckedOnce = true
        this.isLoading = false
      }
    },

    async login(username, password) {
      this.clearError()
      this.isLoading = true

      try {
        const response = await axios.post('/auth/login', {
          nickname: username,
          password,
        })

        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.data?.message || 'Authentication failed')
        }

        const token = response.data?.token

        if (!token) {
          throw new Error('Authentication token was not returned')
        }

        this.setAuthenticatedSession(token, response.data?.emailVerified)

        return response.data
      } catch (err) {
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          'Authentication failed'

        throw err
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.clearError()
      this.isLoading = true

      try {
        const response = await axios.post('/auth/register', {
          email: userData.email,
          nickname: userData.username,
          password: userData.password,
          passConfirm: userData.passConfirm,
        })

        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.data?.message || 'Registration failed')
        }

        const token = response.data?.token

        if (token) {
          this.setAuthenticatedSession(token, response.data?.emailVerified)
        }

        return response.data
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Registration failed'

        throw err
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.clearError()
      this.isLoading = true

      try {
        await axios.post('/logout')
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Logout failed'

        console.error('Logout request failed:', err)
      } finally {
        this.clearAuthState()
        this.isLoading = false
      }
    },
  },
})
