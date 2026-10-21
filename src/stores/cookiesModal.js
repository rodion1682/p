import { defineStore } from 'pinia'

export const useCookiesModalStore = defineStore('cookiesModal', {
  state: () => ({
    isModalOpen: false,
    isCookiesAccepted: localStorage.getItem('cookies_accepted') === 'true',
  }),

  actions: {
    checkInitialState() {
      if (!this.isCookiesAccepted) {
        this.isModalOpen = true
      }
    },

    openModal() {
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
      this.isCookiesAccepted = true
      localStorage.setItem('cookies_accepted', 'true')
    },
  },
})
