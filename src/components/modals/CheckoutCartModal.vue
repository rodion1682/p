<template>
  <BaseModal
    :show="props.show"
    variant="dialog"
    size="large"
    :max-width="1120"
    modal-class="cart-checkout-dialog"
    labelledby="cart-checkout-modal-title"
    @close="close"
  >
    <div class="cart-checkout-modal">
      <div class="cart-checkout-modal__main">
        <h2
          id="cart-checkout-modal-title"
          class="cart-checkout-modal__title _h4"
        >
          {{ $t('Payment details') }}
        </h2>
        <div
          v-if="formErrors.general"
          class="cart-checkout-modal__error"
          role="alert"
        >
          {{ formErrors.general }}
        </div>

        <form
          id="cart-checkout-payment-form"
          class="cart-checkout-modal__form"
          novalidate
          @submit.prevent="handlePay"
        >
          <div class="cart-checkout-modal__fields">
            <BaseInput
              v-model="topupStore.checkoutFormData.name"
              class="cart-checkout-modal__input"
              :placeholder="$t('First Name')"
              :error="formErrors.name"
              autocomplete="given-name"
              @input="clearFieldError('name')"
            />

            <BaseSelect
              v-model="topupStore.checkoutFormData.country"
              class="cart-checkout-modal__select"
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
              v-model="topupStore.checkoutFormData.surname"
              class="cart-checkout-modal__input"
              :placeholder="$t('Last Name')"
              :error="formErrors.surname"
              autocomplete="family-name"
              @input="clearFieldError('surname')"
            />

            <BaseInput
              v-model="topupStore.checkoutFormData.city"
              class="cart-checkout-modal__input"
              :placeholder="$t('City')"
              :error="formErrors.city"
              autocomplete="address-level2"
              @input="clearFieldError('city')"
            />

            <BaseInput
              v-model="topupStore.checkoutFormData.email"
              class="cart-checkout-modal__input"
              type="email"
              inputmode="email"
              :placeholder="$t('Email')"
              :error="formErrors.email"
              :disabled="Boolean(authStore.user?.email)"
              autocomplete="email"
              @input="clearFieldError('email')"
            />

            <BaseInput
              v-model="topupStore.checkoutFormData.address"
              class="cart-checkout-modal__input"
              :placeholder="$t('Address')"
              :error="formErrors.address"
              autocomplete="street-address"
              @input="clearFieldError('address')"
            />

            <BaseInput
              v-model="topupStore.checkoutFormData.phone"
              class="cart-checkout-modal__input"
              type="tel"
              inputmode="tel"
              :placeholder="$t('Phone')"
              :error="formErrors.phone"
              autocomplete="tel"
              @input="clearFieldError('phone')"
            />

            <BaseInput
              v-model="topupStore.checkoutFormData.postCode"
              class="cart-checkout-modal__input"
              :placeholder="$t('Post code')"
              :error="formErrors.postCode"
              autocomplete="postal-code"
              @input="clearFieldError('postCode')"
            />
          </div>

          <div class="cart-checkout-modal__terms">
            <BaseCheckbox
              v-model="topupStore.checkoutFormData.termsAccepted"
              class="cart-checkout-modal__checkbox"
              :error="formErrors.termsAccepted"
              @update:model-value="clearFieldError('termsAccepted')"
              terms
            />

            <span
              v-if="formErrors.termsAccepted"
              class="cart-checkout-modal__field-error"
            >
              {{ formErrors.termsAccepted }}
            </span>
          </div>
        </form>
      </div>
      <aside class="cart-checkout-modal__sidebar">
        <h3 class="cart-checkout-modal__sidebar-title _h6">
          {{ $t('Payment method') }}
        </h3>
        <div class="cart-checkout-modal__summary">
          <div class="cart-checkout-modal__summary-row">
            <span class="cart-checkout-modal__summary-label">{{
              $t('Total')
            }}</span>
            <span class="cart-checkout-modal__total">{{
              formattedCartTotal
            }}</span>
          </div>
          <div class="cart-checkout-modal__summary-row">
            <span class="cart-checkout-modal__payment-label">{{
              $t('You get')
            }}</span>
            <span class="cart-checkout-modal__payment-value">
              <PriceFormatter :price="normalizedCartTotal" size="size-14" />
            </span>
          </div>
        </div>
        <div class="cart-checkout-modal__actions">
          <BaseButton
            type="submit"
            form="cart-checkout-payment-form"
            variant="primary"
            class="cart-checkout-modal__submit"
            :disabled="!isFormValid || isLoading"
          >
            <span v-if="isLoading">{{ $t('Processing...') }}</span>
            <span v-else>
              {{
                selectedPaymentMethod?.title ||
                formatText(topupStore.paymentType)
              }}
            </span>
          </BaseButton>
        </div>
      </aside>
    </div>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
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
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_contact_data'

