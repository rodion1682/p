// stores/auth.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('auth_session'),
    emailVerified: false,
    authCheckedOnce: false,
    sessionExpired: false,
  }),

  getters: {
    steamAuthUrl: () => {
      const domain = import.meta.env.VITE_DOMAIN?.replace(/\/+$/, '') || ''
      return `${domain}/auth/steam/redirect`
    },
  },

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
      this.sessionExpired = false // Reset session expired flag

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
        const response = await axios.get('/user/is-auth', {
          withCredentials: true,
        })

        if (response.data.status === 'OK' && response.data.authenticated) {
          this.isAuthenticated = true
          localStorage.setItem('auth_session', 'true')
        } else {
          const loggedIn = await this.localTestLogin()
          if (!loggedIn) {
            this.clearAuthState()
          }
        }

        this.authCheckedOnce = true
      } catch (error) {
        this.clearAuthState()
        console.error('Error checking auth status:', error)
      } finally {
        this.isLoading = false
      }
    },

    async localTestLogin() {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'

      if (!isLocal) return false

      try {
        const response = await axios.post('/user/fake-login')

        if (response.data.status === 'OK') {
          this.isAuthenticated = true
          localStorage.setItem('auth_session', 'true')

          if (response.data.token) {
            localStorage.setItem('token', response.data.token)
          }

          return true
        }
      } catch (error) {
        console.error('Local test login failed:', error)
      }

      return false
    },

    async login(email, password) {
      this.clearError()
      this.isLoading = true

      try {
        // Fetch CSRF token before login
        await this.getCsrfToken()
        const response = await axios.post('/login', {
          username: email,
          password,
        })

        if (response.data.status === 'OK') {
          this.isAuthenticated = true
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
        await this.getCsrfToken()

        const response = await axios.post('/register', {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          phone: userData.phone,
          phoneE164: userData.phoneE164,
          password: userData.password,
          passConfirm: userData.passConfirm,
        })

        if (response.data.status === 'OK') {
          this.isAuthenticated = true
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
