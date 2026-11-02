<template>
  <div class="checkout">
    <div class="checkout__top">
      <BaseButton
        variant="bordered"
        class="checkout__back"
        @click="goBackToStepOne"
      >
        <SvgIcon class="checkout__back-icon" :icon="ArrowIcon" />
      </BaseButton>
      <div class="checkout__title _l">
        {{ $t('Checkout') }}
      </div>
    </div>
    <div class="checkout__inner">
      <div class="checkout__block">
        <div class="checkout__subtitle _l">
          <span>{{ $t('Payment information') }}</span>
        </div>
        <div class="checkout__content">
          <div class="checkout__row">
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
          </div>
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
          <div class="checkout__row">
            <BaseInput
              v-model="localForm.city"
              :placeholder="$t('City')"
              :error="errors.city"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('city')"
            />
            <BaseInput
              v-model="localForm.postCode"
              :placeholder="$t('Zip-code')"
              :error="errors.postCode"
              class="checkout__input"
              :disabled="isSubmitting"
              @blur="validateField('postCode')"
            />
          </div>
          <BaseInput
            v-model="localForm.address"
            :placeholder="$t('Address line')"
            :error="errors.address"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />
        </div>
      </div>
      <div class="checkout__block">
        <div class="checkout__subtitle _l">
          <span>{{ $t('Steam trade link') }}</span>
        </div>
        <div class="checkout__content">
          <BaseInput
            v-model="localForm.tradeLink"
            :placeholder="$t('Enter Steam trade link')"
            :error="errors.tradeLink"
            class="checkout__input"
            :disabled="isSubmitting"
            @blur="validateField('tradeLink')"
          />
        </div>
      </div>
      <div class="checkout__block">
        <div class="checkout__subtitle"></div>
        <div class="checkout__content">
          <BaseCheckbox
            v-model="localForm.acceptTerms"
            :error="errors.acceptTerms"
            class="checkout__checkbox"
            :disabled="isSubmitting"
            terms
          />
        </div>
      </div>
      <div class="checkout__block">
        <div class="checkout__subtitle _l">
          <span>{{ $t('Payment Method') }}</span>

          <div class="checkout__summary">
            <div class="checkout__label _l">{{ $t('Total to pay') }}</div>
            <div class="checkout__prices">
              <PriceFormatter
                class="checkout__coin"
                size="size-24"
                :price="cartTotalInternalCurrency"
              />
              <PriceFormatter
                class="checkout__fiat"
                isCurrency
                :price="cartTotal"
              />
            </div>
          </div>
        </div>
        <div class="checkout__content">
          <div v-if="submitError" class="checkout__error _text-error">
            {{ submitError }}
          </div>
          <div v-if="balanceError" class="checkout__error _text-error">
            {{ balanceError }}
          </div>
          <div class="checkout__methods">
            <div
              v-for="(method, index) in availablePaymentMethods"
              :key="method.code"
              class="checkout__method"
            >
              <BaseButton
                type="button"
                :variant="
                  index === availablePaymentMethods.length - 1
                    ? 'primary'
                    : 'white'
                "
                class="checkout__submit"
                :loading="isSubmitting && selectedPaymentMethod === method.code"
                :disabled="isSubmitting || !isFormComplete"
                @click="submit(method.code)"
              >
                <span
                  v-if="method.image"
                  class="checkout__submit-image _ibg-contain"
                >
                  <img :src="method.image" :alt="method.title" />
                </span>
                <span v-else>{{ method.title }}</span>
              </BaseButton>
            </div>
            <div class="checkout__method">
              <BaseButton
                type="button"
                variant="bordered"
                class="checkout__submit"
                :loading="isSubmitting && selectedPaymentMethod === 'balance'"
                :disabled="isSubmitting || !isFormComplete || !hasEnoughBalance"
                @click="submitBalancePayment"
              >
                <template v-if="!hasEnoughBalance">
                  <div class="checkout__submit-text">
                    <span>{{ $t('Balance') }}</span>
                    <span>{{ userBalance }}</span>
                  </div>
                  <SvgIcon class="checkout__submit-icon" :icon="CoinIcon"
                /></template>
                <template v-else>
                  <template
                    v-if="isSubmitting && selectedPaymentMethod === 'balance'"
                  >
                    {{ $t('Paying') }}...
                  </template>
                  <template v-else>
                    {{ $t('Balance') }}
                    <SvgIcon class="checkout__submit-icon" :icon="CoinIcon" />
                  </template>
                </template>
              </BaseButton>
            </div>
            <div class="checkout__method"></div>
            <div class="checkout__method">
              <template v-if="authStore.isAuthenticated && !hasEnoughBalance">
                <div class="checkout__warn">
                  <div class="checkout__warn-image _ibg-contain">
                    <img src="@/assets/img/icons/warn.svg" />
                  </div>
                  <span class="checkout__warn-text">
                    {{ $t('Not enough balance funds. Please') }}
                    <RouterLink
                      class="checkout__warn-link _link"
                      :to="{ name: 'account-balance' }"
                    >
                      {{ $t('top up') }}
                    </RouterLink>
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { ArrowIcon, CoinIcon } from '@/components/icons'
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

