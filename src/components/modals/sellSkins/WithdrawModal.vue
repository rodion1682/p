<template>
  <BaseModal
    :show="show"
    :persistent="isSubmitting"
    :wrapper-classes="[
      'withdraw-checkout__inner',
      { 'withdraw-checkout__inner--sepa': isSepaStep },
    ]"
    @close="handleClose"
  >
    <div
      class="withdraw-checkout"
      :class="{ 'withdraw-checkout--sepa': isSepaStep }"
    >
      <div class="withdraw-checkout__main">
        <BaseButton
          type="button"
          variant="bordered"
          class="withdraw-checkout__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="withdraw-checkout__back-icon"
          />

          {{ isSepaStep ? $t('Change Payment Method') : $t('Back') }}
        </BaseButton>

        <h2 class="withdraw-checkout__title _h2">
          {{ isSepaStep ? $t('SEPA') : $t('Withdraw') }}
        </h2>

        <form
          v-if="!isSepaStep"
          class="withdraw-checkout__form"
          novalidate
          @submit.prevent
        >
          <div class="withdraw-checkout__fields">
            <BaseInput
              v-model="form.name"
              class="withdraw-checkout__field"
              :label="$t('Name')"
              variant="checkout"
              autocomplete="given-name"
              :error="errors.name"
              :disabled="isSubmitting"
              @blur="validateField('name')"
            />

            <BaseInput
              v-model="form.surname"
              class="withdraw-checkout__field"
              :label="$t('Surname')"
              variant="checkout"
              autocomplete="family-name"
              :error="errors.surname"
              :disabled="isSubmitting"
              @blur="validateField('surname')"
            />

            <BaseInput
              v-model="form.phone"
              class="withdraw-checkout__field"
              :label="$t('Phone')"
              variant="checkout"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              :error="errors.phone"
              :disabled="isSubmitting"
              @blur="validateField('phone')"
            />

            <BaseInput
              v-model="form.email"
              class="withdraw-checkout__field"
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
              class="withdraw-checkout__field"
              :label="$t('Country')"
              variant="checkout"
              :options="countries"
              option-label="name"
              option-value="value"
              :placeholder="$t('Choose country')"
              :error="errors.country"
              :disabled="isSubmitting"
            />

            <BaseInput
              v-model="form.city"
              class="withdraw-checkout__field"
              :label="$t('City')"
              variant="checkout"
              autocomplete="address-level2"
              :error="errors.city"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />

            <BaseInput
              v-model="form.address"
              class="withdraw-checkout__field"
              :label="$t('Address line')"
              variant="checkout"
              autocomplete="street-address"
              :error="errors.address"
              :disabled="isSubmitting"
              @blur="validateField('address')"
            />

            <BaseInput
              v-model="form.postCode"
              class="withdraw-checkout__field"
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
          class="withdraw-checkout__form withdraw-checkout__form--sepa"
          novalidate
          @submit.prevent="submitSepa"
        >
          <BaseInput
            v-model="form.accountHolderName"
            class="withdraw-checkout__field"
            :label="$t('Name')"
            variant="checkout"
            autocomplete="name"
            :error="errors.accountHolderName"
            :disabled="isSubmitting"
            @blur="validateField('accountHolderName')"
          />

          <BaseInput
            v-model="form.iban"
            class="withdraw-checkout__field"
            :label="$t('IBAN')"
            variant="checkout"
            autocomplete="off"
            :error="errors.iban"
            :disabled="isSubmitting"
            @blur="validateField('iban')"
          />
        </form>
      </div>

      <aside class="withdraw-checkout__aside">
        <div class="withdraw-checkout__summary">
          <h3 class="withdraw-checkout__summary-title">
            {{ $t('Total to withdraw:') }}
          </h3>

          <div class="withdraw-checkout__totals">
            <div class="withdraw-checkout__total">
              <span class="withdraw-checkout__total-label">
                {{ $t('You get:') }}
              </span>

              <PriceFormatter
                class="withdraw-checkout__total-price"
                :price="withdrawAmountFiat"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
              />
            </div>
          </div>

          <div class="withdraw-checkout__summary-bottom">
            <BaseCheckbox
              v-model="form.acceptTerms"
              class="withdraw-checkout__terms"
              :error="errors.acceptTerms"
              :disabled="isSubmitting"
              terms
            />

            <p
              v-if="submitError"
              class="withdraw-checkout__error _text-error"
              role="alert"
            >
              {{ submitError }}
            </p>

            <div class="withdraw-checkout__methods">
              <template v-if="!isSepaStep">
                <BaseButton
                  v-if="cardEnabled"
                  type="button"
                  variant="primary"
                  class="withdraw-checkout__method"
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
                  class="withdraw-checkout__method"
                  :disabled="isSubmitting"
                  @click="openSepa"
                >
                  {{ $t('SEPA') }}
                </BaseButton>

                <p
                  v-if="!cardEnabled && !sepaEnabled && !settingsStore.loading"
                  class="withdraw-checkout__unavailable"
                >
                  {{ $t('No withdrawal methods available') }}
                </p>
              </template>

              <BaseButton
                v-else
                type="button"
                variant="primary"
                class="withdraw-checkout__method"
                :disabled="isSubmitting"
                :loading="isSubmitting"
                @click="submitSepa"
              >
                {{ $t('Confirm') }}
              </BaseButton>
            </div>
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

