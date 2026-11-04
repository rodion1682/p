<template>
  <BaseModal
    :show="show"
    :persistent="isSubmitting"
    :wrapper-classes="[
      'withdraw-modal__inner',
      { 'withdraw-modal__inner--sepa': isSepaStep },
    ]"
    @close="handleClose"
  >
    <div class="withdraw-modal" :class="{ 'withdraw-modal--sepa': isSepaStep }">
      <div class="withdraw-modal__info">
        <BaseButton
          type="button"
          variant="bordered"
          class="withdraw-modal__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <SvgIcon :icon="ChevronDownIcon" class="withdraw-modal__back-icon" />

          <span>
            {{ isSepaStep ? $t('Change Payment Method') : $t('Back') }}
          </span>
        </BaseButton>

        <h2 class="withdraw-modal__title _h2">
          {{ isSepaStep ? $t('SEPA') : $t('Withdraw') }}
        </h2>

        <form
          v-if="!isSepaStep"
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
              class="withdraw-modal__input"
              autocomplete="given-name"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              :label="$t('Surname')"
              :error="errors.surname"
              variant="checkout"
              class="withdraw-modal__input"
              autocomplete="family-name"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />

            <BaseInput
              v-model="form.phone"
              :label="$t('Phone')"
              :error="errors.phone"
              variant="checkout"
              class="withdraw-modal__input"
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
              class="withdraw-modal__input"
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
              class="withdraw-modal__input"
              :disabled="isSubmitting"
            />

            <BaseInput
              v-model="form.city"
              :label="$t('City')"
              :error="errors.city"
              variant="checkout"
              class="withdraw-modal__input"
              autocomplete="address-level2"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="form.address"
              :label="$t('Address line')"
              :error="errors.address"
              variant="checkout"
              class="withdraw-modal__input"
              autocomplete="street-address"
              :disabled="isSubmitting"
              @blur="validateField('address')"
            />

            <BaseInput
              v-model="form.postCode"
              :label="$t('Zip code')"
              :error="errors.postCode"
              variant="checkout"
              class="withdraw-modal__input"
              autocomplete="postal-code"
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
            :label="$t('Name')"
            :error="errors.accountHolderName"
            variant="checkout"
            class="withdraw-modal__input"
            autocomplete="name"
            :disabled="isSubmitting"
            @blur="validateField('accountHolderName')"
          />

          <BaseInput
            v-model="form.iban"
            :label="$t('IBAN')"
            :error="errors.iban"
            variant="checkout"
            class="withdraw-modal__input"
            autocomplete="off"
            :disabled="isSubmitting"
            @blur="validateField('iban')"
          />
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
            <template v-if="!isSepaStep">
              <BaseButton
                v-if="cardEnabled"
                type="button"
                variant="primary"
                class="withdraw-modal__submit"
                :loading="isSubmitting && activeMethod === 'card-form'"
                :disabled="isSubmitting"
                @click="submitCard"
              >
                {{ $t('Credit/Debit Card') }}
              </BaseButton>

              <BaseButton
                v-if="sepaEnabled"
                type="button"
                variant="primary"
                class="withdraw-modal__submit"
                :disabled="isSubmitting"
                @click="openSepa"
              >
                {{ $t('SEPA') }}
              </BaseButton>

              <p
                v-if="!cardEnabled && !sepaEnabled && !settingsStore.loading"
                class="withdraw-modal__no-methods"
              >
                {{ $t('No withdrawal methods available') }}
              </p>
            </template>

            <BaseButton
              v-else
              type="button"
              variant="primary"
              class="withdraw-modal__submit"
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

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

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

const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const countryStore = useCountriesStore()

const step = ref('contact')
const isSubmitting = ref(false)
const activeMethod = ref('')
const submitError = ref('')
const withdrawRequestId = ref(null)

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

