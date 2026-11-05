<template>
  <BaseModal
    :show="show"
    wrapper-classes="withdraw-checkout__inner"
    :modal-container-class="isSepaStep ? 'withdraw-checkout__inner--sepa' : ''"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="checkout" :class="{ 'checkout--sepa': isSepaStep }">
      <div class="checkout__info">
        <BaseButton
          type="button"
          variant="bordered"
          class="checkout__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <SvgIcon :icon="ChevronDownIcon" class="checkout__back-icon" />

          <span>
            {{ isSepaStep ? $t('Change Payment Method') : $t('Back') }}
          </span>
        </BaseButton>

        <h2 class="checkout__title _h2">
          {{ isSepaStep ? $t('SEPA') : $t('Withdraw') }}
        </h2>

        <form
          v-if="!isSepaStep"
          class="checkout__inputs"
          novalidate
          @submit.prevent
        >
          <BaseInput
            v-model="form.name"
            :label="$t('Name')"
            :error="errors.name"
            variant="checkout"
            class="checkout__input"
            autocomplete="given-name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="form.surname"
            :label="$t('Surname')"
            :error="errors.surname"
            variant="checkout"
            class="checkout__input"
            autocomplete="family-name"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />

          <BaseInput
            v-model="form.phone"
            :label="$t('Phone')"
            :error="errors.phone"
            variant="checkout"
            class="checkout__input"
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
            class="checkout__input"
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
            class="checkout__input"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="form.city"
            :label="$t('City')"
            :error="errors.city"
            variant="checkout"
            class="checkout__input"
            autocomplete="address-level2"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="form.address"
            :label="$t('Address line')"
            :error="errors.address"
            variant="checkout"
            class="checkout__input"
            autocomplete="street-address"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="form.postCode"
            :label="$t('Zip code')"
            :error="errors.postCode"
            variant="checkout"
            class="checkout__input"
            autocomplete="postal-code"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </form>

        <form
          v-else
          class="checkout__inputs checkout__inputs--sepa"
          novalidate
          @submit.prevent="submitSepa"
        >
          <BaseInput
            v-model="form.accountHolderName"
            :label="$t('Name')"
            :error="errors.accountHolderName"
            variant="checkout"
            class="checkout__input"
            autocomplete="name"
            :disabled="isSubmitting"
            @blur="validateField('accountHolderName')"
          />

          <BaseInput
            v-model="form.iban"
            :label="$t('IBAN')"
            :error="errors.iban"
            variant="checkout"
            class="checkout__input"
            autocomplete="off"
            :disabled="isSubmitting"
            @blur="validateField('iban')"
          />
        </form>
      </div>

      <div class="checkout__summary summary">
        <div class="summary__heading">
          <h3 class="summary__title _h4">
            {{ $t('Total to withdraw:') }}
          </h3>
        </div>

        <div class="summary__totals">
          <div class="summary__total-row">
            <span class="summary__subtitle">
              {{ $t('You get:') }}
            </span>

            <PriceFormatter
              :price="withdrawAmountFiat"
              :currency-code="currencyCode"
              size="size-20"
              is-currency
              raw-fiat
              skip-conversion
              class="summary__fiat"
            />
          </div>
        </div>

        <BaseCheckbox
          v-model="form.acceptTerms"
          :error="errors.acceptTerms"
          :disabled="isSubmitting"
          class="summary__terms"
          terms
        />

        <p v-if="submitError" class="summary__error _text-error" role="alert">
          {{ submitError }}
        </p>

        <div class="summary__methods">
          <template v-if="!isSepaStep">
            <div v-if="cardEnabled" class="summary__method">
              <BaseButton
                type="button"
                variant="primary"
                class="summary__submit"
                :loading="isSubmitting && activeMethod === 'card-form'"
                :disabled="isSubmitting"
                @click="submitCard"
              >
                {{ $t('Credit/Debit Card') }}
              </BaseButton>
            </div>

            <div v-if="sepaEnabled" class="summary__method">
              <BaseButton
                type="button"
                variant="primary"
                class="summary__submit"
                :disabled="isSubmitting"
                @click="openSepa"
              >
                {{ $t('SEPA') }}
              </BaseButton>
            </div>

            <p
              v-if="!cardEnabled && !sepaEnabled && !settingsStore.loading"
              class="summary__empty"
            >
              {{ $t('No withdrawal methods available') }}
            </p>
          </template>

          <div v-else class="summary__method">
            <BaseButton
              type="button"
              variant="primary"
              class="summary__submit"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="submitSepa"
            >
              {{ $t('Confirm') }}
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

