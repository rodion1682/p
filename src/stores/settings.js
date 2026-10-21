// stores/settings.js
import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useCurrencyStore } from './currency'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null,
    loading: false,
    error: null,
  }),

  getters: {
    requisites: state => state.settings?.requisites,
    supportEmail: state => state.settings?.support_email,
    isRegistrationEnabled: state => state.settings?.is_reg_enabled ?? false,
    minTopUpAmount: state => {
      const currencyStore = useCurrencyStore()
      const baseAmount = state.settings?.min_top_up ?? 0
      return baseAmount * (currencyStore.currentCurrency?.value ?? 1)
    },
    vatPercent: state => state.settings?.vat_percent ?? 0,
    paymentMethods: state => state.settings?.payment_methods ?? [],
  },

  actions: {
    async fetchSettings() {
      try {
        this.loading = true
        this.error = null
        const { data } = await axios.get('/settings')

        if (data.status === 'OK' && data.payload) {
          this.settings = data.payload

          // --- GOOGLE TAG MANAGER INJECTION (START) ---
          if (
            this.settings.google_tag &&
            !document.querySelector('script[src*="googletagmanager.com"]')
          ) {
            // Check if settings exist AND script not already present
            const scriptContent = this.settings.google_tag

            // Create a container div
            const container = document.createElement('div')
            container.innerHTML = scriptContent

            // Iterate over children
            for (const child of container.children) {
              if (child.tagName === 'SCRIPT') {
                // make sure tag is script
                const script = document.createElement('script')

                // Copy attributes
                for (const attr of child.attributes) {
                  script.setAttribute(attr.name, attr.value)
                }
                script.text = child.textContent
                document.head.appendChild(script)
              }
            }
          }
          // --- GOOGLE TAG MANAGER INJECTION (END) ---
        } else {
          throw new Error('Invalid settings response')
        }
      } catch (error) {
        this.error = 'Failed to fetch settings'
        console.error('Error fetching settings:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
