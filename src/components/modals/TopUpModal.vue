<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['top-up__inner']"
    @close="handleClose"
  >
    <div class="top-up">
      <div class="top-up__info">
        <div class="top-up__title _h3">
          {{ $t('Top Up') }}
        </div>

        <div class="top-up__inputs">
          <BaseInput
            v-model="form.name"
            :placeholder="$t('Name')"
            :error="errors.name"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="form.surname"
            :placeholder="$t('Surname')"
            :error="errors.surname"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />

          <BaseInput
            v-model="form.email"
            :placeholder="$t('Email')"
            type="email"
            autocomplete="email"
            :error="errors.email"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            :placeholder="$t('Phone')"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            :error="errors.phone"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />

          <BaseSelect
            v-model="form.country"
            :options="countries"
            option-label="name"
            option-value="value"
            :placeholder="$t('Choose country')"
            :error="errors.country"
            class="top-up__input"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="form.city"
            :placeholder="$t('City')"
            :error="errors.city"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.address"
            :placeholder="$t('Address line')"
            :error="errors.address"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            :placeholder="$t('Zip code')"
            :error="errors.postCode"
            class="top-up__input"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>

        <BaseCheckbox
          v-model="form.acceptTerms"
          :error="errors.acceptTerms"
          class="top-up__checkbox"
          :disabled="isSubmitting"
          terms
        />

        <div v-if="submitError" class="top-up__error _text-error">
          {{ submitError }}
        </div>

        <div v-if="topupStore.error" class="top-up__error _text-error">
          {{ topupStore.error }}
        </div>
      </div>

      <div class="top-up__aside">
        <div class="top-up__summary">
          <div class="top-up__summary-title _h5">
            {{ $t('Total to pay:') }}
          </div>

          <div class="top-up__summary-item">
            <div class="top-up__summary-label">
              {{ $t('Total to pay:') }}
            </div>

            <PriceFormatter
              class="top-up__summary-price"
              :price="localFiatAmount"
              :currency-code="currencyCode"
              is-currency
              raw-fiat
              skip-conversion
              size="size-32"
            />
          </div>

          <div class="top-up__summary-item">
            <div class="top-up__summary-label">
              {{ $t('You get:') }}
            </div>

            <PriceFormatter
              class="top-up__summary-price"
              :price="localCoinsAmount"
              skip-conversion
              size="size-32"
            />
          </div>
        </div>

        <div class="top-up__methods">
          <div
            v-for="method in availablePaymentMethods"
            :key="method.code"
            class="top-up__method"
          >
            <BaseButton
              type="button"
              :variant="method.image ? 'white' : 'bordered'"
              class="top-up__submit"
              :loading="isSubmitting && selectedPaymentMethod === method.code"
              :disabled="isSubmitting || !isFormComplete"
              @click="submit(method.code)"
            >
              <span
                v-if="method.image"
                class="top-up__submit-image _ibg-contain"
              >
                <img :src="method.image" :alt="method.title" />
              </span>

              <span v-else>
                {{ method.title }}
              </span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'

const STORAGE_KEY = 'checkout_contact_form'
const LEGACY_STORAGE_KEY = 'cart_checkout_contact_form'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },

  selectedAmount: {
    type: [String, Number],
    required: true,
  },

  haveToPay: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { ensurePages } = useStaticPages()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const countryStore = useCountriesStore()

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: false,
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: '',
})

const norm = value => {
  return String(value ?? '').trim()
}

const emailRe = /^\S+@\S+\.\S+$/

const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const localFiatAmount = computed(() => {
  return Number(props.haveToPay || 0)
})

const localCoinsAmount = computed(() => {
  return Number(props.selectedAmount || 0)
})

const currencyCode = computed(() => {
  return currencyStore.currentCurrencyCode || ''
})

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const normCode = code => {
  return String(code || '')
    .toLowerCase()
    .trim()
}

