<template>
  <BaseModal
    :show="show"
    wrapper-classes="top-up-modal__inner"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="top-up">
      <h2 class="top-up__title _h3">
        {{ $t('Top Up Balance') }}
      </h2>

      <div class="top-up__total">
        <span class="top-up__total-label">
          {{ $t('Total to pay:') }}
        </span>

        <span class="top-up__total-value">
          {{ formattedTotal }}
        </span>
      </div>

      <form class="top-up__form" novalidate @submit.prevent>
        <div class="top-up__fields">
          <BaseInput
            v-model="form.name"
            class="top-up__field"
            name="name"
            autocomplete="given-name"
            :label="$t('Name')"
            :placeholder="$t('Name')"
            :error="errors.name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="form.surname"
            class="top-up__field"
            name="surname"
            autocomplete="family-name"
            :label="$t('Surname')"
            :placeholder="$t('Surname')"
            :error="errors.surname"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />

          <BaseInput
            v-model="form.email"
            class="top-up__field"
            type="email"
            name="email"
            autocomplete="email"
            :label="$t('E-Mail')"
            :placeholder="$t('person@gmail.com')"
            :error="errors.email"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            class="top-up__field"
            type="tel"
            name="phone"
            autocomplete="tel"
            :label="$t('Phone')"
            :placeholder="'+1 234 5678 9000'"
            :error="errors.phone"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />
        </div>

        <div class="top-up__divider"></div>

        <div class="top-up__fields">
          <BaseSelect
            v-model="form.country"
            class="top-up__field top-up__field_select"
            :options="countryOptions"
            option-label="title"
            option-value="id"
            :label="$t('Country')"
            :placeholder="$t('Country')"
            :error="errors.country"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="form.city"
            class="top-up__field"
            name="city"
            autocomplete="address-level2"
            :label="$t('City')"
            :placeholder="$t('City')"
            :error="errors.city"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.address"
            class="top-up__field"
            name="address"
            autocomplete="street-address"
            :label="$t('Address')"
            :placeholder="$t('Address')"
            :error="errors.address"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            class="top-up__field"
            name="postCode"
            autocomplete="postal-code"
            :label="$t('Postcode')"
            :placeholder="$t('123456')"
            :error="errors.postCode"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>

        <div class="top-up__agreements">
          <BaseCheckbox
            v-model="form.termsAccepted"
            class="top-up__checkbox"
            :error="errors.termsAccepted"
            :disabled="isSubmitting"
            terms
          />

          <div
            v-if="settingsStore.requisites && false"
            class="top-up__requisites"
          >
            {{ settingsStore.requisites }}
          </div>
        </div>

        <div
          v-if="submitError || topupStore.error"
          class="top-up__error _text-error"
          role="alert"
        >
          {{ submitError || topupStore.error }}
        </div>

        <div class="top-up__methods">
          <div
            v-for="method in paymentMethods"
            :key="method.code"
            class="top-up__method"
            :class="{
              'top-up__method_card': isCard(method.code),
              'top-up__method_light': isLightMethod(method.code),
            }"
          >
            <BaseButton
              type="button"
              variant="white-bordered"
              class="top-up__payment-button"
              :disabled="isSubmitting || localFiatAmount <= 0"
              @click="submitWithMethod(method.code)"
            >
              <span
                v-if="isSubmitting && selectedPaymentMethod === method.code"
              >
                {{ $t('Processing') }}...
              </span>

              <img
                v-else-if="getPaymentImage(method)"
                :src="getPaymentImage(method)"
                :alt="method.title || method.code"
                class="top-up__payment-image"
              />

              <span v-else>
                {{ method.title || method.code }}
              </span>
            </BaseButton>
          </div>

          <div
            v-if="!paymentMethods.length && !settingsStore.loading"
            class="top-up__empty-methods"
          >
            {{ $t('No payment methods available') }}
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import applePayImage from '@/assets/img/payment-methods/apple.svg'
import cardPayImage from '@/assets/img/payment-methods/card.svg'
import googlePayImage from '@/assets/img/payment-methods/google.svg'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  selectedAmount: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { ensurePages } = useStaticPages()

const topupStore = useTopUpStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

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
  termsAccepted: false,
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
  termsAccepted: '',
})

const savedFields = ['country', 'city', 'address', 'postCode']

const norm = value => String(value ?? '').trim()

