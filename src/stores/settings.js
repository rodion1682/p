// stores/settings.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null,
    loading: false,
    error: null,
    googleTagLoaded: false,
  }),

  getters: {
    requisites: state => state.settings?.requisites || '',
    supportEmail: state => state.settings?.support_email || '',
    supportPhone: state => state.settings?.support_phone || '',

    companyName: state => state.settings?.company_name || '',
    companyRegNumber: state => state.settings?.company_reg_number || '',
    companyAddress: state => state.settings?.company_address || '',

    copyright: state => state.settings?.copyright || '',
    isRegistrationEnabled: state => state.settings?.is_reg_enabled ?? false,

    minOrderAmount: state => state.settings?.min_order_amount ?? 0,
    maxOrderAmount: state => state.settings?.max_order_amount ?? 0,
    minTopUpAmount: state => state.settings?.min_topup_amount ?? 0,

    paymentMethods: state => state.settings?.payment_methods || [],

    serverIP: state => state.settings?.game_server?.host || '',
    serverPort: state => state.settings?.game_server?.port || '',

    creditsEnabled: state => state.settings?.credits_enabled ?? false,
    creditsConversionRate: state =>
      state.settings?.credits_conversion_rate ?? 1,

    payoutEnabled: state => state.settings?.payout_enabled ?? false,
    canSellItems: state => {
      return (
        state.settings?.payout_enabled === true &&
        Array.isArray(state.settings?.payout_methods) &&
        state.settings.payout_methods.length > 0
      )
    },
  },

  actions: {
    async fetchSettings() {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get('/settings')

        if (data.status !== 'OK' || !data.payload) {
          throw new Error(data.message || 'Invalid settings response')
        }

        this.settings = data.payload
        this.injectGoogleTag()
        return data.payload
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch settings'

        console.error('Error fetching settings:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    injectGoogleTag() {
      if (this.googleTagLoaded || !this.settings?.google_tag) return

      const container = document.createElement('div')
      container.innerHTML = this.settings.google_tag

      Array.from(container.children).forEach(child => {
        if (child.tagName !== 'SCRIPT') return

        const script = document.createElement('script')

        Array.from(child.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value)
        })

        script.text = child.textContent
        document.head.appendChild(script)
      })

      this.googleTagLoaded = true
    },

    $reset() {
      this.settings = null
      this.loading = false
      this.error = null
      this.googleTagLoaded = false
    },
  },
})
