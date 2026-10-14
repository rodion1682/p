// stores/purchase.js
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import { useUserStore } from './user'
import { useCartStore } from './cart'
import { usePromoCodeStore } from './promocode'

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    isLoading: false,
    error: null,
    purchaseHistory: [],
    currentPurchase: null,
  }),

  actions: {
    async purchaseCartItems(purchaseData) {
      try {
        this.isLoading = true
        this.error = null

        const promoCodeStore = usePromoCodeStore()

        const response = await axios.post('/cart/checkout-external', {
          ...purchaseData,
          country_id: purchaseData.country,
          promocode: promoCodeStore.currentPromo?.code || null,
        })

        if (response.statusText === 'OK') {
          // Only refresh user balance and cart if it was a balance payment (no redirect_url)
          if (!response.data.redirect_url) {
            const userStore = useUserStore()
            const cartStore = useCartStore()

            await Promise.all([
              userStore.fetchProfile(),
              cartStore.fetchCartContent(),
            ])
          }

          // Return success status and any redirect_url
          return {
            success: true,
            balance: response.data.balance,
            redirect_url: response.data.redirect_url,
          }
        }

        throw new Error(response.data.message || 'Purchase failed')
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async purchaseCartItemsFromBalance() {
      try {
        this.isLoading = true
        this.error = null

        const response = await axios.post('/cart/checkout')

        if (response.statusText === 'OK') {
          // Only refresh user balance and cart if it was a balance payment (no redirect_url)
          if (!response.data.redirect_url) {
            const userStore = useUserStore()
            const cartStore = useCartStore()

            await Promise.all([
              userStore.fetchProfile(),
              cartStore.fetchCartContent(),
            ])
          }

          // Return success status and any redirect_url
          return {
            success: true,
            balance: response.data.balance,
            redirect_url: response.data.redirect_url,
          }
        }

        throw new Error(response.data.message || 'Purchase failed')
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async buyPack(packId) {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.post('/purchase/pack', {
          pack_id: packId,
        })

        if (response.statusText === 'OK') {
          // Optionally refresh user balance after successful purchase
          const userStore = useUserStore()
          await userStore.fetchProfile()
          return true
        }
        return false
      } catch (error) {
        this.error = error.response?.data?.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async buyPrompt(promptId) {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.post('/purchase/prompt', {
          prompt_id: promptId,
        })

        if (response.statusText === 'OK') {
          // Optionally refresh user balance after successful purchase
          const userStore = useUserStore()
          userStore.fetchProfile()
          return true
        }
        return false
      } catch (error) {
        this.error = error.response?.data?.message || 'Purchase failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchPurchaseHistory() {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.get('/transactions/orders')

        if (response.statusText === 'OK') {
          this.purchaseHistory = response.data.payload.map(purchase => ({
            ...purchase,
            // Convert timestamp to Date object for easier handling
            createdAt: new Date(purchase.created_at * 1000),
            // Format image URL
            imageUrl: purchase.image_url,
          }))
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch purchase history'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Helper to clear any errors
    clearError() {
      this.error = null
    },
  },

  getters: {
    // Get formatted purchase history with date formatting
    formattedPurchaseHistory: state => {
      return state.purchaseHistory.map(purchase => ({
        ...purchase,
        formattedDate: purchase.createdAt.toLocaleDateString(),
        formattedTime: purchase.createdAt.toLocaleTimeString(),
        formattedAmount: `${purchase.sum} EUR`,
      }))
    },

    // Get purchases grouped by date
    purchasesByDate: state => {
      const grouped = {}
      state.purchaseHistory.forEach(purchase => {
        const date = purchase.createdAt.toLocaleDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(purchase)
      })
      return grouped
    },
  },
})
