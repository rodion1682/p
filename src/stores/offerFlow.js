import api from '@/plugins/axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'

const normalizeApiList = data => {
  if (Array.isArray(data?.payload?.data)) return data.payload.data
  if (Array.isArray(data?.payload)) return data.payload
  if (Array.isArray(data?.data)) return data.data
  return []
}

const getApiPayload = data => {
  return data?.payload ?? data?.data ?? null
}

const flattenErrors = errorsObj => {
  if (!errorsObj || typeof errorsObj !== 'object') return []

  return Object.entries(errorsObj).flatMap(([field, messages]) => {
    if (Array.isArray(messages)) {
      return messages.filter(Boolean).map(message => `${field}: ${message}`)
    }

    return messages ? [`${field}: ${String(messages)}`] : []
  })
}

const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data
  const errors = flattenErrors(data?.errors)

  return data?.message || data?.error || errors[0] || err?.message || fallback
}

const normalizeSellItems = formData => {
  const items = Array.isArray(formData?.items)
    ? formData.items
    : Array.isArray(formData)
      ? formData
      : []

  return items.map(item => ({
    short_name: String(item.short_name || '').trim(),
    quantity: Number(item.quantity || item.qty || item.count || 1),
    price: Number(item.price || 0),
  }))
}

export const useOfferFlowStore = defineStore('offerFlow', () => {
  const currentStep = ref(null)
  const selectedOffer = ref(null)
  const selectedPaymentMethod = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const offers = ref([])
  const offersMeta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const submissionInProgress = ref(false)

  const contactInfo = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
  })

  const paymentInfo = ref({
    cardNumber: '',
    cardHolderName: '',
    expirationDate: '',
    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',
    termsAccepted: false,
  })

  const getOffers = computed(() => offers.value)
  const getSelectedOffer = computed(() => selectedOffer.value)

  const resetFormData = () => {
    contactInfo.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      postCode: '',
      address: '',
    }

    paymentInfo.value = {
      cardNumber: '',
      cardHolderName: '',
      expirationDate: '',
      accountHolderFirstName: '',
      accountHolderLastName: '',
      iban: '',
      termsAccepted: false,
    }

    selectedPaymentMethod.value = null
    currentStep.value = null
  }

  const setStep = step => {
    currentStep.value = step
  }

  const setSelectedOffer = offer => {
    selectedOffer.value = offer
  }

  const updateContactInfo = data => {
    contactInfo.value = {
      ...contactInfo.value,
      ...data,
    }
  }

  const setPaymentMethod = method => {
    selectedPaymentMethod.value = method
  }

  const updatePaymentInfo = data => {
    paymentInfo.value = {
      ...paymentInfo.value,
      ...data,
    }
  }

  const fetchOffers = async (page = 1) => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await api.get('user/sell-requests', {
        params: { page },
      })

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to fetch offers')
      }

      offers.value = normalizeApiList(response.data)

      const pagination =
        response.data?.meta || response.data?.payload?.meta || {}

      offersMeta.value = {
        current_page: Number(pagination.current_page || page),
        last_page: Number(pagination.last_page || 1),
        per_page: Number(pagination.per_page || 10),
        total: Number(pagination.total ?? offers.value.length),
      }

      return {
        success: true,
        data: offers.value,
      }
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to fetch offers')
      offers.value = []
      toast.error(error.value)

      return {
        success: false,
        error: error.value,
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchOfferDetails = async offerId => {
    if (!offerId) return null

    isLoading.value = true
    error.value = ''

    try {
      const response = await api.get(`user/sell-requests/${offerId}`)

      if (response.data?.status !== 'OK') {
        throw new Error(
          response.data?.message || 'Failed to fetch offer details',
        )
      }

      const payload = getApiPayload(response.data)
      selectedOffer.value = payload

      return payload
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to fetch offer details')
      toast.error(error.value)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createSellOrder = async (formData = {}) => {
    submissionInProgress.value = true
    error.value = ''

    try {
      const items = normalizeSellItems(formData)

      const invalidItem = items.find(
        item =>
          !item.short_name ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.price) ||
          item.price <= 0,
      )

      if (invalidItem || !items.length) {
        throw new Error('Please fill in item name, quantity and price')
      }

      const payload = {
        items,
      }

      const response = await api.post('user/sell-requests', payload)

      if (response.data?.status !== 'OK') {
        throw new Error(
          response.data?.message || 'Failed to submit sell request',
        )
      }

      await fetchOffers()

      return {
        success: true,
        id: response.data?.payload?.id,
        data: response.data?.payload,
      }
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to submit sell request')
      toast.error(error.value)

      return {
        success: false,
        error: error.value,
        validationErrors: err?.response?.data?.errors || {},
        httpStatus: err?.response?.status,
      }
    } finally {
      submissionInProgress.value = false
    }
  }

  const acceptOffer = async offerId => {
    if (!offerId) return false

    isLoading.value = true
    error.value = ''

    try {
      const response = await api.post(`user/sell-requests/${offerId}/approve`)

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to accept offer')
      }

      await fetchOffers()
      return true
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to accept offer')
      toast.error(error.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const declineOffer = async offerId => {
    if (!offerId) return false

    isLoading.value = true
    error.value = ''

    try {
      const response = await api.post(`user/sell-requests/${offerId}/decline`)

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to decline offer')
      }

      await fetchOffers()
      return true
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to decline offer')
      toast.error(error.value)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const saveUserOfferData = async (offerId = selectedOffer.value?.id) => {
    if (!offerId) {
      return {
        success: false,
        message: 'No offer selected',
        errors: {},
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      const payload = {
        first_name: contactInfo.value.firstName,
        last_name: contactInfo.value.lastName,
        email: contactInfo.value.email,
        phone: contactInfo.value.phone,
        country_id: contactInfo.value.country,
        city: contactInfo.value.city,
        address: contactInfo.value.address,
        zip: contactInfo.value.postCode,
      }

      const response = await api.post(
        `user/sell-requests/${offerId}/payout-data`,
        payload,
      )

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to save offer data')
      }

      return {
        success: true,
        data: getApiPayload(response.data),
      }
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to save offer data')

      return {
        success: false,
        message: error.value,
        errors: err?.response?.data?.errors || {},
        httpStatus: err?.response?.status,
      }
    } finally {
      isLoading.value = false
    }
  }

  const requestPayout = async (offerId, withdrawType) => {
    if (!offerId) {
      return {
        success: false,
        message: 'No offer selected',
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      const payload = {
        first_name: contactInfo.value.firstName,
        last_name: contactInfo.value.lastName,
        email: contactInfo.value.email,
        phone: contactInfo.value.phone,
        country_id: contactInfo.value.country,
        city: contactInfo.value.city,
        address: contactInfo.value.address,
        zip: contactInfo.value.postCode,
        withdraw_type: withdrawType,
      }

      const response = await api.post(
        `user/sell-requests/${offerId}/request-payout`,
        payload,
      )

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to request payout')
      }

      const data = getApiPayload(response.data)

      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url

        return {
          success: true,
          redirect: true,
        }
      }

      await fetchOffers()

      return {
        success: true,
        data,
      }
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to request payout')
      toast.error(error.value)

      return {
        success: false,
        message: error.value,
        errors: err?.response?.data?.errors || {},
        messages: flattenErrors(err?.response?.data?.errors),
        httpStatus: err?.response?.status,
      }
    } finally {
      isLoading.value = false
    }
  }

  const submitWithdrawal = async () => {
    return requestPayout(selectedOffer.value?.id, selectedPaymentMethod.value)
  }

  const completeOffer = async ({ offerId, paymentMethod, payload = {} }) => {
    if (!offerId) {
      return {
        success: false,
        error: 'No offer selected',
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      const response = await api.post(
        `user/sell-requests/${offerId}/request-payout`,
        {
          ...payload,
          withdraw_type: paymentMethod,
        },
      )

      if (response.data?.status !== 'OK') {
        throw new Error(response.data?.message || 'Failed to complete offer')
      }

      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url

        return {
          success: true,
          redirect: true,
        }
      }

      await fetchOffers()

      toast.success(
        response.data?.message || 'Payout request submitted successfully!',
      )

      return {
        success: true,
        data: getApiPayload(response.data),
      }
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to complete offer')
      toast.error(error.value)

      return {
        success: false,
        error: error.value,
        validationErrors: err?.response?.data?.errors || {},
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentStep,
    selectedOffer,
    selectedPaymentMethod,
    isLoading,
    error,
    offers,
    offersMeta,
    submissionInProgress,
    contactInfo,
    paymentInfo,

    getOffers,
    getSelectedOffer,

    resetFormData,
    setStep,
    setSelectedOffer,
    updateContactInfo,
    setPaymentMethod,
    updatePaymentInfo,

    fetchOffers,
    fetchOfferDetails,
    createSellOrder,
    acceptOffer,
    declineOffer,
    saveUserOfferData,
    requestPayout,
    submitWithdrawal,
    completeOffer,
  }
})
