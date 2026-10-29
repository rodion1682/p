<template>
  <BaseModal
    :show="show"
    wrapper-classes="payment-modal__inner"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <div class="payment">
      <h2 class="payment__title _h3">
        {{ $t('Payment Information') }}
      </h2>

      <form class="payment__form" novalidate @submit.prevent="handleConfirm">
        <template v-if="!isCardMode">
          <div class="payment__inputs">
            <BaseInput
              v-model="formData.fullName"
              class="payment__input"
              name="fullName"
              autocomplete="name"
              :label="$t('Name')"
              :placeholder="$t('Name')"
              :error="formErrors.fullName"
              :disabled="isSubmitting"
              @blur="validateField('fullName')"
            />

            <BaseInput
              :model-value="formData.iban"
              class="payment__input"
              name="iban"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              :label="$t('IBAN')"
              :placeholder="$t('IBAN number')"
              :error="formErrors.iban"
              :disabled="isSubmitting"
              @update:model-value="handleIbanChange"
              @blur="validateField('iban')"
            />
          </div>

          <div class="payment__agreements">
            <BaseCheckbox
              v-model="formData.termsAccepted"
              class="payment__checkbox"
              :error="formErrors.termsAccepted"
              :disabled="isSubmitting"
              terms
            />
          </div>
        </template>

        <p v-else class="payment__redirect-info">
          {{
            $t('Continue to the payment provider to complete your card payout.')
          }}
        </p>

        <div class="payment__total">
          <span class="payment__total-label"> {{ $t('Total') }}: </span>

          <span class="payment__total-value">
            {{ formattedTotal }}
          </span>
        </div>

        <div
          v-if="formErrors.general"
          class="payment__error _text-error"
          role="alert"
        >
          {{ formErrors.general }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          class="payment__submit"
          :disabled="isSubmitting || (isCardMode && !redirectUrl)"
        >
          <span v-if="isSubmitting"> {{ $t('Processing') }}... </span>

          <span v-else-if="isCardMode">
            {{ $t('Continue') }}
          </span>

          <span v-else>
            {{ $t('Pay') }}
          </span>
        </BaseButton>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'

import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { usePayoutStore } from '@/stores/payout'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  mode: {
    type: String,
    default: 'offer',
    validator: value => ['offer', 'balance'].includes(value),
  },
  paymentMethod: {
    type: String,
    default: 'sepa',
  },
  redirectUrl: {
    type: String,
    default: '',
  },
  amount: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { ensurePages } = useStaticPages()

const toast = useToast()
const currencyStore = useCurrencyStore()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const payoutStore = usePayoutStore()
const userStore = useUserStore()

const isLoading = ref(false)

const formData = reactive({
  fullName: '',
  iban: '',
  termsAccepted: false,
})

const formErrors = reactive({
  fullName: '',
  iban: '',
  termsAccepted: '',
  general: '',
})

const norm = value => String(value ?? '').trim()

const isSubmitting = computed(() => isLoading.value || payoutStore.isLoading)

const isBalanceMode = computed(() => props.mode === 'balance')

const isCardMode = computed(() => {
  return ['card', 'card-form', 'card-direct'].includes(
    String(props.paymentMethod || '').toLowerCase(),
  )
})

const selectedOffer = computed(() => {
  return offerFlowStore.selectedOffer || offerFlowStore.getSelectedOffer || null
})

const modalData = computed(() => {
  return modalStore.getData('payment') || {}
})

const selectedCurrency = computed(() => {
  return String(
    modalData.value?.currency ||
      (isBalanceMode.value
        ? currencyStore.currentCurrencyCode
        : selectedOffer.value?.fiat_currency ||
          selectedOffer.value?.currency) ||
      currencyStore.currentCurrencyCode ||
      'EUR',
  ).toUpperCase()
})

const currencySymbol = computed(() => {
  const currency = currencyStore.currencies?.find(
    item => item.code === selectedCurrency.value,
  )

  if (currency?.symbol) {
    return currency.symbol
  }

  if (selectedCurrency.value === 'EUR') return '€'
  if (selectedCurrency.value === 'USD') return '$'
  if (selectedCurrency.value === 'GBP') return '£'

  return selectedCurrency.value
})

const totalAmount = computed(() => {
  const rawAmount =
    props.amount ??
    modalData.value?.amount ??
    (isBalanceMode.value
      ? payoutStore.amount
      : (selectedOffer.value?.fiat_price ??
        selectedOffer.value?.service_price ??
        selectedOffer.value?.user_fiat_price ??
        selectedOffer.value?.user_price ??
        selectedOffer.value?.price)) ??
    0

  const amount = Number(rawAmount)

  return Number.isFinite(amount) && amount > 0 ? amount : 0
})

const formattedTotal = computed(() => {
  const amount = currencyStore.formatFiat(
    totalAmount.value,
    selectedCurrency.value,
  )

  return `${amount} ${currencySymbol.value}`
})

const contactInfo = computed(() => {
  return isBalanceMode.value
    ? payoutStore.contactInfo || {}
    : offerFlowStore.contactInfo || {}
})

const splitFullName = value => {
  const parts = norm(value).split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

const normalizeIban = value => {
  return String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 34)
}

const formatIban = value => {
  return normalizeIban(value).replace(/(.{4})(?=.)/g, '$1 ')
}

const isValidFullName = computed(() => {
  const { firstName, lastName } = splitFullName(formData.fullName)

  return firstName.length >= 2 && lastName.length >= 2
})

const isValidIban = computed(() => {
  const iban = normalizeIban(formData.iban)

  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) {
    return false
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0

  for (const character of rearranged) {
    const number =
      character >= 'A' && character <= 'Z'
        ? String(character.charCodeAt(0) - 55)
        : character

    for (const digit of number) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
})

const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })
}

