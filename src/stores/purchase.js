// stores/purchase.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { usePromoCodeStore } from './promocode'
import { useUserStore } from './user'

const normalizeCount = value => {
  const count = Number(value)
  return Number.isFinite(count) && count >= 1 ? count : 1
}

export const usePurchaseStore = defineStore('purchase', {
  state: () => ({
    isLoading: false,
    error: null,
    purchaseHistory: [],
    currentPurchase: null,
  }),

  actions: {
    async purchaseCartItems(purchaseData) {
      const promoCodeStore = usePromoCodeStore()
      const cartStore = useCartStore()

      this.isLoading = true
      this.error = null

      try {
        const cartPayload = (cartStore.items || []).map(row => ({
          item_id: row.item_id,
          product_id: row.item_id,
          qty: normalizeCount(row.count),
          quantity: normalizeCount(row.count),
          count: normalizeCount(row.count),
          price: Number(row.price || 0),
        }))

        const response = await axios.post('/cart/purchase', {
          first_name: purchaseData.name,
          last_name: purchaseData.surname,
          email: purchaseData.email,
          phone: purchaseData.phone,
          country_id: purchaseData.country,
          city: purchaseData.city,
          address: purchaseData.address,
          zip: purchaseData.postCode,
          paymentType:
            purchaseData.paymentType || purchaseData.paymentMethod || 'card',
          promocode: promoCodeStore.currentPromo?.code || null,
          cart: cartPayload,
        })

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Purchase failed')
        }

        if (!response.data.redirect_url) {
          const userStore = useUserStore()

          await Promise.all([
            userStore.fetchProfile?.(),
            cartStore.fetchCartContent?.(),
          ])
        }

        return {
          success: true,
          balance: response.data.balance,
          redirect_url: response.data.redirect_url,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Purchase failed'

        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.isLoading = false
      }
    },

    async buyPack(packId) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post('/purchase/pack', {
          pack_id: packId,
        })

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Purchase failed')
        }

        const userStore = useUserStore()
        await userStore.fetchProfile?.()

        return true
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Purchase failed'

        return false
      } finally {
        this.isLoading = false
      }
    },

    async buyPrompt(promptId) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post('/purchase/prompt', {
          prompt_id: promptId,
        })

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Purchase failed')
        }

        const userStore = useUserStore()
        await userStore.fetchProfile?.()

        return true
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Purchase failed'

        return false
      } finally {
        this.isLoading = false
      }
    },

    async fetchPurchaseHistory() {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get('/orders/history')

        this.purchaseHistory = Array.isArray(response.data?.data)
          ? response.data.data
          : []

        return this.purchaseHistory
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch purchase history'

        return []
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },
  },

  getters: {
    formattedPurchaseHistory: state => state.purchaseHistory,

    purchasesByDate: state => {
      const grouped = {}

      state.purchaseHistory.forEach(purchase => {
        const date = purchase.date || 'Unknown'

        if (!grouped[date]) grouped[date] = []
        grouped[date].push(purchase)
      })

      return grouped
    },
  },
})
