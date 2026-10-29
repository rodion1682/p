<template>
  <BaseModal
    :show="show"
    wrapper-classes="withdraw-modal__inner"
    @close="handleClose"
  >
    <div class="withdraw">
      <h2 class="withdraw__title _h3">
        {{ $t('Withdraw') }}
      </h2>

      <form class="withdraw__form" novalidate @submit.prevent>
        <div class="withdraw__amount-row">
          <BaseInput
            v-model="form.amount"
            class="withdraw__field withdraw__field_amount"
            name="amount"
            inputmode="decimal"
            :label="$t('Amount')"
            :placeholder="'100.00'"
            :error="errors.amount"
            @blur="validateField('amount')"
          >
            <template #suffix>
              {{ currencySymbol }}
            </template>
          </BaseInput>
        </div>

        <div class="withdraw__divider"></div>

        <div class="withdraw__fields">
          <BaseInput
            v-model="form.firstName"
            class="withdraw__field"
            name="firstName"
            autocomplete="given-name"
            :label="$t('Name')"
            :placeholder="$t('Name')"
            :error="errors.firstName"
            @blur="validateField('firstName')"
          />

          <BaseInput
            v-model="form.lastName"
            class="withdraw__field"
            name="lastName"
            autocomplete="family-name"
            :label="$t('Surname')"
            :placeholder="$t('Surname')"
            :error="errors.lastName"
            @blur="validateField('lastName')"
          />

          <BaseInput
            v-model="form.email"
            class="withdraw__field"
            type="email"
            name="email"
            autocomplete="email"
            :label="$t('E-Mail')"
            :placeholder="'person@gmail.com'"
            :error="errors.email"
            @blur="validateField('email')"
          />

          <BaseInput
            v-model="form.phone"
            class="withdraw__field"
            type="tel"
            name="phone"
            autocomplete="tel"
            :label="$t('Phone')"
            :placeholder="'+1 234 5678 9000'"
            :error="errors.phone"
            @blur="validateField('phone')"
          />
        </div>

        <div class="withdraw__divider"></div>

        <div class="withdraw__fields">
          <BaseSelect
            v-model="form.country"
            class="withdraw__field withdraw__field_select"
            :options="countryOptions"
            option-label="title"
            option-value="id"
            :label="$t('Country')"
            :placeholder="$t('Country')"
            :error="errors.country"
          />

          <BaseInput
            v-model="form.city"
            class="withdraw__field"
            name="city"
            autocomplete="address-level2"
            :label="$t('City')"
            :placeholder="$t('City')"
            :error="errors.city"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.address"
            class="withdraw__field"
            name="address"
            autocomplete="street-address"
            :label="$t('Address')"
            :placeholder="$t('Address')"
            :error="errors.address"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            class="withdraw__field"
            name="postCode"
            autocomplete="postal-code"
            :label="$t('Postcode')"
            :placeholder="'123456'"
            :error="errors.postCode"
            @blur="validateField('postCode')"
          />
        </div>

        <div class="withdraw__agreements">
          <BaseCheckbox
            v-model="form.termsAccepted"
            class="withdraw__checkbox"
            :error="errors.termsAccepted"
          >
            {{ $t('I agree with ') }}
            <router-link :to="getPageUrl(termsPage)" target="_blank">
              {{ $t('Terms & Conditions') }}
            </router-link>
            {{ $t(' and ') }}
            <router-link :to="getPageUrl(privacyPage)" target="_blank">
              {{ $t('Privacy Policy') }}
            </router-link>
          </BaseCheckbox>
        </div>

        <div v-if="errors.general" class="withdraw__error _text-error">
          {{ errors.general }}
        </div>

        <div class="withdraw__methods">
          <div class="withdraw__method">
            <BaseButton
              type="button"
              variant="white-bordered"
              class="withdraw__payment-button withdraw__payment-button_sepa"
              @click="submitWithMethod('sepa-manual')"
            >
              {{ $t('SEPA') }}
            </BaseButton>
          </div>

          <div class="withdraw__method">
            <BaseButton
              type="button"
              class="withdraw__payment-button withdraw__payment-button_card"
              @click="submitWithMethod('card-direct')"
            >
              {{ $t('Credit / Debit Card') }}
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useUserStore } from '@/stores/user'

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'
const savedFields = ['country', 'city', 'address', 'postCode']

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['close', 'submit'])

const { t } = useI18n()
const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const countriesStore = useCountriesStore()
const userStore = useUserStore()
const currencyStore = useCurrencyStore()

const form = reactive({
  amount: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: false,
})

const errors = reactive({
  amount: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  termsAccepted: '',
  general: '',
})

const countryOptions = computed(() => countriesStore.countries || [])

const currencySymbol = computed(() => {
  return (
    currencyStore.currentCurrencySymbol ||
    currencyStore.currentCurrency?.symbol ||
    '€'
  )
})

const norm = value => String(value ?? '').trim()

const amountNumber = computed(() => {
  const normalized = norm(form.amount).replace(',', '.')
  const value = Number(normalized)

  return Number.isFinite(value) ? value : 0
})

const nameRegex = /^[\p{L}][\p{L}\p{M}' -]*$/u
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const toId = value => {
  const numeric = Number(value)

  return Number.isFinite(numeric) && numeric > 0 ? numeric : ''
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
    const saved = getSavedCheckoutData()

    savedFields.forEach(field => {
      saved[field] = form[field]
    })

    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(saved))
  } catch (error) {
    console.error('Failed to save withdrawal data:', error)
  }
}

