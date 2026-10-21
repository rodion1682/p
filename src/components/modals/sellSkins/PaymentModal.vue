<template>
  <BaseModal
    :show="show"
    size="medium"
    class="payment-details-modal"
    content-class="payment-details-modal__content"
    :labelledby="titleId"
    @update:show="handleShowUpdate"
  >
    <div class="payout-details">
      <h2 :id="titleId" class="payout-details__title _h5">
        {{ $t('Payment details') }}
      </h2>
      <div v-if="!withdrawal" class="payout-details__empty">
        <p>
          {{
            $t(
              'Withdrawal information is unavailable. Please go back and try again.',
            )
          }}
        </p>
        <BaseButton type="button" variant="bordered" @click="handleBack">
          {{ $t('Back') }}
        </BaseButton>
      </div>

      <template v-else>
        <div class="payout-details__summary">
          <div class="payout-details__summary-label">
            <span>{{ $t('Withdrawal') }} #{{ withdrawal.id }}</span>
            <span>{{
              method === 'sepa' ? $t('SEPA transfer') : $t('Bank card')
            }}</span>
          </div>
          <div class="payout-details__summary-amount">
            {{ formattedAmount }}
          </div>
        </div>

        <form
          class="payout-details__form"
          novalidate
          @submit.prevent="handleConfirm"
        >
          <p v-if="errors.general" class="payout-details__alert" role="alert">
            {{ errors.general }}
          </p>

          <template v-if="method === 'sepa'">
            <div class="payout-details__section-caption">
              {{ $t('BANK ACCOUNT DETAILS') }}
            </div>
            <div class="payout-details__fields">
              <BaseInput
                v-model="form.firstName"
                name="first_name"
                autocomplete="given-name"
                :label="$t('Account holder first name')"
                :error="errors.firstName"
                :disabled="isSubmitting"
                required
              />
              <BaseInput
                v-model="form.lastName"
                name="last_name"
                autocomplete="family-name"
                :label="$t('Account holder last name')"
                :error="errors.lastName"
                :disabled="isSubmitting"
                required
              />
              <BaseInput
                :model-value="form.iban"
                name="iban"
                autocapitalize="characters"
                autocomplete="off"
                :label="$t('IBAN')"
                :placeholder="$t('Enter your IBAN')"
                :error="errors.iban"
                :disabled="isSubmitting"
                maxlength="42"
                required
                @update:model-value="onIbanInput"
              />
            </div>
          </template>

          <div class="payout-details__terms">
            <BaseCheckbox
              v-model="form.termsAccepted"
              name="payout-terms"
              :error="errors.termsAccepted"
              :disabled="isSubmitting"
              terms
            />
          </div>

          <div class="payout-details__actions">
            <BaseButton
              type="button"
              variant="bordered"
              class="payout-details__back"
              :disabled="isSubmitting"
              @click="handleBack"
            >
              {{ $t('Back') }}
            </BaseButton>
            <BaseButton
              type="submit"
              class="payout-details__submit"
              :disabled="isSubmitting || !form.termsAccepted"
            >
              {{
                isSubmitting
                  ? $t('Submitting...')
                  : method === 'card' && !collectCardDetails
                    ? $t('Continue')
                    : $t('Submit')
              }}
            </BaseButton>
          </div>
        </form>
      </template>
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
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: { type: Boolean, required: true },
  paymentMethod: { type: String, default: '' },
  modalData: { type: Object, default: null },
})

const emit = defineEmits(['close', 'update:show', 'success', 'back'])
const { t } = useI18n()
const toast = useToast()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const titleId = 'withdrawal-payment-details-title'

const isSubmitting = ref(false)
const collectCardDetails = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  iban: '',
  cardNumber: '',
  cardHolderName: '',
  expirationDate: '',
  termsAccepted: false,
})
const errors = reactive({
  general: '',
  firstName: '',
  lastName: '',
  iban: '',
  cardNumber: '',
  cardHolderName: '',
  expirationDate: '',
  termsAccepted: '',
})

const withdrawal = computed(
  () =>
    props.modalData?.withdrawal ||
    props.modalData?.offer ||
    offerFlowStore.selectedOffer ||
    null,
)

const method = computed(() => {
  const value =
    props.paymentMethod ||
    props.modalData?.paymentMethod ||
    offerFlowStore.selectedPaymentMethod
  return value === 'card' ? 'card' : 'sepa'
})

const formattedAmount = computed(() => {
  const amount = Number(withdrawal.value?.amount || 0)
  const currency = String(withdrawal.value?.currency || 'EUR').toUpperCase()
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(Number.isFinite(amount) ? amount : 0)
  } catch {
    return `${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'} EUR`
  }
})