const emit = defineEmits(['success-close', 'back'])

const CHECKOUT_STORAGE_KEY = 'checkout_prefill_data'

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

const { userBalance } = storeToRefs(userStore)
const { cartTotal } = storeToRefs(cartStore)

const isSubmitting = ref(false)
const selectedPaymentMethod = ref(null)
const submitError = ref('')
const balanceError = ref('')

const localForm = reactive({
  tradeLink: '',
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
  tradeLink: '',
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

const savedFields = ['country', 'city', 'address', 'postCode', 'tradeLink']

const getSavedCheckoutData = () => {
  try {
    return JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveCheckoutData = () => {
  const data = getSavedCheckoutData()

  savedFields.forEach(field => {
    data[field] = localForm[field]
  })

  localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data))
}

const getProfileValue = (user, field) => {
  if (!user) return ''

  const map = {
    tradeLink: user.steam_trade_link,
    country: user.country || user.country_id,
    city: user.city,
    address: user.address,
    postCode: user.zip || user.post_code,
  }

  return map[field] ?? ''
}

const getUserOrSavedValue = (user, field) => {
  const profileValue = getProfileValue(user, field)
  if (norm(profileValue)) return profileValue

  const savedData = getSavedCheckoutData()
  return savedData[field] ?? ''
}

const isPlaceholderValue = (value, key) => {
  const v = norm(value).toLowerCase()
  const ph = norm(t(key)).toLowerCase()
  return !!v && v === ph
}

const isLegacyPlaceholder = (value, type) => {
  const v = norm(value).toLowerCase()

  if (type === 'name') return v === 'name'
  if (type === 'surname') return v === 'surname'

  return false
}

const sanitizeName = value =>
  isPlaceholderValue(value, 'Name') || isLegacyPlaceholder(value, 'name')
    ? ''
    : norm(value)

const sanitizeSurname = value =>
  isPlaceholderValue(value, 'Surname') || isLegacyPlaceholder(value, 'surname')
    ? ''
    : norm(value)

const goBackToStepOne = () => {
  emit('back')
}

const isValidPhone = phone => {
  const p = norm(phone)
  const digits = p.replace(/\D/g, '')

  if (digits.length < 7 || digits.length > 15) return false
  if (!/^[+0-9()\-\s]+$/.test(p)) return false

  return true
}

const normCode = code =>
  String(code || '')
    .toLowerCase()
    .trim()

const isBalance = code => normCode(code) === 'balance'

const isApplePay = code => {
  const c = normCode(code)
  return ['apple_pay', 'apple-pay', 'applepay'].includes(c)
}

const isGooglePay = code => {
  const c = normCode(code)
  return ['google_pay', 'google-pay', 'googlepay'].includes(c)
}

const getDisplayImage = method => {
  if (isApplePay(method.code)) return method.image
  if (isGooglePay(method.code)) return method.image
  return method.image || null
}

const countries = computed(() =>
  (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  })),
)

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currentCurrency = currencyStore.currentCurrencyCode

  const filtered = methods.filter(method => {
    if (!method.currencies || method.currencies.length === 0) return true
    return method.currencies.includes(currentCurrency)
  })

  const code = method => String(method?.code || '').toLowerCase()

  const card = filtered.filter(method => code(method) === 'creditdebit-card')
  const google = filtered.filter(method =>
    ['google-pay', 'google_pay'].includes(code(method)),
  )
  const apple = filtered.filter(method =>
    ['apple-pay', 'apple_pay'].includes(code(method)),
  )
  const rest = filtered.filter(
    method =>
      ![
        'balance',
        'creditdebit-card',
        'google-pay',
        'google_pay',
        'apple-pay',
        'apple_pay',
      ].includes(code(method)),
  )

  return [...card, ...google, ...apple, ...rest]
    .filter(method => !isBalance(method.code))
    .map(method => ({
      ...method,
      image: getDisplayImage(method),
    }))
})