const nameRegex = /^[\p{L}][\p{L}\p{M}' -]*$/u
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isSubmitting = computed(() => topupStore.isLoading)

const currencyCode = computed(() => {
  return (
    currencyStore.currentCurrencyCode ||
    currencyStore.currentCurrency?.code ||
    'EUR'
  )
})

const currencySymbol = computed(() => {
  return (
    currencyStore.currentCurrencySymbol ||
    currencyStore.currentCurrency?.symbol ||
    '€'
  )
})

const localFiatAmount = computed(() => {
  const amount = Number(props.selectedAmount)

  return Number.isFinite(amount) && amount > 0 ? amount : 0
})

const formattedTotal = computed(() => {
  const amount = currencyStore.formatFiat(
    localFiatAmount.value,
    currencyCode.value,
  )

  return `${amount} ${currencySymbol.value}`
})

const receiveCredits = computed(() => {
  const currencyValue = Number(currencyStore.currentCurrency?.value ?? 1)

  if (!Number.isFinite(currencyValue) || currencyValue <= 0) {
    return 0
  }

  return Number((localFiatAmount.value / currencyValue).toFixed(2))
})

const countryOptions = computed(() => {
  return countriesStore.countries || []
})

const normalizeCode = value => {
  return String(value || '')
    .trim()
    .toLowerCase()
}

const isCard = code => {
  return ['creditdebit-card', 'credit-card', 'credit_card', 'card'].includes(
    normalizeCode(code),
  )
}

const isApplePay = code => {
  return ['apple_pay', 'apple-pay', 'applepay'].includes(normalizeCode(code))
}

const isGooglePay = code => {
  return ['google_pay', 'google-pay', 'googlepay'].includes(normalizeCode(code))
}

const isLightMethod = code => {
  return isApplePay(code) || isGooglePay(code)
}

const getPaymentImage = method => {
  if (isCard(method.code)) return cardPayImage
  if (isApplePay(method.code)) return applePayImage
  if (isGooglePay(method.code)) return googlePayImage

  return method.image || ''
}

const paymentPriority = code => {
  if (isCard(code)) return 1
  if (isApplePay(code)) return 2
  if (isGooglePay(code)) return 3

  return 4
}

const paymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const selectedCurrency = currencyCode.value.toUpperCase()

  return methods
    .filter(method => {
      if (normalizeCode(method.code) === 'balance') {
        return false
      }

      if (!method.currencies?.length) {
        return true
      }

      return method.currencies.some(currency => {
        const code = typeof currency === 'string' ? currency : currency?.code

        return String(code || '').toUpperCase() === selectedCurrency
      })
    })
    .sort((a, b) => {
      return paymentPriority(a.code) - paymentPriority(b.code)
    })
})

const isValidPhone = value => {
  const phone = norm(value)
  const digits = phone.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

const isPlaceholderName = (value, field) => {
  const input = norm(value).toLowerCase()

  return input === field.toLowerCase() || input === norm(t(field)).toLowerCase()
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
  topupStore.clearError?.()
}

const validateField = field => {
  errors[field] = ''

  const value = norm(form[field])

  if (field === 'name' || field === 'surname') {
    if (!value || isPlaceholderName(value, field)) {
      errors[field] =
        field === 'name'
          ? t('First name is required')
          : t('Last name is required')

      return
    }

    if (!nameRegex.test(value)) {
      errors[field] = t('Invalid name')
    }

    return
  }

  if (field === 'email') {
    if (!value) {
      errors.email = t('Email is required')
    } else if (!emailRegex.test(value)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!value) {
      errors.phone = t('Phone number is required')
    } else if (!isValidPhone(value)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !form.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !value) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !value) {
    errors.address = t('Address is required')
  }

  if (field === 'postCode' && !value) {
    errors.postCode = t('Post Code is required')
  }

  if (field === 'termsAccepted' && !form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  Object.keys(errors).forEach(field => {
    validateField(field)
  })

  if (localFiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')
    return false
  }

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t('Please fill in all required fields correctly.')

    return false
  }

  return true
}

const getSavedCheckoutData = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) || '{}')

    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

const saveCheckoutData = () => {
  try {
    const data = getSavedCheckoutData()

    savedFields.forEach(field => {
      data[field] = form[field]
    })

    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save checkout data:', error)
  }
}

const getCountryValue = user => {
  const saved = getSavedCheckoutData()

  const country =
    user?.country?.id ??
    user?.country_id ??
    (typeof user?.country === 'string' ? user.country : null)

  return country || saved.country || ''
}

const prefillForm = () => {
  const user = userStore.user || {}
  const saved = getSavedCheckoutData()

  form.name = isPlaceholderName(user.name, 'Name') ? '' : norm(user.name)

  form.surname = isPlaceholderName(user.surname, 'Surname')
    ? ''
    : norm(user.surname)

  form.email = user.email || ''
  form.phone = user.phone || ''

  form.country = getCountryValue(user)
  form.city = user.city || saved.city || ''
  form.address = user.address || saved.address || ''
  form.postCode =
    user.zip || user.post_code || user.postCode || saved.postCode || ''

  form.termsAccepted = false

  clearErrors()
}

