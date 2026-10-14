<template>
  <BaseModal
    :show="props.show"
    class="payment-details-modal"
    content-class="payment-details-modal__content"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div class="payment-details">
      <h2 :id="titleId" class="payment-details__title _h3">
        {{ $t('Payment details') }}
      </h2>

      <!-- Payment method branding -->
      <div class="payment-details__brand">
        <div
          v-if="paymentMethod === 'card'"
          class="payment-details__card-brand"
          :aria-label="$t('Credit/Debit card')"
        >
          <span class="payment-details__mastercard" aria-hidden="true">
            <span class="payment-details__mastercard-circle" />
            <span
              class="payment-details__mastercard-circle payment-details__mastercard-circle_right"
            />
          </span>

          <span class="payment-details__visa">VISA</span>
        </div>

        <div v-else class="payment-details__sepa" :aria-label="$t('SEPA')">
          <span>SE</span>
          <span class="payment-details__sepa-symbol">€</span>
          <span>PA</span>
        </div>
      </div>

      <!-- Missing offer -->
      <div v-if="!selectedOffer" class="payment-details__state">
        <div class="payment-details__state-title">
          {{ $t('Withdrawal information is unavailable') }}
        </div>

        <p class="payment-details__state-text">
          {{ $t('Please return and select the withdrawal again.') }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="payment-details__state-button"
          @click="handleBack"
        >
          {{ $t('Back') }}
        </BaseButton>
      </div>

      <form
        v-else
        class="payment-details__form"
        @submit.prevent="handleConfirm"
      >
        <!-- General API error -->
        <div
          v-if="formErrors.general"
          class="payment-details__general-error"
          role="alert"
          aria-live="polite"
        >
          <span class="payment-details__error-icon" aria-hidden="true">!</span>

          <span>
            {{ formErrors.general }}
          </span>
        </div>

        <!-- Card form -->
        <div v-if="paymentMethod === 'card'" class="payment-details__fields">
          <BaseInput
            :model-value="formData.cardNumber"
            name="card-number"
            type="text"
            inputmode="numeric"
            autocomplete="cc-number"
            :label="$t('Card number')"
            :error="formErrors.cardNumber"
            maxlength="23"
            required
            @update:model-value="handleCardNumberInput"
          />

          <BaseInput
            :model-value="formData.cardHolderName"
            name="card-holder"
            type="text"
            autocomplete="cc-name"
            :label="$t('Card holder')"
            :error="formErrors.cardHolderName"
            required
            @update:model-value="handleCardHolderInput"
          />

          <BaseInput
            :model-value="formData.expirationDate"
            name="expiration-date"
            type="text"
            inputmode="numeric"
            autocomplete="cc-exp"
            :label="$t('Expiration date')"
            :placeholder="$t('MM/YY')"
            :error="formErrors.expirationDate"
            input-class="payment-details__expiration-control"
            class="payment-details__expiration"
            maxlength="5"
            required
            @update:model-value="handleExpirationInput"
          />
        </div>

        <!-- SEPA form -->
        <div v-else class="payment-details__fields">
          <BaseInput
            v-model="formData.firstName"
            name="account-holder-first-name"
            type="text"
            autocomplete="given-name"
            :label="$t('First name')"
            :error="formErrors.firstName"
            required
            @update:model-value="clearFieldError('firstName')"
          />

          <BaseInput
            :model-value="formData.iban"
            name="iban"
            type="text"
            autocapitalize="characters"
            autocomplete="off"
            :label="$t('IBAN')"
            :error="formErrors.iban"
            maxlength="42"
            required
            @update:model-value="handleIbanInput"
          />
        </div>

        <!-- Terms -->
        <div class="payment-details__terms">
          <BaseCheckbox
            v-model="formData.termsAccepted"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
          >
            <span class="payment-details__terms-text">
              {{
                $t(
                  'I confirm that I am 18 years old or older and I agree to the',
                )
              }}

              <RouterLink
                v-if="termsPage"
                :to="getPageUrl(termsPage)"
                class="payment-details__terms-link"
                target="_blank"
                @click.stop
              >
                {{ $t('Terms & Conditions') }}
              </RouterLink>

              <span v-if="termsPage && privacyPage">
                {{ $t('and') }}
              </span>

              <RouterLink
                v-if="privacyPage"
                :to="getPageUrl(privacyPage)"
                class="payment-details__terms-link"
                target="_blank"
                @click.stop
              >
                {{ $t('Privacy Notice') }}
              </RouterLink>
            </span>
          </BaseCheckbox>
        </div>

        <!-- Actions -->
        <div class="payment-details__actions">
          <button
            type="button"
            class="payment-details__back"
            :disabled="isLoading"
            @click="handleBack"
          >
            {{ $t('Cancel') }}
          </button>

          <BaseButton
            type="submit"
            variant="primary"
            class="payment-details__confirm"
            :disabled="isLoading || !formData.termsAccepted"
          >
            <span
              v-if="isLoading"
              class="payment-details__button-loader"
              aria-hidden="true"
            />

            <template v-else>
              {{ $t('Confirm') }}
            </template>
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  paymentMethod: {
    type: String,
    default: '',
  },

  /*
   * Optional data passed with:
   *
   * modalStore.open('payment', {
   *   paymentMethod: 'card',
   *   offer,
   * })
   */
  modalData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'success', 'back'])

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const toast = useToast()