const cartTotalInternalCurrency = computed(() => {
  if (!currencyStore.isInternalCurrencyEnabled) {
    return Number(cartStore.totalAmount || cartStore.cartTotal || 0)
  }

  const total =
    Number(cartStore.totalAmountInternal || cartStore.cartTotalInternal || 0) ||
    (cartStore.items || []).reduce((sum, row) => {
      return sum + Number(row.item?.price_internal ?? row.price_internal ?? 0)
    }, 0)

  if (promoCodeStore.hasActivePromo) {
    const discountAmount = Number(promoCodeStore.discount?.amount ?? 0)
    return Math.max(0, total - discountAmount)
  }

  return total
})

const hasEnoughBalance = computed(() => {
  const total = Number(cartTotalInternalCurrency.value ?? 0)
  return userBalance.value >= total
})

const prefillFromUser = user => {
  const savedData = getSavedCheckoutData()

  localForm.name = sanitizeName(user?.name || '')
  localForm.surname = sanitizeSurname(user?.surname || '')
  localForm.email = user?.email || ''
  localForm.phone = user?.phone || ''

  localForm.tradeLink = getUserOrSavedValue(user, 'tradeLink')
  localForm.country = getUserOrSavedValue(user, 'country')
  localForm.city = getUserOrSavedValue(user, 'city')
  localForm.address = getUserOrSavedValue(user, 'address')
  localForm.postCode = getUserOrSavedValue(user, 'postCode')

  if (!user) {
    localForm.tradeLink = savedData.tradeLink || ''
    localForm.country = savedData.country || ''
    localForm.city = savedData.city || ''
    localForm.address = savedData.address || ''
    localForm.postCode = savedData.postCode || ''
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
  balanceError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'tradeLink') {
    if (!norm(localForm.tradeLink))
      errors.tradeLink = t('Steam trade link is required')
    return
  }

  if (field === 'name') {
    if (!norm(localForm.name)) {
      errors.name = t('First name is required')
      return
    }

    if (!nameRe.test(norm(localForm.name))) errors.name = t('Invalid name')
    return
  }

  if (field === 'surname') {
    if (!norm(localForm.surname)) {
      errors.surname = t('Last name is required')
      return
    }

    if (!nameRe.test(norm(localForm.surname)))
      errors.surname = t('Invalid surname')
    return
  }

  if (field === 'email') {
    if (!localForm.email) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(localForm.email)) errors.email = t('Invalid email format')
    return
  }

  if (field === 'phone') {
    if (!localForm.phone) {
      errors.phone = t('Phone is required')
      return
    }

    if (!isValidPhone(localForm.phone)) errors.phone = t('Invalid phone number')
    return
  }

  if (field === 'country' && !localForm.country)
    errors.country = t('Country is required')
  if (field === 'city' && !localForm.city) errors.city = t('City is required')
  if (field === 'address' && !localForm.address)
    errors.address = t('Address line is required')
  if (field === 'postCode' && !localForm.postCode)
    errors.postCode = t('Post Code is required')
  if (field === 'acceptTerms' && !localForm.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('tradeLink')
  validateField('name')
  validateField('surname')
  validateField('email')
  validateField('phone')
  validateField('country')
  validateField('city')
  validateField('address')
  validateField('postCode')
  validateField('acceptTerms')

  const hasErrors = Object.values(errors).some(Boolean)

  if (hasErrors) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )
    return false
  }

  return true
}