const clearFieldError = field => {
  formErrors[field] = ''
  formErrors.general = ''
}

const validateField = field => {
  clearFieldError(field)

  if (field === 'fullName') {
    if (!norm(formData.fullName)) {
      formErrors.fullName = t('Name is required')
      return
    }

    if (!isValidFullName.value) {
      formErrors.fullName = t('Please enter your name and surname')
    }

    return
  }

  if (field === 'iban') {
    if (!normalizeIban(formData.iban)) {
      formErrors.iban = t('IBAN is required')
      return
    }

    if (!isValidIban.value) {
      formErrors.iban = t('Please enter a valid IBAN')
    }

    return
  }

  if (field === 'termsAccepted' && !formData.termsAccepted) {
    formErrors.termsAccepted = t('You must accept the terms')
  }
}

const validateForm = () => {
  clearErrors()

  validateField('fullName')
  validateField('iban')
  validateField('termsAccepted')

  if (totalAmount.value <= 0) {
    formErrors.general = t('Invalid payment amount')
    return false
  }

  const hasErrors = Object.values(formErrors).some(Boolean)

  if (hasErrors) {
    formErrors.general = t('Please fill in all required fields correctly.')
    return false
  }

  return true
}

const handleIbanChange = value => {
  formData.iban = formatIban(value)
  clearFieldError('iban')
}

const handleClose = () => {
  if (isSubmitting.value) return

  clearErrors()
  emit('close')
}

const buildOfferPayload = () => {
  const offerId = selectedOffer.value?.id
  const info = contactInfo.value

  const { firstName, lastName } = splitFullName(formData.fullName)

  return {
    id: offerId,
    name: firstName,
    surname: lastName,
    first_name: firstName,
    last_name: lastName,
    account_number: normalizeIban(formData.iban),
    currency: selectedCurrency.value,
    address: info.address || '',
    city: info.city || '',
    country: info.country || '',
    email: info.email || '',
    phone: info.phone || '',
    postCode: info.postCode || info.post_code || '',
  }
}

