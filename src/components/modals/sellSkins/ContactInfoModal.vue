<template>
  <BaseModal
    :show="props.show"
    size="small"
    modal-container-class="withdraw-modal__modal"
    @close="close"
  >
    <div class="withdraw-modal">
      <h2 class="withdraw-modal__title _h3">
        {{ $t('Withdraw') }}
      </h2>

      <div class="withdraw-modal__summary">
        <div class="withdraw-modal__summary-row">
          <span class="withdraw-modal__summary-label">
            {{ $t('Total') }}:
          </span>

          <PriceFormatter
            :price="normalizedAmount"
            size="size-24"
            class="withdraw-modal__summary-price"
          />
        </div>

        <div class="withdraw-modal__summary-divider" />

        <div class="withdraw-modal__summary-row">
          <span class="withdraw-modal__receive-label">
            {{ $t('You get') }}:
          </span>

          <span class="withdraw-modal__receive-value">
            {{ formattedPayoutAmount }}
          </span>
        </div>
      </div>

      <div
        v-if="formErrors.general"
        class="withdraw-modal__error withdraw-modal__error_general"
        role="alert"
      >
        {{ formErrors.general }}
      </div>

      <form
        class="withdraw-modal__form"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="withdraw-modal__fields">
          <BaseInput
            v-model="checkoutForm.name"
            class="withdraw-modal__input"
            :placeholder="$t('First name')"
            :error="formErrors.name"
            autocomplete="given-name"
            @input="clearFieldError('name')"
          />

          <BaseInput
            v-model="checkoutForm.surname"
            class="withdraw-modal__input"
            :placeholder="$t('Last name')"
            :error="formErrors.surname"
            autocomplete="family-name"
            @input="clearFieldError('surname')"
          />

          <BaseInput
            v-model="checkoutForm.phone"
            class="withdraw-modal__input"
            type="tel"
            inputmode="tel"
            :placeholder="$t('Phone')"
            :error="formErrors.phone"
            autocomplete="tel"
            @input="clearFieldError('phone')"
          />

          <BaseInput
            v-model="checkoutForm.email"
            class="withdraw-modal__input"
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
            class="withdraw-modal__select"
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
            class="withdraw-modal__input"
            :placeholder="$t('City')"
            :error="formErrors.city"
            autocomplete="address-level2"
            @input="clearFieldError('city')"
          />

          <BaseInput
            v-model="checkoutForm.postCode"
            class="withdraw-modal__input"
            :placeholder="$t('Post code')"
            :error="formErrors.postCode"
            autocomplete="postal-code"
            @input="clearFieldError('postCode')"
          />

          <BaseInput
            v-model="checkoutForm.address"
            class="withdraw-modal__input"
            :placeholder="$t('Address')"
            :error="formErrors.address"
            autocomplete="street-address"
            @input="clearFieldError('address')"
          />

          <div class="withdraw-modal__amount">
            <BaseInput
              v-model="amount"
              class="withdraw-modal__input"
              type="number"
              inputmode="decimal"
              :placeholder="$t('Amount')"
              :error="formErrors.amount"
              min="0.01"
              :max="currentBalance"
              step="0.01"
              @input="handleAmountInput"
            >
              <template #suffix>
                <span class="withdraw-modal__amount-prefix">
                  {{ internalCurrencySymbol }}
                </span>
              </template>
            </BaseInput>

            <div class="withdraw-modal__balance">
              <span> {{ $t('Available balance') }}: </span>

              <PriceFormatter
                :price="currentBalance"
                size="size-14"
                :balance="true"
              />
            </div>
          </div>
        </div>

        <div class="withdraw-modal__terms">
          <BaseCheckbox
            v-model="checkoutForm.termsAccepted"
            class="withdraw-modal__checkbox"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
            terms
          />

          <span
            v-if="formErrors.termsAccepted"
            class="withdraw-modal__field-error"
          >
            {{ formErrors.termsAccepted }}
          </span>
        </div>

        <div class="withdraw-modal__actions">
          <BaseButton
            type="submit"
            class="withdraw-modal__submit"
            :disabled="!isFormValid || isLoading"
          >
            <LoadingSpinner v-if="isLoading" class="withdraw-modal__loader" />

            <span v-else>
              {{ $t('Create request') }}
            </span>
          </BaseButton>

          <BaseButton
            type="button"
            variant="hint-bordered"
            class="withdraw-modal__cancel"
            :disabled="isLoading"
            @click="close"
          >
            {{ $t('Cancel') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_contact_data'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const offerFlowStore = useOfferFlowStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const toast = useToast()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const amount = ref('')
const isLoading = ref(false)
const storageReady = ref(false)
const formErrors = ref({})

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
  const normalized =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalized)

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

const currentBalance = computed(() => {
  return normalizeNumber(userStore.user?.balance ?? userStore.userBalance ?? 0)
})

const normalizedAmount = computed(() => {
  return normalizeNumber(amount.value, 0)
})

const internalCurrencySymbol = computed(() => {
  return settingsStore.settings?.internal_currency?.symbol || 'CR'
})

/*
 * Current selected fiat currency rate.
 *
 * Example:
 * EUR = 1
 * USD = API supplied value
 * GBP = API supplied value
 *
 * This is the same currency source used by the
 * top-up flow.
 */
const currencyRate = computed(() => {
  return normalizeNumber(currencyStore.currentCurrency?.value, 1)
})

/*
 * Value of one internal coin in EUR.
 *
 * This comes from:
 * settings.internal_currency.exchange_rate_eur
 *
 * The top-up wallet uses this same setting.
 */
const internalCurrencyEurRate = computed(() => {
  return normalizeNumber(
    settingsStore.settings?.internal_currency?.exchange_rate_eur,
    1,
  )
})

/*
 * Withdrawal conversion:
 *
 * internal coins
 * × internal coin EUR rate
 * × selected fiat currency rate
 *
 * Example:
 *
 * 100 coins
 * × 0.93 EUR
 * × selected currency rate
 *
 * = displayed fiat payout.
 */
const payoutFiatAmount = computed(() => {
  const convertedAmount =
    normalizedAmount.value * internalCurrencyEurRate.value * currencyRate.value

  return Number(convertedAmount.toFixed(2))
})

const payoutCurrencyCode = computed(() => {
  return (
    currencyStore.currentCurrencyCode ||
    currencyStore.currentCurrency?.code ||
    'EUR'
  )
})

const payoutCurrencySymbol = computed(() => {
  return currencyStore.currentCurrencySymbol || '€'
})

const formattedPayoutAmount = computed(() => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payoutCurrencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(payoutFiatAmount.value)
  } catch {
    return `${payoutCurrencySymbol.value}${payoutFiatAmount.value.toFixed(2)}`
  }
})

