<template>
  <div class="checkout">
    <h2 class="checkout__title">
      {{ $t('Checkout') }}
    </h2>

    <div class="checkout__fields">
      <div class="checkout__grid">
        <BaseInput
          v-model="localForm.name"
          class="checkout__input"
          :label="$t('Name')"
          name="name"
          autocomplete="given-name"
          :error="errors.name"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="localForm.surname"
          class="checkout__input"
          :label="$t('Surname')"
          name="surname"
          autocomplete="family-name"
          :error="errors.surname"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="localForm.email"
          class="checkout__input"
          :label="$t('E-mail')"
          name="email"
          type="email"
          autocomplete="email"
          :error="errors.email"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="localForm.phone"
          class="checkout__input"
          :label="$t('Phone')"
          name="phone"
          type="tel"
          autocomplete="tel"
          :error="errors.phone"
          :disabled="isSubmitting"
        />
      </div>

      <div class="checkout__trade">
        <BaseInput
          v-model="localForm.tradeLink"
          class="checkout__input"
          :label="$t('Steam Trade URL')"
          name="tradeLink"
          autocomplete="off"
          :error="errors.tradeLink"
          :disabled="isSubmitting"
        />
      </div>

      <div class="checkout__address">
        <div class="checkout__grid">
          <BaseSelect
            v-model="localForm.country"
            class="checkout__input"
            :options="countries"
            option-label="name"
            option-value="value"
            :label="$t('Country')"
            :placeholder="$t('Country')"
            :error="errors.country"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="localForm.city"
            class="checkout__input"
            :label="$t('City')"
            name="city"
            autocomplete="address-level2"
            :error="errors.city"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="localForm.address"
            class="checkout__input"
            :label="$t('Address')"
            name="address"
            autocomplete="street-address"
            :error="errors.address"
            :disabled="isSubmitting"
          />

          <BaseInput
            v-model="localForm.postCode"
            class="checkout__input"
            :label="$t('Postcode')"
            name="postCode"
            autocomplete="postal-code"
            :error="errors.postCode"
            :disabled="isSubmitting"
          />
        </div>
      </div>
    </div>

    <div class="checkout__agreements">
      <BaseCheckbox
        v-model="localForm.acceptDeliveryTerms"
        class="checkout__checkbox"
        :error="errors.acceptDeliveryTerms"
        :disabled="isSubmitting"
      >
        {{
          $t(
            'I expressly request that delivery of the digital content I am ordering begins immediately, and I acknowledge that once delivery begins I lose my right to withdraw from this purchase within 14 days.',
          )
        }}
      </BaseCheckbox>

      <BaseCheckbox
        v-model="localForm.acceptTerms"
        class="checkout__checkbox"
        :error="errors.acceptTerms"
        :disabled="isSubmitting"
        terms
      />

      <div
        v-if="settingsStore.requisites && false"
        class="checkout__requisites"
      >
        {{ settingsStore.requisites }}
      </div>
    </div>

    <div class="checkout__summary">
      <div class="checkout__total">
        <span class="checkout__total-label">
          {{ $t('Total to pay:') }}
        </span>

        <div class="checkout__total-values">
          <PriceFormatter
            class="checkout__total-internal"
            :price="cartTotalInternal"
            skip-conversion
            reverse
            size="size-16"
          />

          <span class="checkout__total-separator">/</span>

          <PriceFormatter
            class="checkout__total-fiat"
            :price="cartTotalFiat"
            :currency-code="cartFiatCurrency"
            skip-conversion
            raw-fiat
            is-currency
            reverse
            size="size-16"
          />
        </div>
      </div>

      <div
        v-if="authStore.isAuthenticated && !hasEnoughBalance"
        class="checkout__balance-warning"
      >
        {{ $t('Not enough balance funds. Please') }}

        <button type="button" @click="goToTopUp">
          {{ $t('top up') }}
        </button>
      </div>
    </div>

    <div v-if="submitError" class="checkout__error _text-error">
      {{ submitError }}
    </div>

    <div class="checkout__payments">
      <div class="checkout__payment">
        <BaseButton
          type="button"
          variant="primary"
          class="checkout__payment-button checkout__payment-button_balance"
          :disabled="isSubmitting || !isFormComplete || !hasEnoughBalance"
          @click="submitPurchase('balance')"
        >
          <span v-if="isSubmitting && selectedPaymentMethod === 'balance'">
            {{ $t('Paying') }}...
          </span>

          <span v-else>
            {{ $t('Pay with Balance') }}
          </span>
        </BaseButton>
      </div>

      <div
        v-for="method in availablePaymentMethods"
        :key="method.code"
        class="checkout__payment"
      >
        <BaseButton
          type="button"
          :variant="methodVariant(method)"
          class="checkout__payment-button"
          :class="{
            'checkout__payment-button_light': isLightMethod(method),
          }"
          :disabled="isSubmitting || !isFormComplete"
          @click="submitPurchase(method.code)"
        >
          <span v-if="isSubmitting && selectedPaymentMethod === method.code">
            {{ $t('Paying') }}...
          </span>

          <span v-else-if="method.displayImage" class="checkout__payment-logo">
            <img
              :src="method.displayImage"
              :alt="method.title || method.code"
            />
          </span>

          <span v-else>
            {{ method.title || method.code }}
          </span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import applePayImage from '@/assets/img/payment-methods/apple.svg'
