<template>
  <BaseModal
    :show="props.show"
    modal-container-class="checkout-modal__inner"
    @close="close"
  >
    <div class="checkout-modal">
      <h2 class="checkout-modal__title _h3">
        {{ $t('Payment') }}
      </h2>

      <div class="checkout-modal__summary">
        <div class="checkout-modal__summary-row">
          <span class="checkout-modal__summary-label">
            {{ $t('Amount') }}:
          </span>

          <span class="checkout-modal__total">
            {{ formattedAmount }}
          </span>
        </div>

        <div class="checkout-modal__summary-divider" />

        <div class="checkout-modal__summary-row">
          <span class="checkout-modal__payment-label">
            {{ $t('Payment method') }}:
          </span>

          <span class="checkout-modal__payment-value">
            {{
              selectedPaymentMethod?.title || formatText(topupStore.paymentType)
            }}
          </span>
        </div>
      </div>

      <div
        v-if="formErrors.general"
        class="checkout-modal__error checkout-modal__error_general"
        role="alert"
      >
        {{ formErrors.general }}
      </div>

      <form class="checkout-modal__form" novalidate @submit.prevent="handlePay">
        <div class="checkout-modal__section">
          <p class="checkout-modal__section-title">
            {{ $t('Payment information') }}
          </p>

          <div class="checkout-modal__fields">
            <div class="checkout-modal__field">
              <BaseSelect
                v-model="topupStore.checkoutFormData.country"
                class="checkout-modal__select"
                :options="countryOptions"
                option-label="label"
                option-value="value"
                :placeholder="$t('Country')"
                :empty-text="$t('No countries found')"
                :error="formErrors.country"
                required
                @update:model-value="clearFieldError('country')"
              />
            </div>

            <div class="checkout-modal__field-row">
              <div class="checkout-modal__field">
                <BaseInput
                  v-model="topupStore.checkoutFormData.city"
                  class="checkout-modal__input"
                  :placeholder="$t('City')"
                  :error="formErrors.city"
                  autocomplete="address-level2"
                  @input="clearFieldError('city')"
                />
              </div>

              <div
                class="checkout-modal__field checkout-modal__field_post-code"
              >
                <BaseInput
                  v-model="topupStore.checkoutFormData.postCode"
                  class="checkout-modal__input"
                  :placeholder="$t('Post code')"
                  :error="formErrors.postCode"
                  autocomplete="postal-code"
                  @input="clearFieldError('postCode')"
                />
              </div>
            </div>

            <div class="checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.address"
                class="checkout-modal__input"
                :placeholder="$t('Address')"
                :error="formErrors.address"
                autocomplete="street-address"
                @input="clearFieldError('address')"
              />
            </div>
          </div>
        </div>

        <div class="checkout-modal__section checkout-modal__section_contact">
          <p class="checkout-modal__section-title">
            {{ $t('Contact information') }}
          </p>

          <div class="checkout-modal__fields">
            <div class="checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.name"
                class="checkout-modal__input"
                :placeholder="$t('First name')"
                :error="formErrors.name"
                autocomplete="given-name"
                @input="clearFieldError('name')"
              />
            </div>

            <div class="checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.surname"
                class="checkout-modal__input"
                :placeholder="$t('Last name')"
                :error="formErrors.surname"
                autocomplete="family-name"
                @input="clearFieldError('surname')"
              />
            </div>

            <div class="checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.phone"
                class="checkout-modal__input"
                type="tel"
                inputmode="tel"
                :placeholder="$t('Phone Number')"
                :error="formErrors.phone"
                autocomplete="tel"
                @input="clearFieldError('phone')"
              />
            </div>

            <div class="checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.email"
                class="checkout-modal__input"
                type="email"
                inputmode="email"
                :placeholder="$t('Email')"
                :error="formErrors.email"
                :disabled="Boolean(authStore.user?.email)"
                autocomplete="email"
                @input="clearFieldError('email')"
              />
            </div>
          </div>
        </div>

        <div class="checkout-modal__terms">
          <BaseCheckbox
            v-model="topupStore.checkoutFormData.termsAccepted"
            class="checkout-modal__checkbox"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
          >
            <span class="checkout-modal__terms-text">
              {{
                $t(
                  'I confirm that I am 18 years old or older and I agree to the',
                )
              }}

              <RouterLink
                v-if="termsPage"
                :to="getPageUrl(termsPage)"
                class="checkout-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Terms & Conditions') }}
              </RouterLink>

              <span>{{ $t('and') }}</span>

              <RouterLink
                v-if="privacyPage"
                :to="getPageUrl(privacyPage)"
                class="checkout-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Privacy Notice') }}
              </RouterLink>
            </span>
          </BaseCheckbox>

          <span
            v-if="formErrors.termsAccepted"
            class="checkout-modal__field-error"
          >
            {{ formErrors.termsAccepted }}
          </span>
        </div>

        <div class="checkout-modal__actions">
          <button
            type="submit"
            class="checkout-modal__submit"
            :disabled="!isFormValid || isLoading"
          >
            <span>
              {{ $t('Confirm payment') }}
            </span>

            <span
              v-if="isLoading"
              class="checkout-modal__loader"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            class="checkout-modal__cancel"
            :disabled="isLoading"
            @click="emit('back')"
          >
            {{ $t('Cancel') }}
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'back'])