const isFormComplete = computed(() => {
  return (
    norm(localForm.tradeLink) &&
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

const syncServerCartQty = async () => {
  const rows = cartStore.items || []

  for (const row of rows) {
    const itemId = row.item_id
    const qty = cartStore.getQty
      ? cartStore.getQty(itemId, row.count ?? 1)
      : Number(row.count ?? 1)

    const res = await cartStore.updateQuantity(itemId, qty)

    if (!res?.success) {
      await cartStore.fetchCartContent()
      throw new Error(res?.error || 'Failed to sync cart quantities')
    }
  }
}

const createPurchaseData = methodCode => ({
  steamId: userStore.user?.steamid,
  tradeUrl: norm(localForm.tradeLink),
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
})

const handleSuccessfulPayment = response => {
  saveCheckoutData()

  if (response.redirect_url) {
    window.location.href = response.redirect_url
    return
  }

  emit('success-close')
  router.push({ name: 'SuccessPaymentPage' })
}

const submitBalancePayment = async () => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  if (!hasEnoughBalance.value) {
    const errorMsg = t('Not enough funds')
    balanceError.value = errorMsg
    toast.error(errorMsg)
    return
  }

  try {
    isSubmitting.value = true
    selectedPaymentMethod.value = 'balance'
    clearErrors()

    await syncServerCartQty()

    const response = await purchaseStore.purchaseCartItems(
      createPurchaseData('balance'),
    )

    if (response.success) {
      handleSuccessfulPayment(response)
      return
    }

    const errorMsg = response.error || t('An error occurred during checkout')
    balanceError.value = errorMsg
    toast.error(errorMsg)
  } catch (error) {
    console.error('Balance checkout error:', error)

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      t('An error occurred during checkout')

    balanceError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

const submit = async methodCode => {
  if (isSubmitting.value) return
  if (!validateForm()) return

  selectedPaymentMethod.value = methodCode

  if (isBalance(methodCode) && !hasEnoughBalance.value) {
    const msg = t('Not enough funds')
    submitError.value = msg
    toast.error(msg)
    return
  }

  try {
    isSubmitting.value = true
    clearErrors()

    await syncServerCartQty()

    const response = await purchaseStore.purchaseCartItems(
      createPurchaseData(methodCode),
    )

    if (response.success) {
      handleSuccessfulPayment(response)
      return
    }

    const errorMsg = response.error || t('An error occurred during checkout')
    submitError.value = errorMsg
    toast.error(errorMsg)
  } catch (error) {
    console.error('Checkout error:', error)

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      t('An error occurred during checkout')

    submitError.value = errorMsg
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

const initCheckout = async () => {
  await Promise.all([
    ensurePages(),
    settingsStore.fetchSettings(),
    countryStore.fetchCountries(),
    authStore.isAuthenticated ? userStore.fetchProfile?.() : Promise.resolve(),
  ])

  prefillFromUser(authStore.isAuthenticated ? userStore.user : null)

  clearErrors()
  selectedPaymentMethod.value = null
}

onMounted(async () => {
  await initCheckout()
})

watch(
  () => localForm.country,
  () => validateField('country'),
)

watch(() => savedFields.map(field => localForm[field]), saveCheckoutData)

watch(
  () => userStore.user,
  user => {
    if (!authStore.isAuthenticated) return
    prefillFromUser(user)
  },
  { deep: true },
)
</script>
<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.checkout {
  @include adaptiveValue('padding-bottom', 140, 35);
  &__top {
    display: flex;
    @include adaptiveValue('gap', 32, 20);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 45, 20);
    }
  }
  &__back {
    border-radius: 50%;
    min-width: 40px;
    max-width: 40px;
    height: 40px;
    &-icon {
      min-width: 19px;
      height: 19px;
      transform: rotate(-180deg);
    }
  }

  &__title {
    align-self: center;
  }

  &__inner {
    max-width: 1006px;
    margin: 0 auto;
    overflow: hidden;
    @include adaptiveValue('border-radius', 12, 10);
    position: relative;
    @include adaptiveValue('padding-top', 43, 15);
    @include adaptiveValue('padding-bottom', 43, 15);
    @include adaptiveValue('padding-left', 48, 10, 1280, 768, 1);
    @include adaptiveValue('padding-right', 48, 10, 1280, 768, 1);
    &::after {
      content: '';
      position: absolute;
      inset: 1px;
      z-index: -1;
      border-radius: inherit;
      backdrop-filter: blur(26.8px);
      -webkit-backdrop-filter: blur(26.8px);
      opacity: 0.6;
      background: linear-gradient(180deg, #2a2a2a 0%, #131313 100%);
    }
    @media (max-width: $md3) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__block {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 43, 25);
    }
    @media (min-width: $md6) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1820, 768, 1);
    }
  }

  &__subtitle {
    flex: 0 1 52%;
    span {
      font-weight: 700;
      text-align: right;
      display: block;
      font-size: 14px;
      line-height: 19px;
      @include adaptiveValue('padding-bottom', 23, 15);
    }
    @media (min-width: $md6) {
      border-bottom: 1px solid var(--bg-secondary-color);
    }
    @media (max-width: $md4) {
      flex: 0 1 40%;
      min-width: 180px;
    }
    @media (max-width: $md6) {
      span {
        padding-bottom: 10px;
        text-align: left;
      }
    }
  }

  &__content {
    flex: 0 1 48%;
    margin-left: auto;
    @media (max-width: $md4) {
      flex: 0 1 60%;
    }
  }

  &__row {
    @media (min-width: $md4) or (max-width: $md6) {
      display: flex;
      @include adaptiveValue('gap', 14, 10);
    }
    @media (max-width: $md4) and (min-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }

  &__input {
    :deep(.base-select),
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);
      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__checkbox {
  }

  &__summary {
    @media (min-width: $md6) {
      @include adaptiveValue('margin-top', 72, 15);
    }
    @media (min-width: $md3) or (max-width: $md6) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    @media (max-width: $md6) {
      margin: 5px 0px 10px;
    }
  }
  &__label {
    line-height: 130%;
    height: fit-content;
    @media (max-width: $md3) and (min-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    @media (max-width: $md6) {
      align-self: flex-start;
    }
  }

  &__prices {
    display: flex;
    column-gap: 12px;
    @media (max-width: $md4) {
      flex-wrap: wrap;
    }
    @media (max-width: $md6) {
      flex-direction: column;
    }
  }

  &__coin {
  }

  &__fiat {
    :deep(.price__currency),
    :deep(.price__value) {
      color: var(--secondary-color) !important;
    }
    @media (max-width: $md6) {
      justify-content: flex-end;
    }
  }

  &__error {
  }

  &__methods {
    @media (min-width: $md3) or ((max-width: $md6) and (min-width: $md7)) {
      display: flex;
      flex-wrap: wrap;
      @include adaptiveValue('margin-left', -10, -2, 1280, 768, 1);
      @include adaptiveValue('margin-right', -10, -2, 1280, 768, 1);
      @include adaptiveValue('row-gap', 18, 4, 1280, 768, 1);
    }
  }

  &__method {
    @media (min-width: $md3) or ((max-width: $md6) and (min-width: $md7)) {
      flex: 0 1 50%;
      width: 100%;
      @include adaptiveValue('padding-left', 10, 2, 1280, 768, 1);
      @include adaptiveValue('padding-right', 10, 2, 1280, 768, 1);
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
  }

  &__submit {
    position: relative;
    z-index: 1;
    width: 100%;
    @include adaptiveValue('min-height', 46, 45);
    &-image {
      width: fit-content;
      min-width: 55px;
      height: 22px;
    }
    &-icon {
      min-width: 18px;
      height: 18px;
    }
    &-text {
      display: flex;
      flex-wrap: wrap;
      column-gap: 4px;
    }
  }

  &__warn {
    display: flex;
    gap: 9px;
    @include adaptiveValue('margin-top', 0, 11, 1280, 768, 1);
    &-image {
      min-width: 16px;
      height: 16px;
    }
    &-text {
      display: block;

      min-width: 0;

      overflow-wrap: anywhere;
      word-break: break-word;
      font-size: 12px;
      line-height: 135%;
      color: var(--secondary-color);
    }
    &-link {
      display: inline;
      color: var(--link-color);
    }
  }
}
</style>