import cardPayImage from '@/assets/img/payment-methods/card.svg'
import googlePayImage from '@/assets/img/payment-methods/google.svg'

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

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

const emit = defineEmits(['success-close', 'back', 'top-up-click'])

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const { ensurePages } = useStaticPages()

const authStore = useAuthStore()
const cartStore = useCartStore()
const countryStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const purchaseStore = usePurchaseStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { userBalance } = storeToRefs(userStore)

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')

const localForm = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  tradeLink: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptDeliveryTerms: false,
  acceptTerms: false,
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  tradeLink: '',
  country: '',
  city: '',
  address: '',
  postCode: '',
  acceptDeliveryTerms: '',
  acceptTerms: '',
})

const norm = value => String(value ?? '').trim()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nameRegex = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const isValidPhone = value => {
  const phone = norm(value)
  const digits = phone.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(phone)
  )
}

const isValidName = value => nameRegex.test(norm(value))

const isFormComplete = computed(() => {
  return Boolean(
    isValidName(localForm.name) &&
    isValidName(localForm.surname) &&
    emailRegex.test(norm(localForm.email)) &&
    isValidPhone(localForm.phone) &&
    norm(localForm.tradeLink) &&
    localForm.country &&
    norm(localForm.city) &&
    norm(localForm.address) &&
    norm(localForm.postCode) &&
    localForm.acceptDeliveryTerms &&
    localForm.acceptTerms,
  )
})

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const normalizeCode = code => {
  return String(code || '')
    .toLowerCase()
    .trim()
}

const isApplePay = code => {
  return ['apple_pay', 'apple-pay', 'applepay'].includes(normalizeCode(code))
}

const isGooglePay = code => {
  return ['google_pay', 'google-pay', 'googlepay'].includes(normalizeCode(code))
}

const isCardPayment = code => {
  return normalizeCode(code) === 'creditdebit-card'
}

const isLightMethod = method => {
  return isApplePay(method.code) || isGooglePay(method.code)
}

const methodVariant = method => {
  return isLightMethod(method) ? 'white' : 'white-bordered'
}

const getPaymentImage = method => {
  if (method.image) return method.image

  if (isCardPayment(method.code)) return cardPayImage
  if (isApplePay(method.code)) return applePayImage
  if (isGooglePay(method.code)) return googlePayImage

  return ''
}