const currencyStore = useCurrencyStore()
const topupStore = useTopUpStore()
const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const toast = useToast()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const { checkoutFormData } = storeToRefs(topupStore)

const isLoading = ref(false)
const formErrors = ref({})

const getCountryLabel = country => {
  if (!country) {
    return ''
  }

  if (typeof country.title === 'string') {
    return country.title
  }

  if (country.title && typeof country.title === 'object') {
    const translatedTitle =
      country.title.en ||
      country.title.name ||
      Object.values(country.title).find(value => typeof value === 'string')

    if (translatedTitle) {
      return translatedTitle
    }
  }

  if (typeof country.name === 'string') {
    return country.name
  }

  if (typeof country.label === 'string') {
    return country.label
  }

  if (typeof country.code === 'string') {
    return country.code
  }

  return ''
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

const normalizeCountryValue = country => {
  if (country === null || country === undefined || country === '') {
    return ''
  }

  if (typeof country === 'object') {
    return country.id ?? country.value ?? country.code ?? ''
  }

  return country
}

const selectedPaymentMethod = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  if (!Array.isArray(methods)) {
    return null
  }

  return (
    methods.find(method => {
      return method.code === topupStore.paymentType
    }) || null
  )
})

const normalizedAmount = computed(() => {
  const value =
    typeof topupStore.amount === 'string'
      ? topupStore.amount.replace(',', '.').trim()
      : topupStore.amount

  const number = Number(value)

  return Number.isFinite(number) ? number : 0
})

const formattedAmount = computed(() => {
  const currencyCode =
    currencyStore.currentCurrency?.code ||
    currencyStore.currentCurrencyCode ||
    'EUR'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedAmount.value)
  } catch {
    const symbol =
      currencyStore.currentCurrency?.symbol ||
      currencyStore.currentCurrencySymbol ||
      '€'

    return `${symbol}${normalizedAmount.value.toFixed(2)}`
  }
})

const formatText = value => {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => {
      return character.toUpperCase()
    })
}

const isFormValid = computed(() => {
  const formData = checkoutFormData.value

  if (!formData) {
    return false
  }

  return Boolean(
    formData.name &&
    formData.surname &&
    formData.phone &&
    normalizeCountryValue(formData.country) &&
    formData.city &&
    formData.address &&
    formData.postCode &&
    formData.termsAccepted &&
    (authStore.user?.email || formData.email),
  )
})

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

