import axios from '@/plugins/axios'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const toNumber = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : fallback
}

const normalizeCount = value => {
  const count = Number.parseInt(value, 10)

  return Number.isFinite(count) && count >= 1 ? count : 1
}

const fixedPrice = value => {
  return Number(Number(value || 0).toFixed(2))
}

const getCartPayload = response => {
  return Array.isArray(response?.data?.cart?.payload)
    ? response.data.cart.payload
    : []
}

const normalizeCartItem = item => ({
  id: item.id,
  item_id: item.item_id,
  title: item.title || item.name || item.item?.name || '',
  category: item.category || item.item?.category || '',
  count: normalizeCount(item.count),
  price: toNumber(item.price, 0),
  price_internal: toNumber(item.price_internal, 0),
  img: item.img || item.item?.img || item.item?.img_url || '',
})

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalAmount: 0,
    totalAmountInternal: 0,
    isLoading: false,
    itemsLoading: {},
    error: null,
    itemErrors: {},
  }),

  getters: {
    cartItemsCount: state => {
      return state.items.reduce((total, item) => {
        return total + normalizeCount(item.count)
      }, 0)
    },

    isEmpty: state => {
      return state.items.length === 0
    },

    hasError: state => {
      return !!state.error
    },

    cartTotal: state => {
      const total = state.items.reduce((sum, item) => {
        return sum + toNumber(item.price, 0) * normalizeCount(item.count)
      }, 0)

      return fixedPrice(total)
    },

    cartTotalInternal: state => {
      const total = state.items.reduce((sum, item) => {
        return (
          sum + toNumber(item.price_internal, 0) * normalizeCount(item.count)
        )
      }, 0)

      return fixedPrice(total)
    },

    isItemInCart: state => itemId => {
      return state.items.some(item => Number(item.item_id) === Number(itemId))
    },

    isItemLoading: state => itemId => {
      return !!state.itemsLoading[itemId]
    },

    getItemError: state => itemId => {
      return state.itemErrors[itemId] || null
    },

    getQty: state => itemId => {
      const item = state.items.find(
        row => Number(row.item_id) === Number(itemId),
      )

      return normalizeCount(item?.count)
    },
  },

  actions: {
    setItemLoading(itemId, status) {
      this.itemsLoading = {
        ...this.itemsLoading,
        [itemId]: status,
      }
    },

    setItemError(itemId, message) {
      if (message) {
        this.itemErrors = {
          ...this.itemErrors,
          [itemId]: message,
        }

        return
      }

      const next = {
        ...this.itemErrors,
      }

      delete next[itemId]

      this.itemErrors = next
    },

    setCartFromResponse(response, preferredOrder = null) {
      let items = getCartPayload(response).map(normalizeCartItem)

      if (Array.isArray(preferredOrder) && preferredOrder.length) {
        const order = new Map(
          preferredOrder.map((itemId, index) => [Number(itemId), index]),
        )

        items.sort((a, b) => {
          const aIndex = order.has(Number(a.item_id))
            ? order.get(Number(a.item_id))
            : Number.MAX_SAFE_INTEGER

          const bIndex = order.has(Number(b.item_id))
            ? order.get(Number(b.item_id))
            : Number.MAX_SAFE_INTEGER

          return aIndex - bIndex
        })
      }

      this.items = items
      this.recalculateTotals()
    },

    recalculateTotals() {
      const totalAmount = this.items.reduce((sum, item) => {
        return sum + toNumber(item.price, 0) * normalizeCount(item.count)
      }, 0)

      const totalAmountInternal = this.items.reduce((sum, item) => {
        return (
          sum + toNumber(item.price_internal, 0) * normalizeCount(item.count)
        )
      }, 0)

      this.totalAmount = fixedPrice(totalAmount)
      this.totalAmountInternal = fixedPrice(totalAmountInternal)
    },

    async fetchCartContent() {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        this.resetState()

        return {
          success: true,
        }
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get('/cart/contents')

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Failed to fetch cart')
        }

        this.setCartFromResponse(response)

        return {
          success: true,
        }
      } catch (error) {
        this.resetState()

        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch cart'

        console.error('Cart fetch error:', error)

        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.isLoading = false
      }
    },

    async addToCart(itemId, quantity = 1) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isUnauthorized: true,
          isAlreadyInCart: false,
          message: 'Please login to add items to cart',
        }
      }

      if (this.isItemInCart(itemId)) {
        return {
          success: false,
          isUnauthorized: false,
          isAlreadyInCart: true,
          message: 'This item already added to your cart!',
        }
      }

      this.setItemLoading(itemId, true)
      this.setItemError(itemId, null)

      try {
        const response = await axios.post('/cart/add', {
          id: itemId,
          count: normalizeCount(quantity),
        })

        if (response.data?.status !== 'OK') {
          throw new Error(
            response.data?.message || 'Failed to add item to cart',
          )
        }

        this.setCartFromResponse(response)

        return {
          success: true,
          isAlreadyInCart: false,
          message: 'OK',
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to add item to cart'

        this.setItemError(itemId, message)

        return {
          success: false,
          isUnauthorized: error.response?.status === 401,
          isAlreadyInCart: message.toLowerCase().includes('already added'),
          message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async updateQuantity(itemId, quantity) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isUnauthorized: true,
        }
      }

      const count = normalizeCount(quantity)

      const currentItem = this.items.find(
        item => Number(item.item_id) === Number(itemId),
      )

      if (!currentItem) {
        return {
          success: false,
          error: 'Item not found in cart',
        }
      }

      const currentCount = normalizeCount(currentItem.count)

      if (currentCount === count) {
        return {
          success: true,
        }
      }

      const previousOrder = this.items.map(item => Number(item.item_id))
      const previousCount = currentItem.count

      currentItem.count = count

      this.recalculateTotals()

      this.setItemLoading(itemId, true)
      this.setItemError(itemId, null)

      try {
        const removeResponse = await axios.post('/cart/remove', {
          id: itemId,
        })

        if (removeResponse.data?.status !== 'OK') {
          throw new Error(
            removeResponse.data?.message || 'Failed to update cart quantity',
          )
        }

        const addResponse = await axios.post('/cart/add', {
          id: itemId,
          count,
        })

        if (addResponse.data?.status !== 'OK') {
          throw new Error(
            addResponse.data?.message || 'Failed to update cart quantity',
          )
        }

        this.setCartFromResponse(addResponse, previousOrder)

        return {
          success: true,
        }
      } catch (error) {
        currentItem.count = previousCount

        this.recalculateTotals()

        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to update cart quantity'

        this.setItemError(itemId, message)

        await this.fetchCartContent()

        return {
          success: false,
          error: message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async removeFromCart(itemId) {
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        return {
          success: false,
        }
      }

      this.setItemLoading(itemId, true)
      this.setItemError(itemId, null)

      try {
        const response = await axios.post('/cart/remove', {
          id: itemId,
        })

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Failed to remove item')
        }

        this.setCartFromResponse(response)

        return {
          success: true,
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to remove item'

        this.error = message

        this.setItemError(itemId, message)

        return {
          success: false,
          error: message,
        }
      } finally {
        this.setItemLoading(itemId, false)
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

      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post('/cart/clear')

        if (response.data?.status !== 'OK') {
          throw new Error(response.data?.message || 'Failed to clear cart')
        }

        this.resetState()

        return {
          success: true,
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Failed to clear cart'

        return {
          success: false,
          error: this.error,
        }
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.items = []
      this.totalAmount = 0
      this.totalAmountInternal = 0
      this.isLoading = false
      this.itemsLoading = {}
      this.error = null
      this.itemErrors = {}
    },
  },
})
