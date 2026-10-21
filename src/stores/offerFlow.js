import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'

import api from '@/plugins/axios'
import { useUserStore } from '@/stores/user'

const emptyContact = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  postCode: '',
  address: '',
})

const emptyPayment = () => ({
  cardNumber: '',
  cardHolderName: '',
  expirationDate: '',
  accountHolderFirstName: '',
  accountHolderLastName: '',
  iban: '',
  termsAccepted: false,
})

function responseMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    (typeof error === 'string' ? error : fallback)
  )
}

function firstValidationMessage(errors) {
  if (!errors || typeof errors !== 'object') return ''
  const value = Object.values(errors)[0]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}

function readCollection(payload) {
  if (Array.isArray(payload)) return payload

  // Laravel's paginated collection can be nested
  // inside { status: 'OK', payload: ... }.
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items

  return []
}

function requireSuccessfulResponse(response, fallback) {
  const data = response?.data || {}

  if (data.status && data.status !== 'OK') {
    const message = data.message || fallback
    const error = new Error(message)
    error.validationErrors = data.errors || {}
    throw error
  }

  return data
}

// Share concurrent requests for the same lists.
let withdrawalsRequest = null
let offersRequest = null

export const useOfferFlowStore = defineStore('offerFlow', () => {
  const userStore = useUserStore()

  const currentStep = ref(null)
  const selectedOffer = ref(null)
  const selectedPaymentMethod = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const offers = ref([])
  const withdrawals = ref([])
  const submissionInProgress = ref(false)
  const payoutInProgress = ref(false)

  const contactInfo = ref(emptyContact())
  const paymentInfo = ref(emptyPayment())

  const getOffers = computed(() => offers.value)
  const getWithdrawals = computed(() => withdrawals.value)
  const getSelectedOffer = computed(() => selectedOffer.value)

  const resetFormData = () => {
    contactInfo.value = emptyContact()
    paymentInfo.value = emptyPayment()
    selectedPaymentMethod.value = null
    currentStep.value = null
  }

  const initContactInfoFromUser = () => {
    contactInfo.value = {
      firstName: userStore.firstName || '',
      lastName: userStore.lastName || '',
      email: userStore.userEmail || '',
      phone: userStore.userPhone || '',
      country: userStore.userCountry || '',
      city: userStore.userCity || '',
      postCode: userStore.userPostCode || '',
      address: userStore.userAddress || '',
    }
  }

  const setStep = step => {
    if (step === 'contact') initContactInfoFromUser()
    currentStep.value = step
  }

  const setSelectedOffer = offer => {
    selectedOffer.value = offer || null
  }

  const updateContactInfo = data => {
    contactInfo.value = { ...contactInfo.value, ...data }
  }

  const setPaymentMethod = method => {
    selectedPaymentMethod.value = method || null
  }

  const updatePaymentInfo = data => {
    paymentInfo.value = { ...paymentInfo.value, ...data }
  }

  const fetchWithdrawals = async () => {
    if (withdrawalsRequest) return withdrawalsRequest

    withdrawalsRequest = (async () => {
      isLoading.value = true
      error.value = ''

      try {
        const response = await api.get('withdrawals')
        const data = requireSuccessfulResponse(
          response,
          'Failed to load withdrawals',
        )

        withdrawals.value = readCollection(data.payload ?? data.data)

        return withdrawals.value
      } catch (err) {
        error.value = responseMessage(err, 'Failed to load withdrawals')

        // Keep previously loaded history on temporary failure.
        throw err
      } finally {
        isLoading.value = false
      }
    })()

    try {
      return await withdrawalsRequest
    } finally {
      withdrawalsRequest = null
    }
  }

  const fetchOffers = async () => {
    if (offersRequest) return offersRequest

    offersRequest = (async () => {
      isLoading.value = true
      error.value = ''

      try {
        const response = await api.get('card-sales')
        const data = requireSuccessfulResponse(
          response,
          'Failed to load offers',
        )

        offers.value = readCollection(data.payload ?? data.data)

        return offers.value
      } catch (err) {
        error.value = responseMessage(err, 'Failed to load offers')

        throw err
      } finally {
        isLoading.value = false
      }
    })()

    try {
      return await offersRequest
    } finally {
      offersRequest = null
    }
  }

  const fetchOfferDetails = async offerId => {
    try {
      const response = await api.get(`offer/${encodeURIComponent(offerId)}`)

      return response.data
    } catch (err) {
      console.error('Unable to load offer details:', err)
      return null
    }
  }

  // ContactInfoModal expects the Axios response and
  // needs original errors for Laravel validation messages.
  const requestWithdraw = async data => {
    if (submissionInProgress.value) {
      throw new Error('A withdrawal request is already being submitted')
    }

    submissionInProgress.value = true
    error.value = ''

    try {
      const response = await api.post('withdrawals', data)

      requireSuccessfulResponse(response, 'Failed to request withdrawal')

      return response
    } catch (err) {
      error.value = responseMessage(err, 'Failed to request withdrawal')

      throw err
    } finally {
      submissionInProgress.value = false
    }
  }

  const cancelWithdraw = async withdrawalId => {
    if (!withdrawalId) {
      throw new Error('Withdrawal ID is missing')
    }

    const response = await api.post(
      `withdrawals/${encodeURIComponent(withdrawalId)}/cancel`,
    )

    requireSuccessfulResponse(response, 'Failed to cancel withdrawal')

    return response.data
  }

  const cancelOffer = async offerId => {
    try {
      const response = await api.post(
        `card-sales/${encodeURIComponent(offerId)}/cancel`,
      )

      requireSuccessfulResponse(response, 'Failed to cancel offer')

      return response.data
    } catch (err) {
      console.error('Unable to cancel offer:', err)
      return null
    }
  }

  const createOffer = async formData => {
    try {
      const response = await api.post('offers/cards', formData)

      requireSuccessfulResponse(response, 'Failed to create offer')

      return {
        success: true,
        data: response.data,
      }
    } catch (err) {
      return {
        success: false,
        error: responseMessage(err, 'Failed to create offer'),
        validationErrors: err?.response?.data?.errors || {},
      }
    }
  }

  const createSellOrder = async formData => {
    if (submissionInProgress.value) {
      return {
        success: false,
        error: 'Submission already in progress',
      }
    }

    submissionInProgress.value = true

    try {
      const response = await api.post('offer/create', {
        ...formData,
        currency: formData.currency || 'EUR',
      })

      const data = requireSuccessfulResponse(
        response,
        'Failed to submit sell order',
      )

      await fetchOffers()

      return {
        success: true,
        id: data.id,
        data,
      }
    } catch (err) {
      const validationErrors =
        err?.response?.data?.errors || err?.validationErrors || {}

      const message =
        firstValidationMessage(validationErrors) ||
        responseMessage(err, 'Failed to submit sell order')

      toast.error(message)

      return {
        success: false,
        error: message,
        validationErrors,
      }
    } finally {
      submissionInProgress.value = false
    }
  }

  const acceptOffer = async offerId => {
    isLoading.value = true

    try {
      const response = await api.post('offer/request-payout', { id: offerId })

      requireSuccessfulResponse(response, 'Failed to accept offer')

      const existing = offers.value.find(
        item => String(item.id) === String(offerId),
      )

      if (existing) {
        existing.status = 'accepted'
      }

      toast.success('Offer successfully accepted')

      return true
    } catch (err) {
      toast.error(responseMessage(err, 'Failed to accept offer'))

      return false
    } finally {
      isLoading.value = false
    }
  }

  const declineOffer = async offerId => {
    isLoading.value = true

    try {
      const response = await api.post('offer/decline', { id: offerId })

      requireSuccessfulResponse(response, 'Failed to decline offer')

      const existing = offers.value.find(
        item => String(item.id) === String(offerId),
      )

      if (existing) {
        existing.status = 'declined'
      }

      return true
    } catch (err) {
      toast.error(responseMessage(err, 'Failed to decline offer'))

      return false
    } finally {
      isLoading.value = false
    }
  }

  // Initiate a payout for an APPROVED withdrawal.
  //
  // A successful API response only means initiation succeeded.
  // It does NOT mean the money was received.
  //
  // The backend/provider decides when status is 'completed'.
  const completeOffer = async ({ offerId, payload }) => {
    if (payoutInProgress.value) {
      return {
        success: false,
        error: 'A payout submission is already in progress',
      }
    }

    const withdrawalId = Number(offerId)

    if (!Number.isSafeInteger(withdrawalId) || withdrawalId <= 0) {
      return {
        success: false,
        error: 'Invalid withdrawal ID',
      }
    }

    if (!['sepa', 'card'].includes(payload?.payment_method)) {
      return {
        success: false,
        error: 'Please select a valid payout method',
      }
    }

    // Frontend validation only.
    // The backend must also validate ownership, approval,
    // and whether the payout method is locked.
    const selected = selectedOffer.value

    if (selected && String(selected.id) === String(withdrawalId)) {
      const status = String(selected.status || '').toLowerCase()

      if (status && status !== 'approved') {
        return {
          success: false,
          error: 'Only approved withdrawals can be paid out',
        }
      }

      if (
        selected.payment_method &&
        selected.payment_method !== payload.payment_method
      ) {
        return {
          success: false,
          error: 'This withdrawal has a different, locked payout method',
        }
      }
    }

    payoutInProgress.value = true
    error.value = ''

    try {
      const response = await api.post(
        `withdrawals/${withdrawalId}/payout`,
        payload,
      )

      const data = requireSuccessfulResponse(
        response,
        'Failed to initiate payout',
      )

      if (data?.payload?.id != null) {
        const index = withdrawals.value.findIndex(
          item => String(item.id) === String(withdrawalId),
        )

        if (index !== -1) {
          withdrawals.value[index] = data.payload
        }

        selectedOffer.value = data.payload
      }

      return {
        success: true,

        // Processing is not completed.
        withdrawal: data.payload || null,
        status: data.payload?.status || null,

        // Required for provider-hosted card payout flows.
        redirectUrl: data.redirect_url || null,
        nextAction: data.next_action || null,

        // Preserve the original API response.
        data,
      }
    } catch (err) {
      const validationErrors =
        err?.response?.data?.errors || err?.validationErrors || {}

      const message =
        firstValidationMessage(validationErrors) ||
        responseMessage(err, 'Failed to initiate payout')

      error.value = message

      return {
        success: false,
        error: message,
        validationErrors,
      }
    } finally {
      payoutInProgress.value = false
    }
  }

  return {
    // State
    currentStep,
    selectedOffer,
    selectedPaymentMethod,
    isLoading,
    error,
    offers,
    withdrawals,
    submissionInProgress,
    payoutInProgress,
    contactInfo,
    paymentInfo,

    // Getters
    getOffers,
    getWithdrawals,
    getSelectedOffer,

    // Actions
    resetFormData,
    initContactInfoFromUser,
    setStep,
    setSelectedOffer,
    updateContactInfo,
    updatePaymentInfo,
    setPaymentMethod,
    fetchOffers,
    fetchWithdrawals,
    fetchOfferDetails,
    createSellOrder,
    acceptOffer,
    declineOffer,
    completeOffer,
    createOffer,
    cancelOffer,
    cancelWithdraw,
    requestWithdraw,
  }
})
