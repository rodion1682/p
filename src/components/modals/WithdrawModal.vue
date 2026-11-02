<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['withdraw-modal__inner']"
    @close="handleClose"
  >
    <div class="withdraw-modal">
      <button
        type="button"
        class="withdraw-modal__back"
        @click="step === 1 ? handleClose() : (step = 1)"
      >
        <span class="withdraw-modal__back-icon">‹</span>

        <span>
          {{ $t('Back') }}
        </span>
      </button>

      <template v-if="step === 1">
        <div class="withdraw-modal__layout">
          <div class="withdraw-modal__info">
            <div class="withdraw-modal__title _h3">
              {{ $t('Withdraw') }}
            </div>

            <div class="withdraw-modal__inputs">
              <BaseInput
                v-model="form.name"
                :placeholder="$t('Name')"
                :error="errors.name"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('name')"
              />

              <BaseInput
                v-model="form.surname"
                :placeholder="$t('Surname')"
                :error="errors.surname"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('surname')"
              />

              <BaseInput
                v-model="form.email"
                :placeholder="$t('Email')"
                type="email"
                autocomplete="email"
                :error="errors.email"
                class="withdraw-modal__input"
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
                class="withdraw-modal__input"
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
                class="withdraw-modal__input"
                :disabled="isSubmitting"
              />

              <BaseInput
                v-model="form.city"
                :placeholder="$t('City')"
                :error="errors.city"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('city')"
              />

              <BaseInput
                v-model="form.address"
                :placeholder="$t('Address line')"
                :error="errors.address"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('address')"
              />

              <BaseInput
                v-model="form.postCode"
                :placeholder="$t('Zip code')"
                :error="errors.postCode"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('postCode')"
              />
            </div>

            <BaseCheckbox
              v-model="form.acceptTerms"
              :error="errors.acceptTerms"
              class="withdraw-modal__checkbox"
              :disabled="isSubmitting"
              terms
            />

            <div v-if="submitError" class="withdraw-modal__error _text-error">
              {{ submitError }}
            </div>
          </div>

          <div class="withdraw-modal__aside">
            <div class="withdraw-modal__summary">
              <div class="withdraw-modal__summary-title _h5">
                {{ $t('Total to withdraw:') }}
              </div>

              <div class="withdraw-modal__summary-item">
                <div class="withdraw-modal__summary-label">
                  {{ $t('You withdraw:') }}
                </div>

                <PriceFormatter
                  class="withdraw-modal__summary-price"
                  :price="amountValue"
                  skip-conversion
                  size="size-32"
                />
              </div>

              <div class="withdraw-modal__summary-item">
                <div class="withdraw-modal__summary-label">
                  {{ $t('You will get:') }}
                </div>

                <PriceFormatter
                  class="withdraw-modal__summary-price"
                  :price="withdrawAmountFiat"
                  :currency-code="currencyCode"
                  is-currency
                  raw-fiat
                  skip-conversion
                  size="size-32"
                />
              </div>
            </div>

            <div class="withdraw-modal__methods">
              <BaseButton
                v-if="cardEnabled"
                type="button"
                class="withdraw-modal__method"
                variant="bordered"
                :loading="isSubmitting && activeMethod === 'card-form'"
                :disabled="isSubmitting || !isStepOneComplete"
                @click="handleCard"
              >
                {{ $t('Credit/Debit Card') }}
              </BaseButton>

              <BaseButton
                v-if="sepaEnabled"
                type="button"
                class="withdraw-modal__method"
                variant="bordered"
                :loading="isSubmitting && activeMethod === 'sepa-manual'"
                :disabled="isSubmitting || !isStepOneComplete"
                @click="handleSepa"
              >
                {{ $t('SEPA') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="step === 2">
        <div class="withdraw-modal__layout">
          <div class="withdraw-modal__info">
            <div class="withdraw-modal__title _h3">
              {{ $t('SEPA') }}
            </div>

            <div class="withdraw-modal__sepa-inputs">
              <BaseInput
                v-model="form.accountHolderFirstName"
                :placeholder="$t('Name')"
                :error="errors.accountHolderFirstName"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('accountHolderFirstName')"
              />

              <BaseInput
                v-model="form.iban"
                :placeholder="$t('IBAN')"
                :error="errors.iban"
                class="withdraw-modal__input"
                :disabled="isSubmitting"
                @blur="validateField('iban')"
              />
            </div>

            <BaseCheckbox
              v-model="form.acceptSepaTerms"
              :error="errors.acceptSepaTerms"
              class="withdraw-modal__checkbox"
              :disabled="isSubmitting"
              terms
            />

            <div v-if="submitError" class="withdraw-modal__error _text-error">
              {{ submitError }}
            </div>
          </div>

          <div class="withdraw-modal__aside">
            <div class="withdraw-modal__summary">
              <div class="withdraw-modal__summary-title _h5">
                {{ $t('Total to withdraw:') }}
              </div>

              <div class="withdraw-modal__summary-item">
                <div class="withdraw-modal__summary-label">
                  {{ $t('You withdraw:') }}
                </div>

                <PriceFormatter
                  class="withdraw-modal__summary-price"
                  :price="amountValue"
                  skip-conversion
                  size="size-32"
                />
              </div>

              <div class="withdraw-modal__summary-item">
                <div class="withdraw-modal__summary-label">
                  {{ $t('You will get:') }}
                </div>

                <PriceFormatter
                  class="withdraw-modal__summary-price"
                  :price="withdrawAmountFiat"
                  :currency-code="currencyCode"
                  is-currency
                  raw-fiat
                  skip-conversion
                  size="size-32"
                />
              </div>
            </div>

            <BaseButton
              type="button"
              variant="bordered"
              class="withdraw-modal__confirm"
              :loading="isSubmitting"
              :disabled="isSubmitting || !isSepaComplete"
              @click="submitSepa"
            >
              {{ $t('Confirm') }}
            </BaseButton>
          </div>
        </div>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import axios from '@/plugins/axios'

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

const STORAGE_KEY = 'checkout_contact_form'
const LEGACY_STORAGE_KEY = 'cart_checkout_contact_form'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },

  balance: {
    type: [String, Number],
    default: 0,
  },

  selectedAmount: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(['close', 'success'])

const { t } = useI18n()
const { ensurePages } = useStaticPages()

const countryStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const step = ref(1)

const isSubmitting = ref(false)
const activeMethod = ref('')
const submitError = ref('')

const withdrawAmount = ref(Number(props.selectedAmount || 0))

const withdrawRequestId = ref(null)

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',

  accountHolderFirstName: '',
  iban: '',

  acceptTerms: false,
  acceptSepaTerms: false,
})