const handleBalancePayout = async () => {
  const { firstName, lastName } = splitFullName(formData.fullName)

  payoutStore.updatePaymentInfo({
    accountHolderFirstName: firstName,
    accountHolderLastName: lastName,
    iban: normalizeIban(formData.iban),
    termsAccepted: formData.termsAccepted,
  })

  payoutStore.setPaymentMethod('sepa-manual')

  if (Number(payoutStore.amount || 0) <= 0) {
    formErrors.general = t('Invalid withdrawal amount')
    return
  }

  const result = await payoutStore.createPayout()

  if (!result?.success) {
    const validationErrors = result?.validationErrors || {}

    const ibanError = validationErrors.account_number || validationErrors.iban

    if (ibanError) {
      formErrors.iban = Array.isArray(ibanError)
        ? String(ibanError[0] || '')
        : String(ibanError)
    }

    formErrors.general = result?.error || t('Failed to request payout')

    return
  }

  emit('close')

  if (!result.redirect) {
    await userStore.fetchProfile?.()
  }
}

const handleOfferPayout = async () => {
  const offerId = selectedOffer.value?.id

  if (!offerId) {
    formErrors.general = t('Offer ID not found')
    return
  }

  const result = await offerFlowStore.completeOffer({
    offerId,
    paymentMethod: 'sepa',
    payload: buildOfferPayload(),
  })

  if (!result?.success) {
    const validationErrors = result?.validationErrors || {}

    const ibanError = validationErrors.account_number || validationErrors.iban

    if (ibanError) {
      formErrors.iban = Array.isArray(ibanError)
        ? String(ibanError[0] || '')
        : String(ibanError)
    }

    formErrors.general =
      result?.error || result?.message || t('Failed to process payment')

    return
  }

  toast.success(t('Payment submitted successfully'))

  emit('close')

  await offerFlowStore.fetchOffers?.()
}

const handleCardRedirect = () => {
  if (!props.redirectUrl) {
    formErrors.general = t('Payment link is not available')
    return
  }

  try {
    const url = new URL(props.redirectUrl, window.location.origin)

    if (!['https:', 'http:'].includes(url.protocol)) {
      throw new Error(t('Invalid payment link'))
    }

    window.location.assign(url.href)
  } catch (error) {
    formErrors.general = error?.message || t('Invalid payment link')
  }
}

const handleConfirm = async () => {
  if (isSubmitting.value) return

  if (isCardMode.value) {
    handleCardRedirect()
    return
  }

  if (!validateForm()) return

  isLoading.value = true
  formErrors.general = ''

  try {
    if (isBalanceMode.value) {
      await handleBalancePayout()
    } else {
      await handleOfferPayout()
    }
  } catch (error) {
    formErrors.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to process payment')
  } finally {
    isLoading.value = false
  }
}

const initializeModal = async () => {
  clearErrors()

  formData.termsAccepted = false
  formData.iban = ''

  const info = contactInfo.value

  const firstName = info.firstName || info.name || userStore.user?.name || ''

  const lastName =
    info.lastName || info.surname || userStore.user?.surname || ''

  formData.fullName = [firstName, lastName].filter(Boolean).join(' ')

  try {
    await Promise.allSettled([
      currencyStore.initializeCurrencies?.(),
      ensurePages(),
    ])
  } catch (error) {
    console.error('Payment initialization error:', error)
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initializeModal()
    } else {
      clearErrors()
      formData.termsAccepted = false
    }
  },
  { immediate: true },
)

watch(
  () => formData.fullName,
  () => {
    clearFieldError('fullName')
  },
)