const paymentPriority = method => {
  if (isCardPayment(method.code)) return 1
  if (isApplePay(method.code)) return 2
  if (isGooglePay(method.code)) return 3
  return 4
}

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currentCurrency = currencyStore.currentCurrencyCode

  return methods
    .filter(method => {
      if (normalizeCode(method.code) === 'balance') {
        return false
      }

      if (!method.currencies?.length) {
        return true
      }

      return method.currencies.includes(currentCurrency)
    })
    .map(method => ({
      ...method,
      displayImage: getPaymentImage(method),
    }))
    .sort((a, b) => paymentPriority(a) - paymentPriority(b))
})

const cartResponse = computed(() => {
  return cartStore.cartData || cartStore.cart || cartStore.cartContent || {}
})

const cartFiatCurrency = computed(() => {
  return (
    cartResponse.value?.fiat_currency ||
    cartResponse.value?.currency ||
    currencyStore.currentCurrencyCode ||
    'EUR'
  )
})

const cartTotalInternal = computed(() => {
  const serverTotal = Number(cartResponse.value?.total_internal)

  if (Number.isFinite(serverTotal)) {
    return Number(serverTotal.toFixed(2))
  }

  const total = (cartStore.items || []).reduce((sum, row) => {
    const amount = Number(row.item?.internal_price ?? 0)
    const count = cartStore.getQty(row.item_id, row.count ?? 1)

    return sum + amount * count
  }, 0)

  return Number(total.toFixed(2))
})

const cartTotalFiat = computed(() => {
  const serverTotal = Number(
    cartResponse.value?.total_fiat ?? cartResponse.value?.total,
  )

  if (Number.isFinite(serverTotal)) {
    return Number(serverTotal.toFixed(2))
  }

  const total = (cartStore.items || []).reduce((sum, row) => {
    const amount = Number(row.item?.fiat_price ?? row.item?.price ?? 0)

    const count = cartStore.getQty(row.item_id, row.count ?? 1)

    return sum + amount * count
  }, 0)

  return Number(total.toFixed(2))
})

const hasEnoughBalance = computed(() => {
  return Number(userBalance.value ?? 0) >= Number(cartTotalInternal.value)
})

const savedFields = ['country', 'city', 'address', 'postCode', 'tradeLink']

const getSavedCheckoutData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveCheckoutData = () => {
  try {
    const data = getSavedCheckoutData()

    savedFields.forEach(field => {
      data[field] = localForm[field]
    })

    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save checkout data:', error)
  }
}

const sanitizeName = value => {
  const result = norm(value)

  if (result.toLowerCase() === 'name' || result.toLowerCase() === 'surname') {
    return ''
  }

  return result
}

const prefillFromUser = user => {
  const saved = getSavedCheckoutData()

  localForm.name = sanitizeName(user?.name || '')
  localForm.surname = sanitizeName(user?.surname || '')
  localForm.email = user?.email || ''
  localForm.phone = user?.phone || ''

  localForm.tradeLink =
    user?.steam_trade_link ||
    user?.tradeLink ||
    user?.trade_url ||
    saved.tradeLink ||
    ''

  localForm.country =
    user?.country?.id ||
    user?.country_id ||
    user?.country ||
    saved.country ||
    ''

  localForm.city = user?.city || saved.city || ''
  localForm.address = user?.address || saved.address || ''

  localForm.postCode = user?.zip || user?.post_code || saved.postCode || ''

  localForm.acceptDeliveryTerms = false
  localForm.acceptTerms = false
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!isValidName(localForm.name)) {
    errors.name = t('Invalid name')
  }

  if (!isValidName(localForm.surname)) {
    errors.surname = t('Invalid surname')
  }

  if (!emailRegex.test(norm(localForm.email))) {
    errors.email = t('Invalid email format')
  }

  if (!isValidPhone(localForm.phone)) {
    errors.phone = t('Invalid phone number')
  }

  if (!norm(localForm.tradeLink)) {
    errors.tradeLink = t('Steam trade link is required')
  }

  if (!localForm.country) {
    errors.country = t('Country is required')
  }

  if (!norm(localForm.city)) {
    errors.city = t('City is required')
  }

  if (!norm(localForm.address)) {
    errors.address = t('Address line is required')
  }

  if (!norm(localForm.postCode)) {
    errors.postCode = t('Post Code is required')
  }

  if (!localForm.acceptDeliveryTerms) {
    errors.acceptDeliveryTerms = t(
      'You must confirm immediate delivery and acknowledge the loss of your 14-day right of withdrawal',
    )
  }

  if (!localForm.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept the required confirmations.',
    )
    return false
  }

  return true
}

