// stores/countries.js
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useFaqStore = defineStore('faq', {
  state: () => ({
    faq: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchFaq() {
      try {
        this.isLoading = true
        this.error = null
        const response = await axios.get('/faq')
        if (response.data.status === 'OK') {
          this.faq = response.data.payload
        }
      } catch (error) {
        this.error = 'Failed to load faq'
        console.error('Error fetching faq:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