const minimumWithdrawalAmount = computed(() => {
  return normalizeNumber(
    settingsStore.settings?.payouts?.min_payout_amount ??
      settingsStore.settings?.min_payout_amount ??
      0,
  )
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

const isFormValid = computed(() => {
  const value = normalizedAmount.value

  return Boolean(
    checkoutForm.name.trim() &&
    checkoutForm.surname.trim() &&
    checkoutForm.phone.trim() &&
    checkoutForm.email.trim() &&
    normalizeCountryValue(checkoutForm.country) &&
    checkoutForm.city.trim() &&
    checkoutForm.postCode.trim() &&
    checkoutForm.address.trim() &&
    checkoutForm.termsAccepted &&
    value > 0 &&
    value <= currentBalance.value &&
    (minimumWithdrawalAmount.value <= 0 ||
      value >= minimumWithdrawalAmount.value),
  )
})

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

  checkoutForm.termsAccepted = false

  storageReady.value = true

  syncCheckoutStore()
}

const clearFieldError = field => {
  if (!formErrors.value[field]) {
    return
  }

  const errors = {
    ...formErrors.value,
  }

  delete errors[field]

  formErrors.value = errors
}

const resetErrors = () => {
  formErrors.value = {}
}

const handleAmountInput = () => {
  clearFieldError('amount')
  clearFieldError('general')
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
  } else if (!/^\+?[0-9\s]{8,15}$/.test(checkoutForm.phone.trim())) {
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

  if (normalizedAmount.value <= 0) {
    errors.amount = 'Please enter a valid amount'
  }

  if (normalizedAmount.value > currentBalance.value) {
    errors.amount = 'Amount exceeds available balance'
  }

  if (
    minimumWithdrawalAmount.value > 0 &&
    normalizedAmount.value < minimumWithdrawalAmount.value
  ) {
    errors.amount = `Minimum withdrawal amount is ${minimumWithdrawalAmount.value.toFixed(
      2,
    )}`
  }

  if (!checkoutForm.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions'
  }

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyApiErrors = error => {
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
    'Withdraw failed. Please try again.'

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
      '.withdraw-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handleSubmit = async () => {
  if (isLoading.value) {
    return
  }

  resetErrors()

  persistCheckoutForm()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    const countryId = normalizeCountryValue(checkoutForm.country)

    const email = authStore.user?.email || checkoutForm.email.trim()

    /*
     * IMPORTANT:
     *
     * The backend still receives the INTERNAL
     * currency amount.
     *
     * payoutFiatAmount is display-only.
     */
    const requestData = {
      amount: normalizedAmount.value,

      name: checkoutForm.name.trim(),

      surname: checkoutForm.surname.trim(),

      email,

      phone: checkoutForm.phone.trim(),

      country_id: countryId,

      city: checkoutForm.city.trim(),

      address: checkoutForm.address.trim(),

      post_code: checkoutForm.postCode.trim(),
    }

    saveStoredCheckoutData({
      ...checkoutForm,
      email,
      country: countryId,
    })

    syncCheckoutStore()

    const response = await offerFlowStore.requestWithdraw(requestData)

    const responseStatus = response?.data?.status ?? response?.status

    const isSuccessful =
      response?.status === 201 ||
      response?.status === 200 ||
      responseStatus === 'OK'

    if (!isSuccessful) {
      throw new Error(
        response?.data?.message ||
          response?.message ||
          'Withdraw failed. Please try again.',
      )
    }

    toast.success('Withdraw request successfully sent.')

    amount.value = ''
    checkoutForm.termsAccepted = false

    await userStore.fetchProfile()

    emit('created', response?.data?.payload ?? response?.payload ?? response)

    close()
  } catch (error) {
    console.error('Withdraw failed:', error)

    applyApiErrors(error)

    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const initializeModal = async () => {
  isLoading.value = true
  storageReady.value = false

  resetErrors()

  amount.value = ''

  try {
    await Promise.all([
      countriesStore.countries?.length
        ? Promise.resolve()
        : countriesStore.fetchCountries(),

      userStore.user ? Promise.resolve() : userStore.fetchProfile(),

      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings(),

      /*
       * Required for selected fiat code,
       * symbol and conversion rate.
       */
      currencyStore.currencies?.length
        ? Promise.resolve()
        : currencyStore.initializeCurrencies(),
    ])

    await nextTick()

    prefillForm()
  } catch (error) {
    console.error('Failed to initialize withdraw modal:', error)

    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to prepare the withdraw form.'

    formErrors.value = {
      general: message,
    }

    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (isLoading.value) {
    return
  }

  persistCheckoutForm()

  resetErrors()

  emit('close')
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
.withdraw-modal {
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

  &__summary-price {
    margin-left: auto;

    :deep(.price) {
      color: var(--primary-color);
    }

    :deep(.price__number) {
      font-family: var(--font-spectral);
      font-weight: 600;
    }
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

  &__receive-value {
    margin-left: auto;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 140%;
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

  &__amount {
    width: 100%;
  }

  &__amount-prefix {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__balance {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;

    margin-top: 7px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 140%;

    :deep(.price) {
      color: var(--secondary-color);
    }
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

  &__actions {
    @include adaptiveValue('margin-top', 26, 20);

    display: flex;
    flex-direction: column;
    gap: 10px;

    width: 100%;
  }

  &__submit,
  &__cancel {
    width: 100%;
    min-height: 40px;
  }

  &__loader {
    width: 18px;
    height: 18px;
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

    &__submit,
    &__cancel {
      min-height: 42px;
    }
  }
}

:deep(.withdraw-modal__modal) {
  width: min(calc(100vw - 30px), 470px);
  max-width: 470px;
}
</style>
