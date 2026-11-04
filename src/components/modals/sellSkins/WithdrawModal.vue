<template>
  <BaseModal
    :show="show"
    :persistent="isSubmitting"
    :wrapper-classes="[
      'withdraw-modal__inner',
      { 'withdraw-modal__inner--sepa': step === 'sepa' },
    ]"
    @close="handleClose"
  >
    <div class="withdraw-modal">
      <div class="withdraw-modal__left">
        <BaseButton
          type="button"
          variant="bordered"
          class="withdraw-modal__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <span class="withdraw-modal__back-icon">‹</span>
          {{ step === 'sepa' ? $t('Change Payment Method') : $t('Back') }}
        </BaseButton>

        <h2 class="withdraw-modal__title _h2">
          {{ step === 'sepa' ? $t('SEPA') : $t('Withdraw') }}
        </h2>

        <form
          v-if="step === 'contact'"
          class="withdraw-modal__form"
          novalidate
          @submit.prevent
        >
          <div class="withdraw-modal__fields">
            <BaseInput
              v-model="form.name"
              class="withdraw-modal__field"
              :label="$t('Name')"
              variant="checkout"
              autocomplete="given-name"
              :error="errors.name"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              class="withdraw-modal__field"
              :label="$t('Surname')"
              variant="checkout"
              autocomplete="family-name"
              :error="errors.surname"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />

            <BaseInput
              v-model="form.phone"
              class="withdraw-modal__field"
              :label="$t('Phone')"
              variant="checkout"
              type="tel"
              autocomplete="tel"
              :error="errors.phone"
              :disabled="isSubmitting"
              @blur="validateField('phone')"
            />

            <BaseInput
              v-model="form.email"
              class="withdraw-modal__field"
              :label="$t('Email')"
              variant="checkout"
              type="email"
              autocomplete="email"
              :error="errors.email"
              :disabled="isSubmitting"
              @blur="validateField('email')"
            />

            <BaseSelect
              v-model="form.country"
              class="withdraw-modal__field"
              :label="$t('Country')"
              :options="countries"
              option-label="name"
              option-value="value"
              :placeholder="$t('Choose country')"
              variant="checkout"
              :error="errors.country"
              :disabled="isSubmitting"
            />

            <BaseInput
              v-model="form.city"
              class="withdraw-modal__field"
              :label="$t('City')"
              variant="checkout"
              autocomplete="address-level2"
              :error="errors.city"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="form.address"
              class="withdraw-modal__field"
              :label="$t('Address line')"
              variant="checkout"
              autocomplete="street-address"
              :error="errors.address"
              :disabled="isSubmitting"
              @blur="validateField('address')"
            />

            <BaseInput
              v-model="form.postCode"
              class="withdraw-modal__field"
              :label="$t('Zip code')"
              variant="checkout"
              autocomplete="postal-code"
              :error="errors.postCode"
              :disabled="isSubmitting"
              @blur="validateField('postCode')"
            />
          </div>
        </form>

        <form
          v-else
          class="withdraw-modal__form withdraw-modal__form--sepa"
          novalidate
          @submit.prevent="submitSepa"
        >
          <BaseInput
            v-model="form.accountHolderName"
            class="withdraw-modal__field"
            :label="$t('Name')"
            variant="checkout"
            autocomplete="name"
            :error="errors.accountHolderName"
            :disabled="isSubmitting"
            @blur="validateField('accountHolderName')"
          />

          <BaseInput
            v-model="form.iban"
            class="withdraw-modal__field"
            :label="$t('IBAN')"
            variant="checkout"
            autocomplete="off"
            :error="errors.iban"
            :disabled="isSubmitting"
            @update:model-value="formatIban"
            @blur="validateField('iban')"
          />
        </form>
      </div>

      <aside class="withdraw-modal__right">
        <div class="withdraw-modal__summary">
          <h3 class="withdraw-modal__summary-title">
            {{ $t('Total to withdraw:') }}
          </h3>

          <div class="withdraw-modal__totals">
            <div class="withdraw-modal__total">
              <span class="withdraw-modal__total-label">
                {{ $t('You get:') }}
              </span>

              <PriceFormatter
                class="withdraw-modal__total-price"
                :price="withdrawAmountFiat"
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

          <div class="withdraw-modal__methods">
            <template v-if="step === 'contact'">
              <BaseButton
                v-if="cardEnabled"
                type="button"
                variant="primary"
                class="withdraw-modal__method"
                :disabled="isSubmitting"
                :loading="isSubmitting && activeMethod === 'card-form'"
                @click="submitCard"
              >
                {{ $t('Credit/Debit Card') }}
              </BaseButton>

              <BaseButton
                v-if="sepaEnabled"
                type="button"
                variant="primary"
                class="withdraw-modal__method"
                :disabled="isSubmitting"
                @click="openSepa"
              >
                {{ $t('SEPA') }}
              </BaseButton>

              <p
                v-if="!cardEnabled && !sepaEnabled && !settingsStore.loading"
                class="withdraw-modal__unavailable"
              >
                {{ $t('No withdrawal methods available') }}
              </p>
            </template>

            <BaseButton
              v-else
              type="button"
              variant="primary"
              class="withdraw-modal__method"
              :disabled="isSubmitting"
              :loading="isSubmitting"
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

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'

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

const countriesStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const STORAGE_KEY = 'checkout_contact_form'
const LEGACY_STORAGE_KEY = 'cart_checkout_contact_form'

const step = ref('contact')
const isSubmitting = ref(false)
const activeMethod = ref('')
const submitError = ref('')
const requestId = ref(null)

const form = reactive({
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  accountHolderName: '',
  iban: '',
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
  accountHolderName: '',
  iban: '',
  acceptTerms: '',
})

const namePattern = /^[\p{L}][\p{L}\p{M}' -]*$/u
const emailPattern = /^\S+@\S+\.\S+$/

const clean = value => String(value ?? '').trim()

const amount = computed(() => {
  const value = Number(props.selectedAmount)
  return Number.isFinite(value) ? value : 0
})

const balance = computed(() => {
  const value = Number(props.balance)
  return Number.isFinite(value) ? value : 0
})

const currencyCode = computed(() => {
  return currencyStore.currentCurrencyCode || 'EUR'
})

const currencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const withdrawAmountFiat = computed(() => {
  if (creditsRate.value <= 0) return 0

  return Number(
    ((amount.value * currencyRate.value) / creditsRate.value).toFixed(2),
  )
})

const countries = computed(() => {
  return (countriesStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const payoutMethods = computed(() => {
  const source = settingsStore.settings?.payout_methods

  if (!Array.isArray(source)) return []

  return source.map(method => {
    const value =
      typeof method === 'string' ? method : method.code || method.type || ''

    return String(value).trim().toLowerCase()
  })
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

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''
  const value = clean(form[field])

  if (field === 'acceptTerms') {
    if (!form.acceptTerms) {
      errors.acceptTerms = t('You must accept the Terms of Use')
    }
    return
  }

  if (!value) {
    const labels = {
      name: 'Name is required',
      surname: 'Surname is required',
      phone: 'Phone is required',
      email: 'Email is required',
      country: 'Country is required',
      city: 'City is required',
      address: 'Address is required',
      postCode: 'Zip code is required',
      accountHolderName: 'Name is required',
      iban: 'IBAN is required',
    }

    errors[field] = t(labels[field] || 'Required')
    return
  }

  if (
    ['name', 'surname', 'accountHolderName'].includes(field) &&
    !value.split(/\s+/).every(part => namePattern.test(part))
  ) {
    errors[field] = t('Invalid name')
  }

  if (field === 'email' && !emailPattern.test(value)) {
    errors.email = t('Invalid email format')
  }

  if (field === 'phone') {
    const digits = value.replace(/\D/g, '')

    if (
      digits.length < 7 ||
      digits.length > 15 ||
      !/^[+0-9()\-\s]+$/.test(value)
    ) {
      errors.phone = t('Invalid phone number')
    }
  }

  if (field === 'iban' && !isValidIban(value)) {
    errors.iban = t('Invalid IBAN')
  }
}

const validate = fields => {
  clearErrors()

  if (
    amount.value <= 0 ||
    amount.value > balance.value ||
    withdrawAmountFiat.value <= 0
  ) {
    submitError.value = t('Invalid withdrawal amount')
    return false
  }

  fields.forEach(validateField)

  if (fields.some(field => errors[field])) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )
    return false
  }

  return true
}

const contactFields = [
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

const normalizeIban = value => {
  return clean(value).replace(/\s+/g, '').toUpperCase()
}

const formatIban = value => {
  const normalized = normalizeIban(value)
  form.iban = normalized.replace(/(.{4})(?=.)/g, '$1 ')
  errors.iban = ''
}

const isValidIban = value => {
  const iban = normalizeIban(value)

  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)) {
    return false
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0

  for (const char of rearranged) {
    const digits =
      char >= 'A' && char <= 'Z' ? String(char.charCodeAt(0) - 55) : char

    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
}

const getStorageData = () => ({
  name: form.name,
  surname: form.surname,
  phone: form.phone,
  email: form.email,
  country: form.country,
  city: form.city,
  address: form.address,
  postCode: form.postCode,
})

const saveContact = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageData()))
  } catch (error) {
    console.error(error)
  }
}

