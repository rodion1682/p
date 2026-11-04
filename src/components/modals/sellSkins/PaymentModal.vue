<template>
  <BaseModal
    :show="show"
    :persistent="isSubmitting"
    wrapper-classes="sepa-payment__inner"
    @close="handleClose"
  >
    <div class="sepa-payment">
      <div class="sepa-payment__left">
        <BaseButton
          type="button"
          variant="bordered"
          class="sepa-payment__back"
          :disabled="isSubmitting"
          @click="handleBack"
        >
          <span class="sepa-payment__back-icon">‹</span>
          {{ $t('Change Payment Method') }}
        </BaseButton>

        <h2 class="sepa-payment__title _h2">
          {{ $t('SEPA') }}
        </h2>

        <form
          class="sepa-payment__form"
          novalidate
          @submit.prevent="handleConfirm"
        >
          <BaseInput
            v-model="form.name"
            :label="$t('Name')"
            variant="checkout"
            class="sepa-payment__field"
            autocomplete="name"
            :error="errors.name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />

          <BaseInput
            v-model="form.iban"
            :label="$t('IBAN')"
            variant="checkout"
            class="sepa-payment__field"
            autocomplete="off"
            :error="errors.iban"
            :disabled="isSubmitting"
            @update:model-value="formatIban"
            @blur="validateField('iban')"
          />
        </form>
      </div>

      <aside class="sepa-payment__right">
        <div class="sepa-payment__summary">
          <h3 class="sepa-payment__summary-title">
            {{ $t('Total to withdraw:') }}
          </h3>

          <div class="sepa-payment__totals">
            <div class="sepa-payment__total">
              <span class="sepa-payment__total-label">
                {{ $t('You get:') }}
              </span>

              <PriceFormatter
                v-if="hasAmount"
                class="sepa-payment__total-price"
                :price="payoutAmount"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
              />
            </div>
          </div>

          <BaseCheckbox
            v-model="form.acceptTerms"
            class="sepa-payment__terms"
            :error="errors.acceptTerms"
            :disabled="isSubmitting"
            terms
          />

          <p
            v-if="errors.general"
            class="sepa-payment__error _text-error"
            role="alert"
          >
            {{ errors.general }}
          </p>

          <BaseButton
            type="button"
            variant="primary"
            class="sepa-payment__confirm"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            @click="handleConfirm"
          >
            {{ $t('Confirm') }}
          </BaseButton>
        </div>
      </aside>
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
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  paymentMethod: {
    type: [String, Object],
    default: null,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const toast = useToast()

const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const currencyStore = useCurrencyStore()

const isSubmitting = ref(false)

const form = reactive({
  name: '',
  iban: '',
  acceptTerms: false,
})

const errors = reactive({
  name: '',
  iban: '',
  acceptTerms: '',
  general: '',
})

const selectedOffer = computed(() => {
  return offerFlowStore.getSelectedOffer || offerFlowStore.selectedOffer || null
})

const payoutAmount = computed(() => {
  const offer = selectedOffer.value

  const value = offer?.counter_offer_amount ?? offer?.total_amount

  if (value === null || value === undefined || value === '') {
    return null
  }

  const amount = Number(value)

  return Number.isFinite(amount) ? amount : null
})

const hasAmount = computed(() => payoutAmount.value !== null)

const currencyCode = computed(() => {
  return (
    selectedOffer.value?.currency || currencyStore.currentCurrencyCode || 'EUR'
  )
})

const clean = value => String(value ?? '').trim()

const normalizeIban = value => {
  return clean(value).replace(/\s+/g, '').toUpperCase()
}

const formatIban = value => {
  form.iban = normalizeIban(value).replace(/(.{4})(?=.)/g, '$1 ')

  errors.iban = ''
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

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name' && !clean(form.name)) {
    errors.name = t('Name is required')
  }

  if (field === 'iban') {
    if (!clean(form.iban)) {
      errors.iban = t('IBAN is required')
    } else if (!isValidIban(form.iban)) {
      errors.iban = t('Invalid IBAN')
    }
  }

  if (field === 'acceptTerms' && !form.acceptTerms) {
    errors.acceptTerms = t('You must accept the Terms of Use')
  }
}