const createPurchaseData = methodCode => {
  return {
    steamId: userStore.user?.steamid,
    tradeUrl: norm(localForm.tradeLink),
    name: sanitizeName(localForm.name),
    surname: sanitizeName(localForm.surname),
    email: norm(localForm.email),
    phone: norm(localForm.phone),
    country: localForm.country,
    city: norm(localForm.city),
    address: norm(localForm.address),
    postCode: norm(localForm.postCode),
    paymentMethod: methodCode,
    paymentType: methodCode,
    directPayment: methodCode !== 'balance',
    promocode: promoCodeStore.currentPromo?.code || null,
  }
}

const goToTopUp = () => {
  emit('top-up-click')

  router.push({
    name: 'account-balance',
  })
}

const submitPurchase = async methodCode => {
  if (isSubmitting.value || cartStore.isEmpty) return

  if (!validateForm()) {
    toast.error(submitError.value)
    return
  }

  if (methodCode === 'balance' && !hasEnoughBalance.value) {
    const message = t('Not enough funds')
    submitError.value = message
    toast.error(message)
    return
  }

  isSubmitting.value = true
  selectedPaymentMethod.value = methodCode

  try {
    const response = await purchaseStore.purchaseCartItems(
      createPurchaseData(methodCode),
    )

    if (!response?.success) {
      throw new Error(response?.error || t('An error occurred during checkout'))
    }

    saveCheckoutData()

    if (response.redirect_url) {
      window.location.href = response.redirect_url
      return
    }

    emit('success-close')

    await router.push({
      name: 'SuccessPaymentPage',
    })
  } catch (error) {
    console.error('Checkout error:', error)

    const message =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during checkout')

    submitError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
    selectedPaymentMethod.value = null
  }
}

const initCheckout = async () => {
  await Promise.allSettled([
    ensurePages(),
    settingsStore.fetchSettings(),
    countryStore.fetchCountries(),
    authStore.isAuthenticated ? userStore.fetchProfile() : Promise.resolve(),
  ])

  prefillFromUser(authStore.isAuthenticated ? userStore.user : null)
}

onMounted(initCheckout)

watch(() => savedFields.map(field => localForm[field]), saveCheckoutData)

watch(
  () => userStore.user,
  user => {
    if (authStore.isAuthenticated && user) {
      prefillFromUser(user)
    }
  },
)

watch(
  () => localForm.acceptTerms,
  accepted => {
    if (accepted) errors.acceptTerms = ''
  },
)

watch(
  () => localForm.acceptDeliveryTerms,
  accepted => {
    if (accepted) errors.acceptDeliveryTerms = ''
  },
)