const restoreContact = () => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!raw) return

    const saved = JSON.parse(raw)

    Object.keys(getStorageData()).forEach(key => {
      form[key] = saved[key] ?? ''
    })
  } catch (error) {
    console.error(error)
  }
}

const reset = () => {
  step.value = 'contact'
  requestId.value = null
  activeMethod.value = ''
  form.accountHolderName = ''
  form.iban = ''
  form.acceptTerms = false
  clearErrors()
}

const initialize = async () => {
  reset()
  restoreContact()

  const requests = [ensurePages()]

  if (!settingsStore.settings) {
    requests.push(settingsStore.fetchSettings())
  }

  if (!countriesStore.countries?.length) {
    requests.push(countriesStore.fetchCountries())
  }

  await Promise.allSettled(requests)
}

const handleClose = () => {
  if (isSubmitting.value) return
  saveContact()
  reset()
  emit('close')
}

const handleBack = () => {
  if (isSubmitting.value) return

  if (step.value === 'sepa') {
    step.value = 'contact'
    clearErrors()
    return
  }

  handleClose()
}

const getContactPayload = () => ({
  name: clean(form.name),
  surname: clean(form.surname),
  phone: clean(form.phone),
  email: clean(form.email),
  country: form.country,
  city: clean(form.city),
  address: clean(form.address),
  postCode: clean(form.postCode),
  currency: currencyCode.value,
})

const getRequestId = async () => {
  if (requestId.value) return requestId.value

  const { data } = await axios.post('/user/withdraw-requests', {
    amount: amount.value,
  })

  if (data?.status !== 'OK') {
    throw new Error(data?.message || t('Failed to create withdraw request'))
  }

  const id = data?.payload?.id ?? data?.id

  if (!id) {
    throw new Error(t('Withdraw request ID is missing'))
  }

  requestId.value = id
  return id
}

const submitCard = async () => {
  if (isSubmitting.value || !validate(contactFields)) return

  isSubmitting.value = true
  activeMethod.value = 'card-form'

  try {
    saveContact()

    const id = await getRequestId()

    const { data } = await axios.post(
      `/user/withdraw-requests/${id}/payout/card-form`,
      getContactPayload(),
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || t('Failed to initiate withdrawal'))
    }

    if (!data?.redirect_url) {
      throw new Error(t('Payment redirect URL is missing'))
    }

    window.location.assign(data.redirect_url)
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to initiate withdrawal')
  } finally {
    isSubmitting.value = false
    activeMethod.value = ''
  }
}

const openSepa = () => {
  if (isSubmitting.value || !validate(contactFields)) return

  saveContact()
  form.accountHolderName = `${clean(form.name)} ${clean(form.surname)}`.trim()
  form.iban = ''
  step.value = 'sepa'
  clearErrors()
}

