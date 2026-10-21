import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useStaticStore = defineStore('static', {
  state: () => ({
    pages: [],
    currentPage: null,
    socialLinks: [],
    loading: false,
    error: null,
  }),

  getters: {
    termsPage: state => state.pages.find(page => page.is_terms),
    privacyPage: state => state.pages.find(page => page.is_privacy),
    cookiePage: state => {
      const searchTerm = 'cookie'
      return state.pages.find(page => {
        if (!page || !page.title) return false
        return page.title.toLowerCase().includes(searchTerm)
      })
    },
  },

  actions: {
    async fetchPages() {
      try {
        this.loading = true
        const { data } = await axios.get('/static-pages')
        if (data.status === 'OK') {
          this.pages = data.payload
        }
      } catch (error) {
        this.error = 'Failed to fetch pages'
        console.error('Error fetching pages:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPageById(identifier) {
      try {
        this.error = null
        this.loading = true
        // identifier can be either a slug or an ID
        const { data } = await axios.get(`/static-pages/${identifier}`)
        if (data.status === 'OK') {
          this.currentPage = data.payload
        }
      } catch (error) {
        this.error = 'Failed to fetch page'
        console.error('Error fetching page:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSocialLinks() {
      try {
        const { data } = await axios.get('/social-links')
        if (data.status === 'OK') {
          this.socialLinks = data.payload
        }
      } catch (error) {
        console.error('Error fetching social links:', error)
      }
    },
  },
})