const isApplePay = code => {
  return ['apple_pay', 'apple-pay', 'applepay'].includes(normCode(code))
}

const isGooglePay = code => {
  return ['google_pay', 'google-pay', 'googlepay'].includes(normCode(code))
}

const getDisplayImage = method => {
  if (isApplePay(method.code)) {
    return method.image
  }

  if (isGooglePay(method.code)) {
    return method.image
  }

  return method.image || null
}

const availablePaymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  return methods
    .filter(method => {
      if (!method.currencies || !method.currencies.length) {
        return true
      }

      return method.currencies.includes(currencyCode.value)
    })
    .map(method => ({
      ...method,
      image: getDisplayImage(method),
    }))
})

const isValidPhone = phone => {
  const value = norm(phone)
  const digits = value.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) {
    return false
  }

  if (!/^[+0-9()\-\s]+$/.test(value)) {
    return false
  }

  return true
}

const sanitizeName = value => {
  return norm(value)
}

const sanitizeSurname = value => {
  return norm(value)
}

const getFormStoragePayload = () => {
  return {
    name: form.name,
    surname: form.surname,
    email: form.email,
    phone: form.phone,
    country: form.country,
    city: form.city,
    address: form.address,
    postCode: form.postCode,
  }
}

const getSavedContactData = () => {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (saved) {
    return saved
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)

  if (!legacy) {
    return null
  }

  localStorage.setItem(STORAGE_KEY, legacy)

  localStorage.removeItem(LEGACY_STORAGE_KEY)

  return legacy
}

const saveFormToStorage = () => {
  try {
    const payload = getFormStoragePayload()

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to save checkout contact form:', error)
  }
}

const prefillFromStorage = () => {
  const saved = getSavedContactData()

  if (!saved) {
    form.acceptTerms = false
    return
  }

  try {
    const data = JSON.parse(saved)

    form.name = data?.name ?? ''

    form.surname = data?.surname ?? ''

    form.email = data?.email ?? ''

    form.phone = data?.phone ?? ''

    form.country = data?.country ?? ''

    form.city = data?.city ?? ''

    form.address = data?.address ?? ''

    form.postCode = data?.postCode ?? ''

    form.acceptTerms = false
  } catch (error) {
    console.error('Failed to restore checkout contact form:', error)

    localStorage.removeItem(STORAGE_KEY)

    form.acceptTerms = false
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    if (!norm(form.name)) {
      errors.name = t('First name is required')

      return
    }

    if (!nameRe.test(norm(form.name))) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    if (!norm(form.surname)) {
      errors.surname = t('Last name is required')

      return
    }

    if (!nameRe.test(norm(form.surname))) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!form.email) {
      errors.email = t('Email is required')

      return
    }

    if (!emailRe.test(form.email)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!form.phone) {
      errors.phone = t('Phone is required')

      return
    }

    if (!isValidPhone(form.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !form.country) {
    errors.country = t('Country is required')

    return
  }

  if (field === 'city' && !form.city) {
    errors.city = t('City is required')

    return
  }

  if (field === 'address' && !form.address) {
    errors.address = t('Address line is required')

    return
  }

  if (field === 'postCode' && !form.postCode) {
    errors.postCode = t('Post Code is required')

    return
  }

  if (field === 'acceptTerms' && !form.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('acceptTerms')

  if (!localFiatAmount.value || localFiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')

    return false
  }

  if (!localCoinsAmount.value || localCoinsAmount.value <= 0) {
    submitError.value = t('Invalid credits amount')

    return false
  }

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )

    return false
  }

  return true
}

const isFormComplete = computed(() => {
  return Boolean(
    norm(form.name) &&
    norm(form.surname) &&
    form.email &&
    emailRe.test(form.email) &&
    isValidPhone(form.phone) &&
    form.country &&
    form.city &&
    form.address &&
    form.postCode &&
    form.acceptTerms &&
    localFiatAmount.value > 0 &&
    localCoinsAmount.value > 0,
  )
})