const submitSepa = async () => {
  if (
    isSubmitting.value ||
    !validate(['accountHolderName', 'iban', 'acceptTerms'])
  ) {
    return
  }

  isSubmitting.value = true
  activeMethod.value = 'sepa-manual'

  try {
    const id = await getRequestId()
    const parts = clean(form.accountHolderName).split(/\s+/)
    const firstName = parts.shift() || ''
    const lastName = parts.join(' ') || clean(form.surname)

    const { data } = await axios.post(
      `/user/withdraw-requests/${id}/payout/sepa-manual`,
      {
        first_name: firstName,
        last_name: lastName,
        account_number: normalizeIban(form.iban),
      },
    )

    if (data?.status !== 'OK') {
      throw new Error(data?.message || t('Failed to process SEPA withdrawal'))
    }

    saveContact()
    emit('success', data)
    reset()
  } catch (error) {
    submitError.value =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to process SEPA withdrawal')
  } finally {
    isSubmitting.value = false
    activeMethod.value = ''
  }
}

watch(
  () => props.show,
  value => {
    if (value) initialize()
  },
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

:global(.modal__inner.withdraw-modal__inner) {
  max-width: 1073px;
}

:global(.modal__inner.withdraw-modal__inner--sepa) {
  max-width: 793px;
}

.withdraw-modal {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  align-items: start;

  width: 100%;
  min-width: 0;
  gap: 40px;

  &__left,
  &__right {
    min-width: 0;
    width: 100%;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    min-height: 38px;
    padding: 9px 14px;
    gap: 10px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__back-icon {
    font-size: 23px;
    font-weight: 400;
    line-height: 10px;
  }

  &__title {
    margin: 0;
    color: var(--primary-color);
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 22);
    }
  }

  &__form,
  &__fields {
    width: 100%;
    min-width: 0;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('column-gap', 38, 14);
    @include adaptiveValue('row-gap', 18, 14);
  }

  &__field {
    min-width: 0;
    width: 100%;

    :deep(.base-input__label),
    :deep(.base-select__label) {
      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    :deep(.base-input),
    :deep(.base-select) {
      min-height: 44px;
      border: 1px solid var(--border-primary-color);
      border-radius: 5px;
      background-color: var(--bg-third-color);
    }

    :deep(.base-input__control) {
      min-height: 42px;
      padding-top: 0;
      font-family: var(--font-inter);
      font-size: 13px;
    }
  }

  &__right {
    padding-top: 58px;
  }

  &__summary {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding', 24, 16);

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;
    background-color: var(--bg-eight-color);
  }

  &__summary-title {
    margin: 0;

    color: var(--primary-color);
    font-family: var(--font-akshar);
    font-size: 23px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 26px;
    }
  }

  &__totals {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 74, 38);
    }
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
    line-height: 1.4;
  }

  &__total-price {
    justify-content: flex-end;
    min-width: 0;

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 20px;
      font-weight: 500;
    }
  }

  &__terms {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      margin-bottom: 24px;
    }

    :deep(.base-checkbox__row) {
      align-items: flex-start;
      gap: 14px;
    }

    :deep(.base-checkbox__box) {
      width: 22px;
      min-width: 22px;
      height: 22px;
    }

    :deep(.base-checkbox__label) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 14px;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    :deep(a) {
      color: #4285ff;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__methods {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    min-width: 0;
  }

  &__method {
    width: 100%;
    min-width: 0;
    min-height: 43px;
    padding: 9px 12px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__error {
    margin-bottom: 12px;
    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__unavailable {
    color: var(--hint-third-color);
    font-size: 12px;
    text-align: center;
  }

  &__form--sepa {
    display: flex;
    flex-direction: column;
    gap: 18px;
    max-width: 268px;
  }

  @media (max-width: $md3) {
    gap: 22px;
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;

    &__right {
      padding-top: 0;
    }

    &__form--sepa {
      max-width: 100%;
    }

    &__totals:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  @media (max-width: $md6) {
    &__fields {
      grid-template-columns: minmax(0, 1fr);
    }

    &__back {
      min-height: 34px;
    }

    &__summary {
      padding: 16px 12px;
    }

    &__summary-title {
      font-size: 20px;
    }

    &__terms {
      :deep(.base-checkbox__label) {
        font-size: 13px;
      }
    }
  }
}
</style>
