import axios from 'axios'
import { toast } from 'vue3-toastify'

import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useCurrencyStore } from '@/stores/currency'
import { useLanguageStore } from '@/stores/language'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  timeout: 6000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/sanctum/csrf-cookie',
]

const isAuthEndpoint = url => {
  if (typeof url !== 'string') {
    return false
  }

  try {
    const pathname = new URL(url, 'http://localhost').pathname.replace(
      /\/+$/,
      '',
    )

    return AUTH_ENDPOINTS.some(endpoint => {
      return pathname === endpoint || pathname.endsWith(endpoint)
    })
  } catch {
    return false
  }
}

let isHandlingUnauthorized = false

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    if (!config.noParams) {
      const currencyStore = useCurrencyStore()
      const languageStore = useLanguageStore()

      if (config.method === 'get') {
        config.params = {
          ...config.params,
          currency: currencyStore.currentCurrencyCode,
          lang_id: languageStore.currentLanguageId,
        }
      } else if (['post', 'put'].includes(config.method)) {
        config.data = {
          ...config.data,
          currency: currencyStore.currentCurrencyCode,
          lang_id: languageStore.currentLanguageId,
        }
      }
    }

    return config
  },
  error => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  response => response,

  async error => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''

    if (status === 401) {
      // Login, registration, and session-check failures
      // must be handled by their own callers.
      if (isAuthEndpoint(requestUrl)) {
        return Promise.reject(error)
      }

      const authStore = useAuthStore()

      if (!isHandlingUnauthorized && authStore.isAuthenticated) {
        isHandlingUnauthorized = true

        try {
          const currentRoute = router.currentRoute.value

          const redirectTo = currentRoute.meta.requiresAuth
            ? currentRoute.fullPath
            : null

          // Clear local state only. Do not call the logout API
          // from inside an unauthorized-response handler.
          authStore.clearAuthState()

          if (redirectTo) {
            toast.error('Your session has expired. Please log in again.', {
              autoClose: 3000,
            })

            await router.push({
              path: '/login',
              query: {
                redirect: redirectTo,
              },
            })
          }
        } catch (navigationError) {
          console.error(
            'Failed to handle expired authentication:',
            navigationError,
          )
        } finally {
          isHandlingUnauthorized = false
        }
      }
    }

    if (
      status === 403 &&
      error?.response?.data?.message === 'Your email address is not verified.'
    ) {
      toast.error('Please verify your email address before continuing.', {
        autoClose: 3000,
      })

      // No redirect until EmailVerificationPage
      // is restored in the router.
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
