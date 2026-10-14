import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

let heroesRequest = null

export const useHeroesStore = defineStore('heroes', {
  state: () => ({
    heroes: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    hasHeroes: state => {
      return state.heroes.length > 0
    },

    getHeroById: state => {
      return heroId => {
        if (heroId === null || heroId === undefined || heroId === '') {
          return null
        }

        return (
          state.heroes.find(hero => {
            return String(hero.id) === String(heroId)
          }) ?? null
        )
      }
    },
  },

  actions: {
    async fetchHeroes(force = false) {
      /*
       * Do not request heroes again when they already exist.
       */
      if (!force && this.heroes.length > 0) {
        return this.heroes
      }

      /*
       * Reuse an active request when multiple components
       * request heroes simultaneously.
       */
      if (heroesRequest) {
        return heroesRequest
      }

      this.isLoading = true
      this.error = null

      heroesRequest = axios
        .get('/heroes')
        .then(response => {
          const heroes = response?.data?.data

          this.heroes = Array.isArray(heroes) ? heroes : []

          return this.heroes
        })
        .catch(error => {
          console.error('Error fetching heroes:', error)

          this.error =
            error?.response?.data?.message ||
            error?.message ||
            'Failed to load heroes'

          throw error
        })
        .finally(() => {
          this.isLoading = false
          heroesRequest = null
        })

      return heroesRequest
    },

    async ensureHeroes() {
      if (this.heroes.length > 0) {
        return this.heroes
      }

      return this.fetchHeroes()
    },

    clearHeroes() {
      this.heroes = []
      this.error = null
    },
  },
})
