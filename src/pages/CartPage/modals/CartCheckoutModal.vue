<template>
  <BaseModal
    :show="show"
    wrapper-classes="checkout__inner"
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

          <span>{{ $t('Back to cart') }}</span>
        </BaseButton>

        <h2 class="checkout__title _h2">
          {{ $t('Payment details') }}
        </h2>

        <div class="checkout__inputs">
          <BaseInput
            v-model="localForm.name"
            :label="$t('Name')"
            :error="errors.name"
            variant="checkout"
            class="checkout__input"
            autocomplete="given-name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="localForm.surname"
            :label="$t('Surname')"
            :error="errors.surname"
            variant="checkout"
            class="checkout__input"
            autocomplete="family-name"
            :disabled="isSubmitting"
            @blur="validateField('surname')"
          />

          <BaseInput
            v-model="localForm.phone"
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
            v-model="localForm.email"
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
            v-model="localForm.country"
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
            v-model="localForm.city"
            :label="$t('City')"
            :error="errors.city"
            variant="checkout"
            class="checkout__input"
            autocomplete="address-level2"
            :disabled="isSubmitting"
            @blur="validateField('city')"
          />

          <BaseInput
            v-model="localForm.address"
            :label="$t('Address line')"
            :error="errors.address"
            variant="checkout"
            class="checkout__input"
            autocomplete="street-address"
            :disabled="isSubmitting"
            @blur="validateField('address')"
          />

          <BaseInput
            v-model="localForm.postCode"
            :label="$t('Zip code')"
            :error="errors.postCode"
            variant="checkout"
            class="checkout__input"
            autocomplete="postal-code"
            :disabled="isSubmitting"
            @blur="validateField('postCode')"
          />
        </div>
      </div>

      <div class="checkout__summary summary">
        <div class="summary__heading">
          <h3 class="summary__title _h4">
            {{ $t('Checkout') }}
          </h3>

          <span class="summary__count">
            ({{ cartStore.cartItemsCount }} {{ $t('items') }})
          </span>
        </div>

        <div class="summary__total">
          <div class="summary__subtitle">
            {{ $t('Total to pay:') }}
          </div>

          <PriceFormatter
            :price="totalCoins"
            size="size-20"
            class="summary__coin"
          />

          <PriceFormatter
            :price="totalFiat"
            size="size-14"
            is-currency
            class="summary__fiat"
          />
        </div>

        <BaseCheckbox
          v-model="localForm.acceptTerms"
          :error="errors.acceptTerms"
          :disabled="isSubmitting"
          class="summary__terms"
          terms
        />

        <div v-if="submitError" class="summary__error _text-error" role="alert">
          {{ submitError }}
        </div>

        <div class="summary__methods">
          <div class="summary__method">
            <BaseButton
              type="button"
              variant="primary"
              class="summary__submit"
              :loading="isSubmitting && selectedPaymentMethod === 'balance'"
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
              class="summary__submit"
              :variant="isCard(method.code) ? 'primary' : 'bordered'"
              :loading="isSubmitting && selectedPaymentMethod === method.code"
              :disabled="isSubmitting || !isFormComplete"
              @click="submit(method.code)"
            >
              <span
                v-if="method.image"
                class="summary__submit-image _ibg-contain"
              >
                <img :src="method.image" :alt="method.title || method.code" />
              </span>

              <span v-else>
                {{ method.title || method.code }}
              </span>
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

import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const STORAGE_KEY = 'checkout_contact_form'
const LEGACY_STORAGE_KEY = 'cart_checkout_contact_form'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },

  totalCoins: {
    type: [Number, String],
    default: 0,
  },

  totalFiat: {
    type: [Number, String],
    default: 0,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const { ensurePages } = useStaticPages()

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
const hasHydratedContact = ref(false)

const localForm = reactive({
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

const norm = value => {
  return String(value ?? '').trim()
}

const emailRe = /^\S+@\S+\.\S+$/

const nameRe = /^[\p{L}][\p{L}\p{M}' -]{1,}$/u

const contactFields = [
  'name',
  'surname',
  'phone',
  'email',
  'country',
  'city',
  'address',
  'postCode',
]

const userBalance = computed(() => {
  return (
    Number(
      currencyStore.isInternalCurrencyEnabled
        ? userStore.user?.balance_internal
        : userStore.user?.balance,
    ) || 0
  )
})

const hasEnoughBalance = computed(() => {
  return userBalance.value >= Number(props.totalCoins || 0)
})

const countries = computed(() => {
  return (countryStore.countries || []).map(country => ({
    name: country.title,
    value: country.id,
  }))
})

const normCode = code => {
  return String(code || '')
    .toLowerCase()
    .trim()
}

const isCard = code => {
  return ['card', 'creditdebit-card', 'credit_card'].includes(normCode(code))
}

const isBalance = code => {
  return normCode(code) === 'balance'
}

const availablePaymentMethods = computed(() => {
  const methods = settingsStore.paymentMethods || []
  const currency = String(currencyStore.currentCurrencyCode || '').toUpperCase()

  return methods.filter(method => {
    if (!method?.code || isBalance(method.code)) {
      return false
    }

    if (!Array.isArray(method.currencies) || !method.currencies.length) {
      return true
    }

    return method.currencies.some(code => {
      return String(code).toUpperCase() === currency
    })
  })
})

const getStoragePayload = () => ({
  name: localForm.name,
  surname: localForm.surname,
  phone: localForm.phone,
  email: localForm.email,
  country: localForm.country,
  city: localForm.city,
  address: localForm.address,
  postCode: localForm.postCode,
})

const saveFormToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStoragePayload()))
  } catch (error) {
    console.warn('Could not save checkout form', error)
  }
}