const submitWithMethod = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  selectedPaymentMethod.value = methodCode

  saveCheckoutData()

  topupStore.setAmount(receiveCredits.value)
  topupStore.setPaymentType(methodCode)

  try {
    const response = await topupStore.checkout({
      name: norm(form.name),
      surname: norm(form.surname),
      email: norm(form.email),
      phone: norm(form.phone),
      country: form.country,
      city: norm(form.city),
      address: norm(form.address),
      postCode: norm(form.postCode),
      currency: currencyCode.value,
      amount: localFiatAmount.value,
      paymentType: methodCode,
    })

    if (response?.redirect_url) {
      window.location.href = response.redirect_url
      return
    }

    emit('close')
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to create top up payment')
  } finally {
    selectedPaymentMethod.value = null
  }
}

const handleClose = () => {
  if (isSubmitting.value) return

  clearErrors()
  emit('close')
}

const initializeModal = async () => {
  const tasks = [ensurePages()]

  if (!settingsStore.settings) {
    tasks.push(settingsStore.fetchSettings())
  }

  if (!countriesStore.countries?.length) {
    tasks.push(countriesStore.fetchCountries())
  }

  if (!userStore.user?.email) {
    tasks.push(userStore.fetchProfile())
  }

  await Promise.allSettled(tasks)

  if (props.show) {
    prefillForm()
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initializeModal()
    } else {
      clearErrors()
      form.termsAccepted = false
    }
  },
  { immediate: true },
)

watch(
  () => savedFields.map(field => form[field]),
  () => {
    if (props.show) {
      saveCheckoutData()
    }
  },
)

watch(
  () => form.country,
  value => {
    if (value) errors.country = ''
  },
)

watch(
  () => form.termsAccepted,
  value => {
    if (value) errors.termsAccepted = ''
  },
)

watch(
  () => form.name,
  () => {
    errors.name = ''
  },
)

watch(
  () => form.surname,
  () => {
    errors.surname = ''
  },
)

watch(
  () => form.email,
  () => {
    errors.email = ''
  },
)

watch(
  () => form.phone,
  () => {
    errors.phone = ''
  },
)

watch(
  () => form.city,
  () => {
    errors.city = ''
  },
)

watch(
  () => form.address,
  () => {
    errors.address = ''
  },
)

watch(
  () => form.postCode,
  () => {
    errors.postCode = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.top-up-modal__inner) {
  width: min(832px, calc(100% - 32px));
  max-width: 832px;
  max-height: calc(100dvh - 32px);

  padding: 58px 49px 63px;

  border: 1px solid #344050;
  border-radius: 18px;

  background: #111821;
  background-image: none;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);

  overflow-x: hidden;
  overflow-y: auto;
}

:global(.modal .modal__inner.top-up-modal__inner .modal__close) {
  top: 14px;
  right: 14px;

  width: 34px;
  min-width: 34px;
  height: 34px;

  padding: 0;
  border-radius: 6px;

  color: #f4f6fb;
  background: transparent;
}

:global(.modal .modal__inner.top-up-modal__inner .modal__close:hover) {
  color: #1a73ff;
}

