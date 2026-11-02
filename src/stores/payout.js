import api from '@/plugins/axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const usePayoutStore = defineStore('payout', () => {
  const isLoading = ref(false)
  const error = ref('')
  const currentWithdrawRequestId = ref(null)
  const currentPayoutStatus = ref('')

  const amount = ref('')

  const contactInfo = ref({
    name: '',
    surname: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    postCode: '',
    address: '',
    currency: '',
  })

  const paymentInfo = ref({
    method: 'card-form',

    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',

    accountHolderFirstName: '',
    accountHolderLastName: '',
    iban: '',
  })

  const getPayoutId = computed(() => currentWithdrawRequestId.value)
  const getPayoutStatus = computed(() => currentPayoutStatus.value)

  const clearError = () => {
    error.value = ''
  }

  const resetFormData = () => {
    isLoading.value = false
    error.value = ''
    currentWithdrawRequestId.value = null
    currentPayoutStatus.value = ''
    amount.value = ''

    contactInfo.value = {
      name: '',
      surname: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      postCode: '',
      address: '',
      currency: '',
    }

    paymentInfo.value = {
      method: 'card-form',
      cardHolderName: '',
      cardNumber: '',
      expirationDate: '',
      accountHolderFirstName: '',
      accountHolderLastName: '',
      iban: '',
    }
  }

  const setAmount = value => {
    amount.value = value
  }

  const setPaymentMethod = method => {
    paymentInfo.value.method = method || 'card-form'
  }

  const updateContactInfo = data => {
    contactInfo.value = {
      ...contactInfo.value,
      ...data,
    }
  }

  const updatePaymentInfo = data => {
    paymentInfo.value = {
      ...paymentInfo.value,
      ...data,
    }
  }

  const createWithdrawRequest = async withdrawAmount => {
    const { data } = await api.post('/user/withdraw-requests', {
      amount: Number(withdrawAmount),
    })

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to create withdraw request')
    }

    const requestId = data?.payload?.id || data?.id

    if (!requestId) {
      throw new Error('Withdraw request ID was not returned')
    }

    currentWithdrawRequestId.value = requestId
    currentPayoutStatus.value = data?.payload?.status || ''

    return data.payload
  }

  const sendCardFormPayout = async withdrawRequestId => {
    const payload = {
      email: contactInfo.value.email,
      name: contactInfo.value.name,
      surname: contactInfo.value.surname,
      phone: contactInfo.value.phone,
      country: String(contactInfo.value.country || ''),
      currency: contactInfo.value.currency,
      city: contactInfo.value.city,
      address: contactInfo.value.address,
      postCode: contactInfo.value.postCode,
    }

    const { data } = await api.post(
      `/user/withdraw-requests/${withdrawRequestId}/payout/card-form`,
      payload,
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to create card payout')
    }

    return data
  }

  const sendSepaManualPayout = async withdrawRequestId => {
    const payload = {
      email: contactInfo.value.email,
      name: contactInfo.value.name,
      surname: contactInfo.value.surname,
      phone: contactInfo.value.phone,
      country: String(contactInfo.value.country || ''),
      currency: contactInfo.value.currency,
      city: contactInfo.value.city,
      address: contactInfo.value.address,
      postCode: contactInfo.value.postCode,

      first_name: paymentInfo.value.accountHolderFirstName,
      last_name: paymentInfo.value.accountHolderLastName,
      account_number: String(paymentInfo.value.iban || '').replace(/\s/g, ''),
    }

    const { data } = await api.post(
      `/user/withdraw-requests/${withdrawRequestId}/payout/sepa-manual`,
      payload,
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to create SEPA payout')
    }

    return data
  }

  const sendCardDirectPayout = async withdrawRequestId => {
    const [expireMonth = '', expireYear = ''] = String(
      paymentInfo.value.expirationDate || '',
    )
      .split('/')
      .map(v => v.trim())

    const payload = {
      email: contactInfo.value.email,
      name: contactInfo.value.name,
      surname: contactInfo.value.surname,
      phone: contactInfo.value.phone,
      country: String(contactInfo.value.country || ''),
      currency: contactInfo.value.currency,
      city: contactInfo.value.city,
      address: contactInfo.value.address,
      postCode: contactInfo.value.postCode,

      card_holder_name: paymentInfo.value.cardHolderName,
      card_number: String(paymentInfo.value.cardNumber || '').replace(
        /\s/g,
        '',
      ),
      expire_month: expireMonth,
      expire_year: expireYear,
    }

    const { data } = await api.post(
      `/user/withdraw-requests/${withdrawRequestId}/payout/card-direct`,
      payload,
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || 'Failed to create card payout')
    }

    return data
  }
  const createPayout = async (payload = null) => {
    try {
      isLoading.value = true
      error.value = ''

      if (payload) {
        amount.value = payload.amount

        contactInfo.value = {
          ...contactInfo.value,
          name: payload.name,
          surname: payload.surname,
          email: payload.email,
          phone: payload.phone,
          country: payload.country,
          city: payload.city,
          postCode: payload.postCode,
          address: payload.address,
          currency: payload.currency,
        }

        paymentInfo.value = {
          ...paymentInfo.value,
          method: payload.withdrawType || 'card-form',

          accountHolderFirstName:
            payload.first_name ||
            payload.accountHolderFirstName ||
            payload.name ||
            '',

          accountHolderLastName:
            payload.last_name ||
            payload.accountHolderLastName ||
            payload.surname ||
            '',

          iban: payload.account_number || payload.iban || '',
        }
      }

      const withdrawRequest = await createWithdrawRequest(amount.value)
      const withdrawRequestId = withdrawRequest.id

      let result

      if (paymentInfo.value.method === 'sepa-manual') {
        result = await sendSepaManualPayout(withdrawRequestId)
      } else if (paymentInfo.value.method === 'card-direct') {
        result = await sendCardDirectPayout(withdrawRequestId)
      } else {
        result = await sendCardFormPayout(withdrawRequestId)
      }

      currentPayoutStatus.value = result?.payload?.status || ''

      return {
        success: true,
        data: result,
        redirect_url: result?.redirect_url || null,
        message: result?.message || '',
      }
    } catch (err) {
      error.value =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit withdraw request'

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
    isLoading,
    error,
    amount,
    contactInfo,
    paymentInfo,
    currentWithdrawRequestId,
    currentPayoutStatus,

    getPayoutId,
    getPayoutStatus,

    clearError,
    resetFormData,
    setAmount,
    setPaymentMethod,
    updateContactInfo,
    updatePaymentInfo,

    createWithdrawRequest,
    sendCardFormPayout,
    sendSepaManualPayout,
    sendCardDirectPayout,

    createPayout,
  }
})
