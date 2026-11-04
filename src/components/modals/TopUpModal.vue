<template>
  <BaseModal
    :show="show"
    wrapper-classes="top-up__inner"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="top-up">
      <div class="top-up__info">
        <BaseButton
          type="button"
          variant="bordered"
          class="top-up__back"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <SvgIcon :icon="ChevronDownIcon" class="top-up__back-icon" />

          <span>{{ $t('Back') }}</span>
        </BaseButton>

        <h2 class="top-up__title _h2">
          {{ $t('Top Up') }}
        </h2>

        <form id="top-up-form" class="top-up__form" novalidate @submit.prevent>
          <div class="top-up__inputs">
            <BaseInput
              v-model="form.name"
              :label="$t('Name')"
              :error="errors.name"
              variant="checkout"
              class="top-up__input"
              autocomplete="given-name"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              :label="$t('Surname')"
              :error="errors.surname"
              variant="checkout"
              class="top-up__input"
              autocomplete="family-name"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />

            <BaseInput
              v-model="form.phone"
              :label="$t('Phone')"
              :error="errors.phone"
              variant="checkout"
              class="top-up__input"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              :disabled="isSubmitting"
              @blur="validateField('phone')"
            />

            <BaseInput
              v-model="form.email"
              :label="$t('Email')"
              :error="errors.email"
              variant="checkout"
              class="top-up__input"
              type="email"
              autocomplete="email"
              :disabled="isSubmitting"
              @blur="validateField('email')"
            />

            <BaseSelect
              v-model="form.country"
              :label="$t('Country')"
              :options="countries"
              option-label="name"
              option-value="value"
              :placeholder="$t('Choose country')"
              :error="errors.country"
              variant="checkout"
              class="top-up__input"
              :disabled="isSubmitting"
            />

            <BaseInput
              v-model="form.city"
              :label="$t('City')"
              :error="errors.city"
              variant="checkout"
              class="top-up__input"
              autocomplete="address-level2"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="form.address"
              :label="$t('Address line')"
              :error="errors.address"
              variant="checkout"
              class="top-up__input"
              autocomplete="street-address"
              :disabled="isSubmitting"
              @blur="validateField('address')"
            />

            <BaseInput
              v-model="form.postCode"
              :label="$t('Zip code')"
              :error="errors.postCode"
              variant="checkout"
              class="top-up__input"
              autocomplete="postal-code"
              :disabled="isSubmitting"
              @blur="validateField('postCode')"
            />
          </div>
        </form>
      </div>

      <aside class="top-up__aside">
        <div class="top-up__summary">
          <h3 class="top-up__summary-title _h4">
            {{ $t('Total to pay') }}
          </h3>

          <div class="top-up__totals">
            <div class="top-up__total">
              <span class="top-up__total-label">
                {{ $t('You get:') }}
              </span>

              <PriceFormatter
                class="top-up__total-value"
                :price="localCoinsAmount"
                skip-conversion
                size="size-20"
              />
            </div>

            <div class="top-up__total">
              <span class="top-up__total-label">
                {{ $t('Total to pay:') }}
              </span>

              <PriceFormatter
                class="top-up__total-value"
                :price="localFiatAmount"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
              />
            </div>
          </div>

          <BaseCheckbox
            v-model="form.acceptTerms"
            class="top-up__terms"
            :error="errors.acceptTerms"
            :disabled="isSubmitting"
            terms
          />

          <div
            v-if="submitError || topupStore.error"
            class="top-up__error _text-error"
            role="alert"
          >
            {{ submitError || topupStore.error }}
          </div>

          <div class="top-up__methods">
            <div
              v-for="method in availablePaymentMethods"
              :key="method.code"
              class="top-up__method"
            >
              <BaseButton
                type="button"
                class="top-up__submit"
                :variant="isCard(method.code) ? 'primary' : 'bordered'"
                :loading="isSubmitting && selectedPaymentMethod === method.code"
                :disabled="isSubmitting"
                @click="submit(method.code)"
              >
                <span v-if="method.image" class="top-up__submit-image">
                  <img :src="method.image" :alt="method.title || method.code" />
                </span>

                <span v-else>
                  {{ method.title || method.code }}
                </span>
              </BaseButton>
            </div>

            <p
              v-if="!availablePaymentMethods.length && !settingsStore.loading"
              class="top-up__no-methods"
            >
              {{ $t('No payment methods available') }}
            </p>
          </div>
        </div>
      </aside>
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

import { ChevronDownIcon } from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

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
  phone: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: false,
})

const errors = reactive({
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: '',
})

