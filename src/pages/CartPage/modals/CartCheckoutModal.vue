<template>
  <BaseModal
    :show="show"
    @close="handleClose"
    :wrapperClasses="['checkout__inner']"
  >
    <div class="checkout">
      <div class="checkout__info">
        <button @click="handleClose" class="checkout__back">
          <SvgIcon :icon="ChevronDownIcon" class="checkout__back-icon" />
          <span>{{ $t('Back') }}</span>
        </button>
        <div class="checkout__title _h3">
          {{ $t('Payment details') }}
        </div>
        <div class="checkout__inputs">
          <BaseInput
            v-model="localForm.name"
            :placeholder="$t('Name')"
            :error="errors.name"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />
          <BaseInput
            v-model="localForm.surname"
            :placeholder="$t('Surname')"
            :error="errors.surname"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />
          <BaseInput
            v-model="localForm.email"
            :placeholder="$t('Email')"
            type="email"
            :error="errors.email"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('email')"
          />
          <BaseInput
            v-model="localForm.phone"
            :placeholder="$t('Phone')"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            :error="errors.phone"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('phone')"
          />
          <BaseSelect
            v-model="localForm.country"
            :options="countries"
            option-label="name"
            option-value="value"
            :placeholder="$t('Country')"
            :error="errors.country"
            class="checkout__input"
            :disabled="isSubmitting"
          />
          <BaseInput
            v-model="localForm.city"
            :placeholder="$t('City')"
            :error="errors.city"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />
          <BaseInput
            v-model="localForm.address"
            :placeholder="$t('Address line')"
            :error="errors.address"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />
          <BaseInput
            v-model="localForm.postCode"
            :placeholder="$t('Zip code')"
            :error="errors.postCode"
            class="checkout__input checkout__input_post"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>
        <BaseCheckbox
          v-model="localForm.acceptTerms"
          :error="errors.acceptTerms"
          class="checkout__checkbox"
          :disabled="isSubmitting"
          terms
        />
      </div>
      <div class="checkout__summary summary">
        <div class="summary__top">
          <div class="summary__title _h5">{{ $t('Checkout') }}</div>
          <div class="summary__subtitle">{{ $t('Total to pay:') }}</div>
          <PriceFormatter
            size="size-32"
            class="summary__coin"
            :price="totalCoins"
          />
          <PriceFormatter
            class="summary__fiat"
            is-currency
            size="size-12"
            :price="totalFiat"
          />
          <div class="summary__conversion">
            <PriceFormatter
              :price="oneCoinFiatValue"
              :currency-code="currencyStore.currentCurrencyCode"
              size="size-12"
              reverse
            />
            <span>=</span>
            <PriceFormatter
              :price="1"
              :currency-code="currencyStore.currentCurrencyCode"
              is-currency
              raw-fiat
              reverse
              skip-conversion
              size="size-12"
            />
          </div>
        </div>

        <div v-if="submitError" class="summary__error _text-error">
          {{ submitError }}
        </div>
        <div class="summary__methods">
          <div class="summary__method">
            <BaseButton
              type="button"
              class="summary__submit"
              :loading="isSubmitting && selectedPaymentMethod === 'balance'"
              variant="bordered"
              :disabled="isSubmitting || !isFormComplete || !hasEnoughBalance"
              @click="submit('balance')"
            >
              {{ $t('Pay by balance') }}
            </BaseButton>

            <div
              v-if="!hasEnoughBalance"
              class="summary__submit-warn _text-error"
            >
              {{ $t('Not enough balance for purchase!') }}
            </div>
          </div>
          <div
            v-for="method in availablePaymentMethods"
            :key="method.code"
            class="summary__method"
          >
            <BaseButton
              type="button"
              :variant="isCard(method.code) ? 'bordered' : 'white'"
              class="summary__submit"
              :loading="isSubmitting && selectedPaymentMethod === method.code"
              :disabled="isSubmitting || !isFormComplete"
              @click="submit(method.code)"
            >
              <span
                v-if="method.image"
                class="summary__submit-image _ibg-contain"
              >
                <img :src="method.image" :alt="method.title" />
              </span>

              <span v-else>{{ method.title }}</span>
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
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const STORAGE_KEY = 'cart_checkout_contact_form'

