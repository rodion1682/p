import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

const RUST_CATEGORY = 'rust'
const DEFAULT_LIMIT = 18

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
    randomProducts: [],
    popularProducts: [],
    saleProducts: [],
    newProducts: [],
    error: null,
  }),

  actions: {
    async fetchProductDetails(productId) {
      try {
        const { data } = await axios.get(`/items/${productId}`)

        const payload = data?.payload || data?.data

        if (data?.status === 'OK' || payload) {
          this.currentProduct = payload
          this.error = null
          return payload
        }

        throw new Error(data?.message || 'Failed to fetch product details')
      } catch (error) {
        console.error('Error fetching product details:', error)
        this.error = error?.message || 'Failed to fetch product details'
        throw error
      }
    },

    async fetchRandomProducts(params = {}) {
      return this.fetchProductCollection('randomProducts', {
        random: true,
        ...params,
      })
    },

    async fetchPopularProducts(params = {}) {
      try {
        const { data } = await axios.get('/items/recommended', {
          params: {
            category: RUST_CATEGORY,
            limit: DEFAULT_LIMIT,
            ...params,
          },
        })

        this.popularProducts = data?.status === 'OK' ? data.payload || [] : []
        return this.popularProducts
      } catch (error) {
        console.error('Error fetching popular products:', error)
        this.popularProducts = []
        return []
      }
    },

    async fetchSaleProducts(params = {}) {
      return this.fetchProductCollection('saleProducts', {
        special_offer: 'sale',
        sale: true,
        ...params,
      })
    },

    async fetchNewProducts(params = {}) {
      return this.fetchProductCollection('newProducts', {
        special_offer: 'new',
        new: true,
        ...params,
      })
    },

    async fetchProductCollection(stateKey, params = {}) {
      try {
        const { data } = await axios.get('/items', {
          params: {
            category: RUST_CATEGORY,
            limit: DEFAULT_LIMIT,
            ...params,
          },
        })

        this[stateKey] =
          data?.status === 'OK' ? data.payload || [] : data?.data || []
        return this[stateKey]
      } catch (error) {
        console.error(`Error fetching ${stateKey}:`, error)
        this[stateKey] = []
        return []
      }
    },

    clearCurrentProduct() {
      this.currentProduct = null
      this.error = null
    },

    clearCollections() {
      this.randomProducts = []
      this.popularProducts = []
      this.saleProducts = []
      this.newProducts = []
    },
  },
})