function resetErrors() {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

function resetForm() {
  form.firstName =
    withdrawal.value?.name || offerFlowStore.contactInfo?.firstName || ''
  form.lastName =
    withdrawal.value?.surname || offerFlowStore.contactInfo?.lastName || ''
  form.iban = ''
  form.cardNumber = ''
  form.cardHolderName = [form.firstName, form.lastName]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
  form.expirationDate = ''
  form.termsAccepted = false
  collectCardDetails.value = false
  resetErrors()
}

function onIbanInput(value) {
  const iban = String(value || '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 34)
  form.iban = iban.replace(/(.{4})(?=.)/g, '$1 ')
  errors.iban = ''
}

function onCardNumberInput(value) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 19)
  form.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  errors.cardNumber = ''
}

function onExpirationInput(value) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 4)
  form.expirationDate =
    digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  errors.expirationDate = ''
}

function validIban(input) {
  const iban = input.replace(/\s/g, '').toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0
  for (const character of rearranged) {
    const value = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character
    for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}

function validCardNumber(input) {
  const digits = input.replace(/\D/g, '')
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  for (
    let i = digits.length - 1, alternate = false;
    i >= 0;
    i -= 1, alternate = !alternate
  ) {
    let digit = Number(digits[i])
    if (alternate) digit = digit * 2 > 9 ? digit * 2 - 9 : digit * 2
    sum += digit
  }
  return sum % 10 === 0
}

function validExpiry(input) {
  if (!/^\d{2}\/\d{2}$/.test(input)) return false
  const [monthString, yearString] = input.split('/')
  const month = Number(monthString)
  const year = 2000 + Number(yearString)
  if (month < 1 || month > 12) return false
  return new Date(year, month, 0, 23, 59, 59, 999) >= new Date()
}

function validateForm() {
  resetErrors()
  if (!form.termsAccepted) errors.termsAccepted = t('Please accept the terms')

  if (method.value === 'sepa') {
    if (!form.firstName.trim()) errors.firstName = t('First name is required')
    if (!form.lastName.trim()) errors.lastName = t('Last name is required')
    if (!validIban(form.iban)) errors.iban = t('Please enter a valid IBAN')
  } else if (collectCardDetails.value) {
    if (!validCardNumber(form.cardNumber))
      errors.cardNumber = t('Please enter a valid card number')
    if (!form.cardHolderName.trim())
      errors.cardHolderName = t('Card holder name is required')
    if (!validExpiry(form.expirationDate))
      errors.expirationDate = t('Please enter a valid expiration date')
  }
  return !Object.values(errors).some(Boolean)
}

function makePayload() {
  if (method.value === 'sepa') {
    return {
      payment_method: 'sepa',
      account_number: form.iban.replace(/\s/g, ''),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
    }
  }

  if (collectCardDetails.value) {
    const [month, year] = form.expirationDate.split('/')
    return {
      payment_method: 'card',
      card_number: form.cardNumber.replace(/\D/g, ''),
      card_holder_name: form.cardHolderName.trim(),
      expire_month: month,
      expire_year: `20${year}`, // Laravel's direct card API expects four digits.
    }
  }

  // The backend decides whether to return redirect_url or
  // next_action: 'collect_card_details' for direct mode.
  return { payment_method: 'card' }
}

function applyApiErrors(validationErrors) {
  const map = {
    first_name: 'firstName',
    last_name: 'lastName',
    account_number: 'iban',
    card_number: 'cardNumber',
    card_holder_name: 'cardHolderName',
    expire_month: 'expirationDate',
    expire_year: 'expirationDate',
  }
  for (const [field, messages] of Object.entries(validationErrors || {})) {
    const key = map[field] || field
    if (key in errors)
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
  }
}

function safeGatewayUrl(value) {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    // Do not navigate to javascript:, data:, insecure HTTP, etc.
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

async function handleConfirm() {
  if (isSubmitting.value || !withdrawal.value?.id) return
  if (!validateForm()) return

  if (String(withdrawal.value.status).toLowerCase() !== 'approved') {
    errors.general = t('Only approved withdrawals can be initiated')
    return
  }
  if (
    withdrawal.value.payment_method &&
    withdrawal.value.payment_method !== method.value
  ) {
    errors.general = t('The payout method cannot be changed after approval')
    return
  }

  isSubmitting.value = true
  errors.general = ''
  try {
    const result = await offerFlowStore.completeOffer({
      offerId: withdrawal.value.id,
      payload: makePayload(),
    })

    if (!result?.success) {
      errors.general = result?.error || t('Unable to initiate payout')
      applyApiErrors(result?.validationErrors)
      return
    }

    if (result.nextAction === 'collect_card_details') {
      collectCardDetails.value = true
      toast.info(t('Please provide your card details to continue'))
      return
    }

    if (result.redirectUrl) {
      const gatewayUrl = safeGatewayUrl(result.redirectUrl)
      if (!gatewayUrl) {
        errors.general = t(
          'The payment provider returned an invalid redirect address. Please contact support; your withdrawal may already be processing.',
        )
        return
      }
      // No raw card data is collected in gateway redirect mode.
      form.cardNumber = ''
      form.expirationDate = ''
      window.location.assign(gatewayUrl)
      return
    }

    // Success here means request accepted/processing, not money transferred.
    toast.success(
      t('Your payout details were submitted. The withdrawal is processing.'),
    )
    try {
      await offerFlowStore.fetchWithdrawals()
    } catch (refreshError) {
      console.warn('Payout submitted; history refresh failed:', refreshError)
    }

    emit('success', {
      withdrawal: result.withdrawal,
      result,
      paymentMethod: method.value,
    })
    closeModal(true)
  } catch (err) {
    errors.general =
      err?.response?.data?.message ||
      err?.message ||
      t('Unable to initiate payout')
    applyApiErrors(err?.response?.data?.errors)
  } finally {
    isSubmitting.value = false
  }
}

function closeModal(force = false) {
  if (isSubmitting.value && !force) return
  resetForm()
  modalStore.close('payment')
  emit('close')
}

function handleBack() {
  if (isSubmitting.value) return
  resetForm()
  modalStore.close('payment')
  modalStore.open('paymentMethod', { offer: withdrawal.value })
  emit('back', withdrawal.value)
}

function handleShowUpdate(value) {
  emit('update:show', value)
  if (!value) closeModal()
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) resetForm()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.payout-details {
  width: 100%;
  max-width: 470px;

  margin-inline: auto;

  &__eyebrow {
    margin-bottom: 9px;

    color: var(--third-color);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-align: center;
  }
  &__title {
    margin: 0 0 12px;

    color: var(--fourth-color);
    text-align: center;
  }
  &__subtitle {
    max-width: 390px;

    margin: 0 auto 24px;

    color: var(--secondary-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    text-align: center;
  }

  &__summary {
    margin-bottom: 25px;
    padding: 18px 20px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background: var(--bg-fourth-color);
  }
  &__summary-label {
    display: flex;
    justify-content: space-between;
    gap: 12px;

    margin-bottom: 13px;

    color: var(--secondary-color);
    font-size: 12px;
  }
  &__summary-amount {
    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-size: clamp(26px, 5vw, 34px);
    font-weight: 600;
    line-height: 1.3;
  }
  &__summary-notice {
    margin-top: 11px;

    color: var(--secondary-color);
    font-size: 11px;
    line-height: 1.55;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__fields {
    display: grid;
    gap: 14px;
  }
  &__section-caption {
    color: var(--secondary-color);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }
  &__inline-note {
    margin: 10px 0 14px;

    color: var(--secondary-color);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.65;
  }
  &__terms {
    padding-top: 8px;
  }
  &__actions {
    display: flex;
    gap: 12px;
  }
  &__back {
    flex: 0 0 33%;
  }
  &__submit {
    flex: 1 1 auto;
  }
  &__footer-note {
    margin-top: 22px;
    padding-top: 16px;

    border-top: 1px solid var(--border-seventh-color);

    color: var(--secondary-color);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.6;
    text-align: center;
  }
  &__alert {
    padding: 12px 14px;

    border: 1px solid var(--error-color);
    border-radius: 6px;
    background: var(--bg-third-color);

    color: var(--error-color);
    font-size: 12px;
    line-height: 1.5;
  }
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    color: var(--secondary-color);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }
  &__gateway {
    display: flex;
    align-items: flex-start;
    gap: 16px;

    padding: 20px 16px;

    border: 1px solid var(--border-sixth-color);
    border-radius: 9px;
    background: var(--bg-fourth-color);
  }
  &__gateway-icon {
    display: grid;
    flex: 0 0 46px;
    place-items: center;

    width: 46px;
    height: 46px;

    border-radius: 10px;
    background: var(--bg-secondary-color);

    color: var(--fourth-color);
  }
  &__gateway-icon svg {
    width: 24px;
    height: 24px;
  }
  &__gateway strong {
    color: var(--primary-color);
    font-size: 14px;
    font-weight: 600;
  }
  &__gateway p {
    margin-top: 8px;

    color: var(--secondary-color);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.6;
  }

  @media (max-width: $md7) {
    &__actions {
      flex-direction: column-reverse;
    }
    &__back,
    &__submit {
      flex: 0 0 auto;

      width: 100%;
    }
    &__summary {
      padding: 15px;
    }
  }
}

:global(.payment-details-modal .base-modal__frame) {
  padding: clamp(25px, 4vw, 40px);

  border: 1px solid var(--border-fourth-color);
  background-color: var(--bg-primary-color);
}
:global(.payment-details-modal__content) {
  width: 100%;
}
</style>
