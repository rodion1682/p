<template>
  <BaseModal
    :show="props.show"
    size="small"
    modal-container-class="top-up-modal__modal"
    @close="close"
  >
    <div class="top-up-modal">
      <h2 class="top-up-modal__title _h3">
        {{ $t('Top Up') }}
      </h2>

      <div class="top-up-modal__summary">
        <div class="top-up-modal__summary-row">
          <span class="top-up-modal__summary-label"> {{ $t('Total') }}: </span>

          <span class="top-up-modal__total">
            {{ formattedFiatAmount }}
          </span>
        </div>

        <div class="top-up-modal__summary-divider" />

        <div class="top-up-modal__summary-row">
          <span class="top-up-modal__receive-label">
            {{ $t('You get') }}:
          </span>

          <PriceFormatter
            :price="normalizedInternalAmount"
            size="size-16"
            class="top-up-modal__receive"
          />
        </div>
      </div>

      <div
        v-if="formErrors.general"
        class="top-up-modal__error top-up-modal__error_general"
        role="alert"
      >
        {{ formErrors.general }}
      </div>

      <form class="top-up-modal__form" novalidate @submit.prevent>
        <div class="top-up-modal__fields">
          <BaseInput
            v-model="checkoutForm.name"
            class="top-up-modal__input"
            :placeholder="$t('First name')"
            :error="formErrors.name"
            autocomplete="given-name"
            @input="clearFieldError('name')"
          />

          <BaseInput
            v-model="checkoutForm.surname"
            class="top-up-modal__input"
            :placeholder="$t('Last name')"
            :error="formErrors.surname"
            autocomplete="family-name"
            @input="clearFieldError('surname')"
          />

          <BaseInput
            v-model="checkoutForm.phone"
            class="top-up-modal__input"
            type="tel"
            inputmode="tel"
            :placeholder="$t('Phone')"
            :error="formErrors.phone"
            autocomplete="tel"
            @input="clearFieldError('phone')"
          />

          <BaseInput
            v-model="checkoutForm.email"
            class="top-up-modal__input"
            type="email"
            inputmode="email"
            :placeholder="$t('Email')"
            :error="formErrors.email"
            :disabled="Boolean(authStore.user?.email)"
            autocomplete="email"
            @input="clearFieldError('email')"
          />

          <BaseSelect
            v-model="checkoutForm.country"
            class="top-up-modal__select"
            :options="countryOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('Country')"
            :empty-text="$t('No countries found')"
            :error="formErrors.country"
            required
            @update:model-value="clearFieldError('country')"
          />

          <BaseInput
            v-model="checkoutForm.city"
            class="top-up-modal__input"
            :placeholder="$t('City')"
            :error="formErrors.city"
            autocomplete="address-level2"
            @input="clearFieldError('city')"
          />

          <BaseInput
            v-model="checkoutForm.postCode"
            class="top-up-modal__input"
            :placeholder="$t('Post code')"
            :error="formErrors.postCode"
            autocomplete="postal-code"
            @input="clearFieldError('postCode')"
          />

          <BaseInput
            v-model="checkoutForm.address"
            class="top-up-modal__input"
            :placeholder="$t('Address')"
            :error="formErrors.address"
            autocomplete="street-address"
            @input="clearFieldError('address')"
          />
        </div>

        <div class="top-up-modal__terms">
          <BaseCheckbox
            v-model="checkoutForm.termsAccepted"
            class="top-up-modal__checkbox"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
            terms
          />

          <span
            v-if="formErrors.termsAccepted"
            class="top-up-modal__field-error"
          >
            {{ formErrors.termsAccepted }}
          </span>
        </div>

        <div class="top-up-modal__payments">
          <button
            v-for="method in paymentMethods"
            :key="method.code"
            type="button"
            class="top-up-modal__payment"
            :class="
              selectedPaymentMethod === method.code
                ? 'top-up-modal__payment_active'
                : ''
            "
            :disabled="isLoading"
            @click="handlePayment(method.code)"
          >
            <span class="top-up-modal__payment-content">
              <template v-if="getPaymentMethodImages(method).length">
                <img
                  v-for="(image, index) in getPaymentMethodImages(method)"
                  :key="`${method.code}-${index}`"
                  :src="image"
                  :alt="method.title || method.code"
                  class="top-up-modal__payment-image"
                />
              </template>

              <span v-else class="top-up-modal__payment-name">
                {{ method.title || formatText(method.code) }}
              </span>
            </span>

            <span
              v-if="isLoading && selectedPaymentMethod === method.code"
              class="top-up-modal__loader"
              aria-hidden="true"
            />
          </button>

          <div
            v-if="!paymentMethods.length && !isLoading"
            class="top-up-modal__error top-up-modal__error_methods"
          >
            {{ $t('No payment methods are available.') }}
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_contact_data'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  initialAmount: {
    type: [String, Number],
    default: 0,
  },

  fiatAmount: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(['close', 'update:show'])