import axios from '@/plugins/axios'

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

const clean = value => String(value ?? '').trim()

const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u
const emailRe = /^\S+@\S+\.\S+$/

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

const creditsRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const withdrawAmountFiat = computed(() => {
  if (!settingsStore.creditsEnabled) {
    return Number(amountValue.value.toFixed(2))
  }

  if (creditsRate.value <= 0) return 0

  return Number(
    ((amountValue.value * currencyRate.value) / creditsRate.value).toFixed(2),
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

  if (!Array.isArray(methods)) return []

  return methods.map(method => {
    const code =
      typeof method === 'string' ? method : method?.code || method?.type || ''

    return String(code).trim().toLowerCase()
  })
})

const cardEnabled = computed(() => {
  if (payoutMethods.value.length) {
    return payoutMethods.value.some(method =>
      ['card', 'card-form', 'card-direct'].includes(method),
    )
  }

  return Boolean(settingsStore.settings?.payout_card_enabled)
})

const sepaEnabled = computed(() => {
  if (payoutMethods.value.length) {
    return payoutMethods.value.some(method =>
      ['sepa', 'sepa-manual'].includes(method),
    )
  }

  return Boolean(settingsStore.settings?.payout_sepa_enabled)
})

const isValidPhone = value => {
  const phone = clean(value)
  const digits = phone.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

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

const isValidAmount = computed(() => {
  return (
    amountValue.value > 0 &&
    amountValue.value <= balanceValue.value &&
    withdrawAmountFiat.value > 0
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

  if (!value) {
    const messages = {
      name: 'First name is required',
      surname: 'Last name is required',
      phone: 'Phone is required',
      email: 'Email is required',
      city: 'City is required',
      address: 'Address line is required',
      postCode: 'Post Code is required',
      accountHolderName: 'Name is required',
      iban: 'IBAN is required',
    }

    errors[field] = t(messages[field] || 'Required')
    return
  }

  if (field === 'name' || field === 'surname') {
    if (!nameRe.test(value)) {
      errors[field] = t('Invalid name')
    }

    return
  }

  if (field === 'accountHolderName') {
    if (value.length < 2 || !/^[\p{L}\p{M}' -]+$/u.test(value)) {
      errors.accountHolderName = t('Invalid name')
    }

    return
  }

  if (field === 'email') {
    if (!emailRe.test(value)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!isValidPhone(value)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'iban') {
    if (!isValidIban(value)) {
      errors.iban = t('Invalid IBAN')
    }
  }
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

const sepaFields = ['accountHolderName', 'iban', 'acceptTerms']

const validate = fields => {
  clearErrors()

  if (!isValidAmount.value) {
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

const getContactData = () => ({
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getContactData()))
  } catch (error) {
    console.error(error)
  }
}

const restoreContact = () => {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!saved) return

    const data = JSON.parse(saved)

    Object.keys(getContactData()).forEach(key => {
      form[key] = data[key] ?? ''
    })
  } catch (error) {
    console.error(error)
  }
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

  const tasks = [ensurePages()]

  if (!settingsStore.settings) {
    tasks.push(settingsStore.fetchSettings())
  }

  if (!countryStore.countries?.length) {
    tasks.push(countryStore.fetchCountries())
  }

  await Promise.allSettled(tasks)
}

const handleClose = () => {
  if (isSubmitting.value) return

  saveContact()
  reset()

  emit('close')
}

const handleBack = () => {
  if (isSubmitting.value) return

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

    const redirectUrl = data?.redirect_url || data?.payload?.redirect_url

    if (!redirectUrl) {
      throw new Error(t('Payment redirect URL is missing'))
    }

    window.location.assign(redirectUrl)
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
  if (isSubmitting.value || !validate(sepaFields)) {
    return
  }

  isSubmitting.value = true
  activeMethod.value = 'sepa-manual'

  try {
    const requestId = await getOrCreateWithdrawRequest()

    const nameParts = clean(form.accountHolderName).split(/\s+/)
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ') || clean(form.surname)

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
    if (isOpen) initialize()
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
  saveContact,
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
  if (props.show) initialize()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal__inner.withdraw-checkout__inner) {
  width: calc(100% - 32px);
  max-width: 1072px;
  border-radius: 6px;
  background: var(--bg-third-color);
}

:global(.modal__inner.withdraw-checkout__inner--sepa) {
  max-width: 793px;
}

:global(.withdraw-checkout__inner .modal__content) {
  @include adaptiveValue('padding-top', 34, 18);
  @include adaptiveValue('padding-bottom', 34, 18);
  @include adaptiveValue('padding-left', 34, 15);
  @include adaptiveValue('padding-right', 34, 15);

  background: var(--bg-third-color);
  border-radius: 6px;
}

:global(.withdraw-checkout__inner .modal__close) {
  top: 12px;
  right: 12px;
  color: var(--primary-color);
}

.checkout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;

  @include adaptiveValue('gap', 40, 16);

  &__info,
  &__summary {
    min-width: 0;
  }

  &__back {
    width: fit-content;

    @include adaptiveValue('min-height', 38, 34);
    @include adaptiveValue('margin-bottom', 28, 18);

    padding: 8px 12px;

    background: transparent;
    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;

    &-icon {
      width: 12px;
      min-width: 12px;
      height: 12px;
      transform: rotate(90deg);
    }
  }

  &__title {
    color: var(--primary-color);

    @include adaptiveValue('margin-bottom', 30, 18);
  }

  &__inputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 18, 10);

    &--sepa {
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
      max-width: 268px;
    }
  }

  &__input {
    min-width: 0;
    width: 100%;
  }

  &__summary {
    @include adaptiveValue('margin-top', 56, 0, 1430, 768, 1);
  }

  &--sepa {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);

    @include adaptiveValue('gap', 68, 24);
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);

    &__summary {
      margin-top: 0;
    }

    &__inputs--sepa {
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    &__inputs {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.summary {
  min-width: 0;

  @include adaptiveValue('padding', 24, 14);

  border: 1px solid var(--border-primary-color);
  border-radius: 6px;
  background: var(--bg-fourth-color);

  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 12px;

    @include adaptiveValue('margin-bottom', 24, 16);
  }

  &__title {
    color: var(--primary-color);
    text-transform: uppercase;
  }

  &__totals {
    display: grid;
    gap: 12px;

    @include adaptiveValue('margin-bottom', 84, 30);
  }

  &__total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    min-width: 0;
    gap: 12px;
  }

  &__subtitle {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.4;
  }

  &__fiat {
    justify-content: flex-end;
    flex: 0 0 auto;

    min-width: 0;
    color: var(--primary-color);
  }

  &__terms {
    @include adaptiveValue('margin-bottom', 24, 16);

    :deep(.base-checkbox__row) {
      gap: 16px;
    }

    :deep(.base-checkbox__label) {
      font-family: var(--font-inter);
      font-size: 14px;
      line-height: 1.5;
      color: var(--primary-color);
    }

    :deep(.base-checkbox__box) {
      min-width: 22px;
      width: 22px;
      height: 22px;
    }
  }

  &__error {
    @include adaptiveValue('margin-bottom', 12, 8);
  }

  &__methods {
    display: grid;
    gap: 10px;
  }

  &__method {
    min-width: 0;
  }

  &__submit {
    width: 100%;
    border-radius: 5px;

    @include adaptiveValue('min-height', 44, 40);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__empty {
    font-family: var(--font-inter);
    font-size: 13px;
    color: var(--hint-third-color);
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkout__back,
  .summary__submit {
    transition: none;
  }
}
</style>