const emailPattern = /^\S+@\S+\.\S+$/
const namePattern = /^[\p{L}][\p{L}\p{M}' -]*$/u

const clean = value => String(value ?? '').trim()

const isSepaStep = computed(() => step.value === 'sepa')

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

    return String(value).toLowerCase().trim()
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
    const expanded =
      character >= 'A' && character <= 'Z'
        ? String(character.charCodeAt(0) - 55)
        : character

    for (const digit of expanded) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
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

  if (field === 'phone' && !isValidPhone(value)) {
    errors.phone = t('Invalid phone number')
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
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY)

    return raw ? JSON.parse(raw) : null
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

const initialize = async () => {
  step.value = 'contact'
  withdrawRequestId.value = null
  activeMethod.value = ''

  form.iban = ''
  form.accountHolderName = ''
  form.acceptTerms = false

  clearErrors()
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
  step.value = 'contact'
  clearErrors()
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

    if (!data.redirect_url) {
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

:global(.modal__inner.withdraw-checkout__inner) {
  width: calc(100% - 32px);
  max-width: 1073px;
  border-radius: 6px;
  background-color: var(--bg-third-color);
}

:global(.modal__inner.withdraw-checkout__inner--sepa) {
  max-width: 793px;
}

:global(.withdraw-checkout__inner .modal__content) {
  padding: 34px !important;
  background-color: var(--bg-third-color);
  border-radius: 6px;
}

:global(.withdraw-checkout__inner .modal__close) {
  top: 12px;
  right: 12px;
}

.withdraw-checkout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;

  width: 100%;
  min-width: 0;
  gap: 40px;

  &__main,
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

    border-radius: 5px;

    background-color: transparent;
    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    text-transform: uppercase;

    margin-bottom: 28px;
  }

  &__back-icon {
    width: 12px;
    min-width: 12px;
    height: 12px;

    transform: rotate(90deg);
  }

  &__title {
    margin: 0 0 32px;

    color: var(--primary-color);
    text-transform: uppercase;
  }

  &__form {
    width: 100%;
    min-width: 0;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;

    width: 100%;
    min-width: 0;

    gap: 18px 38px;
  }

  &__field {
    width: 100%;
    min-width: 0;

    :deep(.base-input-wrap),
    :deep(.base-select-wrap) {
      width: 100%;
      min-width: 0;
    }

    :deep(.base-input__label),
    :deep(.base-select__label) {
      display: block;

      margin-bottom: 5px;

      color: var(--hint-third-color);

      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.3;
    }

    :deep(.base-input),
    :deep(.base-select) {
      width: 100%;
      min-width: 0;
      min-height: 44px;

      border: 1px solid var(--border-primary-color);
      border-radius: 5px;

      background-color: var(--bg-third-color);
    }

    :deep(.base-input__control) {
      width: 100%;
      min-width: 0;
      height: 42px;
      min-height: 42px;

      padding: 0 13px;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-select__control) {
      min-height: 42px;
    }

    :deep(.base-select__value),
    :deep(.base-select__placeholder) {
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 400;
    }
  }

  &__aside {
    margin-top: 58px;
  }

  &__summary {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    min-height: 394px;

    padding: 24px;

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-fourth-color);
  }

  &__summary-title {
    margin: 0 0 26px;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 23px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }

  &__totals {
    display: flex;
    flex-direction: column;
    gap: 12px;

    width: 100%;
    min-width: 0;
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 12px;

    width: 100%;
    min-width: 0;
  }

  &__total-label {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
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
      line-height: 1.2;
    }
  }

  &__summary-bottom {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    margin-top: auto;
    padding-top: 42px;
  }

  &__terms {
    width: 100%;
    min-width: 0;

    margin-bottom: 24px;

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
      font-weight: 400;
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

    width: 100%;
    min-width: 0;

    gap: 10px;
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
    line-height: 1.3;
    text-transform: uppercase;
  }

  &__error {
    margin-bottom: 14px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  &__unavailable {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }

  &--sepa {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);
    gap: 68px;

    .withdraw-checkout__aside {
      margin-top: 58px;
    }

    .withdraw-checkout__title {
      margin-bottom: 34px;
    }

    .withdraw-checkout__form--sepa {
      display: flex;
      flex-direction: column;
      gap: 18px;

      width: 100%;
      min-width: 0;
    }

    .withdraw-checkout__summary {
      min-height: 342px;
    }

    .withdraw-checkout__summary-bottom {
      padding-top: 48px;
    }
  }

  @media (max-width: $md3) {
    gap: 22px;

    &__fields {
      column-gap: 14px;
    }

    &--sepa {
      gap: 28px;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;

    &__aside {
      margin-top: 0;
    }

    &__summary {
      min-height: 0;
    }

    &__summary-bottom {
      padding-top: 30px;
    }

    &--sepa {
      grid-template-columns: minmax(0, 1fr);

      .withdraw-checkout__aside {
        margin-top: 0;
      }

      .withdraw-checkout__summary {
        min-height: 0;
      }
    }
  }

  @media (max-width: $md6) {
    &__back {
      min-height: 34px;
      margin-bottom: 20px;
    }

    &__title {
      margin-bottom: 22px;
    }

    &__fields {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 14px;
    }

    &__summary {
      padding: 16px 12px;
    }

    &__summary-title {
      font-size: 20px;
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

@media (max-width: 619.98px) {
  :global(.withdraw-checkout__inner .modal__content) {
    padding: 24px 15px 20px !important;
  }
}

@media (max-width: 479.98px) {
  :global(.withdraw-checkout__inner .modal__content) {
    padding: 25px 12px 18px !important;
  }
}
</style>