watch(
  () => formData.termsAccepted,
  accepted => {
    if (accepted) {
      clearFieldError('termsAccepted')
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.payment-modal__inner) {
  width: min(520px, calc(100% - 30px));
  max-width: 520px;
  max-height: calc(100dvh - 32px);

  padding: 58px 45px 55px;

  border: 1px solid #344050;
  border-radius: 18px;

  background-color: #111821;
  background-image: none;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);

  overflow-x: hidden;
  overflow-y: auto;
}

:global(.modal .modal__inner.payment-modal__inner .modal__close) {
  top: 14px;
  right: 14px;

  width: 34px;
  min-width: 34px;
  height: 34px;

  padding: 0;
  border-radius: 6px;

  color: #f4f6fb;
  background-color: transparent;
}

:global(.modal .modal__inner.payment-modal__inner .modal__close:hover) {
  color: #1a73ff;
}

.payment {
  width: 100%;
  min-width: 0;

  &__title {
    margin: 0;

    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: 27px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 24);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__inputs {
    display: flex;
    flex-direction: column;
    gap: 18px;

    width: 100%;
    min-width: 0;
  }

  &__input {
    width: 100%;
    min-width: 0;

    :deep(.base-input__label) {
      margin-bottom: 7px;

      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-input) {
      width: 100%;
      min-height: 46px;
      height: 46px;

      border: 1px solid rgba(153, 161, 176, 0.12);
      border-radius: 8px;

      background-color: #222934;
      color: #f4f6fb;

      transition:
        background-color 0.25s ease,
        border-color 0.25s ease;
    }

    :deep(.base-input.is-focused),
    :deep(.base-input:focus-within) {
      border-color: #1a73ff;
    }

    :deep(.base-input.has-error) {
      border-color: var(--error-color);
    }

    :deep(.base-input__control) {
      color: #f4f6fb;

      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input__placeholder) {
      color: #b6c0ce;

      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-input__error) {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.4;
    }
  }

  &__agreements {
    display: flex;
    flex-direction: column;

    margin-top: 22px;
  }

  &__checkbox {
    width: 100%;

    :deep(.base-checkbox__row) {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    :deep(.base-checkbox__box) {
      width: 16px;
      min-width: 16px;
      height: 16px;
      margin-top: 2px;

      border: 1px solid #4c5a6c;
      border-radius: 3px;

      background-color: #222934;
    }

    :deep(.base-checkbox__label) {
      color: #99a1b0;

      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }

    :deep(.base-checkbox__label a) {
      color: #f4f6fb;
      text-decoration: none;

      @media (any-hover: hover) {
        &:hover {
          color: #65a7ff;
        }
      }
    }

    :deep(.base-checkbox__error) {
      margin-top: 7px;
      font-size: 12px;
    }
  }

  &__redirect-info {
    margin: 0;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;
    gap: 16px;

    margin-top: 36px;
  }

  &__total-label {
    color: #99a1b0;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
  }

  &__total-value {
    color: #f4f6fb;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.5;

    text-align: right;
    white-space: nowrap;
  }

  &__error {
    margin-top: 18px;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
  }

  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 46px;
    height: 46px;

    margin-top: 36px;
    padding: 9px 15px;

    border: 1px solid #1a73ff !important;
    border-radius: 8px !important;

    background-color: #1a73ff !important;
    color: #ffffff !important;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: #005fe8 !important;
        background-color: #005fe8 !important;
      }
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }
  }

  @media (max-width: $md5) {
    &__title {
      font-size: 23px;
    }

    &__inputs {
      gap: 15px;
    }

    &__input {
      :deep(.base-input__label),
      :deep(.base-input__control),
      :deep(.base-input__placeholder) {
        font-size: 14px;
      }

      :deep(.base-input) {
        min-height: 44px;
        height: 44px;
      }
    }

    &__checkbox {
      :deep(.base-checkbox__label) {
        font-size: 12px;
      }
    }

    &__total {
      margin-top: 26px;
    }

    &__submit {
      margin-top: 26px;
      min-height: 44px;
      height: 44px;
    }
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.payment-modal__inner) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;

    padding: 50px 20px 30px;

    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: $md7) {
  :global(.modal .modal__inner.payment-modal__inner) {
    padding-left: 15px;
    padding-right: 15px;
  }
}
</style>
