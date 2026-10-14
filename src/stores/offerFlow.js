import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/plugins/axios'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'

export const useOfferFlowStore = defineStore('offerFlow', () => {
  const userStore = useUserStore()

  // Current step and data storage
  const currentStep = ref(null)
  const selectedOffer = ref(null)
  const selectedPaymentMethod = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const offers = ref([])
  const withdrawals = ref([])
  const submissionInProgress = ref(false)

  // Form data storage with initial values from user store
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
    // Card payment fields
    cardNumber: '',
    cardHolderName: '',
    expirationDate: '',
    // SEPA payment fields
    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',
    // Common fields
    termsAccepted: false,
  })

  // Computed properties
  const getOffers = computed(() => offers.value)
  const getWithdrawals = computed(() => withdrawals.value)
  const getSelectedOffer = computed(() => selectedOffer.value)

  // Reset form data
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

  // Initialize contact info from user data
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

  // Set current step
  const setStep = step => {
    if (step === 'contact') {
      initContactInfoFromUser()
    }
    currentStep.value = step
  }

  // Set selected offer
  const setSelectedOffer = offer => {
    selectedOffer.value = offer
  }

  // Update contact information
  const updateContactInfo = data => {
    contactInfo.value = { ...contactInfo.value, ...data }
  }

  // Set payment method
  const setPaymentMethod = method => {
    selectedPaymentMethod.value = method
  }

  // Update payment information
  const updatePaymentInfo = data => {
    paymentInfo.value = { ...paymentInfo.value, ...data }
  }

  // Format data for withdrawal request
  const formatWithdrawalData = () => {
    const baseData = {
      id: selectedOffer.value?.id,
      address: contactInfo.value.address,
      city: contactInfo.value.city,
      country: contactInfo.value.country,
      email: contactInfo.value.email,
      name: contactInfo.value.firstName,
      surname: contactInfo.value.lastName,
      phone: contactInfo.value.phone,
      postCode: contactInfo.value.postCode,
      withdrawType: selectedPaymentMethod.value,
    }

    if (selectedPaymentMethod.value === 'card') {
      const [month, year] = paymentInfo.value.expirationDate.split('/')
      return {
        ...baseData,
        card_holder_name: paymentInfo.value.cardHolderName,
        card_number: paymentInfo.value.cardNumber.replace(/\s/g, ''),
        expire_month: month,
        expire_year: year,
      }
    } else {
      return {
        ...baseData,
        first_name: paymentInfo.value.accountHolderFirstName,
        last_name: paymentInfo.value.accountHolderLastName,
        account_number: paymentInfo.value.iban.replace(/\s/g, ''),
      }
    }
  }

  // Submit the withdrawal request
  const submitWithdrawal = async () => {
    try {
      isLoading.value = true
      error.value = ''

      const data = formatWithdrawalData()
      const response = await api.post(
        'offer/withdraw/' + selectedPaymentMethod.value,
        data,
      )

      if (response.data.status === 'OK') {
        resetFormData()
        return { success: true }
      }

      throw new Error(response.data.message || 'Failed to process withdrawal')
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      return {
        error: error.value,
        validationErrors: err.response?.data?.errors,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Fetch user's offers
  const fetchWithdrawals = async () => {
    try {
      isLoading.value = true
      const response = await api.get('withdrawals')

      if (response.data.status === 'OK' && response.data.payload) {
        withdrawals.value = response.data.payload
      } else {
        withdrawals.value = []
        toast.error('Failed to fetch withdrawals data')
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error('Failed to fetch withdrawals. Please try again later.')
      withdrawals.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch user's offers
  const fetchOffers = async () => {
    try {
      isLoading.value = true
      const response = await api.get('card-sales')

      if (response.data.status === 'OK' && response.data.payload) {
        offers.value = response.data.payload
      } else {
        offers.value = []
        toast.error('Failed to fetch offers data')
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Failed to fetch offers. Please try again later.')
      offers.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Get details of a specific offer
  const fetchOfferDetails = async offerId => {
    try {
      const response = await api.get(`offer/${offerId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching offer details:', error)
      return null
    }
  }

  const cancelWithdraw = async offerId => {
    try {
      const response = await api.post(`withdrawals/${offerId}/cancel`)
      return response.data
    } catch (error) {
      console.error('Error fetching withdraw details:', error)
      return null
    }
  }
  const cancelOffer = async offerId => {
    try {
      const response = await api.post(`card-sales/${offerId}/cancel`)
      return response.data
    } catch (error) {
      console.error('Error fetching offer details:', error)
      return null
    }
  }

  const requestWithdraw = async data => {
    try {
      const response = await api.post(`withdrawals`, data)
      return response
    } catch (error) {
      console.error('Error withdraw:', error)
      return error
    }
  }

  // Create a new sell order

  const createOffer = async formData => {
    try {
      const payload = formData
      const response = await api.post('offers/cards', payload)
      if (response) {
        return { success: true }
      }
    } catch (error) {
      console.error('Error: ', error.response.data.message)
      return { error: error.response.data.message }
    }
  }
  const createSellOrder = async formData => {
    try {
      submissionInProgress.value = true
      const payload = {
        ...formData,
        currency: formData.currency || 'EUR',
      }

      const response = await api.post('offer/create', payload)

      if (response.data.status === 'OK') {
        await fetchOffers()
        return { success: true, id: response.data.id }
      } else {
        const errorMessage =
          response.data.message || 'Failed to submit sell order'
        toast.error(errorMessage)
        return {
          success: false,
          error: errorMessage,
          validationErrors: response.data.errors || {},
        }
      }
    } catch (error) {
      const validationErrors = error.response?.data?.errors || {}
      let errorMessage =
        'Failed to submit your sell order. Please try again later.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      if (Object.keys(validationErrors).length > 0) {
        const firstErrorKey = Object.keys(validationErrors)[0]
        if (firstErrorKey && validationErrors[firstErrorKey][0]) {
          errorMessage = validationErrors[firstErrorKey][0]
        }
      }

      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage,
        validationErrors: validationErrors,
      }
    } finally {
      submissionInProgress.value = false
    }
  }

  // Accept an offer
  const acceptOffer = async offerId => {
    try {
      isLoading.value = true
      const response = await api.post(`offer/request-payout`, { id: offerId })

      if (response.data.status === 'OK') {
        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'accepted'
        }
        toast.success('Offer successfully accepted')
        return true
      } else {
        toast.error(response.data.message || 'Failed to accept offer')
        return false
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      toast.error('Failed to accept offer. Please try again later.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Decline an offer
  const declineOffer = async offerId => {
    try {
      isLoading.value = true
      const response = await api.post('offer/decline', { id: offerId })

      if (response.data.status === 'OK') {
        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'declined'
        }
        return true
      } else {
        toast.error(response.data.message || 'Failed to decline offer')
        return false
      }
    } catch (error) {
      console.error('Error declining offer:', error)
      toast.error('Failed to decline offer. Please try again later.')
      return false
    } finally {
      isLoading.value = false
    }
  }
  // Complete offer with payment
  const completeOffer = async ({ offerId, payload }) => {
    try {
      isLoading.value = true

      const response = await api.post(`withdrawals/${offerId}/payout`, payload)

      if (response.data.status === 'OK') {
        const offerIndex = offers.value.findIndex(o => o.id === offerId)
        if (offerIndex !== -1) {
          offers.value[offerIndex].status = 'completed'
        }
        return true
      } else {
        let errorMessage = response.data.message || 'Failed to complete offer'

        if (response.data.errors) {
          const firstErrorKey = Object.keys(response.data.errors)[0]
          if (firstErrorKey && response.data.errors[firstErrorKey][0]) {
            errorMessage = response.data.errors[firstErrorKey][0]
          }
        }

        toast.error(errorMessage)
        return {
          success: false,
          error: errorMessage,
          validationErrors: response.data.errors || {},
        }
      }
    } catch (error) {
      console.error('Error completing offer:', error)

      let errorMessage = 'Failed to complete offer. Please try again later.'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      const validationErrors = error.response?.data?.errors || {}
      if (Object.keys(validationErrors).length > 0) {
        const firstErrorKey = Object.keys(validationErrors)[0]
        if (firstErrorKey && validationErrors[firstErrorKey][0]) {
          errorMessage = validationErrors[firstErrorKey][0]
        }
      }

      toast.error(errorMessage)
      return {
        success: false,
        error: errorMessage,
        validationErrors: validationErrors,
      }
    } finally {
      isLoading.value = false
    }
  }

  // Return store methods and properties
  return {
    // State
    currentStep,
    selectedOffer,
    selectedPaymentMethod,
    isLoading,
    error,
    offers,
    submissionInProgress,
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
    setPaymentMethod,
    updatePaymentInfo,
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