const prefillFromStorage = () => {
  hasHydratedContact.value = false

  try {
    const sharedSaved = localStorage.getItem(STORAGE_KEY)
    const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY)

    const saved = sharedSaved || legacySaved

    if (saved) {
      const data = JSON.parse(saved)

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        contactFields.forEach(key => {
          localForm[key] = data[key] ?? ''
        })

        if (!sharedSaved && legacySaved) {
          saveFormToStorage()
        }
      }
    }
  } catch (error) {
    console.warn('Could not restore checkout contact details', error)
  } finally {
    localForm.acceptTerms = false
    hasHydratedContact.value = true
  }
}

const isValidPhone = phone => {
  const value = norm(phone)
  const digits = value.replace(/\D/g, '')

  return (
    digits.length >= 7 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(value)
  )
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  const value = norm(localForm[field])

  switch (field) {
    case 'name':
      if (!value) {
        errors.name = t('First name is required')
      } else if (!nameRe.test(value)) {
        errors.name = t('Invalid name')
      }
      break

    case 'surname':
      if (!value) {
        errors.surname = t('Last name is required')
      } else if (!nameRe.test(value)) {
        errors.surname = t('Invalid surname')
      }
      break

    case 'phone':
      if (!value) {
        errors.phone = t('Phone is required')
      } else if (!isValidPhone(value)) {
        errors.phone = t('Invalid phone number')
      }
      break

    case 'email':
      if (!value) {
        errors.email = t('Email is required')
      } else if (!emailRe.test(value)) {
        errors.email = t('Invalid email format')
      }
      break

    case 'country':
      if (
        localForm.country === '' ||
        localForm.country === null ||
        localForm.country === undefined
      ) {
        errors.country = t('Country is required')
      }
      break

    case 'city':
      if (!value) {
        errors.city = t('City is required')
      }
      break

    case 'address':
      if (!value) {
        errors.address = t('Address line is required')
      }
      break

    case 'postCode':
      if (!value) {
        errors.postCode = t('Post Code is required')
      }
      break

    case 'acceptTerms':
      if (!localForm.acceptTerms) {
        errors.acceptTerms = t('You must accept the Terms of Use')
      }
      break
  }
}

const validateForm = () => {
  clearErrors()

  Object.keys(errors).forEach(validateField)

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t(
      'Please fill in all required fields correctly and accept terms.',
    )

    return false
  }

  return true
}

const isFormComplete = computed(() => {
  return Boolean(
    nameRe.test(norm(localForm.name)) &&
    nameRe.test(norm(localForm.surname)) &&
    isValidPhone(localForm.phone) &&
    emailRe.test(norm(localForm.email)) &&
    localForm.country !== '' &&
    localForm.country !== null &&
    localForm.country !== undefined &&
    norm(localForm.city) &&
    norm(localForm.address) &&
    norm(localForm.postCode) &&
    localForm.acceptTerms,
  )
})

const submit = async methodCode => {
  if (isSubmitting.value) {
    return
  }

  if (!validateForm()) {
    return
  }

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
      name: norm(localForm.name),
      surname: norm(localForm.surname),
      phone: norm(localForm.phone),
      email: norm(localForm.email),
      country: localForm.country,
      city: norm(localForm.city),
      address: norm(localForm.address),
      postCode: norm(localForm.postCode),
      paymentMethod: methodCode,
      paymentType: methodCode,
      directPayment: !isBalance(methodCode),
      promocode: promoCodeStore.currentPromo?.code || null,
    }

    const response = await purchaseStore.purchaseCartItems(purchaseData)

    if (response?.success) {
      if (response.redirect_url) {
        window.location.href = response.redirect_url
        return
      }

      emit('close')

      await router.push({
        name: 'SuccessPaymentPage',
      })

      return
    }

    const errorMessage =
      response?.error || t('An error occurred during checkout')

    submitError.value = errorMessage

    toast.error(errorMessage)
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      t('An error occurred during checkout')

    submitError.value = errorMessage

    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
    selectedPaymentMethod.value = null
  }
}

