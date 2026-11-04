<template>
  <BaseModal
    :show="show"
    wrapper-classes="withdraw-modal__inner"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="withdraw-modal">
      <div class="withdraw-modal__info">
        <BaseButton
          type="button"
          variant="bordered"
          class="withdraw-modal__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <span class="withdraw-modal__back-arrow">
            <icon name="chevron-left" />
          </span>

          {{ $t('Back') }}
        </BaseButton>

        <h2 class="withdraw-modal__title _h2">
          {{ step === 1 ? $t('Withdraw') : $t('SEPA') }}
        </h2>

        <form
          v-if="step === 1"
          class="withdraw-modal__form"
          novalidate
          @submit.prevent
        >
          <div class="withdraw-modal__inputs">
            <BaseInput
              v-model="form.name"
              :label="$t('Name')"
              :error="errors.name"
              variant="checkout"
              autocomplete="given-name"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              :label="$t('Surname')"
              :error="errors.surname"
              variant="checkout"
              autocomplete="family-name"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />

            <BaseInput
              v-model="form.phone"
              :label="$t('Phone')"
              :error="errors.phone"
              variant="checkout"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('phone')"
            />

            <BaseInput
              v-model="form.email"
              :label="$t('Email')"
              :error="errors.email"
              variant="checkout"
              type="email"
              autocomplete="email"
              class="withdraw-modal__input"
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
              class="withdraw-modal__input"
              :disabled="isSubmitting"
            />

            <BaseInput
              v-model="form.city"
              :label="$t('City')"
              :error="errors.city"
              variant="checkout"
              autocomplete="address-level2"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="form.address"
              :label="$t('Address line')"
              :error="errors.address"
              variant="checkout"
              autocomplete="street-address"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('address')"
            />

            <BaseInput
              v-model="form.postCode"
              :label="$t('Zip code')"
              :error="errors.postCode"
              variant="checkout"
              autocomplete="postal-code"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('postCode')"
            />
          </div>
        </form>

        <form
          v-else
          class="withdraw-modal__form"
          novalidate
          @submit.prevent="submitSepa"
        >
          <div class="withdraw-modal__inputs">
            <BaseInput
              v-model="form.accountHolderFirstName"
              :label="$t('Account holder name')"
              :error="errors.accountHolderFirstName"
              variant="checkout"
              autocomplete="given-name"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('accountHolderFirstName')"
            />

            <BaseInput
              v-model="form.accountHolderLastName"
              :label="$t('Account holder surname')"
              :error="errors.accountHolderLastName"
              variant="checkout"
              autocomplete="family-name"
              class="withdraw-modal__input"
              :disabled="isSubmitting"
              @blur="validateField('accountHolderLastName')"
            />

            <BaseInput
              v-model="form.iban"
              :label="$t('IBAN')"
              :error="errors.iban"
              variant="checkout"
              autocomplete="off"
              class="withdraw-modal__input withdraw-modal__input--wide"
              :disabled="isSubmitting"
              @blur="validateField('iban')"
            />
          </div>
        </form>
      </div>

      <aside class="withdraw-modal__aside">
        <div class="withdraw-modal__summary">
          <h3 class="withdraw-modal__summary-title _h4">
            {{ $t('Total to withdraw:') }}
          </h3>

          <div class="withdraw-modal__totals">
            <div class="withdraw-modal__total">
              <span class="withdraw-modal__total-label">
                {{ $t('You get:') }}
              </span>

              <PriceFormatter
                class="withdraw-modal__total-value"
                :price="withdrawAmountFiat"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
              />
            </div>

            <div class="withdraw-modal__total withdraw-modal__total--credits">
              <span class="withdraw-modal__total-label">
                {{ $t('You withdraw:') }}
              </span>

              <PriceFormatter
                class="withdraw-modal__total-value"
                :price="amountValue"
                skip-conversion
                size="size-14"
              />
            </div>
          </div>

          <BaseCheckbox
            v-model="form.acceptTerms"
            class="withdraw-modal__terms"
            :error="errors.acceptTerms"
            :disabled="isSubmitting"
            terms
          />

          <p
            v-if="submitError"
            class="withdraw-modal__error _text-error"
            role="alert"
          >
            {{ submitError }}
          </p>

          <div v-if="step === 1" class="withdraw-modal__methods">
            <BaseButton
              v-if="cardEnabled"
              type="button"
              variant="primary"
              class="withdraw-modal__method"
              :loading="isSubmitting && activeMethod === 'card-form'"
              :disabled="isSubmitting"
              @click="handleCard"
            >
              {{ $t('Credit/Debit Card') }}
            </BaseButton>

            <BaseButton
              v-if="sepaEnabled"
              type="button"
              variant="primary"
              class="withdraw-modal__method"
              :disabled="isSubmitting"
              @click="handleSepa"
            >
              {{ $t('SEPA') }}
            </BaseButton>

            <p
              v-if="!cardEnabled && !sepaEnabled && !settingsStore.loading"
              class="withdraw-modal__unavailable"
            >
              {{ $t('No withdrawal methods available') }}
            </p>
          </div>

          <div v-else class="withdraw-modal__methods">
            <BaseButton
              type="button"
              variant="primary"
              class="withdraw-modal__method"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="submitSepa"
            >
              {{ $t('Confirm') }}
            </BaseButton>
          </div>
        </div>
      </aside>
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
    type: [Number, String],
    default: 0,
  },

  selectedAmount: {
    type: [Number, String],
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
const withdrawAmount = ref(0)

const form = reactive({
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  accountHolderFirstName: '',
  accountHolderLastName: '',
  iban: '',
  acceptTerms: false,
})

const errors = reactive({
  amount: '',
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  accountHolderFirstName: '',
  accountHolderLastName: '',
  iban: '',
  acceptTerms: '',
})

const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const norm = value => String(value ?? '').trim()

const balanceValue = computed(() => {
  const value = Number(props.balance)
  return Number.isFinite(value) ? value : 0
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

const oneCoinFiatValue = computed(() => {
  if (creditsConversionRate.value <= 0) return 0

  return selectedCurrencyRate.value / creditsConversionRate.value
})

const withdrawAmountFiat = computed(() => {
  return Number((amountValue.value * oneCoinFiatValue.value).toFixed(2))
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
    ? methods.map(method =>
        String(
          typeof method === 'string'
            ? method
            : method.code || method.type || '',
        )
          .trim()
          .toLowerCase(),
      )
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

const sanitizeIban = value => {
  return norm(value).replace(/\s+/g, '').toUpperCase()
}

const isValidIban = value => {
  const iban = sanitizeIban(value)

  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)) {
    return false
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0

  for (const char of rearranged) {
    const expanded =
      char >= 'A' && char <= 'Z' ? String(char.charCodeAt(0) - 55) : char

    for (const digit of expanded) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
}

const getSavedContactData = () => {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY)

    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error(error)
    return null
  }
}

const saveFormToStorage = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        email: form.email,
        country: form.country,
        city: form.city,
        address: form.address,
        postCode: form.postCode,
      }),
    )
  } catch (error) {
    console.error(error)
  }
}