const props = defineProps({
  show: { type: Boolean, default: false },
  totalCoins: { type: [Number, String], default: 0 },
  totalFiat: { type: [Number, String], default: 0 },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const { ensurePages } = useStaticPages()

const authStore = useAuthStore()
const cartStore = useCartStore()
const countryStore = useCountriesStore()
const purchaseStore = usePurchaseStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const userStore = useUserStore()

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')

const localForm = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptTerms: false,
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
  acceptTerms: '',
})

const norm = value => String(value ?? '').trim()
const emailRe = /^\S+@\S+\.\S+$/
const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const selectedCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const creditsConversionRate = computed(() => {
  return Number(settingsStore.creditsConversionRate || 0)
})

const oneCoinFiatValue = computed(() => {
  return selectedCurrencyRate.value * creditsConversionRate.value
})

const userBalance = computed(
  () =>
    Number(
      currencyStore.isInternalCurrencyEnabled
        ? userStore.user?.balance_internal
        : userStore.user?.balance,
    ) || 0,
)

const hasEnoughBalance = computed(() => {
  return userBalance.value >= Number(props.totalCoins || 0)
})

const countries = computed(() =>
  (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  })),
)

const normCode = code =>
  String(code || '')
    .toLowerCase()
    .trim()

const isCard = code =>
  ['card', 'creditdebit-card', 'credit_card'].includes(normCode(code))

const isBalance = code => normCode(code) === 'balance'

const isApplePay = code =>
  ['apple_pay', 'apple-pay', 'applepay'].includes(normCode(code))

const isGooglePay = code =>
  ['google_pay', 'google-pay', 'googlepay'].includes(normCode(code))

const getDisplayImage = method => {
  if (isApplePay(method.code)) return method.image
  if (isGooglePay(method.code)) return method.image
  return method.image || null
}

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currentCurrency = currencyStore.currentCurrencyCode

  return methods
    .filter(method => {
      if (!method.currencies || method.currencies.length === 0) return true
      return method.currencies.includes(currentCurrency)
    })
    .filter(method => !isBalance(method.code))
    .map(method => ({
      ...method,
      image: getDisplayImage(method),
    }))
})

const getStoragePayload = () => ({
  name: localForm.name,
  surname: localForm.surname,
  email: localForm.email,
  phone: localForm.phone,
  country: localForm.country,
  city: localForm.city,
  address: localForm.address,
  postCode: localForm.postCode,
})

const saveFormToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getStoragePayload()))
}

const prefillFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    localForm.acceptTerms = false
    return
  }

  try {
    const data = JSON.parse(saved)

    localForm.name = data.name || ''
    localForm.surname = data.surname || ''
    localForm.email = data.email || ''
    localForm.phone = data.phone || ''
    localForm.country = data.country || ''
    localForm.city = data.city || ''
    localForm.address = data.address || ''
    localForm.postCode = data.postCode || ''
    localForm.acceptTerms = false
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    localForm.acceptTerms = false
  }
}

const sanitizeName = value => norm(value)
const sanitizeSurname = value => norm(value)