const titleId = 'payment-details-modal-title'

const isLoading = ref(false)

const formData = reactive({
  cardNumber: '',
  cardHolderName: '',
  expirationDate: '',
  firstName: '',
  iban: '',
  termsAccepted: false,
})

const formErrors = reactive({
  cardNumber: '',
  cardHolderName: '',
  expirationDate: '',
  firstName: '',
  iban: '',
  termsAccepted: '',
  general: '',
})

const paymentMethod = computed(() => {
  const method =
    props.paymentMethod ||
    props.modalData?.paymentMethod ||
    offerFlowStore.selectedPaymentMethod ||
    'sepa'

  return method === 'card' ? 'card' : 'sepa'
})

const selectedOffer = computed(() => {
  return (
    props.modalData?.offer ||
    props.modalData?.withdrawal ||
    offerFlowStore.selectedOffer ||
    offerFlowStore.getSelectedOffer ||
    null
  )
})

function clearErrors() {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })
}

function clearFieldError(field) {
  if (field && formErrors[field]) {
    formErrors[field] = ''
  }

  if (formErrors.general) {
    formErrors.general = ''
  }
}

function resetForm() {
  formData.cardNumber = ''
  formData.cardHolderName = ''
  formData.expirationDate = ''
  formData.firstName = ''
  formData.iban = ''
  formData.termsAccepted = false

  clearErrors()
}

