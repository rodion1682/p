import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/plugins/axios'

const FALLBACK_CURRENCY = {
  code: import.meta.env.VITE_FALLBACK_CURRENCY_CODE || 'EUR',
  value: Number(import.meta.env.VITE_FALLBACK_CURRENCY_VALUE) || 1,
  symbol: import.meta.env.VITE_FALLBACK_CURRENCY_SYMBOL || '€',
  default: 0,
}

export const useCurrencyStore = defineStore('currency', () => {
  const currencies = ref([])
  const currentCurrencyCode = ref(
    localStorage.getItem('currencyCode') || FALLBACK_CURRENCY.code,
  )
  const currentCurrencySymbol = ref(
    localStorage.getItem('currencySymbol') || FALLBACK_CURRENCY.symbol,
  )
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const currentCurrency = computed(
    () =>
      currencies.value.find(curr => curr.code === currentCurrencyCode.value) ||
      FALLBACK_CURRENCY,
  )

  const currencyOptions = computed(() =>
    currencies.value.map(curr => ({
      label: `${curr.code}`,
      value: curr.code,
    })),
  )

  const getDefaultCurrencyCode = () => {
    const storedCurrencyCode = localStorage.getItem('currencyCode')
    if (
      storedCurrencyCode &&
      currencies.value.some(curr => curr.code === storedCurrencyCode)
    ) {
      return storedCurrencyCode
    }

    const defaultCurr = currencies.value.find(curr => curr.default === 1)
    if (defaultCurr) {
      return defaultCurr.code
    }

    return currencies.value[0]?.code || FALLBACK_CURRENCY.code
  }

  const changeCurrency = async code => {
    if (!code || code === currentCurrencyCode.value) return

    try {
      const isValidCurrency = currencies.value.some(curr => curr.code === code)
      if (!isValidCurrency) {
        throw new Error('Invalid currency code')
      }

      // Update both the currency code and symbol in local storage
      const selectedCurrency = currencies.value.find(curr => curr.code === code)
      currentCurrencyCode.value = code
      currentCurrencySymbol.value = selectedCurrency.symbol
      localStorage.setItem('currencyCode', code)
      localStorage.setItem('currencySymbol', selectedCurrency.symbol)

      await updatePrices(code)
    } catch (err) {
      console.error('Currency change error:', err.message)
      const fallbackCode = getDefaultCurrencyCode()
      currentCurrencyCode.value = fallbackCode
      const fallbackCurrency =
        currencies.value.find(curr => curr.code === fallbackCode) ||
        FALLBACK_CURRENCY
      currentCurrencySymbol.value = fallbackCurrency.symbol
      localStorage.setItem('currencyCode', fallbackCode)
      localStorage.setItem('currencySymbol', fallbackCurrency.symbol)
    }
  }

  const updatePrices = async code => {
    // Implement your price update logic here
  }

  const fetchCurrencies = async () => {
    isLoading.value = true
    try {
      const { data } = await axiosInstance.get('currencies')

      if (data.status === 'OK' && Array.isArray(data.payload)) {
        currencies.value = data.payload

        const defaultCurrencyCode = getDefaultCurrencyCode()
        await changeCurrency(defaultCurrencyCode)
      }
    } catch (err) {
      console.error('Currency fetch error:', err)
      error.value = 'Failed to load currencies'

      currencies.value = [FALLBACK_CURRENCY]
      await changeCurrency(FALLBACK_CURRENCY.code)
    } finally {
      isLoading.value = false
    }
  }

  const initializeCurrencies = async () => {
    if (currencies.value.length === 0) {
      await fetchCurrencies()
    } else if (!currentCurrencyCode.value) {
      const defaultCurrencyCode = getDefaultCurrencyCode()
      await changeCurrency(defaultCurrencyCode)
    }
  }

  const formatPrice = amount => {
    if (!amount) return '0.00'

    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentCurrencyCode.value,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      return formatter.format(amount)
    } catch (err) {
      console.error('Price format error:', err)
      return `${currentCurrencySymbol.value}${Number(amount).toFixed(2)}`
    }
  }

  return {
    currencies,
    currentCurrencyCode,
    currentCurrencySymbol,
    currentCurrency,
    currencyOptions,
    isLoading,
    error,
    changeCurrency,
    fetchCurrencies,
    initializeCurrencies,
    formatPrice,
  }
})