const handleClose = () => {
  if (isSubmitting.value) {
    return
  }

  saveFormToStorage()

  emit('close')
}

const initializeCheckout = async () => {
  prefillFromStorage()

  clearErrors()
  selectedPaymentMethod.value = null

  const requests = [ensurePages()]

  if (!settingsStore.settings) {
    requests.push(settingsStore.fetchSettings())
  }

  if (!countryStore.countries?.length) {
    requests.push(countryStore.fetchCountries())
  }

  requests.push(cartStore.fetchCartContent())

  const results = await Promise.allSettled(requests)

  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error('Failed to initialize checkout', result.reason)
    }
  })
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initializeCheckout()
    } else {
      hasHydratedContact.value = false
    }
  },
)

watch(
  () => [
    localForm.name,
    localForm.surname,
    localForm.phone,
    localForm.email,
    localForm.country,
    localForm.city,
    localForm.address,
    localForm.postCode,
  ],
  () => {
    if (props.show && hasHydratedContact.value) {
      saveFormToStorage()
    }
  },
)

watch(
  () => localForm.country,
  () => {
    if (errors.country) {
      validateField('country')
    }
  },
)

watch(
  () => localForm.acceptTerms,
  accepted => {
    if (accepted) {
      errors.acceptTerms = ''
    }
  },
)

onMounted(() => {
  if (props.show) {
    initializeCheckout()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal__inner.checkout__inner) {
  width: calc(100% - 32px);
  max-width: 1072px;

  border-radius: 6px;
  background: var(--bg-third-color);
}

:global(.checkout__inner .modal__content) {
  @include adaptiveValue('padding-top', 34, 18);
  @include adaptiveValue('padding-bottom', 34, 18);
  @include adaptiveValue('padding-left', 34, 15);
  @include adaptiveValue('padding-right', 34, 15);

  background: var(--bg-third-color);
  border-radius: 6px;
}

:global(.checkout__inner .modal__close) {
  top: 12px;
  right: 12px;
  color: var(--primary-color);
}

.checkout {
  display: grid;
  grid-template-columns:
    minmax(0, 3fr)
    minmax(0, 2fr);

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
    line-height: 1;

    text-transform: uppercase;

    &-icon {
      width: 12px;
      min-width: 12px;
      height: 12px;

      transform: rotate(90deg);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);
    text-transform: uppercase;

    @include adaptiveValue('margin-bottom', 30, 18);
  }

  &__inputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 18, 10);

    width: 100%;
    min-width: 0;
  }

  &__input {
    width: 100%;
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
    margin: 0;

    color: var(--primary-color);
    text-transform: uppercase;
  }

  &__count {
    flex-shrink: 0;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
  }

  &__total {
    position: relative;

    @include adaptiveValue('margin-bottom', 30, 20);
  }

  &__subtitle {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.4;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  &__coin {
    justify-content: flex-end;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__fiat {
    justify-content: flex-end;

    color: var(--primary-color);
  }

  &__terms {
    @include adaptiveValue('margin-bottom', 24, 16);

    :deep(.base-checkbox__row) {
      align-items: flex-start;
      gap: 16px;
    }

    :deep(.base-checkbox__label) {
      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 14px;
      line-height: 1.5;
    }

    :deep(.base-checkbox__box) {
      width: 22px;
      min-width: 22px;
      height: 22px;
    }
  }

  &__error {
    @include adaptiveValue('margin-bottom', 12, 8);
  }

  &__methods {
    display: grid;

    grid-template-columns: minmax(0, 1fr);

    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  &__method {
    width: 100%;
    min-width: 0;
  }

  &__submit {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('min-height', 44, 40);

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: uppercase;

    &-warn {
      margin-top: 8px;

      color: var(--error-color);

      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.5;

      text-align: center;
    }

    &-image {
      width: 130px;
      max-width: 70%;
      height: 26px;

      margin: auto;

      img {
        display: block;
        width: 100%;
        height: 100%;

        object-fit: contain;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkout__back,
  .summary__submit {
    transition: none;
  }
}
</style>
