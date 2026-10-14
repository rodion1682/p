import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
    randomProducts: [],
    popularProducts: [],
    saleProducts: [],
    error: null,
  }),

  actions: {
    async fetchProductDetails(productId) {
      try {
        const { data } = await axios.get(`/catalog/cards/${productId}`)
        if (data.data) {
          this.currentProduct = data.data
          this.error = null
        } else {
          throw new Error(data.message || 'Failed to fetch product details')
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
        this.error = error.message
        throw error
      }
    },
    async fetchPackDetails(productId) {
      try {
        const { data } = await axios.get(`/catalog/packs/${productId}`)
        if (data.data) {
          this.currentProduct = data.data
          this.error = null
        } else {
          throw new Error(data.message || 'Failed to fetch pack details')
        }
      } catch (error) {
        console.error('Error fetching pack details:', error)
        this.error = error.message
        throw error
      }
    },

    async fetchRandomProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/list', {
          params: {
            random: true,
            limit: 20,
            ...params,
          },
        })

        if (data.status === 'OK') {
          this.randomProducts = data.payload
          return data.payload
        }
      } catch (error) {
        console.error('Error fetching random products:', error)
        // Initialize randomProducts as empty array even on error
        this.randomProducts = []
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null
      this.error = null
    },
  },
})