const emailPattern = /^\S+@\S+\.\S+$/
const namePattern = /^[\p{L}][\p{L}\p{M}' -]*$/u

const clean = value => String(value ?? '').trim()

const isSepaStep = computed(() => {
  return step.value === 'sepa'
})

const amountValue = computed(() => {
  const value = Number(props.selectedAmount)

  return Number.isFinite(value) ? value : 0
})

const balanceValue = computed(() => {
  const value = Number(props.balance)

  return Number.isFinite(value) ? value : 0
})

const currencyCode = computed(() => {
  return currencyStore.currentCurrencyCode || 'EUR'
})

const currencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const withdrawAmountFiat = computed(() => {
  if (creditsConversionRate.value <= 0) {
    return 0
  }

  return Number(
    (
      (amountValue.value * currencyRate.value) /
      creditsConversionRate.value
    ).toFixed(2),
  )
})

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const payoutMethods = computed(() => {
  const methods = settingsStore.settings?.payout_methods

  if (!Array.isArray(methods)) {
    return []
  }

  return methods.map(method => {
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

const normalizeIban = value => {
  return clean(value).replace(/\s+/g, '').toUpperCase()
}

const isValidIban = value => {
  const iban = normalizeIban(value)

  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)) {
    return false
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0

  for (const character of rearranged) {
    const digits =
      character >= 'A' && character <= 'Z'
        ? String(character.charCodeAt(0) - 55)
        : character

    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
}

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
    const messages = {
      name: 'First name is required',
      surname: 'Last name is required',
      phone: 'Phone is required',
      email: 'Email is required',
      country: 'Country is required',
      city: 'City is required',
      address: 'Address line is required',
      postCode: 'Post Code is required',
      accountHolderName: 'Name is required',
      iban: 'IBAN is required',
    }

    errors[field] = t(messages[field] || 'Required')

    return
  }

  if (
    ['name', 'surname', 'accountHolderName'].includes(field) &&
    !namePattern.test(value)
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
    amountValue.value <= 0 ||
    amountValue.value > balanceValue.value ||
    withdrawAmountFiat.value <= 0
  ) {
    submitError.value = t('Invalid withdrawal amount')

    return false
  }

  fields.forEach(validateField)

  if (fields.some(field => Boolean(errors[field]))) {
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

const getSavedContact = () => {
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

const saveContact = () => {
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

const restoreContact = () => {
  const saved = getSavedContact()

  if (!saved) {
    return
  }

  form.name = saved.name ?? ''
  form.surname = saved.surname ?? ''
  form.phone = saved.phone ?? ''
  form.email = saved.email ?? ''
  form.country = saved.country ?? ''
  form.city = saved.city ?? ''
  form.address = saved.address ?? ''
  form.postCode = saved.postCode ?? ''
}

const reset = () => {
  step.value = 'contact'

  withdrawRequestId.value = null
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

  if (!countryStore.countries?.length) {
    requests.push(countryStore.fetchCountries())
  }

  await Promise.allSettled(requests)
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  saveContact()
  reset()

  emit('close')
}

const handleBack = () => {
  if (isSubmitting.value) {
    return
  }

  if (isSepaStep.value) {
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

const getOrCreateWithdrawRequest = async () => {
  if (withdrawRequestId.value) {
    return withdrawRequestId.value
  }

  const { data } = await axios.post('/user/withdraw-requests', {
    amount: amountValue.value,
  })

  if (data?.status !== 'OK') {
    throw new Error(data?.message || t('Failed to create withdraw request'))
  }

  const id = data?.payload?.id ?? data?.id

  if (!id) {
    throw new Error(t('Withdraw request ID is missing'))
  }

  withdrawRequestId.value = id

  return id
}

const submitCard = async () => {
  if (isSubmitting.value || !validate(contactFields)) {
    return
  }

  isSubmitting.value = true
  activeMethod.value = 'card-form'

  try {
    saveContact()

    const requestId = await getOrCreateWithdrawRequest()

    const { data } = await axios.post(
      `/user/withdraw-requests/${requestId}/payout/card-form`,
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
      t('An error occurred during withdrawal')
  } finally {
    isSubmitting.value = false
    activeMethod.value = ''
  }
}

const openSepa = () => {
  if (isSubmitting.value || !validate(contactFields)) {
    return
  }

  saveContact()

  form.accountHolderName = [clean(form.name), clean(form.surname)]
    .filter(Boolean)
    .join(' ')

  form.iban = ''

  clearErrors()
  step.value = 'sepa'
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
    const requestId = await getOrCreateWithdrawRequest()

    const parts = clean(form.accountHolderName).split(/\s+/)

    const firstName = parts.shift() || ''

    const lastName = parts.join(' ') || clean(form.surname)

    const { data } = await axios.post(
      `/user/withdraw-requests/${requestId}/payout/sepa-manual`,
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

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initialize()
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
  () => form.acceptTerms,
  accepted => {
    if (accepted) {
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

:global(.modal__inner.withdraw-modal__inner--sepa) {
  max-width: 793px;
}

.withdraw-modal {
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
  }

  &__no-methods {
    padding: 12px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    text-align: center;
  }

  &--sepa {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1.45fr);

    gap: 68px;

    .withdraw-modal__form--sepa {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
  }

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(0, 1.35fr)
      minmax(0, 1fr);

    &__inputs {
      column-gap: 14px;
    }

    &--sepa {
      grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1.45fr);

      gap: 28px;
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

    &--sepa {
      grid-template-columns: minmax(0, 1fr);
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
</style>
