import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    unavailableItems: [],

    isLoading: false,
    itemsLoading: {},

    error: null,
    itemErrors: {},

    isUniqueItems: true,

    rentalPeriods: [],
  }),

  getters: {
    cartItemsCount: state => {
      return state.items.length
    },

    isEmpty: state => {
      return state.items.length === 0
    },

    hasError: state => {
      return Boolean(state.error)
    },

    cartTotal: state => {
      return state.items.reduce((total, item) => {
        const unitPrice = Number(
          item.unit_price ?? item?.details?.price ?? item?.price ?? 0,
        )

        const quantity = item.is_rental
          ? 1
          : Math.max(1, Number(item.quantity) || 1)

        return total + unitPrice * quantity
      }, 0)
    },

    currencySymbol: () => {
      return '€'
    },

    isItemLoading: state => itemId => {
      return Boolean(state.itemsLoading[itemId])
    },

    getItemError: state => itemId => {
      return state.itemErrors[itemId] ?? null
    },

    isItemInCart:
      state =>
      (itemId, type, rentalPeriodId = null) => {
        return state.items.some(item => {
          if (Number(item.purchasable_id) !== Number(itemId)) {
            return false
          }

          if (type && item.purchasable_type !== type) {
            return false
          }

          if (rentalPeriodId !== null) {
            const itemRentalPeriodId =
              item?.rental_period?.id ?? item?.rental_period_id ?? null

            return (
              Boolean(item.is_rental) &&
              String(itemRentalPeriodId) === String(rentalPeriodId)
            )
          }

          return !item.is_rental
        })
      },

    isAnyVersionInCart: state => (itemId, type) => {
      return state.items.some(item => {
        return (
          Number(item.purchasable_id) === Number(itemId) &&
          (!type || item.purchasable_type === type)
        )
      })
    },

    getCartItem:
      state =>
      (itemId, type, rentalPeriodId = null) => {
        return (
          state.items.find(item => {
            if (Number(item.purchasable_id) !== Number(itemId)) {
              return false
            }

            if (type && item.purchasable_type !== type) {
              return false
            }

            if (rentalPeriodId !== null) {
              const itemRentalPeriodId =
                item?.rental_period?.id ?? item?.rental_period_id ?? null

              return (
                Boolean(item.is_rental) &&
                String(itemRentalPeriodId) === String(rentalPeriodId)
              )
            }

            return !item.is_rental
          }) ?? null
        )
      },
  },

  actions: {
    async fetchRentalPeriods() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.rentalPeriods = []

        return {
          success: true,
          data: [],
        }
      }

      try {
        this.error = null

        const response = await axios.get('/rental-periods')

        const periods = response.data?.payload ?? response.data?.data ?? []

        this.rentalPeriods = Array.isArray(periods) ? periods : []

        return {
          success: true,
          data: this.rentalPeriods,
        }
      } catch (error) {
        this.rentalPeriods = []

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch rental periods'

        this.error = errorMessage

        return {
          success: false,
          error: errorMessage,
          data: [],
        }
      }
    },

    async fetchCartContent() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.items = []

        return {
          success: true,
          data: [],
        }
      }

      try {
        this.error = null
        this.isLoading = true

        const response = await axios.get('/cart')

        const cart =
          response.data?.data ?? response.data?.payload ?? response.data

        const items = cart?.items

        if (!Array.isArray(items)) {
          throw new Error('Invalid cart response format')
        }

        this.items = items

        this.unavailableItems = Array.isArray(cart?.unavailable_items)
          ? cart.unavailable_items
          : []

        return {
          success: true,
          data: cart,
        }
      } catch (error) {
        console.error('Error fetching cart content:', error)

        this.items = []
        this.unavailableItems = []

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch cart content'

        this.error = errorMessage

        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        this.isLoading = false
      }
    },

    async ensureRentalPeriods() {
      if (this.rentalPeriods.length) {
        return {
          success: true,
          data: this.rentalPeriods,
        }
      }

      return this.fetchRentalPeriods()
    },

    async rentCard(itemId, rentalPeriodId = null) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'please_login_to_rent_card',
          isUnauthorized: true,
        }
      }

      const periodsResult = await this.ensureRentalPeriods()

      if (!periodsResult.success) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: periodsResult.error || 'Failed to load rental periods',
        }
      }

      const selectedPeriodId =
        rentalPeriodId ?? this.rentalPeriods[0]?.id ?? null

      if (!selectedPeriodId) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'No rental periods available',
        }
      }

      const period = this.rentalPeriods.find(item => {
        return String(item.id) === String(selectedPeriodId)
      })

      if (!period) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'Selected rental period is invalid',
        }
      }

      if (this.isItemInCart(itemId, 'card', period.id)) {
        return {
          success: false,
          isAlreadyInCart: true,
          message: 'This rental is already in your cart',
        }
      }

      try {
        this.setItemLoading(itemId, true)

        this.setItemError(itemId, null)

        const response = await axios.post('/cart/add', {
          type: 'card',
          id: itemId,
          rental_period_id: period.id,
        })

        await this.fetchCartContent()

        return {
          success: true,
          isAlreadyInCart: false,
          message: response.data?.message || 'Rental added to cart',
          data: response.data?.data ?? response.data,
        }
      } catch (error) {
        if (error.response?.status === 401) {
          return {
            success: false,
            isAlreadyInCart: false,
            message: 'please_login_to_add_to_cart',
            isUnauthorized: true,
          }
        }

        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to add rental to cart'

        this.setItemError(itemId, message)

        return {
          success: false,
          isAlreadyInCart: message
            .toLowerCase()
            .includes('already in your cart'),
          message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async addToCart(
      itemId,
      quantity = 1,
      type = 'card',
      rentalPeriodId = null,
    ) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'please_login_to_add_to_cart',
          isUnauthorized: true,
        }
      }

      if (
        rentalPeriodId !== null &&
        rentalPeriodId !== undefined &&
        rentalPeriodId !== false
      ) {
        return this.rentCard(itemId, rentalPeriodId)
      }

      try {
        if (this.isUniqueItems && this.isItemInCart(itemId, type)) {
          return {
            success: false,
            isAlreadyInCart: true,
            message: 'This item is already in your cart',
          }
        }

        this.setItemLoading(itemId, true)

        this.setItemError(itemId, null)

        const response = await axios.post('/cart/add', {
          type,
          id: itemId,
          quantity: Math.max(1, Number(quantity) || 1),
        })

        await this.fetchCartContent()

        return {
          success: true,
          isAlreadyInCart: false,
          message: response.data?.message || 'Item added to cart',
          data: response.data?.data ?? response.data,
        }
      } catch (error) {
        if (error.response?.status === 401) {
          return {
            success: false,
            isAlreadyInCart: false,
            message: 'please_login_to_add_to_cart',
            isUnauthorized: true,
          }
        }

        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to add item to cart'

        this.setItemError(itemId, message)

        return {
          success: false,
          isAlreadyInCart: message
            .toLowerCase()
            .includes('already in your cart'),
          message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async updateQuantity(itemId, quantity) {
      try {
        this.setItemLoading(itemId, true)

        this.setItemError(itemId, null)

        const response = await axios.patch(`/cart/items/${itemId}`, {
          quantity: Math.max(1, Number(quantity) || 1),
        })

        await this.fetchCartContent()

        return {
          success: true,
          data: response.data?.data ?? response.data,
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to update quantity'

        this.setItemError(itemId, errorMessage)

        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async removeFromCart(productId, type = 'card', rentalPeriodId = null) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isUnauthorized: true,
        }
      }

      try {
        this.error = null

        this.setItemLoading(productId, true)

        this.setItemError(productId, null)

        const payload = {
          type,
          id: productId,
        }

        if (
          rentalPeriodId !== null &&
          rentalPeriodId !== undefined &&
          rentalPeriodId !== false
        ) {
          payload.rental_period_id = rentalPeriodId
        }

        const response = await axios.delete('/cart/items/by-product', {
          data: payload,
        })

        await this.fetchCartContent()

        return {
          success: true,
          data: response.data?.data ?? response.data,
          message: response.data?.message || 'Item removed from cart',
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to remove item from cart'

        this.error = errorMessage

        this.setItemError(productId, errorMessage)

        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        this.setItemLoading(productId, false)
      }
    },

    async removeMultipleFromCart(productIds, type = 'card') {
      if (!Array.isArray(productIds) || !productIds.length) {
        return {
          success: true,
        }
      }

      for (const id of productIds) {
        const result = await this.removeFromCart(id, type)

        if (!result.success) {
          return result
        }
      }

      return {
        success: true,
      }
    },

    async clearCart() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.resetState()

        return {
          success: true,
        }
      }

      try {
        this.error = null
        this.isLoading = true

        await axios.delete('/cart/clear')

        this.resetState()

        return {
          success: true,
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to clear cart'

        this.error = errorMessage

        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.items = []
      this.unavailableItems = []

      this.error = null
      this.itemErrors = {}
      this.itemsLoading = {}

      this.rentalPeriods = []
    },

    setLoading(status) {
      this.isLoading = Boolean(status)
    },

    setItemLoading(itemId, status) {
      if (itemId === null || itemId === undefined) {
        return
      }

      this.itemsLoading = {
        ...this.itemsLoading,
        [itemId]: Boolean(status),
      }
    },

    setItemError(itemId, error) {
      if (itemId === null || itemId === undefined) {
        return
      }

      if (!error) {
        const nextErrors = {
          ...this.itemErrors,
        }

        delete nextErrors[itemId]

        this.itemErrors = nextErrors

        return
      }

      this.itemErrors = {
        ...this.itemErrors,
        [itemId]: error,
      }
    },
  },
})