.top-up {
  width: 100%;
  min-width: 0;

  &__title {
    margin: 0;

    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: 30px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 22);
    }
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 24);
    }
  }

  &__total-label {
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__total-value {
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
    text-align: right;
    white-space: nowrap;
  }

  &__form {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 20px;
    row-gap: 18px;
    width: 100%;
    min-width: 0;
  }

  &__field {
    width: 100%;
    min-width: 0;

    :deep(.base-input__label),
    :deep(.base-select__field-label) {
      margin-bottom: 7px;

      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-input),
    :deep(.base-select) {
      width: 100%;
      min-height: 50px;
      height: 50px;

      border: 1px solid rgba(153, 161, 176, 0.12);
      border-radius: 8px;

      background-color: #222934;
      color: #f4f6fb;

      transition:
        border-color 0.25s ease,
        background-color 0.25s ease;
    }

    :deep(.base-input.is-focused),
    :deep(.base-input:focus-within),
    :deep(.base-select.is-open),
    :deep(.base-select:focus-visible) {
      border-color: #1a73ff;
    }

    :deep(.base-input.has-error),
    :deep(.base-select.has-error) {
      border-color: var(--error-color);
    }

    :deep(.base-input__control),
    :deep(.base-select__value-text) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input__placeholder),
    :deep(.base-select__placeholder) {
      color: #b6c0ce;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input__error),
    :deep(.base-select__error) {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.4;
    }

    :deep(.base-select__dropdown) {
      z-index: 30;

      background-color: #222934;
      border: 1px solid #344050;
      border-radius: 8px;

      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
    }

    :deep(.base-select__option) {
      color: #f4f6fb;
      border-radius: 6px;
    }

    :deep(.base-select__option.is-selected) {
      background-color: #1a73ff;
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin-top: 29px;
    margin-bottom: 20px;

    background-color: rgba(153, 161, 176, 0.12);
  }

  &__agreements {
    display: flex;
    flex-direction: column;
    gap: 12px;

    margin-top: 24px;
  }

  &__checkbox {
    width: 100%;

    :deep(.base-checkbox__row) {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    :deep(.base-checkbox__box) {
      width: 16px;
      min-width: 16px;
      height: 16px;
      margin-top: 2px;

      border: 1px solid #4c5a6c;
      border-radius: 3px;

      background-color: #222934;
    }

    :deep(.base-checkbox__label) {
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-checkbox__label a) {
      color: #f4f6fb;
      text-decoration: none;

      @media (any-hover: hover) {
        &:hover {
          color: #65a7ff;
        }
      }
    }

    :deep(.base-checkbox__error) {
      margin-top: 7px;
      font-size: 12px;
    }
  }

  &__requisites {
    white-space: pre-line;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__error {
    margin-top: 18px;

    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  &__methods {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;

    width: 100%;
    min-width: 0;

    margin-top: 40px;
  }

  &__method {
    display: flex;
    min-width: 0;
    width: 100%;

    &_card {
      grid-column: 1 / -1;
    }
  }

  &__payment-button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 50px;
    height: 50px;
    padding: 9px 15px;

    border: 1px solid #b7c4d4 !important;
    border-radius: 8px !important;

    background-color: transparent !important;
    color: #f4f6fb !important;

    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;

    transition:
      border-color 0.25s ease,
      background-color 0.25s ease,
      color 0.25s ease;

    :deep(.btn__text) {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 100%;
      height: 100%;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: #1a73ff !important;
        background-color: rgba(26, 115, 255, 0.08) !important;
      }
    }

    &:focus-visible {
      outline: 2px solid #1a73ff;
      outline-offset: 3px;
    }
  }

  &__method_light &__payment-button {
    border-color: #f1f2f5 !important;
    background-color: #f1f2f5 !important;
    color: #101722 !important;

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: #dce4f0 !important;
        background-color: #dce4f0 !important;
      }
    }
  }

  &__payment-image {
    display: block;

    width: auto;
    max-width: 120px;
    max-height: 27px;

    object-fit: contain;
    object-position: center;
  }

  &__empty-methods {
    grid-column: 1 / -1;

    padding: 18px;
    border: 1px solid #344050;
    border-radius: 8px;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  @media (max-width: $md3) {
    &__title {
      font-size: 27px;
    }

    &__fields {
      column-gap: 15px;
      row-gap: 15px;
    }

    &__methods {
      gap: 14px;
    }
  }

  @media (max-width: $md5) {
    &__title {
      font-size: 24px;
    }

    &__total-label,
    &__total-value {
      font-size: 14px;
    }

    &__fields {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 14px;
    }

    &__field {
      :deep(.base-input__label),
      :deep(.base-select__field-label) {
        font-size: 14px;
        margin-bottom: 6px;
      }

      :deep(.base-input),
      :deep(.base-select) {
        min-height: 45px;
        height: 45px;
      }

      :deep(.base-input__control),
      :deep(.base-input__placeholder),
      :deep(.base-select__value-text),
      :deep(.base-select__placeholder) {
        font-size: 14px;
      }
    }

    &__divider {
      margin-top: 22px;
      margin-bottom: 18px;
    }

    &__agreements {
      margin-top: 22px;
    }

    &__checkbox {
      :deep(.base-checkbox__label) {
        font-size: 12px;
      }
    }

    &__methods {
      gap: 10px;
      margin-top: 26px;
    }

    &__payment-button {
      min-height: 45px;
      height: 45px;
      padding: 8px;
      font-size: 13px;
    }

    &__payment-image {
      max-width: 100px;
      max-height: 23px;
    }
  }

  @media (max-width: $md7) {
    &__methods {
      grid-template-columns: minmax(0, 1fr);
    }

    &__method_card {
      grid-column: auto;
    }
  }
}

@media (max-width: $md3) {
  :global(.modal .modal__inner.top-up-modal__inner) {
    padding: 52px 28px 35px;
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.top-up-modal__inner) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;

    padding: 48px 20px 25px;

    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: $md7) {
  :global(.modal .modal__inner.top-up-modal__inner) {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