const prefillFromStorage = () => {
  const saved = getSavedContactData()

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
  form.accountHolderFirstName = form.name
  form.accountHolderLastName = form.surname
  form.iban = ''
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
    if (amountValue.value <= 0) {
      errors.amount = t('Amount must be higher than 0')
    } else if (amountValue.value > balanceValue.value) {
      errors.amount = t('Not enough balance')
    } else if (oneCoinFiatValue.value <= 0) {
      errors.amount = t('Currency conversion is unavailable')
    }

    return
  }

  if (field === 'name' || field === 'surname') {
    if (!norm(form[field])) {
      errors[field] = t(
        field === 'name' ? 'First name is required' : 'Last name is required',
      )
    } else if (!nameRe.test(norm(form[field]))) {
      errors[field] = t('Invalid name')
    }

    return
  }

  if (field === 'phone') {
    if (!norm(form.phone)) {
      errors.phone = t('Phone is required')
    } else if (!isValidPhone(form.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'email') {
    if (!norm(form.email)) {
      errors.email = t('Email is required')
    } else if (!emailRe.test(norm(form.email))) {
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

  if (['city', 'address', 'postCode'].includes(field)) {
    if (!norm(form[field])) {
      const labels = {
        city: 'City is required',
        address: 'Address line is required',
        postCode: 'Post Code is required',
      }

      errors[field] = t(labels[field])
    }

    return
  }

  if (field === 'accountHolderFirstName' || field === 'accountHolderLastName') {
    if (!norm(form[field])) {
      errors[field] = t('Account holder name is required')
    } else if (!nameRe.test(norm(form[field]))) {
      errors[field] = t('Invalid name')
    }

    return
  }

  if (field === 'iban') {
    if (!norm(form.iban)) {
      errors.iban = t('IBAN is required')
    } else if (!isValidIban(form.iban)) {
      errors.iban = t('Invalid IBAN')
    }

    return
  }

  if (field === 'acceptTerms' && !form.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateFields = fields => {
  clearErrors()

  fields.forEach(validateField)

  const hasErrors = fields.some(field => Boolean(errors[field]))

  if (hasErrors) {
    submitError.value =
      errors.amount ||
      t('Please fill in all required fields correctly and accept terms.')
  }

  return !hasErrors
}

const validateContact = () => {
  return validateFields([
    'amount',
    'name',
    'surname',
    'phone',
    'email',
    'country',
    'city',
    'address',
    'postCode',
    'acceptTerms',
  ])
}

const validateSepa = () => {
  return validateFields([
    'amount',
    'accountHolderFirstName',
    'accountHolderLastName',
    'iban',
    'acceptTerms',
  ])
}

const createWithdrawRequest = async () => {
  const { data } = await axios.post('/user/withdraw-requests', {
    amount: amountValue.value,
  })

  if (data?.status !== 'OK') {
    throw new Error(data?.message || t('Failed to create withdraw request'))
  }

  const requestId = data?.payload?.id ?? data?.id

  if (!requestId) {
    throw new Error(t('Withdraw request ID is missing'))
  }

  return requestId
}

const getContactPayload = () => ({
  name: norm(form.name),
  surname: norm(form.surname),
  phone: norm(form.phone),
  email: norm(form.email),
  country: String(form.country),
  city: norm(form.city),
  address: norm(form.address),
  postCode: norm(form.postCode),
  currency: currencyCode.value,
})

const submitPayout = async method => {
  const requestId = await createWithdrawRequest()

  let url = `/user/withdraw-requests/${requestId}/payout/card-form`
  let payload = getContactPayload()

  if (method === 'sepa-manual') {
    url = `/user/withdraw-requests/${requestId}/payout/sepa-manual`

    payload = {
      ...payload,
      first_name: norm(form.accountHolderFirstName),
      last_name: norm(form.accountHolderLastName),
      account_number: sanitizeIban(form.iban),
    }
  }

  const { data } = await axios.post(url, payload)

  if (data?.status !== 'OK') {
    throw new Error(data?.message || t('Failed to submit withdrawal'))
  }

  return data
}

const handleCard = async () => {
  if (isSubmitting.value || !validateContact()) return

  isSubmitting.value = true
  activeMethod.value = 'card-form'

  try {
    saveFormToStorage()

    const result = await submitPayout('card-form')

    if (!result?.redirect_url) {
      throw new Error(t('Payment redirect URL is missing'))
    }

    window.location.assign(result.redirect_url)
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

const handleSepa = () => {
  if (isSubmitting.value || !validateContact()) return

  saveFormToStorage()

  form.accountHolderFirstName ||= form.name
  form.accountHolderLastName ||= form.surname

  clearErrors()
  step.value = 2
}

const submitSepa = async () => {
  if (isSubmitting.value || !validateSepa()) return

  isSubmitting.value = true
  activeMethod.value = 'sepa-manual'

  try {
    const result = await submitPayout('sepa-manual')

    saveFormToStorage()

    emit('success', result)
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

const resetModal = () => {
  step.value = 1
  withdrawAmount.value = Number(props.selectedAmount || 0)

  activeMethod.value = ''

  form.acceptTerms = false
  form.accountHolderFirstName = form.name
  form.accountHolderLastName = form.surname
  form.iban = ''

  clearErrors()
}

const handleBack = () => {
  if (isSubmitting.value) return

  if (step.value === 2) {
    step.value = 1
    clearErrors()
    return
  }

  handleClose()
}

const handleClose = () => {
  if (isSubmitting.value) return

  saveFormToStorage()
  resetModal()
  emit('close')
}

const initialize = async () => {
  prefillFromStorage()
  resetModal()

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
  value => {
    if (value) initialize()
  },
)

watch(
  () => props.selectedAmount,
  value => {
    withdrawAmount.value = Number(value || 0)
  },
)

watch(
  () => [
    form.name,
    form.surname,
    form.phone,
    form.email,
    form.country,
    form.city,
    form.address,
    form.postCode,
  ],
  saveFormToStorage,
)

watch(
  () => form.country,
  () => {
    if (errors.country) validateField('country')
  },
)

watch(
  () => form.acceptTerms,
  value => {
    if (value) errors.acceptTerms = ''
  },
)

onMounted(() => {
  if (props.show) initialize()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.withdraw-modal {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
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

  &__back-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 13px;
    height: 13px;
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

    &--wide {
      grid-column: 1 / -1;
    }

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

    &--credits {
      .withdraw-modal__total-value {
        :deep(.price__value) {
          font-size: 13px;
        }

        :deep(.price__icon) {
          width: 14px;
          min-width: 14px;
          height: 14px;
        }
      }
    }
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
    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  &__methods {
    display: grid;
    grid-template-columns: minmax(0, 1fr);

    width: 100%;
    min-width: 0;
    gap: 10px;
  }

  &__method {
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
    text-transform: uppercase;
  }

  &__unavailable {
    padding: 10px 0;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);

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

    &__input--wide {
      grid-column: auto;
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
</style>