const errors = reactive({
  amount: '',

  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',

  accountHolderFirstName: '',
  iban: '',

  acceptTerms: '',
  acceptSepaTerms: '',
})

const norm = value => {
  return String(value ?? '').trim()
}

const emailRe = /^\S+@\S+\.\S+$/

const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const balanceValue = computed(() => {
  return Number(props.balance || 0)
})

const amountValue = computed(() => {
  const value = Number(withdrawAmount.value)

  return Number.isFinite(value) ? value : 0
})

const currencyCode = computed(() => {
  return currencyStore.currentCurrencyCode || ''
})

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

// credits_conversion_rate means:
//
// 0.5 credits = 1 base currency unit
//
// Example with EUR:
//
// 0.5 coins = €1
// 1 coin = €2
// 10 coins = €20
const oneCoinFiatValue = computed(() => {
  if (!creditsConversionRate.value) {
    return 0
  }

  return selectedCurrencyRate.value / creditsConversionRate.value
})

const creditsToFiat = credits => {
  const amount = Number(credits) || 0

  return Number((amount * oneCoinFiatValue.value).toFixed(2))
}

const withdrawAmountFiat = computed(() => {
  return creditsToFiat(amountValue.value)
})

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const payoutMethods = computed(() => {
  const methods = settingsStore.settings?.payout_methods

  return Array.isArray(methods)
    ? methods.map(method => String(method).toLowerCase().trim())
    : []
})

const cardEnabled = computed(() => {
  return payoutMethods.value.some(method =>
    ['card', 'card-form'].includes(method),
  )
})

const sepaEnabled = computed(() => {
  return payoutMethods.value.some(method =>
    ['sepa', 'sepa-manual'].includes(method),
  )
})

const isValidPhone = phone => {
  const value = norm(phone)

  const digits = value.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(value)
  )
}

const sanitizeIban = iban => {
  return norm(iban).replace(/\s+/g, '').toUpperCase()
}

const isValidIban = iban => {
  return /^[A-Z]{2}[0-9A-Z]{13,32}$/.test(sanitizeIban(iban))
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormStoragePayload()))
  } catch (error) {
    console.error('Failed to save checkout contact form:', error)
  }
}