const submit = async methodCode => {
  if (isSubmitting.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  selectedPaymentMethod.value = methodCode

  try {
    isSubmitting.value = true

    clearErrors()

    topupStore.clearError?.()

    saveFormToStorage()

    topupStore.setAmount?.(localCoinsAmount.value)

    topupStore.setPaymentType?.(methodCode)

    const response = await topupStore.checkout({
      name: sanitizeName(form.name),

      surname: sanitizeSurname(form.surname),

      email: norm(form.email),

      phone: norm(form.phone),

      country: form.country,

      city: norm(form.city),

      address: norm(form.address),

      postCode: norm(form.postCode),

      currency: currencyCode.value,

      amount: localFiatAmount.value,

      amount_internal: localCoinsAmount.value,

      paymentType: methodCode,
    })

    if (response?.redirect_url) {
      window.location.href = response.redirect_url

      return
    }
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during top up')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  saveFormToStorage()

  emit('close')
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) {
      return
    }

    await Promise.all([
      ensurePages(),
      settingsStore.fetchSettings?.(),
      countryStore.fetchCountries?.(),
    ])

    prefillFromStorage()
    clearErrors()

    topupStore.clearError?.()

    selectedPaymentMethod.value = null
  },
)

watch(
  () => ({
    name: form.name,
    surname: form.surname,
    email: form.email,
    phone: form.phone,
    country: form.country,
    city: form.city,
    address: form.address,
    postCode: form.postCode,
  }),
  () => {
    saveFormToStorage()
  },
  {
    deep: true,
  },
)

watch(
  () => form.country,
  () => {
    validateField('country')
  },
)

onMounted(async () => {
  if (!settingsStore.settings) {
    await settingsStore.fetchSettings?.()
  }

  if (!countryStore.countries?.length) {
    await countryStore.fetchCountries?.()
  }

  prefillFromStorage()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.top-up {
  width: 100%;

  @media (min-width: $md4) {
    display: flex;
    align-items: flex-start;

    @include adaptiveValue('gap', 32, 20, 1400, 992, 1);
  }

  &__info {
    min-width: 0;

    @media (min-width: $md4) {
      flex: 0 1 66%;
    }

    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 24px;
      }
    }
  }

  &__aside {
    min-width: 0;

    @media (min-width: $md4) {
      flex: 0 1 34%;
    }

    @media (max-width: $md4) {
      max-width: 400px;
      margin: 0 auto;
    }
  }

  &__title {
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__inputs {
    display: flex;
    flex-wrap: wrap;

    gap: 12px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 20);
    }
  }

  &__input {
    min-width: 0;

    flex: 0 1 calc(50% - 6px);

    @media (max-width: $md7) {
      flex: 1 1 100%;
    }
  }

  &__checkbox {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }
  }

  &__error {
    margin-top: 8px;
  }

  &__summary {
    text-align: center;

    background-color: var(--bg-primary-color);

    @include adaptiveValue('padding', 32, 20);

    @include adaptiveValue('border-radius', 10, 6);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__summary-title {
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__summary-item {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 24);
    }
  }

  &__summary-label {
    color: var(--seconday-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__summary-price {
    justify-content: center;

    width: fit-content;

    margin-left: auto;
    margin-right: auto;
  }

  &__methods {
    display: flex;
    flex-direction: column;

    gap: 12px;
  }

  &__method {
    width: 100%;
  }

  &__submit {
    position: relative;

    width: 100%;

    @include adaptiveValue('min-height', 44, 40);

    font-family: var(--font-condensed);
    font-size: 14px;
    font-weight: 700;

    text-transform: uppercase;

    &-image {
      position: absolute;

      top: 50%;
      left: 50%;

      width: 65%;
      height: 80%;

      transform: translate(-50%, -50%);
    }
  }

  @media (max-width: $md7) {
    &__title {
      text-align: center;
    }
  }
}
</style>