const isValidPhone = phone => {
  const value = norm(phone)
  const digits = value.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) return false
  if (!/^[+0-9()\-\s]+$/.test(value)) return false

  return true
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    if (!norm(localForm.name)) {
      errors.name = t('First name is required')
      return
    }

    if (!nameRe.test(norm(localForm.name))) {
      errors.name = t('Invalid name')
    }

    return
  }

  if (field === 'surname') {
    if (!norm(localForm.surname)) {
      errors.surname = t('Last name is required')
      return
    }

    if (!nameRe.test(norm(localForm.surname))) {
      errors.surname = t('Invalid surname')
    }

    return
  }

  if (field === 'email') {
    if (!localForm.email) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(localForm.email)) {
      errors.email = t('Invalid email format')
    }

    return
  }

  if (field === 'phone') {
    if (!localForm.phone) {
      errors.phone = t('Phone is required')
      return
    }

    if (!isValidPhone(localForm.phone)) {
      errors.phone = t('Invalid phone number')
    }

    return
  }

  if (field === 'country' && !localForm.country) {
    errors.country = t('Country is required')
  }

  if (field === 'city' && !localForm.city) {
    errors.city = t('City is required')
  }

  if (field === 'address' && !localForm.address) {
    errors.address = t('Address line is required')
  }

  if (field === 'postCode' && !localForm.postCode) {
    errors.postCode = t('Post Code is required')
  }

  if (field === 'acceptTerms' && !localForm.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()

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

const isFormComplete = computed(() => {
  return (
    norm(localForm.name) &&
    norm(localForm.surname) &&
    localForm.email &&
    emailRe.test(localForm.email) &&
    isValidPhone(localForm.phone) &&
    localForm.country &&
    localForm.city &&
    localForm.address &&
    localForm.postCode &&
    localForm.acceptTerms
  )
})

const submit = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  selectedPaymentMethod.value = methodCode

  if (isBalance(methodCode) && !hasEnoughBalance.value) {
    const message = t('Not enough funds')
    submitError.value = message
    toast.error(message)
    return
  }

  try {
    isSubmitting.value = true
    clearErrors()
    saveFormToStorage()

    const purchaseData = {
      name: sanitizeName(localForm.name),
      surname: sanitizeSurname(localForm.surname),
      email: localForm.email,
      phone: localForm.phone,
      country: localForm.country,
      city: localForm.city,
      address: localForm.address,
      postCode: localForm.postCode,
      paymentMethod: methodCode,
      paymentType: methodCode,
      directPayment: !isBalance(methodCode),
      promocode: promoCodeStore.currentPromo?.code || null,
    }

    const response = await purchaseStore.purchaseCartItems(purchaseData)

    if (response.success) {
      if (response.redirect_url) {
        window.location.href = response.redirect_url
        return
      }

      emit('close')
      router.push({ name: 'SuccessPaymentPage' })
      return
    }

    const errorMessage =
      response.error || t('An error occurred during checkout')
    submitError.value = errorMessage
    toast.error(errorMessage)
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      t('An error occurred during checkout')

    submitError.value = errorMessage
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (isSubmitting.value) return

  saveFormToStorage()
  emit('close')
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) return

    await Promise.all([
      ensurePages(),
      settingsStore.fetchSettings(),
      countryStore.fetchCountries(),
      cartStore.fetchCartContent(),
    ])

    prefillFromStorage()
    clearErrors()
    selectedPaymentMethod.value = null
  },
)

watch(
  () => ({ ...localForm }),
  () => {
    saveFormToStorage()
  },
  { deep: true },
)

watch(
  () => localForm.country,
  () => validateField('country'),
)

onMounted(async () => {
  if (!settingsStore.settings) await settingsStore.fetchSettings()
  if (!countryStore.countries?.length) await countryStore.fetchCountries()

  prefillFromStorage()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.checkout {
  @media (min-width: $md4) {
    display: flex;
    @include adaptiveValue('gap', 32, 20, 1400, 992, 1);
  }
  &__info {
    flex: 0 1 60%;
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }
  &__summary {
    flex: 0 1 40%;
    @media (max-width: $md4) {
      max-width: 400px;
      margin: 0 auto;
    }
  }

  &__back {
    background-color: transparent;
    @include adaptiveValue('font-size', 20, 18);
    line-height: 100%;
    font-weight: 700;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 20, 15);
    color: var(--seconday-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
    transition: color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
    &-icon {
      min-width: 13px;
      height: 13px;
      transform: rotate(90deg);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
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
    flex: 0 1 calc(50% - 6px);
    @media (max-width: $md7) {
      flex: 1 1 100%;
    }
    &_post {
    }
  }

  &__checkbox {
  }
}

.summary {
  display: block !important;
  &__top {
    @include adaptiveValue('border-radius', 10, 6);
    background-color: var(--bg-primary-color);
    @include adaptiveValue('padding', 32, 10);
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__subtitle {
    color: var(--seconday-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__coin {
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 15);
    }
  }

  &__fiat {
    color: var(--seconday-color);
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 20);
    }
  }

  &__conversion {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    line-height: 12px;
    font-weight: 700;
    color: var(--primary-color) !important;
  }

  &__error {
    margin-bottom: 8px;
  }

  &__methods {
  }

  &__method {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }
  }

  &__submit {
    position: relative;
    text-transform: uppercase;
    font-size: 14px;
    font-family: var(--font-condensed);
    @include adaptiveValue('min-height', 44, 40);
    &-warn {
      text-align: center;
      @include adaptiveValue('margin-top', 12, 8);
    }
    &-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 65%;
      height: 90%;
    }
  }
}
</style>