const validateForm = () => {
  const errors = {}
  const formData = checkoutFormData.value

  if (!formData) {
    return false
  }

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

  if (!authStore.user?.email && !formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (
    formData.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  ) {
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

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyApiErrors = error => {
  const apiErrors = error.response?.data?.errors

  if (apiErrors && typeof apiErrors === 'object') {
    const errors = {}

    Object.entries(apiErrors).forEach(([field, messages]) => {
      const normalizedField =
        field === 'country_id'
          ? 'country'
          : field === 'post_code'
            ? 'postCode'
            : field

      errors[normalizedField] = Array.isArray(messages)
        ? messages[0]
        : String(messages)
    })

    formErrors.value = {
      ...formErrors.value,
      ...errors,
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
      '.checkout-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handlePay = async () => {
  if (isLoading.value) {
    return
  }

  resetErrors()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    const formData = checkoutFormData.value

    const countryId = normalizeCountryValue(formData.country)

    const checkoutData = {
      name: formData.name.trim(),

      surname: formData.surname.trim(),

      phone: formData.phone.trim(),

      email: authStore.user?.email || formData.email.trim(),

      country_id: countryId,

      city: formData.city.trim(),

      postCode: formData.postCode.trim(),

      address: formData.address.trim(),

      termsAccepted: formData.termsAccepted,

      paymentType: topupStore.paymentType,

      amount: topupStore.amount,

      currency:
        currencyStore.currentCurrency?.code ||
        currencyStore.currentCurrencyCode ||
        'EUR',
    }

    topupStore.setCheckoutFormData?.({
      ...formData,
      country: countryId,
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

    applyApiErrors(error)

    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const getProfileCountry = profile => {
  return normalizeCountryValue(profile.country_id ?? profile.country ?? '')
}

const prefillFormData = () => {
  const profile = userStore.user || {}
  const authUser = authStore.user || {}

  const current = checkoutFormData.value || {}

  topupStore.setCheckoutFormData({
    name: current.name || profile.name || '',

    surname: current.surname || profile.surname || '',

    phone: current.phone || profile.phone || '',

    email: authUser.email || current.email || profile.email || '',

    country:
      normalizeCountryValue(current.country) || getProfileCountry(profile),

    city: current.city || profile.city || '',

    postCode:
      current.postCode ||
      profile.post_code ||
      profile.postCode ||
      profile.zip ||
      '',

    address: current.address || profile.address || '',

    termsAccepted: Boolean(current.termsAccepted),
  })
}

const initializeModal = async () => {
  isLoading.value = true
  resetErrors()

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

    prefillFormData()
  } catch (error) {
    console.error('Failed to initialize checkout modal:', error)

    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to load necessary data for checkout.'

    formErrors.value = {
      ...formErrors.value,
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

  resetErrors()

  emit('close')
}

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
    if (email && checkoutFormData.value) {
      topupStore.setCheckoutFormData({
        email,
      })
    }
  },
)
</script>

<style lang="scss" scoped>
.checkout-modal {
  width: 100%;

  &__title {
    padding: 0 45px;

    color: var(--primary-color);
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__summary {
    &:not(:last-child) {
      margin-bottom: 26px;
    }
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-height: 36px;
  }

  &__summary-label {
    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 18px;
    line-height: 120%;
    text-transform: uppercase;
  }

  &__total {
    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 700;
    line-height: 120%;
    text-align: right;
  }

  &__summary-divider {
    width: 100%;
    height: 1px;

    margin: 16px 0;

    background: linear-gradient(
      90deg,
      transparent,
      var(--border-secondary-color),
      transparent
    );
  }

  &__payment-label {
    color: var(--secondary-color);
    font-size: 14px;
  }

  &__payment-value {
    overflow: hidden;

    color: var(--primary-color);
    font-size: 15px;
    font-weight: 600;
    line-height: 140%;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__form {
    width: 100%;
  }

  &__section {
    width: 100%;

    &_contact {
      margin-top: 26px;
      padding-top: 24px;

      border-top: 1px solid var(--border-secondary-color);
    }
  }

  &__section-title {
    margin-bottom: 12px;

    color: var(--secondary-color);
    font-size: 13px;
    font-weight: 600;
    line-height: 145%;
    text-align: center;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 6px;

    min-width: 0;

    &_post-code {
      flex: 0 1 38%;
    }
  }

  &__field-row {
    display: flex;
    gap: 10px;
  }

  &__input,
  &__select {
    width: 100%;
  }

  &__terms {
    margin-top: 26px;
  }

  &__terms-text {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 145%;
  }

  &__link {
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
    font-size: 12px;
    line-height: 140%;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 26px;
  }

  &__submit {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    width: 100%;
    min-height: 40px;

    padding: 7px 45px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 600;
    line-height: 140%;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.55;

      cursor: not-allowed;
    }

    &:not(:disabled) {
      border-color: var(--hint-secondary-color);
      background-color: rgb(46 207 196 / 8%);
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__cancel {
    align-self: center;

    padding: 5px 12px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 140%;

    cursor: pointer;

    transition:
      color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 14px;

    width: 17px;
    height: 17px;

    margin-top: -8px;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    animation: checkout-modal-spin 0.8s linear infinite;

    border-top-color: var(--hint-secondary-color);
  }

  &__error {
    padding: 10px 12px;

    border: 1px solid rgb(238 57 85 / 30%);
    border-radius: 4px;
    background-color: rgb(238 57 85 / 8%);

    color: var(--error-color);
    font-size: 13px;
    line-height: 145%;

    &_general {
      margin-bottom: 16px;
    }
  }

  :deep(.base-input__control),
  :deep(.base-select__control) {
    min-height: 38px;

    border-color: var(--border-third-color);
    border-radius: 4px;
    background-color: var(--bg-secondary-color);
  }

  :deep(.base-select__list) {
    z-index: calc(var(--modal-z-index) + 1);
  }

  :deep(.base-checkbox) {
    align-items: flex-start;
  }

  @media (max-width: $md7) {
    &__field-row {
      flex-direction: column;
    }

    &__field_post-code {
      flex-basis: auto;
    }

    &__section_contact {
      margin-top: 20px;
      padding-top: 20px;
    }

    &__terms {
      margin-top: 20px;
    }

    &__actions {
      margin-top: 20px;
    }

    &__submit {
      min-height: 44px;
    }
  }
}

:deep(.checkout-modal__inner) {
  width: min(100% - 30px, 480px);
  max-width: 480px;
  max-height: calc(100dvh - 30px);

  padding: clamp(24px, 3vw, 38px) clamp(16px, 3vw, 46px);

  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  background-color: var(--bg-third-color);
  box-shadow:
    0 0 0 4px rgb(7 8 14 / 70%),
    0 0 0 5px var(--border-secondary-color),
    0 24px 70px rgb(0 0 0 / 60%);
}

@keyframes checkout-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
