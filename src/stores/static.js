import axios from '@/plugins/axios'
import { defineStore } from 'pinia'

export const useStaticStore = defineStore('static', {
  state: () => ({
    pages: [],
    currentPage: null,

    socialLinks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPages() {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get('/static-pages')

        if (data.status === 'OK') {
          this.pages = Array.isArray(data.payload) ? data.payload : []
        }
      } catch (e) {
        this.error = 'Failed to fetch pages'
      } finally {
        this.loading = false
      }
    },

    async fetchPage({ slug }) {
      this.error = null
      this.loading = true
      this.currentPage = null

      try {
        if (!this.pages.length) {
          await this.fetchPages()
        }

        const page = this.pages.find(
          p => p.slug?.toLowerCase() === slug?.toLowerCase(),
        )

        if (!page?.id) return null

        const { data } = await axios.get(`/static-pages/${page.id}`)

        if (data.status === 'OK') {
          this.currentPage = data.payload
        }

        return this.currentPage
      } catch (e) {
        this.error = 'Failed to fetch page'
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchSocialLinks() {
      this.error = null

      try {
        const { data } = await axios.get('/social-links')

        if (data.status === 'OK') {
          this.socialLinks = Array.isArray(data.payload) ? data.payload : []
        }
      } catch (e) {
        this.socialLinks = []
      }
    },
  },
})