function initializeForm() {
  const contactInfo = offerFlowStore.contactInfo || {}

  formData.firstName =
    contactInfo.firstName ||
    selectedOffer.value?.name ||
    selectedOffer.value?.first_name ||
    ''

  formData.cardHolderName = [
    contactInfo.firstName || selectedOffer.value?.name,
    contactInfo.lastName || selectedOffer.value?.surname,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()

  formData.iban = ''
  formData.cardNumber = ''
  formData.expirationDate = ''
  formData.termsAccepted = false

  clearErrors()
}

function handleCardNumberInput(inputValue) {
  const digits = String(inputValue || '')
    .replace(/\D/g, '')
    .slice(0, 19)

  formData.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ')

  clearFieldError('cardNumber')
}

function handleCardHolderInput(inputValue) {
  formData.cardHolderName = String(inputValue || '')
    .replace(/\s{2,}/g, ' ')
    .toUpperCase()

  clearFieldError('cardHolderName')
}

function handleExpirationInput(inputValue) {
  const digits = String(inputValue || '')
    .replace(/\D/g, '')
    .slice(0, 4)

  if (digits.length <= 2) {
    formData.expirationDate = digits
  } else {
    formData.expirationDate = `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  clearFieldError('expirationDate')
}

function handleIbanInput(inputValue) {
  const normalized = String(inputValue || '')
    .replace(/\s/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 34)

  formData.iban = normalized.replace(/(.{4})(?=.)/g, '$1 ')

  clearFieldError('iban')
}

function isValidCardNumber(value) {
  const digits = String(value || '').replace(/\s/g, '')

  if (!/^\d{12,19}$/.test(digits)) {
    return false
  }

  /*
   * Luhn checksum validation.
   */
  let sum = 0
  let doubleDigit = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])

    if (doubleDigit) {
      digit *= 2

      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    doubleDigit = !doubleDigit
  }

  return sum % 10 === 0
}

function isValidExpirationDate(value) {
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return false
  }

  const [monthValue, yearValue] = value.split('/')
  const month = Number(monthValue)
  const year = Number(`20${yearValue}`)

  if (month < 1 || month > 12) {
    return false
  }

  /*
   * A card remains valid through the final day
   * of its expiration month.
   */
  const expiration = new Date(year, month, 0, 23, 59, 59, 999)

  return expiration >= new Date()
}

function isValidIban(value) {
  const iban = String(value || '')
    .replace(/\s/g, '')
    .toUpperCase()

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
    return false
  }

  /*
   * IBAN modulo-97 validation without creating
   * an unsafe, extremely large JavaScript number.
   */
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`

  let remainder = 0

  for (const character of rearranged) {
    const numericValue = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character

    for (const digit of numericValue) {
      remainder = (remainder * 10 + Number(digit)) % 97
    }
  }

  return remainder === 1
}

function validateForm() {
  clearErrors()

  if (!formData.termsAccepted) {
    formErrors.termsAccepted = 'You must agree to the terms and conditions'
  }

  if (paymentMethod.value === 'card') {
    if (!isValidCardNumber(formData.cardNumber)) {
      formErrors.cardNumber = 'Please enter a valid card number'
    }

    if (!formData.cardHolderName.trim()) {
      formErrors.cardHolderName = 'Card holder name is required'
    }

    if (!isValidExpirationDate(formData.expirationDate)) {
      formErrors.expirationDate =
        'Please enter a valid, non-expired date in MM/YY format'
    }
  } else {
    if (!formData.firstName.trim()) {
      formErrors.firstName = 'First name is required'
    }

    if (!isValidIban(formData.iban)) {
      formErrors.iban = 'Please enter a valid IBAN'
    }
  }

  return !Object.values(formErrors).some(Boolean)
}

function createPayload() {
  if (paymentMethod.value === 'card') {
    const [expireMonth, expireYear] = formData.expirationDate.split('/')

    return {
      card_number: formData.cardNumber.replace(/\s/g, ''),
      card_holder_name: formData.cardHolderName.trim(),
      expire_month: expireMonth,
      expire_year: expireYear,
      payment_method: 'card',
    }
  }

  const contactInfo = offerFlowStore.contactInfo || {}

  return {
    first_name: formData.firstName.trim(),
    last_name:
      contactInfo.lastName ||
      selectedOffer.value?.surname ||
      selectedOffer.value?.last_name ||
      '',
    account_number: formData.iban.replace(/\s/g, ''),
    payment_method: 'sepa',
  }
}

function applyValidationErrors(validationErrors = {}) {
  const fieldMapping = {
    card_number: 'cardNumber',
    card_holder: 'cardHolderName',
    card_holder_name: 'cardHolderName',
    expiration_date: 'expirationDate',
    expiry_date: 'expirationDate',
    expire_month: 'expirationDate',
    expire_year: 'expirationDate',
    first_name: 'firstName',
    account_number: 'iban',
    iban: 'iban',
    terms: 'termsAccepted',
  }

  Object.entries(validationErrors).forEach(([serverField, messages]) => {
    const clientField = fieldMapping[serverField] || serverField
    const message = Array.isArray(messages) ? messages[0] : messages

    if (clientField in formErrors && message) {
      formErrors[clientField] = message
    }
  })
}

async function handleConfirm() {
  if (isLoading.value || !selectedOffer.value) {
    return
  }

  if (!validateForm()) {
    if (formErrors.termsAccepted) {
      toast.error(formErrors.termsAccepted)
    }

    return
  }

  isLoading.value = true
  formErrors.general = ''

  try {
    const offerId =
      selectedOffer.value.id ||
      selectedOffer.value.offer_id ||
      selectedOffer.value.withdrawal_id

    if (!offerId) {
      throw new Error('Offer ID was not found')
    }

    offerFlowStore.setSelectedOffer(selectedOffer.value)
    offerFlowStore.setPaymentMethod(paymentMethod.value)
    offerFlowStore.updatePaymentInfo({
      cardNumber: formData.cardNumber,
      cardHolderName: formData.cardHolderName,
      expirationDate: formData.expirationDate,
      accountHolderFirstName: formData.firstName,
      accountHolderLastName:
        offerFlowStore.contactInfo?.lastName ||
        selectedOffer.value?.surname ||
        '',
      iban: formData.iban,
      termsAccepted: formData.termsAccepted,
    })

    const result = await offerFlowStore.completeOffer({
      offerId,
      payload: createPayload(),
    })

    if (result === true || result?.success === true) {
      toast.success('Payment submitted successfully')

      await offerFlowStore.fetchWithdrawals()

      emit('success', {
        offer: selectedOffer.value,
        paymentMethod: paymentMethod.value,
        result,
      })

      modalStore.close('payment')
      emit('update:show', false)
      emit('close')

      return
    }

    formErrors.general = result?.error || 'The payment could not be submitted'

    applyValidationErrors(result?.validationErrors)
  } catch (submissionError) {
    console.error('Payment submission error:', submissionError)

    formErrors.general =
      submissionError?.response?.data?.message ||
      submissionError?.message ||
      'Failed to process the payment'

    applyValidationErrors(submissionError?.response?.data?.errors || {})
  } finally {
    isLoading.value = false
  }
}

function handleBack() {
  if (isLoading.value) {
    return
  }

  modalStore.close('payment')

  modalStore.open('paymentMethod', {
    offer: selectedOffer.value,
  })

  emit('back', selectedOffer.value)
  emit('update:show', false)
  emit('close')
}

function handleClose() {
  if (isLoading.value) {
    return
  }

  clearErrors()

  emit('update:show', false)
  emit('close')
}

function handleShowUpdate(value) {
  if (!value && isLoading.value) {
    return
  }

  emit('update:show', value)

  if (!value) {
    emit('close')
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      initializeForm()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => paymentMethod.value,
  () => {
    if (props.show) {
      initializeForm()
    }
  },
)
</script>

<style lang="scss" scoped>
.payment-details {
  width: 100%;

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.04em;
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 58px;

    &:not(:last-child) {
      margin-bottom: 34px;
    }
  }

  &__card-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
  }

  &__mastercard {
    position: relative;

    width: 66px;
    height: 42px;
  }

  &__mastercard-circle {
    position: absolute;
    top: 0;
    left: 0;

    width: 42px;
    height: 42px;

    border-radius: 50%;
    background-color: #eb001b;

    &_right {
      right: 0;
      left: auto;

      background-color: #f79e1b;

      mix-blend-mode: screen;
    }
  }

  &__visa {
    color: var(--primary-color);
    font-family: Arial, sans-serif;
    font-size: 50px;
    font-style: italic;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.06em;
  }

  &__sepa {
    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--primary-color);
    font-family: Arial, sans-serif;
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.08em;
  }

  &__sepa-symbol {
    margin: 0 -3px;

    color: #ffd100;
    font-size: 48px;
  }

  &__state {
    padding: 30px 0;

    text-align: center;
  }

  &__state-title {
    color: var(--primary-color);
    font-size: 16px;
    font-weight: 500;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__state-text {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__state-button {
    width: min(100%, 220px);

    margin: 0 auto;
  }

  &__form {
    width: 100%;
  }

  &__general-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    margin-bottom: 20px;
    padding: 11px 13px;

    border: 1px solid rgb(255 74 101 / 35%);
    border-radius: 4px;
    background-color: rgb(255 74 101 / 7%);

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 150%;
  }

  &__error-icon {
    display: flex;
    flex: 0 0 18px;
    align-items: center;
    justify-content: center;

    width: 18px;
    height: 18px;

    border: 1px solid currentColor;
    border-radius: 50%;

    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__expiration {
    width: 87px;

    :deep(.base-input__control) {
      text-align: center;
    }
  }

  &__terms {
    margin-top: 32px;
  }

  &__terms-text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 140%;
  }

  &__terms-link {
    color: var(--hint-secondary-color);
    text-decoration: none;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;

    margin-top: 34px;
  }

  &__back {
    flex: 0 0 auto;

    padding: 6px 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;

    cursor: pointer;

    transition:
      color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.4;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__confirm {
    flex: 1 1 auto;

    min-height: 42px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__button-loader {
    width: 19px;
    height: 19px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: payment-details-spin 0.75s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md7) {
    &__visa {
      font-size: 42px;
    }

    &__sepa {
      font-size: 44px;
    }

    &__mastercard {
      width: 58px;
      height: 36px;
    }

    &__mastercard-circle {
      width: 36px;
      height: 36px;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__back,
    &__confirm {
      width: 100%;
    }
  }
}

@keyframes payment-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.payment-details-modal) {
  max-width: 480px;
}

:global(.payment-details-modal .base-modal__frame) {
  padding: clamp(32px, 4vw, 42px) clamp(18px, 4vw, 48px);

  border: 1px solid var(--hint-primary-color);
  background-color: var(--bg-fifth-color);
}

:global(.payment-details-modal__content) {
  width: 100%;
}
</style>