const prefillFromStorage = () => {
  const saved = getSavedContactData()

  if (!saved) {
    form.acceptTerms = false
    form.acceptSepaTerms = false

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

    form.accountHolderFirstName = data?.name ?? ''

    form.acceptTerms = false
    form.acceptSepaTerms = false
  } catch (error) {
    console.error('Failed to restore checkout contact form:', error)

    localStorage.removeItem(STORAGE_KEY)

    form.acceptTerms = false
    form.acceptSepaTerms = false
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

  if (field === 'amount') {
    if (!amountValue.value) {
      errors.amount = t('Withdraw amount is required')

      return
    }

    if (amountValue.value <= 0) {
      errors.amount = t('Amount must be higher than 0')

      return
    }

    if (amountValue.value > balanceValue.value) {
      errors.amount = t('Not enough balance')
    }

    return
  }

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
    if (!norm(form.email)) {
      errors.email = t('Email is required')

      return
    }

    if (!emailRe.test(norm(form.email))) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!norm(form.phone)) {
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

  if (field === 'city' && !norm(form.city)) {
    errors.city = t('City is required')

    return
  }

  if (field === 'address' && !norm(form.address)) {
    errors.address = t('Address line is required')

    return
  }

  if (field === 'postCode' && !norm(form.postCode)) {
    errors.postCode = t('Post Code is required')

    return
  }

  if (field === 'acceptTerms' && !form.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')

    return
  }

  if (field === 'accountHolderFirstName') {
    if (!norm(form.accountHolderFirstName)) {
      errors.accountHolderFirstName = t('First name is required')

      return
    }

    if (!nameRe.test(norm(form.accountHolderFirstName))) {
      errors.accountHolderFirstName = t('Invalid name')
    }

    return
  }

  if (field === 'iban') {
    if (!norm(form.iban)) {
      errors.iban = t('IBAN is required')

      return
    }

    if (!isValidIban(form.iban)) {
      errors.iban = t('Invalid IBAN')
    }

    return
  }

  if (field === 'acceptSepaTerms' && !form.acceptSepaTerms) {
    errors.acceptSepaTerms = t('You must accept the Terms of Use')
  }
}

const validateStepOne = () => {
  clearErrors()

  validateField('amount')
  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('acceptTerms')

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )

    return false
  }

  return true
}

const validateSepa = () => {
  clearErrors()

  validateField('accountHolderFirstName')

  validateField('iban')
  validateField('acceptSepaTerms')

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )

    return false
  }

  return true
}

const isStepOneComplete = computed(() => {
  return Boolean(
    amountValue.value > 0 &&
    amountValue.value <= balanceValue.value &&
    norm(form.name) &&
    nameRe.test(norm(form.name)) &&
    norm(form.surname) &&
    nameRe.test(norm(form.surname)) &&
    norm(form.email) &&
    emailRe.test(norm(form.email)) &&
    isValidPhone(form.phone) &&
    form.country &&
    norm(form.city) &&
    norm(form.address) &&
    norm(form.postCode) &&
    form.acceptTerms,
  )
})

const isSepaComplete = computed(() => {
  return Boolean(
    norm(form.accountHolderFirstName) &&
    nameRe.test(norm(form.accountHolderFirstName)) &&
    isValidIban(form.iban) &&
    form.acceptSepaTerms,
  )
})

const createWithdrawRequest = async () => {
  const { data } = await axios.post('/user/withdraw-requests', {
    // IMPORTANT:
    // send internal credits/coins,
    // not fiat amount.
    amount: amountValue.value,
  })

  if (data?.status !== 'OK' || !data?.payload) {
    throw new Error(data?.message || t('Failed to create withdraw request'))
  }

  const requestId = data.payload?.id

  if (!requestId) {
    throw new Error(t('Withdraw request ID is missing'))
  }

  withdrawRequestId.value = requestId

  return requestId
}

const submitCard = async requestId => {
  const { data } = await axios.post(
    `/user/withdraw-requests/${requestId}/payout/card-form`,
    {
      email: norm(form.email),

      name: norm(form.name),

      surname: norm(form.surname),

      phone: norm(form.phone),

      country: form.country,

      currency: currencyCode.value,

      city: norm(form.city),

      address: norm(form.address),

      postCode: norm(form.postCode),
    },
  )

  if (data?.status !== 'OK') {
    throw new Error(data?.message || t('Failed to initiate withdrawal'))
  }

  if (!data?.redirect_url) {
    throw new Error(t('Payment redirect URL is missing'))
  }

  window.location.href = data.redirect_url
}