const validate = () => {
  clearErrors()
  ;['name', 'iban', 'acceptTerms'].forEach(validateField)

  if (!selectedOffer.value?.id) {
    errors.general = t('Offer ID not found')
    return false
  }

  if (Object.values(errors).some(Boolean)) {
    errors.general = t(
      'Please fill in all required fields correctly and accept terms.',
    )
    return false
  }

  return true
}

const initialize = () => {
  clearErrors()

  const contact = offerFlowStore.contactInfo || {}

  form.name = [contact.firstName, contact.lastName].filter(Boolean).join(' ')

  form.iban = ''
  form.acceptTerms = false
}

const handleClose = () => {
  if (isSubmitting.value) return

  clearErrors()
  emit('close')
}

const handleBack = () => {
  if (isSubmitting.value) return

  handleClose()
  modalStore.open('contactInfo')
}

const handleConfirm = async () => {
  if (isSubmitting.value || !validate()) return

  isSubmitting.value = true

  try {
    const offerId = selectedOffer.value.id
    const contact = offerFlowStore.contactInfo || {}

    const nameParts = clean(form.name).split(/\s+/)
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ') || clean(contact.lastName)

    const payload = {
      id: offerId,
      address: contact.address,
      city: contact.city,
      country: contact.country,
      email: contact.email,
      name: contact.firstName,
      surname: contact.lastName,
      phone: contact.phone,
      postCode: contact.postCode,
      currency: currencyCode.value,
      first_name: firstName,
      last_name: lastName,
      account_number: normalizeIban(form.iban),
    }

    const result = await offerFlowStore.completeOffer({
      offerId,
      paymentMethod: 'sepa',
      payload,
    })

    if (!result?.success && result !== true) {
      errors.general = result?.error || t('Failed to process SEPA payout')

      const fieldMapping = {
        first_name: 'name',
        last_name: 'name',
        account_number: 'iban',
        iban: 'iban',
      }

      Object.entries(result?.validationErrors || {}).forEach(
        ([key, messages]) => {
          const field = fieldMapping[key]

          if (field && messages?.length) {
            errors[field] = messages[0]
          }
        },
      )

      return
    }

    toast.success(t('Payout request submitted successfully'))

    handleClose()
    await offerFlowStore.fetchOffers()
  } catch (error) {
    errors.general =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to process SEPA payout')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.show,
  value => {
    if (value) initialize()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal__inner.sepa-payment__inner) {
  max-width: 793px;
}

.sepa-payment {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);

  align-items: start;

  width: 100%;
  min-width: 0;
  gap: 68px;

  &__left,
  &__right {
    width: 100%;
    min-width: 0;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    min-height: 38px;
    padding: 9px 13px;
    gap: 9px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  &__back-icon {
    font-size: 23px;
    line-height: 10px;
  }

  &__title {
    margin: 0;
    color: var(--primary-color);
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 34px;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 18px;

    width: 100%;
    min-width: 0;
  }

  &__field {
    width: 100%;
    min-width: 0;

    :deep(.base-input__label) {
      margin-bottom: 4px;
      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
    }

    :deep(.base-input) {
      min-height: 44px;
      border: 1px solid var(--border-primary-color);
      border-radius: 5px;
      background-color: var(--bg-third-color);
    }

    :deep(.base-input__control) {
      padding-top: 0;
      font-family: var(--font-inter);
      font-size: 13px;
    }
  }

  &__right {
    padding-top: 58px;
  }

  &__summary {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    padding: 24px;

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-eight-color);
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
    margin-bottom: 74px;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;
    gap: 12px;
  }

  &__total-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 13px;
  }

  &__total-price {
    justify-content: flex-end;

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 20px;
      font-weight: 500;
    }
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
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    :deep(a) {
      color: #4285ff;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  &__confirm {
    width: 100%;
    min-height: 43px;
    padding: 10px 14px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__error {
    margin-bottom: 14px;
    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  @media (max-width: $md3) {
    gap: 28px;
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;

    &__right {
      padding-top: 0;
    }

    &__totals {
      margin-bottom: 28px;
    }
  }

  @media (max-width: $md6) {
    &__summary {
      padding: 16px 12px;
    }

    &__summary-title {
      font-size: 20px;
    }

    &__terms {
      :deep(.base-checkbox__label) {
        font-size: 13px;
      }
    }
  }
}
</style>