const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const toast = useToast()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const isLoading = ref(false)
const selectedPaymentMethod = ref('')
const formErrors = ref({})
const storageReady = ref(false)

const checkoutForm = reactive({
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  postCode: '',
  address: '',
  termsAccepted: false,
})

const normalizeNumber = (value, fallback = 0) => {
  const normalizedValue =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : fallback
}

const normalizeCountryValue = country => {
  if (country === null || country === undefined || country === '') {
    return ''
  }

  if (typeof country === 'object') {
    return country.id ?? country.value ?? country.code ?? ''
  }

  return country
}

const normalizedInternalAmount = computed(() => {
  return normalizeNumber(props.initialAmount, 0)
})

const normalizedFiatAmount = computed(() => {
  return normalizeNumber(props.fiatAmount, 0)
})

const formattedFiatAmount = computed(() => {
  const currencyCode =
    currencyStore.currentCurrencyCode ||
    currencyStore.currentCurrency?.code ||
    'EUR'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedFiatAmount.value)
  } catch (error) {
    const symbol = currencyStore.currentCurrencySymbol || '€'

    return `${symbol}${normalizedFiatAmount.value.toFixed(2)}`
  }
})

const getCountryLabel = country => {
  if (!country) {
    return ''
  }

  if (typeof country.title === 'string') {
    return country.title
  }

  if (country.title && typeof country.title === 'object') {
    return (
      country.title.en ||
      country.title.name ||
      country.title.label ||
      Object.values(country.title).find(value => typeof value === 'string') ||
      ''
    )
  }

  return country.name || country.label || country.code || ''
}

const countryOptions = computed(() => {
  const countries = countriesStore.countries || []

  return countries
    .map(country => {
      return {
        label: getCountryLabel(country),

        value: country.id ?? country.value ?? country.code,

        disabled:
          country.disabled === true ||
          country.status === false ||
          country.status === 0,
      }
    })
    .filter(country => {
      return (
        country.label && country.value !== null && country.value !== undefined
      )
    })
})

const paymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  if (!Array.isArray(methods)) {
    return []
  }

  return methods.filter(method => {
    return (
      method &&
      method.code &&
      method.code !== 'balance' &&
      method.enabled !== false &&
      method.status !== false &&
      method.status !== 0
    )
  })
})

const getImageSource = image => {
  if (!image) {
    return ''
  }

  if (typeof image === 'string') {
    return image
  }

  return image.image || image.url || image.src || image.path || ''
}

const getPaymentMethodImages = method => {
  if (!method) {
    return []
  }

  const footerImages = Array.isArray(method.footer_images)
    ? method.footer_images.map(getImageSource).filter(Boolean)
    : []

  if (footerImages.length) {
    return footerImages
  }

  const mainImage =
    method.logo || method.image || method.icon || method.image_url || ''

  return mainImage ? [mainImage] : []
}

