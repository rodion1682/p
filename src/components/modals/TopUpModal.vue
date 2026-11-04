<template>
  <BaseModal
    :show="show"
    wrapper-classes="top-up__inner"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="checkout">
      <div class="checkout__info">
        <BaseButton
          type="button"
          variant="bordered"
          class="checkout__back"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <SvgIcon :icon="ChevronDownIcon" class="checkout__back-icon" />
          <span>{{ $t('Back') }}</span>
        </BaseButton>

        <h2 class="checkout__title _h2">
          {{ $t('Top Up') }}
        </h2>

        <form class="checkout__inputs" novalidate @submit.prevent>
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
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            variant="checkout"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />

          <BaseInput
            v-model="form.email"
            :label="$t('Email')"
            :error="errors.email"
            type="email"
            autocomplete="email"
            variant="checkout"
            class="checkout__input"
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
      </div>

      <div class="checkout__summary summary">
        <div class="summary__heading">
          <h3 class="summary__title _h4">
            {{ $t('Total to pay') }}
          </h3>
        </div>

        <div class="summary__totals">
          <div class="summary__total-row">
            <span class="summary__subtitle">{{ $t('You get:') }}</span>
            <PriceFormatter
              :price="coinsAmount"
              size="size-20"
              class="summary__coin"
              skip-conversion
            />
          </div>

          <div class="summary__total-row">
            <span class="summary__subtitle">{{ $t('Total to pay:') }}</span>
            <PriceFormatter
              :price="fiatAmount"
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

        <div
          v-if="submitError || topupStore.error"
          class="summary__error _text-error"
          role="alert"
        >
          {{ submitError || topupStore.error }}
        </div>

        <div class="summary__methods">
          <div
            v-for="method in availablePaymentMethods"
            :key="method.code"
            class="summary__method"
          >
            <BaseButton
              type="button"
              class="summary__submit"
              :variant="isCard(method.code) ? 'primary' : 'bordered'"
              :loading="isSubmitting && selectedPaymentMethod === method.code"
              :disabled="isSubmitting || !isFormComplete"
              @click="submit(method.code)"
            >
              <span
                v-if="method.image && !isCard(method.code)"
                class="summary__submit-image _ibg-contain"
              >
                <img :src="method.image" :alt="method.title || method.code" />
              </span>
              <span v-else>{{ method.title || method.code }}</span>
            </BaseButton>
          </div>

          <p
            v-if="!availablePaymentMethods.length && !settingsStore.loading"
            class="summary__empty"
          >
            {{ $t('No payment methods available') }}
          </p>
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

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'

const STORAGE_KEY = 'checkout_contact_form'
const CART_STORAGE_KEY = 'cart_checkout_contact_form'

const props = defineProps({
  show: { type: Boolean, default: false },
  selectedAmount: { type: [String, Number], required: true },
  haveToPay: { type: [String, Number], required: true },
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

const clean = value => String(value ?? '').trim()
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u
const emailRe = /^\S+@\S+\.\S+$/

const coinsAmount = computed(() => {
  const value = Number(props.selectedAmount)
  return Number.isFinite(value) ? value : 0
})

const fiatAmount = computed(() => {
  const value = Number(props.haveToPay)
  return Number.isFinite(value) ? value : 0
})

const currencyCode = computed(() => currencyStore.currentCurrencyCode || 'EUR')

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const normalizeCode = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const isCard = code => {
  return ['card', 'creditdebit-card', 'credit_card', 'card-form'].includes(
    normalizeCode(code),
  )
}

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currentCode = currencyCode.value.toUpperCase()

  return methods.filter(method => {
    if (!method?.code || normalizeCode(method.code) === 'balance') return false
    if (!Array.isArray(method.currencies) || !method.currencies.length)
      return true
    return method.currencies.some(
      code => String(code).toUpperCase() === currentCode,
    )
  })
})