const getUserOrSavedValue = (user, field) => {
  const saved = getSavedCheckoutData()

  const map = {
    firstName: user?.name,
    lastName: user?.surname || user?.surename,
    email: user?.email || user?.mail,
    phone: user?.phone,
    country: user?.country?.id || user?.country_id || user?.country,
    city: user?.city,
    address: user?.address,
    postCode: user?.zip || user?.post_code || user?.postCode,
  }

  const userValue = map[field]

  if (field === 'country') {
    const countryId = toId(userValue)

    if (countryId) {
      return countryId
    }
  }

  if (norm(userValue)) {
    return userValue
  }

  return saved[field] ?? ''
}

const prefillForm = () => {
  const user = userStore.user || {}

  form.amount = ''
  form.firstName = getUserOrSavedValue(user, 'firstName')
  form.lastName = getUserOrSavedValue(user, 'lastName')
  form.email = getUserOrSavedValue(user, 'email')
  form.phone = getUserOrSavedValue(user, 'phone')
  form.country = getUserOrSavedValue(user, 'country')
  form.city = getUserOrSavedValue(user, 'city')
  form.address = getUserOrSavedValue(user, 'address')
  form.postCode = getUserOrSavedValue(user, 'postCode')
  form.termsAccepted = false

  clearErrors()
}

const isValidPhone = value => {
  const phone = norm(value)
  const digits = phone.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

const validateField = field => {
  errors[field] = ''
  errors.general = ''

  if (field === 'amount') {
    if (!norm(form.amount)) {
      errors.amount = t('Amount is required')
      return
    }

    if (amountNumber.value <= 0) {
      errors.amount = t('Please enter a valid amount')
      return
    }

    if (amountNumber.value > Number(props.balance || 0)) {
      errors.amount = t('Amount exceeds available balance')
    }

    return
  }

  if (field === 'firstName') {
    if (!norm(form.firstName)) {
      errors.firstName = t('First name is required')
      return
    }

    if (!nameRegex.test(norm(form.firstName))) {
      errors.firstName = t('Invalid name')
    }

    return
  }

  if (field === 'lastName') {
    if (!norm(form.lastName)) {
      errors.lastName = t('Last name is required')
      return
    }

    if (!nameRegex.test(norm(form.lastName))) {
      errors.lastName = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!norm(form.email)) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRegex.test(norm(form.email))) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!norm(form.phone)) {
      errors.phone = t('Phone number is required')
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

  if (field === 'city' && !norm(form.city)) {
    errors.city = t('City is required')
    return
  }

  if (field === 'address' && !norm(form.address)) {
    errors.address = t('Address is required')
    return
  }

  if (field === 'postCode' && !norm(form.postCode)) {
    errors.postCode = t('Post Code is required')
    return
  }

  if (field === 'termsAccepted' && !form.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('amount')
  validateField('firstName')
  validateField('lastName')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('termsAccepted')

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    errors.general = t('Please fill in all required fields correctly.')
    return false
  }

  return true
}

const submitWithMethod = method => {
  if (!validateForm()) {
    return
  }

  saveCheckoutData()

  emit('submit', {
    amount: Number(amountNumber.value.toFixed(2)),
    withdrawType: method,
    name: norm(form.firstName),
    surname: norm(form.lastName),
    email: norm(form.email),
    phone: norm(form.phone),
    country: form.country,
    city: norm(form.city),
    postCode: norm(form.postCode),
    address: norm(form.address),
    card_holder_name: '',
    card_number: '',
    expirationDate: '',
    first_name: norm(form.firstName),
    last_name: norm(form.lastName),
    account_number: '',
  })
}

const handleClose = () => {
  clearErrors()
  emit('close')
}

const initializeModal = async () => {
  await ensurePages()

  if (!countriesStore.countries?.length) {
    try {
      await countriesStore.fetchCountries()
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    }
  }

  try {
    await userStore.fetchProfile?.()
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }

  prefillForm()
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
  () => form.amount,
  () => {
    errors.amount = ''
    errors.general = ''
  },
)

watch(
  () => form.firstName,
  () => {
    errors.firstName = ''
  },
)

watch(
  () => form.lastName,
  () => {
    errors.lastName = ''
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
  () => form.country,
  value => {
    if (value) {
      errors.country = ''
    }
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

watch(
  () => form.termsAccepted,
  value => {
    if (value) {
      errors.termsAccepted = ''
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.withdraw-modal__inner) {
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

:global(.modal .modal__inner.withdraw-modal__inner .modal__close) {
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

:global(.modal .modal__inner.withdraw-modal__inner .modal__close:hover) {
  color: #1a73ff;
}

.withdraw {
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

  &__form {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  &__amount-row {
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

    :deep(.base-input__suffix) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 700;
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

  &__field_amount {
    width: 100%;
  }

  &__divider {
    width: 100%;
    height: 1px;
    margin-top: 29px;
    margin-bottom: 24px;
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
    width: 100%;
    min-width: 0;
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
    border-radius: 8px !important;
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

    &:focus-visible {
      outline: 2px solid #1a73ff;
      outline-offset: 3px;
    }

    &_sepa {
      border: 1px solid #b7c4d4 !important;
      background-color: transparent !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: #1a73ff !important;
          background-color: rgba(26, 115, 255, 0.08) !important;
        }
      }
    }

    &_card {
      border: 1px solid #1a73ff !important;
      background-color: #1a73ff !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          border-color: #3f8cff !important;
          background-color: #3f8cff !important;
        }
      }
    }
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
      :deep(.base-input__suffix),
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
  }

  @media (max-width: $md7) {
    &__methods {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

@media (max-width: $md3) {
  :global(.modal .modal__inner.withdraw-modal__inner) {
    padding: 52px 28px 35px;
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.withdraw-modal__inner) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;
    padding: 48px 20px 25px;
    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: $md7) {
  :global(.modal .modal__inner.withdraw-modal__inner) {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
