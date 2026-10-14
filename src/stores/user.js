import axios from '@/plugins/axios'
import { formatDate } from '@/utils/formatters'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const avatars = ref([])
  const isLoading = ref(false)
  const isAvatarsLoading = ref(false)
  const isAvatarUpdating = ref(false)
  const error = ref(null)

  // Getters
  const fullName = computed(() => {
    if (!user.value) return ''

    return `${user.value.name || ''} ${user.value.surname || ''}`.trim()
  })

  const nickName = computed(() => {
    return user.value?.nickname || ''
  })

  const firstName = computed(() => {
    return user.value?.name || ''
  })

  const lastName = computed(() => {
    return user.value?.surname || ''
  })

  const joinDate = computed(() =>
    formatDate(user.value?.created_at, 'MMM D, YYYY'),
  )

  const userEmail = computed(() => {
    return user.value?.email
  })

  const userPhone = computed(() => {
    return user.value?.phone
  })

  const userBalance = computed(() => {
    return user.value?.balance
  })

  const storedAvatarId = computed(() => {
    const value = localStorage.getItem('selected_avatar_id')

    if (!value) {
      return null
    }

    return value
  })

  const userAvatarId = computed(() => {
    return (
      user.value?.avatar_id ??
      user.value?.avatarId ??
      user.value?.avatar?.id ??
      storedAvatarId.value ??
      null
    )
  })

  const userAvatarUrl = computed(() => {
    /*
     * First priority:
     * URL returned directly by the profile API.
     */
    const directAvatarUrl =
      user.value?.avatar_url ||
      user.value?.avatarUrl ||
      user.value?.avatar?.url ||
      user.value?.avatar?.image ||
      user.value?.avatar?.image_url ||
      null

    if (directAvatarUrl) {
      return directAvatarUrl
    }

    /*
     * Second priority:
     * Find the current avatar by its ID inside
     * the avatars loaded from GET /avatars.
     */
    if (userAvatarId.value && avatars.value.length) {
      const selectedAvatar = avatars.value.find(avatar => {
        return String(avatar?.id) === String(userAvatarId.value)
      })

      if (selectedAvatar) {
        return (
          selectedAvatar.url ||
          selectedAvatar.avatar_url ||
          selectedAvatar.image ||
          selectedAvatar.image_url ||
          ''
        )
      }
    }

    /*
     * Final server fallback:
     * avatar ID 1.
     *
     * This does NOT update the backend.
     * It is only used visually when no saved avatar
     * is available at all.
     */
    if (avatars.value.length) {
      const defaultAvatar = avatars.value.find(avatar => {
        return String(avatar?.id) === '1'
      })

      if (defaultAvatar) {
        return (
          defaultAvatar.url ||
          defaultAvatar.avatar_url ||
          defaultAvatar.image ||
          defaultAvatar.image_url ||
          ''
        )
      }
    }

    return ''
  })

  const userCountry = computed(() => {
    return user.value?.country?.name || ''
  })

  const userCity = computed(() => {
    return user.value?.city || ''
  })

  const userAddress = computed(() => {
    return user.value?.address || ''
  })

  const userPostCode = computed(() => {
    return user.value?.post_code || ''
  })

  const heroLevel = computed(() => {
    return user.value?.hero_level || ''
  })

  // Actions
  const clearError = () => {
    error.value = null
  }

  const saveAvatarIdLocally = avatarId => {
    if (!avatarId) {
      localStorage.removeItem('selected_avatar_id')
      return
    }

    localStorage.setItem('selected_avatar_id', String(avatarId))
  }

  const syncStoredAvatarFromProfile = () => {
    const profileAvatarId =
      user.value?.avatar_id ??
      user.value?.avatarId ??
      user.value?.avatar?.id ??
      null

    if (profileAvatarId) {
      saveAvatarIdLocally(profileAvatarId)
    }
  }

  const fetchProfile = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      user.value = null
      return null
    }

    clearError()
    isLoading.value = true

    try {
      const response = await axios.get('/auth/me')

      user.value = response.data

      syncStoredAvatarFromProfile()

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch profile'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAvatars = async () => {
    clearError()
    isAvatarsLoading.value = true

    try {
      const response = await axios.get('/avatars')

      /*
       * Support several common response shapes:
       *
       * [
       *   { id, url }
       * ]
       *
       * or:
       *
       * {
       *   data: [...]
       * }
       *
       * or:
       *
       * {
       *   avatars: [...]
       * }
       */
      if (Array.isArray(response.data)) {
        avatars.value = response.data
      } else if (Array.isArray(response.data?.data)) {
        avatars.value = response.data.data
      } else if (Array.isArray(response.data?.avatars)) {
        avatars.value = response.data.avatars
      } else {
        avatars.value = []
      }

      return avatars.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch avatars'

      throw err
    } finally {
      isAvatarsLoading.value = false
    }
  }

  const updateAvatar = async avatarId => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return null
    }

    if (!avatarId) {
      return null
    }

    clearError()
    isAvatarUpdating.value = true

    try {
      /*
       * Save through the existing backend functionality.
       */
      const response = await axios.patch('/players/me/avatar', {
        avatar_id: avatarId,
      })

      /*
       * Remember it immediately on the frontend.
       *
       * This prevents the UI from jumping back to avatar 1
       * while /auth/me is being refreshed.
       */
      saveAvatarIdLocally(avatarId)

      /*
       * Optimistically update the current user object too.
       */
      if (user.value) {
        user.value = {
          ...user.value,
          avatar_id: avatarId,
        }
      }

      /*
       * If the update endpoint returned updated user/profile data,
       * merge it into the existing user object.
       */
      const updatedUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        null

      if (
        updatedUser &&
        typeof updatedUser === 'object' &&
        !Array.isArray(updatedUser)
      ) {
        user.value = {
          ...(user.value || {}),
          ...updatedUser,
        }
      }

      /*
       * Refresh profile so the backend remains
       * the final source of truth.
       */
      await fetchProfile()

      /*
       * Important:
       * If /auth/me does not expose avatar_id,
       * keep the ID selected by the user.
       */
      const refreshedAvatarId =
        user.value?.avatar_id ??
        user.value?.avatarId ??
        user.value?.avatar?.id ??
        null

      if (!refreshedAvatarId && user.value) {
        user.value = {
          ...user.value,
          avatar_id: avatarId,
        }

        saveAvatarIdLocally(avatarId)
      }

      return user.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update avatar'

      throw err
    } finally {
      isAvatarUpdating.value = false
    }
  }

  const initializeAvatar = async () => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    /*
     * Load the available avatars if they are
     * not already in memory.
     */
    if (!avatars.value.length) {
      try {
        await fetchAvatars()
      } catch (err) {
        console.error('Failed to initialize avatars:', err)
      }
    }

    /*
     * Do NOT PATCH avatar 1 automatically.
     *
     * If there is no saved avatar, userAvatarUrl
     * will visually use server avatar 1 as fallback.
     */
  }

  const updateProfile = async profileData => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true

    try {
      await axios.patch('/players/me/profile', profileData)

      await fetchProfile()
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async passwordData => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      return
    }

    clearError()
    isLoading.value = true

    try {
      await axios.post('/auth/change-password', passwordData)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update password'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async email => {
    clearError()
    isLoading.value = true

    try {
      await axios.post('/auth/forgot-password', {
        email,
      })
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reset password'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reset = async (token, email, password) => {
    clearError()
    isLoading.value = true

    try {
      await axios.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: password,
      })
    } catch (err) {
      error.value =
        err.response?.data?.message || 'Failed to reset the password'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const $reset = () => {
    user.value = null
    avatars.value = []
    error.value = null
    isLoading.value = false
    isAvatarsLoading.value = false
    isAvatarUpdating.value = false

    localStorage.removeItem('selected_avatar_id')
  }

  return {
    // State
    user,
    avatars,
    isLoading,
    isAvatarsLoading,
    isAvatarUpdating,
    error,

    // Getters
    nickName,
    fullName,
    firstName,
    lastName,
    userEmail,
    userPhone,
    joinDate,
    userBalance,
    userAvatarId,
    userAvatarUrl,
    userCountry,
    userCity,
    userAddress,
    userPostCode,
    heroLevel,

    // Actions
    fetchProfile,
    fetchAvatars,
    updateAvatar,
    initializeAvatar,
    updateProfile,
    updatePassword,
    resetPassword,
    clearError,
    reset,
    $reset,
  }
})