watch(
  () => localForm.country,
  country => {
    if (country) errors.country = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.checkout {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  padding: clamp(20px, 3vw, 35px);

  background-color: #111821;
  border: 1px solid rgba(153, 161, 176, 0.12);
  border-radius: 12px;

  &__title {
    margin: 0 0 26px;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
    text-transform: none;
  }

  &__fields {
    width: 100%;
    min-width: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 15px;
    row-gap: 15px;
  }

  &__input {
    min-width: 0;

    :deep(.base-input__label),
    :deep(.base-select__field-label) {
      margin-bottom: 7px;
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input),
    :deep(.base-select) {
      min-height: 40px;
      border: 1px solid rgba(153, 161, 176, 0.1);
      border-radius: 6px;
      background-color: #222934;
      color: #f4f6fb;

      transition: border-color 0.2s ease;
    }

    :deep(.base-input.is-focused),
    :deep(.base-select.is-open) {
      border-color: #1a73ff;
    }

    :deep(.base-input__control),
    :deep(.base-input input),
    :deep(.base-select__value-text) {
      font-family: var(--font-inter);
      font-size: 12px;
      color: #f4f6fb;
    }

    :deep(.base-input__placeholder) {
      font-size: 12px;
      color: #b9c2d0;
    }

    :deep(.base-select__dropdown) {
      z-index: 20;
      background-color: #222934;
      border: 1px solid rgba(153, 161, 176, 0.2);
      border-radius: 6px;
    }
  }

  &__trade {
    margin-top: 15px;
  }

  &__address {
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid rgba(153, 161, 176, 0.1);
  }

  &__agreements {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 22px;
  }

  &__checkbox {
    color: #99a1b0;

    :deep(.base-checkbox__label) {
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 11px;
      line-height: 1.55;
    }

    :deep(.base-checkbox__box) {
      border-radius: 3px;
    }

    :deep(a) {
      color: #f4f6fb;

      @media (any-hover: hover) {
        &:hover {
          color: #65a7ff;
        }
      }
    }
  }

  &__requisites {
    white-space: pre-line;
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 1.6;
    color: #99a1b0;
  }

  &__summary {
    margin-top: 22px;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
  }

  &__total-label {
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    white-space: nowrap;
  }

  &__total-values {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 5px;
    min-width: 0;
  }

  &__total-internal,
  &__total-fiat {
    color: #ffffff;

    :deep(.price__value) {
      color: #f4f6fb;
      font-family: var(--font-orbitron);
      font-size: 12px;
      font-weight: 700;
    }

    :deep(.price__icon) {
      width: 13px;
      min-width: 13px;
      height: 13px;
    }

    :deep(.price__currency) {
      color: #f4f6fb;
      font-size: 12px;
    }
  }

  &__total-separator {
    color: #99a1b0;
    font-size: 12px;
  }

  &__balance-warning {
    padding: 8px 0;
    color: #f0b84c;
    font-size: 11px;
    line-height: 1.5;

    button {
      padding: 0;
      border: none;
      background: transparent;
      color: #65a7ff;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  &__error {
    margin: 10px 0;
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__payments {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 20px;
  }

  &__payment {
    display: flex;
    min-width: 0;
  }

  &__payment-button {
    width: 100%;
    height: 42px;
    min-height: 42px;
    padding: 7px 12px;
    border: 1px solid #8d99a9;
    border-radius: 6px;
    background-color: transparent;
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;

    :deep(.btn__text) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    &_balance {
      background-color: #1a73ff;
      border-color: #1a73ff;
      color: #ffffff;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          background-color: #005fe8;
          border-color: #005fe8;
        }
      }
    }

    &_light {
      background-color: #f1f2f5;
      border-color: #f1f2f5;
      color: #101722;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          background-color: #dce4f0;
          border-color: #dce4f0;
        }
      }
    }
  }

  &__payment-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 26px;

    img {
      display: block;
      width: auto;
      max-width: 120px;
      height: 100%;
      object-fit: contain;
    }
  }

  @media (max-width: $md5) {
    padding: 20px 15px;

    &__title {
      font-size: 17px;
      margin-bottom: 22px;
    }

    &__grid {
      gap: 12px;
    }

    &__payments {
      gap: 10px;
    }
  }

  @media (max-width: $md7) {
    &__grid {
      grid-template-columns: minmax(0, 1fr);
    }

    &__total {
      align-items: flex-start;
    }

    &__total-values {
      max-width: 65%;
    }

    &__payment-button {
      min-height: 40px;
      height: 40px;
      padding: 6px;
      font-size: 11px;
    }
  }
}
</style>