const CONTACT_FIELDS = [
  'name',
  'surname',
  'phone',
  'email',
  'country',
  'city',
  'postCode',
  'address',
]

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  total: {
    type: [Number, String],
    default: 0,
  },
})

const emit = defineEmits(['close', 'back'])

const router = useRouter()
const toast = useToast()

const currencyStore = useCurrencyStore()
const topupStore = useTopUpStore()
const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const purchaseStore = usePurchaseStore()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()
const { checkoutFormData } = storeToRefs(topupStore)

const isLoading = ref(false)
const formErrors = ref({})
const storageReady = ref(false)

const currencyCode = computed(() => {
  const code =
    currencyStore.currentCurrency?.code ?? currencyStore.currentCurrencyCode

  return typeof code === 'string' && code ? code : 'EUR'
})

const currencySymbol = computed(() => {
  const symbol =
    currencyStore.currentCurrency?.symbol ?? currencyStore.currentCurrencySymbol

  return typeof symbol === 'string' && symbol ? symbol : '€'
})

const normalizeNumber = (value, fallback = 0) => {
  const normalized =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalized)

  return Number.isFinite(number) ? number : fallback
}

const normalizedCartTotal = computed(() => {
  return normalizeNumber(props.total, 0)
})

const formattedCartTotal = computed(() => {
  const amount = normalizedCartTotal.value

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencySymbol.value}`
  }
})

const normalizeCountryValue = country => {
  if (country === null || country === undefined || country === '') {
    return ''
  }

  if (typeof country === 'object') {
    return country.id ?? country.value ?? country.code ?? ''
  }

  return country
}

const getCountryLabel = country => {
  if (!country) return ''

  if (typeof country.title === 'string') {
    return country.title
  }

  if (country.title && typeof country.title === 'object') {
    const translated =
      country.title.en ||
      country.title.name ||
      country.title.label ||
      Object.values(country.title).find(value => typeof value === 'string')

    if (translated) return translated
  }

  return country.name || country.label || country.code || ''
}

const countryOptions = computed(() => {
  return (countriesStore.countries || [])
    .map(country => ({
      label: getCountryLabel(country),
      value: country.id ?? country.value ?? country.code,
      disabled:
        country.disabled === true ||
        country.status === false ||
        country.status === 0,
    }))
    .filter(country => {
      return (
        country.label && country.value !== null && country.value !== undefined
      )
    })
})

const selectedPaymentMethod = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  if (!Array.isArray(methods)) return null

  return methods.find(method => method.code === topupStore.paymentType) || null
})

const formatText = value => {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

const getStoredCheckoutData = () => {
  if (typeof window === 'undefined') return {}

  try {
    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY)

    if (!raw) return {}

    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return parsed
  } catch (error) {
    console.error('Unable to read checkout contact data:', error)
    return {}
  }
}

const saveStoredCheckoutData = data => {
  if (typeof window === 'undefined') return

  try {
    const saved = {}

    for (const field of CONTACT_FIELDS) {
      saved[field] =
        field === 'country'
          ? normalizeCountryValue(data[field])
          : String(data[field] ?? '')
    }

    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(saved))
  } catch (error) {
    console.error('Unable to save checkout contact data:', error)
  }
}

const getProfileCountry = profile => {
  return normalizeCountryValue(profile?.country_id ?? profile?.country ?? '')
}

const getProfileData = () => {
  const profile = userStore.user || {}
  const authUser = authStore.user || {}

  return {
    name: profile.name || authUser.name || '',
    surname: profile.surname || authUser.surname || '',
    phone: profile.phone || authUser.phone || '',
    email: authUser.email || profile.email || '',
    country: getProfileCountry(profile),
    city: profile.city || '',
    postCode: profile.post_code || profile.postCode || profile.zip || '',
    address: profile.address || '',
  }
}

const prefillFormData = () => {
  const profile = getProfileData()
  const stored = getStoredCheckoutData()
  const current = checkoutFormData.value || {}

  const result = {}

  for (const field of CONTACT_FIELDS) {
    if (field === 'country') {
      result.country =
        normalizeCountryValue(current.country) ||
        normalizeCountryValue(stored.country) ||
        normalizeCountryValue(profile.country) ||
        ''

      continue
    }

    result[field] = current[field] || stored[field] || profile[field] || ''
  }

  if (authStore.user?.email) {
    result.email = authStore.user.email
  }

  result.termsAccepted = false

  topupStore.setCheckoutFormData(result)

  storageReady.value = true
}

const persistCheckoutForm = () => {
  if (!storageReady.value || !checkoutFormData.value) {
    return
  }

  saveStoredCheckoutData(checkoutFormData.value)
}

const isFormValid = computed(() => {
  const formData = checkoutFormData.value

  if (!formData) return false

  return Boolean(
    formData.name?.trim() &&
    formData.surname?.trim() &&
    formData.phone?.trim() &&
    normalizeCountryValue(formData.country) &&
    formData.city?.trim() &&
    formData.address?.trim() &&
    formData.postCode?.trim() &&
    formData.termsAccepted &&
    (authStore.user?.email || formData.email?.trim()) &&
    topupStore.paymentType,
  )
})

const clearFieldError = field => {
  if (!formErrors.value[field]) return

  const errors = { ...formErrors.value }

  delete errors[field]

  formErrors.value = errors
}

const resetErrors = () => {
  formErrors.value = {}
}

const validateForm = () => {
  const errors = {}
  const formData = checkoutFormData.value

  if (!formData) return false

  if (!formData.name?.trim()) {
    errors.name = 'First name is required'
  }

  if (!formData.surname?.trim()) {
    errors.surname = 'Last name is required'
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone.trim())) {
    errors.phone = 'Please enter a valid phone number'
  }

  const email = authStore.user?.email || formData.email || ''

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (!normalizeCountryValue(formData.country)) {
    errors.country = 'Country is required'
  }

  if (!formData.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!formData.postCode?.trim()) {
    errors.postCode = 'Post code is required'
  }

  if (!formData.address?.trim()) {
    errors.address = 'Address is required'
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions'
  }

  if (!topupStore.paymentType) {
    errors.general = 'Please select a payment method'
  }

  if (normalizedCartTotal.value <= 0) {
    errors.general = 'Your cart is empty'
  }

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyApiErrors = error => {
  const apiErrors = error?.response?.data?.errors

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
    error?.response?.data?.message ||
    error?.message ||
    'An error occurred during checkout'

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
      '.cart-checkout-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handlePay = async () => {
  if (isLoading.value) return

  resetErrors()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    const formData = checkoutFormData.value
    const countryId = normalizeCountryValue(formData.country)

    const paymentType =
      selectedPaymentMethod.value?.code || topupStore.paymentType

    const purchaseData = {
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      email: authStore.user?.email || formData.email.trim(),
      phone: formData.phone.trim(),
      country: countryId,
      country_id: countryId,
      city: formData.city.trim(),
      address: formData.address.trim(),
      postCode: formData.postCode.trim(),
      post_code: formData.postCode.trim(),
      paymentType,
    }

    persistCheckoutForm()

    const response = await purchaseStore.purchaseCartItems(purchaseData)

    if (response?.success) {
      resetErrors()

      if (response.redirect_url) {
        window.location.assign(response.redirect_url)
        return
      }

      await router.push({
        name: 'SuccessPaymentPage',
      })

      return
    }

    throw new Error(
      response?.error ||
        response?.message ||
        'An error occurred during checkout',
    )
  } catch (error) {
    console.error('Checkout error:', error)

    applyApiErrors(error)

    purchaseStore.error =
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred during checkout'

    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const initializeModal = async () => {
  isLoading.value = true
  storageReady.value = false
  resetErrors()

  try {
    const results = await Promise.allSettled([
      countriesStore.countries?.length
        ? Promise.resolve()
        : countriesStore.fetchCountries(),

      userStore.fetchProfile(),

      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings(),
    ])

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Checkout initialization request failed:', result.reason)
      }
    }
  } catch (error) {
    console.error('Failed to initialize checkout:', error)
  } finally {
    prefillFormData()
    isLoading.value = false
  }
}

const close = () => {
  if (isLoading.value) return

  persistCheckoutForm()
  resetErrors()

  emit('close')
}

watch(
  checkoutFormData,
  () => {
    persistCheckoutForm()
  },
  {
    deep: true,
  },
)

watch(
  () => props.show,
  show => {
    if (show) {
      initializeModal()
    } else {
      storageReady.value = false
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => authStore.user?.email,
  email => {
    if (!email || !checkoutFormData.value) return

    topupStore.setCheckoutFormData({ email })
  },
)
</script>

<style lang="scss" scoped>
.cart-checkout-modal {
  display: grid;
  align-items: stretch;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) 320px;

  width: 100%;
  min-width: 0;

  &__main,
  &__sidebar {
    @include adaptiveValue('border-radius', 22, 10);
    min-width: 0;

    background: linear-gradient(180deg, #111624 0%, #111624 100%);
  }

  &__main {
    @include adaptiveValue('padding-top', 50, 30);
    @include adaptiveValue('padding-left', 64, 10);
    @include adaptiveValue('padding-right', 64, 10);
    @include adaptiveValue('padding-bottom', 42, 10);
  }

  &__title {
    margin: 0 0 30px;

    color: var(--fourth-color);
    text-align: center;
    text-transform: none;
  }

  &__fields {
    display: grid;
    gap: 12px 18px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    width: 100%;
  }

  &__form,
  &__input,
  &__select {
    width: 100%;
    min-width: 0;
  }

  &__terms {
    margin-top: 28px;
  }
  &__checkbox {
    width: 100%;
  }

  &__field-error,
  &__error {
    color: var(--error-color);
    font-family: var(--font-open-sans);
    font-size: 12px;
    line-height: 1.5;
  }
  &__field-error {
    display: block;

    margin-top: 6px;
  }
  &__error {
    margin-bottom: 14px;
  }

  &__sidebar {
    @include adaptiveValue('padding-left', 32, 10);
    @include adaptiveValue('padding-right', 32, 10);
    @include adaptiveValue('padding-bottom', 42, 10);
    display: flex;
    flex-direction: column;

    padding-top: 40px;
  }
  &__sidebar-title {
    margin: 0 0 34px;

    color: var(--fourth-color);
    text-align: center;
    text-transform: none;
  }

  &__summary {
    display: flex;
    flex-direction: column;
    gap: 16px;

    padding: 18px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: var(--bg-primary-color);
  }
  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    min-width: 0;
  }
  &__summary-label,
  &__payment-label {
    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 500;
  }
  &__total {
    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 16px;
    font-weight: 600;
    text-align: right;

    overflow-wrap: anywhere;
  }
  &__payment-value {
    min-width: 0;
    :deep(.price) {
      flex-direction: row-reverse;
    }
  }
  &__actions {
    margin-top: auto;
    padding-top: 28px;
  }
  &__submit {
    width: 100%;
    min-height: 44px;
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 1fr);

    padding: 12px;
    &__main {
      padding-top: 50px;
    }
    &__sidebar {
      padding-top: 10px;
    }
    &__sidebar-title {
      margin-bottom: 18px;
    }
    &__actions {
      margin-top: 8px;
      padding-top: 16px;
    }
  }
  @media (max-width: $md6) {
    padding: 0px;
    &__fields {
      gap: 10px;
      grid-template-columns: minmax(0, 1fr);
    }
    &__title {
      margin-bottom: 22px;
    }
    &__terms {
      margin-top: 20px;
    }
  }
}
</style>