const handleCard = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validateStepOne()) {
    return
  }

  try {
    isSubmitting.value = true

    activeMethod.value = 'card-form'

    submitError.value = ''

    saveFormToStorage()

    const requestId = await createWithdrawRequest()

    await submitCard(requestId)
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during withdrawal')
  } finally {
    isSubmitting.value = false

    activeMethod.value = ''
  }
}

const handleSepa = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validateStepOne()) {
    return
  }

  try {
    isSubmitting.value = true

    activeMethod.value = 'sepa-manual'

    submitError.value = ''

    saveFormToStorage()

    const requestId = await createWithdrawRequest()

    withdrawRequestId.value = requestId

    form.accountHolderFirstName = form.accountHolderFirstName || form.name

    form.acceptSepaTerms = form.acceptTerms

    clearErrors()

    step.value = 2
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during withdrawal')
  } finally {
    isSubmitting.value = false

    activeMethod.value = ''
  }
}

const submitSepa = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validateSepa()) {
    return
  }

  if (!withdrawRequestId.value) {
    submitError.value = t('Withdraw request is missing')

    return
  }

  try {
    isSubmitting.value = true

    submitError.value = ''

    const { data } = await axios.post(
      `/user/withdraw-requests/${withdrawRequestId.value}/payout/sepa-manual`,
      {
        first_name: norm(form.accountHolderFirstName),

        last_name: norm(form.surname),

        account_number: sanitizeIban(form.iban),
      },
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || t('Failed to process SEPA withdrawal'))
    }

    emit('success', data)

    handleClose()
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during withdrawal')
  } finally {
    isSubmitting.value = false
  }
}

const resetModal = () => {
  step.value = 1

  withdrawAmount.value = Number(props.selectedAmount || 0)

  withdrawRequestId.value = null

  activeMethod.value = ''

  form.accountHolderFirstName = form.name || ''

  form.iban = ''

  form.acceptTerms = false
  form.acceptSepaTerms = false

  clearErrors()
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  saveFormToStorage()

  resetModal()

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

    resetModal()
  },
)

watch(
  () => props.selectedAmount,
  value => {
    withdrawAmount.value = Number(value || 0)
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
  () => withdrawAmount.value,
  () => {
    if (errors.amount) {
      validateField('amount')
    }
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
  () => [selectedCurrencyRate.value, creditsConversionRate.value],
  () => {
    if (errors.amount) {
      validateField('amount')
    }
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

  resetModal()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.withdraw-modal {
  width: 100%;

  &__back {
    display: flex;
    align-items: center;

    gap: 12px;

    margin-bottom: 40px;
    padding: 0;

    border: 0;

    background-color: transparent;

    color: var(--seconday-color);

    font-family: var(--font-open-sans);
    font-size: 20px;
    font-weight: 700;
    line-height: 1;

    cursor: pointer;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }

    &-icon {
      font-size: 30px;
      font-weight: 300;
      line-height: 16px;
    }
  }

  &__layout {
    width: 100%;

    @media (min-width: $md4) {
      display: flex;
      align-items: flex-start;

      @include adaptiveValue('gap', 32, 20, 1400, 992, 1);
    }
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
    max-width: 600px;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__error {
    margin-top: 10px;
  }

  &__summary {
    width: 100%;

    text-align: center;

    @include adaptiveValue('padding', 32, 20);

    background-color: var(--bg-primary-color);

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
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__summary-label {
    color: var(--seconday-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__summary-price {
    width: fit-content;

    justify-content: center;

    margin-left: auto;
    margin-right: auto;
  }

  &__methods {
    display: flex;
    flex-direction: column;

    gap: 15px;
  }

  &__method,
  &__confirm {
    width: 100%;

    @include adaptiveValue('min-height', 44, 40);

    font-family: var(--font-condensed);
    font-size: 14px;
    font-weight: 700;
    line-height: 1;

    text-transform: uppercase;
  }

  &__sepa-inputs {
    display: flex;

    gap: 16px;

    &:not(:last-child) {
      margin-bottom: 24px;
    }

    @media (max-width: $md6) {
      flex-direction: column;
    }

    .withdraw-modal__input {
      flex: 0 1 50%;
    }
  }

  @media (max-width: $md4) {
    &__back {
      margin-bottom: 25px;
    }
  }
}
</style>