const isValidPhone = value => {
  const phone = clean(value)
  const digits = phone.replace(/\D/g, '')
  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

const isFormComplete = computed(() => {
  return Boolean(
    nameRe.test(clean(form.name)) &&
    nameRe.test(clean(form.surname)) &&
    emailRe.test(clean(form.email)) &&
    isValidPhone(form.phone) &&
    form.country !== '' &&
    form.country !== null &&
    form.country !== undefined &&
    clean(form.city) &&
    clean(form.address) &&
    clean(form.postCode) &&
    form.acceptTerms &&
    coinsAmount.value > 0 &&
    fiatAmount.value > 0,
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

  if (field === 'name' || field === 'surname') {
    if (!value) {
      errors[field] = t(
        field === 'name' ? 'First name is required' : 'Last name is required',
      )
    } else if (!nameRe.test(value)) {
      errors[field] = t(field === 'name' ? 'Invalid name' : 'Invalid surname')
    }
    return
  }

  if (field === 'phone') {
    if (!value) errors.phone = t('Phone is required')
    else if (!isValidPhone(value)) errors.phone = t('Invalid phone number')
    return
  }

  if (field === 'email') {
    if (!value) errors.email = t('Email is required')
    else if (!emailRe.test(value)) errors.email = t('Invalid email format')
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

  if (['city', 'address', 'postCode'].includes(field) && !value) {
    const messages = {
      city: 'City is required',
      address: 'Address line is required',
      postCode: 'Post Code is required',
    }
    errors[field] = t(messages[field])
    return
  }

  if (field === 'acceptTerms' && !form.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()
  Object.keys(errors).forEach(validateField)

  if (coinsAmount.value <= 0 || fiatAmount.value <= 0) {
    submitError.value = t('Invalid top up amount')
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

const getStoragePayload = () => ({
  name: form.name,
  surname: form.surname,
  phone: form.phone,
  email: form.email,
  country: form.country,
  city: form.city,
  address: form.address,
  postCode: form.postCode,
})

const saveFormToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStoragePayload()))
  } catch (error) {
    console.error(error)
  }
}

const prefillFromStorage = () => {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) {
      form.acceptTerms = false
      return
    }

    const data = JSON.parse(saved)
    Object.keys(getStoragePayload()).forEach(key => {
      form[key] = data[key] ?? ''
    })
    form.acceptTerms = false
  } catch (error) {
    console.error(error)
    form.acceptTerms = false
  }
}

const submit = async methodCode => {
  if (isSubmitting.value || !validateForm()) return

  selectedPaymentMethod.value = methodCode
  isSubmitting.value = true
  topupStore.clearError()

  try {
    saveFormToStorage()
    topupStore.setAmount(coinsAmount.value)
    topupStore.setPaymentType(methodCode)

    const response = await topupStore.checkout({
      name: clean(form.name),
      surname: clean(form.surname),
      phone: clean(form.phone),
      email: clean(form.email),
      country: form.country,
      city: clean(form.city),
      address: clean(form.address),
      postCode: clean(form.postCode),
      currency: currencyCode.value,
      amount: fiatAmount.value,
      amount_internal: coinsAmount.value,
      paymentType: methodCode,
    })

    const redirectUrl =
      response?.redirect_url || response?.payload?.redirect_url
    if (!redirectUrl) {
      throw new Error(t('Payment provider did not return a redirect URL'))
    }
    window.location.assign(redirectUrl)
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
  if (isSubmitting.value) return
  saveFormToStorage()
  emit('close')
}

const initialize = async () => {
  clearErrors()
  topupStore.clearError()
  selectedPaymentMethod.value = null
  prefillFromStorage()

  const tasks = [ensurePages()]
  if (!settingsStore.settings) tasks.push(settingsStore.fetchSettings())
  if (!countryStore.countries?.length) tasks.push(countryStore.fetchCountries())
  await Promise.allSettled(tasks)
}

watch(
  () => props.show,
  open => {
    if (open) initialize()
  },
)

watch(form, saveFormToStorage, { deep: true })

watch(
  () => form.country,
  () => {
    if (errors.country) validateField('country')
  },
)

watch(
  () => form.acceptTerms,
  accepted => {
    if (accepted) errors.acceptTerms = ''
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

:global(.top-up__inner) {
  width: calc(100% - 32px);
  max-width: 1072px;
  border-radius: 6px;
  background: var(--bg-third-color);
}

:global(.top-up__inner .modal__content) {
  @include adaptiveValue('padding-top', 34, 18);
  @include adaptiveValue('padding-bottom', 34, 18);
  @include adaptiveValue('padding-left', 34, 15);
  @include adaptiveValue('padding-right', 34, 15);
  background: var(--bg-third-color);
  border-radius: 6px;
}

:global(.top-up__inner .modal__close) {
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
  }

  &__input {
    min-width: 0;
  }

  &__summary {
    @include adaptiveValue('margin-top', 56, 0, 1430, 768, 1);
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);

    &__summary {
      margin-top: 0;
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
    @include adaptiveValue('margin-bottom', 54, 30);
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

  &__coin,
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

    &-image {
      width: 130px;
      max-width: 70%;
      height: 26px;
      margin: auto;

      img {
        object-fit: contain;
      }
    }
  }

  &__empty {
    font-family: var(--font-inter);
    font-size: 13px;
    color: var(--hint-third-color);
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkout__back {
    transition: none;
  }
}
</style>