const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const norm = value => {
  return String(value ?? '').trim()
}

const localCoinsAmount = computed(() => {
  const value = Number(props.selectedAmount)

  return Number.isFinite(value) ? value : 0
})

const localFiatAmount = computed(() => {
  const value = Number(props.haveToPay)

  return Number.isFinite(value) ? value : 0
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

const normalizeMethodCode = code => {
  return String(code || '')
    .trim()
    .toLowerCase()
}

const isCard = code => {
  return ['card', 'creditdebit-card', 'credit_card'].includes(
    normalizeMethodCode(code),
  )
}

const isBalance = code => {
  return normalizeMethodCode(code) === 'balance'
}

const availablePaymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  return methods.filter(method => {
    if (isBalance(method.code)) {
      return false
    }

    if (!Array.isArray(method.currencies) || !method.currencies.length) {
      return true
    }

    return method.currencies.some(code => {
      return String(code).toUpperCase() === currencyCode.value.toUpperCase()
    })
  })
})

const isValidPhone = value => {
  const phone = norm(value)
  const digits = phone.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

const getStoragePayload = () => {
  return {
    name: form.name,
    surname: form.surname,
    phone: form.phone,
    email: form.email,
    country: form.country,
    city: form.city,
    address: form.address,
    postCode: form.postCode,
  }
}

const saveFormToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStoragePayload()))
  } catch (error) {
    console.error(error)
  }
}

const readSavedForm = () => {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!saved) {
      return null
    }

    return JSON.parse(saved)
  } catch (error) {
    console.error(error)
    return null
  }
}

