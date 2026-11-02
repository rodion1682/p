import api from '@/plugins/axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTopUpStore = defineStore('topup', () => {
  const amount = ref(null)
  const paymentType = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const redirectUrl = ref('')

  const setAmount = value => {
    amount.value = value
    error.value = ''
  }

  const setPaymentType = value => {
    paymentType.value = value
  }

  const clearError = () => {
    error.value = ''
  }

  const normalizeCheckoutPayload = data => {
    return {
      amount: data.amount,
      amount_internal: data.amount_internal,
      currency: data.currency,
      paymentType: data.paymentType || paymentType.value || 'card',

      first_name: data.first_name || data.name,
      last_name: data.last_name || data.surname,
      email: data.email,
      phone: data.phone,
      country_id: data.country_id || data.country,
      city: data.city,
      address: data.address,
      zip: data.zip || data.postCode,
    }
  }

  const checkout = async data => {
    isLoading.value = true
    error.value = ''

    try {
      const payload = normalizeCheckoutPayload(data)

      const response = await api.post('/payments/checkout', payload)

      if (response.data.status !== 'OK') {
        throw new Error(response.data.message || 'Checkout failed')
      }

      redirectUrl.value = response.data.redirect_url || ''

      return response.data
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred during checkout.'

      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    amount.value = null
    paymentType.value = null
    isLoading.value = false
    error.value = ''
    redirectUrl.value = ''
  }

  return {
    amount,
    paymentType,
    isLoading,
    error,
    redirectUrl,

    setAmount,
    setPaymentType,
    checkout,
    clearError,
    reset,
  }
})
