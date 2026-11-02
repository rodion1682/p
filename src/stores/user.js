import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'
import { useSettingsStore } from './settings'

export const useUserStore = defineStore('user', () => {
  const settingsStore = useSettingsStore()
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const name = computed(() => user.value?.name || '')
  const steamID = computed(() => user.value?.steam_id || '')
  const avatar = computed(() => user.value?.avatar || '')
  const balance = computed(() => user.value?.balance ?? 0)
  const balanceInternal = computed(() => user.value?.balance_internal ?? 0)
  const userBalance = computed(() =>
    settingsStore.creditsEnabled ? balanceInternal.value : balance.value,
  )
  const payoutBalance = computed(() => user.value?.payout_balance ?? 0)
  const payoutBalanceInternal = computed(
    () => user.value?.payout_balance_internal ?? 0,
  )

  const isProfileLoaded = computed(() => !!user.value)

  const clearError = () => {
    error.value = null
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
      const response = await axios.get('/user/profile')

      if (response.data.status === 'OK') {
        user.value = response.data.payload
        return response.data.payload
      }

      throw new Error(response.data.message || 'Failed to fetch profile')
    } catch (err) {
      user.value = null
      error.value =
        err.response?.data?.message || err.message || 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const $reset = () => {
    user.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    user,
    isLoading,
    error,

    name,
    steamID,
    avatar,
    balance,
    balanceInternal,
    userBalance,
    payoutBalance,
    payoutBalanceInternal,
    isProfileLoaded,

    fetchProfile,
    clearError,
    $reset,
  }
})