const formatText = value => {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

const getStoredCheckoutData = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const value = localStorage.getItem(CHECKOUT_STORAGE_KEY)

    if (!value) {
      return {}
    }

    const parsed = JSON.parse(value)

    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.error('Unable to read checkout contact data:', error)

    return {}
  }
}

const saveStoredCheckoutData = data => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({
        name: data.name || '',
        surname: data.surname || '',
        phone: data.phone || '',
        email: data.email || '',
        country: normalizeCountryValue(data.country),
        city: data.city || '',
        postCode: data.postCode || '',
        address: data.address || '',
      }),
    )
  } catch (error) {
    console.error('Unable to save checkout contact data:', error)
  }
}

const syncCheckoutStore = () => {
  topupStore.setCheckoutFormData?.({
    name: checkoutForm.name,
    surname: checkoutForm.surname,
    phone: checkoutForm.phone,
    email: checkoutForm.email,
    country: checkoutForm.country,
    city: checkoutForm.city,
    postCode: checkoutForm.postCode,
    address: checkoutForm.address,
    termsAccepted: checkoutForm.termsAccepted,
  })
}

const persistCheckoutForm = () => {
  if (!storageReady.value) {
    return
  }

  saveStoredCheckoutData(checkoutForm)
  syncCheckoutStore()
}

const getProfileCountry = profile => {
  if (profile?.country && typeof profile.country === 'object') {
    return (
      profile.country.id ?? profile.country.value ?? profile.country.code ?? ''
    )
  }

  return profile?.country_id ?? profile?.country ?? ''
}

const prefillForm = () => {
  const profile = userStore.user || {}
  const authUser = authStore.user || {}
  const stored = getStoredCheckoutData()
  const current = topupStore.checkoutFormData || {}

  checkoutForm.name = current.name || stored.name || profile.name || ''

  checkoutForm.surname =
    current.surname || stored.surname || profile.surname || ''

  checkoutForm.phone = current.phone || stored.phone || profile.phone || ''

  checkoutForm.email =
    authUser.email || current.email || stored.email || profile.email || ''

  checkoutForm.country =
    normalizeCountryValue(current.country) ||
    normalizeCountryValue(stored.country) ||
    getProfileCountry(profile)

  checkoutForm.city = current.city || stored.city || profile.city || ''

  checkoutForm.postCode =
    current.postCode ||
    stored.postCode ||
    profile.post_code ||
    profile.postCode ||
    profile.zip ||
    ''

  checkoutForm.address =
    current.address || stored.address || profile.address || ''

  checkoutForm.termsAccepted = Boolean(current.termsAccepted)

  storageReady.value = true

  syncCheckoutStore()
}

const clearFieldError = field => {
  if (!formErrors.value[field]) {
    return
  }

  const nextErrors = {
    ...formErrors.value,
  }

  delete nextErrors[field]

  formErrors.value = nextErrors
}

const resetErrors = () => {
  formErrors.value = {}
}

const validateForm = () => {
  const errors = {}

  if (!checkoutForm.name.trim()) {
    errors.name = 'First name is required'
  }

  if (!checkoutForm.surname.trim()) {
    errors.surname = 'Last name is required'
  }

  if (!checkoutForm.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(checkoutForm.phone.trim())) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!checkoutForm.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!normalizeCountryValue(checkoutForm.country)) {
    errors.country = 'Country is required'
  }

  if (!checkoutForm.city.trim()) {
    errors.city = 'City is required'
  }

  if (!checkoutForm.postCode.trim()) {
    errors.postCode = 'Post code is required'
  }

  if (!checkoutForm.address.trim()) {
    errors.address = 'Address is required'
  }

  if (!checkoutForm.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions'
  }

  if (normalizedInternalAmount.value <= 0) {
    errors.general = 'Invalid top-up amount'
  }

  if (normalizedFiatAmount.value <= 0) {
    errors.general = 'Invalid payment amount'
  }

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyErrorsFromApi = error => {
  const apiErrors = error.response?.data?.errors

  if (apiErrors && typeof apiErrors === 'object') {
    const mappedErrors = {}

    Object.entries(apiErrors).forEach(([field, messages]) => {
      const normalizedField =
        field === 'country_id'
          ? 'country'
          : field === 'post_code'
            ? 'postCode'
            : field

      mappedErrors[normalizedField] = Array.isArray(messages)
        ? messages[0]
        : String(messages)
    })

    formErrors.value = {
      ...formErrors.value,
      ...mappedErrors,
    }

    return
  }

  const message =
    error.response?.data?.message ||
    error.message ||
    'Payment failed. Please try again.'

  formErrors.value = {
    ...formErrors.value,
    general: message,
  }

  toast.error(message)
}