const prefillFromStorage = () => {
  const saved = readSavedForm()

  if (saved) {
    form.name = saved.name ?? ''
    form.surname = saved.surname ?? ''
    form.phone = saved.phone ?? ''
    form.email = saved.email ?? ''
    form.country = saved.country ?? ''
    form.city = saved.city ?? ''
    form.address = saved.address ?? ''
    form.postCode = saved.postCode ?? ''
  }

  form.acceptTerms = false
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  const value = norm(form[field])

  if (field === 'name') {
    if (!value) {
      errors.name = t('First name is required')
    } else if (!nameRe.test(value)) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    if (!value) {
      errors.surname = t('Last name is required')
    } else if (!nameRe.test(value)) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'phone') {
    if (!value) {
      errors.phone = t('Phone is required')
    } else if (!isValidPhone(value)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'email') {
    if (!value) {
      errors.email = t('Email is required')
    } else if (!emailRe.test(value)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'country') {
    if (
      form.country === '' ||
      form.country === null ||
      form.country === undefined
    ) {
      errors.country = t('Country is required')
    }

    return
  }

  if (field === 'city' && !value) {
    errors.city = t('City is required')
    return
  }

  if (field === 'address' && !value) {
    errors.address = t('Address line is required')
    return
  }

  if (field === 'postCode' && !value) {
    errors.postCode = t('Post Code is required')
    return
  }

  if (field === 'acceptTerms') {
    if (!form.acceptTerms) {
      errors.acceptTerms = t('You must accept the Terms of Use')
    }
  }
}

const validateForm = () => {
  clearErrors()

  const fields = [
    'name',
    'surname',
    'phone',
    'email',
    'country',
    'city',
    'address',
    'postCode',
    'acceptTerms',
  ]

  fields.forEach(validateField)

  if (localFiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')
    return false
  }

  if (localCoinsAmount.value <= 0) {
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

const submit = async methodCode => {
  if (isSubmitting.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  selectedPaymentMethod.value = methodCode

  try {
    submitError.value = ''

    topupStore.clearError?.()

    saveFormToStorage()

    topupStore.setAmount(localCoinsAmount.value)
    topupStore.setPaymentType(methodCode)

    const response = await topupStore.checkout({
      name: norm(form.name),
      surname: norm(form.surname),
      phone: norm(form.phone),
      email: norm(form.email),
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
      window.location.assign(response.redirect_url)
      return
    }

    submitError.value = t('Payment provider did not return a redirect URL')
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during top up')
  } finally {
    isSubmitting.value = false
    selectedPaymentMethod.value = null
  }
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  saveFormToStorage()

  emit('close')
}

const initialize = async () => {
  clearErrors()
  topupStore.clearError?.()

  selectedPaymentMethod.value = null

  prefillFromStorage()

  const requests = [ensurePages()]

  if (!settingsStore.settings) {
    requests.push(settingsStore.fetchSettings())
  }

  if (!countryStore.countries?.length) {
    requests.push(countryStore.fetchCountries())
  }

  await Promise.allSettled(requests)
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initialize()
    }
  },
)

watch(
  () => ({
    name: form.name,
    surname: form.surname,
    phone: form.phone,
    email: form.email,
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
    if (errors.country) {
      validateField('country')
    }
  },
)

watch(
  () => form.acceptTerms,
  value => {
    if (value) {
      errors.acceptTerms = ''
    }
  },
)

onMounted(() => {
  if (props.show) {
    initialize()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.top-up {
  display: grid;
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(0, 1fr);

  align-items: start;

  width: 100%;
  min-width: 0;

  @include adaptiveValue('gap', 40, 20);

  &__info,
  &__aside {
    width: 100%;
    min-width: 0;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    min-width: 0;
    min-height: 38px;

    gap: 9px;
    padding: 8px 13px;

    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1;

    text-transform: uppercase;

    @include adaptiveValue('margin-bottom', 28, 18);
  }

  &__back-icon {
    width: 12px;
    min-width: 12px;
    height: 12px;

    transform: rotate(90deg);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);
    text-transform: uppercase;

    @include adaptiveValue('margin-bottom', 34, 22);
  }

  &__form {
    width: 100%;
    min-width: 0;
  }

  &__inputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('column-gap', 38, 14);
    @include adaptiveValue('row-gap', 18, 14);
  }

  &__input {
    width: 100%;
    min-width: 0;

    :deep(.base-input),
    :deep(.base-select) {
      width: 100%;
      min-width: 0;
    }

    :deep(.base-input__label),
    :deep(.base-select__label) {
      color: var(--hint-third-color);

      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-input__control) {
      min-width: 0;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 13px;
    }

    :deep(input::placeholder) {
      color: var(--hint-third-color);
    }
  }

  &__aside {
    @include adaptiveValue('padding-top', 58, 0);
  }

  &__summary {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding', 24, 16);

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: var(--bg-fourth-color);
  }

  &__summary-title {
    margin: 0;

    color: var(--primary-color);
    text-transform: uppercase;

    @include adaptiveValue('margin-bottom', 24, 18);
  }

  &__totals {
    display: flex;
    flex-direction: column;

    min-width: 0;
    gap: 10px;

    @include adaptiveValue('margin-bottom', 44, 28);
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;

    gap: 12px;
  }

  &__total-label {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
  }

  &__total-value {
    justify-content: flex-end;

    min-width: 0;

    color: var(--primary-color);

    :deep(.price__value) {
      color: var(--primary-color);

      font-family: var(--font-inter);
      font-weight: 500;

      @include adaptiveValue('font-size', 19, 16);
    }

    :deep(.price__icon) {
      width: 16px;
      min-width: 16px;
      height: 16px;
    }
  }

  &__terms {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('margin-bottom', 24, 18);

    :deep(.base-checkbox__row) {
      align-items: flex-start;
      gap: 15px;
    }

    :deep(.base-checkbox__box) {
      width: 22px;
      min-width: 22px;
      height: 22px;
    }

    :deep(.base-checkbox__label) {
      min-width: 0;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.6;

      overflow-wrap: anywhere;
    }

    :deep(.base-checkbox__label a) {
      color: #4285ff;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__error {
    margin-bottom: 14px;

    color: var(--error-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  &__methods {
    display: grid;
    grid-template-columns: minmax(0, 1fr);

    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  &__method {
    width: 100%;
    min-width: 0;
  }

  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('min-height', 44, 40);

    padding: 9px 12px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: uppercase;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &-image {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 100%;
      max-width: 160px;
      height: 26px;

      img {
        display: block;

        width: 100%;
        height: 100%;

        object-fit: contain;
      }
    }
  }

  &__no-methods {
    padding: 12px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    text-align: center;
  }

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(0, 1.35fr)
      minmax(0, 1fr);

    &__inputs {
      column-gap: 14px;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;

    &__aside {
      padding-top: 0;
    }

    &__summary {
      max-width: 100%;
    }

    &__totals {
      margin-bottom: 24px;
    }
  }

  @media (max-width: $md6) {
    &__back {
      min-height: 34px;
      margin-bottom: 20px;
    }

    &__title {
      margin-bottom: 20px;
    }

    &__inputs {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 14px;
    }

    &__summary {
      padding: 16px 12px;
    }

    &__total {
      gap: 8px;
    }

    &__terms {
      :deep(.base-checkbox__row) {
        gap: 10px;
      }

      :deep(.base-checkbox__label) {
        font-size: 13px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .top-up__submit {
    transition: none;
  }
}
</style>