const scrollToFirstError = async () => {
  await nextTick()

  document
    .querySelector(
      '.top-up-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handlePayment = async methodCode => {
  if (isLoading.value || !methodCode) {
    return
  }

  selectedPaymentMethod.value = methodCode

  resetErrors()

  persistCheckoutForm()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    topupStore.amount = normalizedInternalAmount.value

    topupStore.setPaymentType(methodCode)

    const email = authStore.user?.email || checkoutForm.email.trim()

    const countryId = normalizeCountryValue(checkoutForm.country)

    const checkoutData = {
      name: checkoutForm.name.trim(),
      surname: checkoutForm.surname.trim(),
      phone: checkoutForm.phone.trim(),
      email,
      country: countryId,
      country_id: countryId,
      city: checkoutForm.city.trim(),
      postCode: checkoutForm.postCode.trim(),
      post_code: checkoutForm.postCode.trim(),
      address: checkoutForm.address.trim(),
      termsAccepted: checkoutForm.termsAccepted,
      paymentType: methodCode,
      amount: normalizedInternalAmount.value,
      currency:
        currencyStore.currentCurrency?.code ||
        currencyStore.currentCurrencyCode ||
        'EUR',
    }

    saveStoredCheckoutData({
      ...checkoutForm,
      email,
      country: countryId,
    })

    topupStore.setCheckoutFormData?.({
      name: checkoutData.name,
      surname: checkoutData.surname,
      phone: checkoutData.phone,
      email: checkoutData.email,
      country: countryId,
      city: checkoutData.city,
      postCode: checkoutData.postCode,
      address: checkoutData.address,
      termsAccepted: checkoutForm.termsAccepted,
    })

    const response = await topupStore.checkout(checkoutData)

    const redirectUrl = response?.redirect_url || response?.data?.redirect_url

    if (redirectUrl) {
      window.location.assign(redirectUrl)

      return
    }

    if (response?.status === 'ERROR' || response?.success === false) {
      throw new Error(response.message || 'Payment failed. Please try again.')
    }

    throw new Error('The payment provider did not return a redirect URL.')
  } catch (error) {
    console.error('Payment failed:', error)

    applyErrorsFromApi(error)

    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const initializeModal = async () => {
  isLoading.value = true
  storageReady.value = false

  resetErrors()

  selectedPaymentMethod.value = ''

  try {
    await Promise.all([
      countriesStore.countries?.length
        ? Promise.resolve()
        : countriesStore.fetchCountries(),

      userStore.user ? Promise.resolve() : userStore.fetchProfile(),

      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings(),
    ])

    await nextTick()

    prefillForm()
  } catch (error) {
    console.error('Unable to initialize top-up modal:', error)

    formErrors.value.general =
      error.response?.data?.message ||
      error.message ||
      'Unable to prepare the payment form.'
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (isLoading.value) {
    return
  }

  persistCheckoutForm()

  selectedPaymentMethod.value = ''

  resetErrors()

  emit('close')
  emit('update:show', false)
}

watch(
  checkoutForm,
  () => {
    persistCheckoutForm()
  },
  {
    deep: true,
  },
)

watch(
  () => props.show,
  value => {
    if (value) {
      initializeModal()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => authStore.user?.email,
  email => {
    if (!email) {
      return
    }

    checkoutForm.email = email

    if (storageReady.value) {
      persistCheckoutForm()
    }
  },
)
</script>

<style lang="scss" scoped>
.top-up-modal {
  width: 100%;
  max-width: 390px;

  margin: 0 auto;

  &__title {
    padding: 0 35px;

    color: var(--primary-color);
    font-weight: 500;
    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__summary {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 16);
    }
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-height: 34px;
  }

  &__summary-label {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 140%;
  }

  &__total {
    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 22px;
    font-weight: 600;
    line-height: 120%;
  }

  &__summary-divider {
    width: 100%;
    height: 1px;

    margin: 10px 0;

    background-color: var(--border-secondary-color);
  }

  &__receive-label {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 140%;
  }

  &__receive {
    margin-left: auto;

    :deep(.price) {
      color: var(--secondary-color);
    }
  }

  &__form {
    width: 100%;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 14px;

    width: 100%;
  }

  &__input,
  &__select {
    width: 100%;
  }

  &__terms {
    @include adaptiveValue('margin-top', 16, 14);

    width: 100%;
  }

  &__checkbox {
    width: 100%;
  }

  &__terms-text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 145%;
  }

  &__link {
    margin: 0 2px;

    color: var(--hint-secondary-color);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__field-error {
    display: block;

    margin-top: 6px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 140%;
  }

  &__payments {
    @include adaptiveValue('margin-top', 26, 20);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__payment {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 40px;

    padding: 5px 45px;

    border: 1px solid var(--hint-fifth-color);
    outline: none;
    background-color: transparent;

    color: var(--primary-color);

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease;

    &_active {
      border-color: var(--hint-secondary-color);
    }

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-secondary-color);
        background-color: rgb(142 178 224 / 4%);
      }
    }
  }

  &__payment-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;

    min-width: 0;
  }

  &__payment-image {
    display: block;

    width: auto;
    max-width: 70px;
    height: 22px;

    object-fit: contain;
  }

  &__payment-name {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 120%;
    text-transform: capitalize;
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 13px;

    width: 16px;
    height: 16px;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    transform: translateY(-50%);
    animation: top-up-modal-spin 0.8s linear infinite;

    border-top-color: var(--hint-secondary-color);
  }

  &__error {
    padding: 9px 11px;

    border: 1px solid rgb(192 67 113 / 35%);
    background-color: rgb(192 67 113 / 8%);

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 145%;

    &_general {
      margin-bottom: 14px;
    }

    &_methods {
      text-align: center;
    }
  }

  :deep(.base-input__control),
  :deep(.base-select__control) {
    min-height: 38px;

    padding-right: 13px;
    padding-left: 13px;

    border-color: var(--border-third-color);
    border-radius: 0;
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;

    &::placeholder {
      opacity: 0.7;

      color: var(--secondary-color);
    }

    &:focus {
      border-color: var(--hint-secondary-color);
    }
  }

  :deep(.base-input__control_error),
  :deep(.base-select__control_error) {
    border-color: var(--error-color);
  }

  :deep(.base-select__list) {
    z-index: calc(var(--modal-z-index) + 2);

    border-color: var(--border-third-color);
    background-color: var(--bg-primary-color);
  }

  :deep(.base-checkbox) {
    align-items: flex-start;
  }

  @media (max-width: $md7) {
    max-width: none;

    &__title {
      padding: 0 30px;
    }

    &__fields {
      gap: 10px;
    }

    &__payment {
      min-height: 42px;
    }
  }
}

:deep(.top-up-modal__modal) {
  width: min(calc(100vw - 30px), 470px);
  max-width: 470px;
}

@keyframes top-up-modal-spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
