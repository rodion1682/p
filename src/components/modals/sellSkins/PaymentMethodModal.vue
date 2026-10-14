<template>
  <BaseModal
    :show="props.show"
    class="payment-method-modal"
    content-class="payment-method-modal__content"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div class="payment-method">
      <h2 :id="titleId" class="payment-method__title _h3">
        {{ $t('Withdraw') }}
      </h2>

      <!-- Loading -->
      <div v-if="isLoading" class="payment-method__state">
        <LoadingSpinner class="payment-method__loader" />
      </div>

      <!-- Missing offer -->
      <div v-else-if="!selectedOffer" class="payment-method__state">
        <div class="payment-method__state-title">
          {{ $t('Withdrawal information is unavailable') }}
        </div>

        <p class="payment-method__state-text">
          {{ $t('Please close this window and select the offer again.') }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="payment-method__close-button"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
      </div>

      <template v-else>
        <!-- Withdrawal summary -->
        <div class="payment-method__summary">
          <div
            class="payment-method__summary-row payment-method__summary-row_total"
          >
            <span class="payment-method__summary-label">
              {{ $t('Total') }}:
            </span>

            <PriceFormatter
              :price="internalAmount"
              :balance="true"
              currency-classes="size-[28px]"
              text-classes="text-[28px] font-medium"
              class="payment-method__total-price"
            />
          </div>

          <div class="payment-method__summary-divider" />

          <div class="payment-method__summary-row">
            <span class="payment-method__receive-label">
              {{ $t('You get') }}:
            </span>

            <strong class="payment-method__receive-value">
              {{ formattedPayoutAmount }}
            </strong>
          </div>

          <div
            v-if="commissionPercent > 0 && false"
            class="payment-method__commission"
          >
            {{
              $t('Commission: {percent}%', {
                percent: formatNumber(commissionPercent),
              })
            }}
          </div>
        </div>

        <!-- Payment methods -->
        <div v-if="availableMethods.length" class="payment-method__methods">
          <button
            v-for="method in availableMethods"
            :key="method.code"
            type="button"
            class="payment-method__method"
            :disabled="isSubmitting"
            @click="selectPaymentMethod(method.code)"
          >
            <span
              v-if="isSubmitting && selectedMethod === method.code"
              class="payment-method__method-loader"
              aria-hidden="true"
            />

            <template v-else>
              <!-- Card logo -->
              <span
                v-if="method.code === 'card'"
                class="payment-method__card-brand"
                aria-hidden="true"
              >
                <span class="payment-method__mastercard">
                  <span class="payment-method__mastercard-circle" />
                  <span
                    class="payment-method__mastercard-circle payment-method__mastercard-circle_right"
                  />
                </span>

                <span class="payment-method__visa">VISA</span>
              </span>

              <!-- SEPA logo -->
              <span
                v-else-if="method.code === 'sepa'"
                class="payment-method__sepa"
                aria-hidden="true"
              >
                <span>SE</span>
                <span class="payment-method__sepa-symbol">€</span>
                <span>PA</span>
              </span>

              <span v-else class="payment-method__method-name">
                {{ method.title }}
              </span>
            </template>
          </button>
        </div>

        <!-- No methods enabled -->
        <div v-else class="payment-method__unavailable">
          <div class="payment-method__unavailable-title">
            {{ $t('No withdrawal methods available') }}
          </div>

          <p class="payment-method__unavailable-text">
            {{
              $t(
                'Card and SEPA withdrawals are currently unavailable. Please try again later.',
              )
            }}
          </p>

          <BaseButton
            type="button"
            variant="bordered"
            class="payment-method__close-button"
            @click="handleClose"
          >
            {{ $t('Close') }}
          </BaseButton>
        </div>

        <p v-if="error" class="payment-method__error" role="alert">
          {{ error }}
        </p>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  /*
   * Optional data from:
   *
   * modalStore.open('paymentMethod', {
   *   offer: selectedOffer,
   * })
   */
  modalData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'select'])

const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const settingsStore = useSettingsStore()
const currencyStore = useCurrencyStore()

const error = ref('')
const isSubmitting = ref(false)
const selectedMethod = ref('')

const titleId = 'payment-method-modal-title'

const selectedOffer = computed(() => {
  return (
    props.modalData?.offer ||
    props.modalData?.withdrawal ||
    props.modalData?.data ||
    offerFlowStore.selectedOffer ||
    offerFlowStore.getSelectedOffer ||
    null
  )
})

const payouts = computed(() => {
  return settingsStore.settings?.payouts || null
})

const isLoading = computed(() => {
  return Boolean(offerFlowStore.isLoading) && !selectedOffer.value
})

const internalAmount = computed(() => {
  const offer = selectedOffer.value

  return toNumber(
    offer?.internal_currency_sum ??
      offer?.total_in_game ??
      offer?.amount_in_game ??
      offer?.sum ??
      offer?.amount ??
      offer?.service_price ??
      offer?.user_price ??
      0,
  )
})

const rawPayoutAmount = computed(() => {
  const offer = selectedOffer.value

  return toNumber(
    offer?.payout_amount ??
      offer?.amount_in_fiat ??
      offer?.fiat_amount ??
      offer?.service_price ??
      offer?.amount ??
      offer?.user_price ??
      0,
  )
})

const commissionPercent = computed(() => {
  return toNumber(
    selectedOffer.value?.commission_percent ??
      payouts.value?.card_sale_commission_percent ??
      settingsStore.settings?.payouts?.card_sale_commission_percent ??
      settingsStore.settings?.card_sale_commission_percent ??
      0,
  )
})

const payoutCurrencyCode = computed(() => {
  const currency =
    selectedOffer.value?.currency?.code ||
    selectedOffer.value?.currency_code ||
    selectedOffer.value?.currency ||
    currencyStore.currentCurrencyCode ||
    'EUR'

  if (typeof currency === 'string' && /^[a-z]{3}$/i.test(currency.trim())) {
    return currency.trim().toUpperCase()
  }

  return 'EUR'
})

const formattedPayoutAmount = computed(() => {
  return formatCurrency(rawPayoutAmount.value)
})

const cardEnabled = computed(() => {
  if (!payouts.value) {
    return false
  }

  return Boolean(payouts.value.payout_card_enabled)
})

const sepaEnabled = computed(() => {
  if (!payouts.value) {
    return false
  }

  return Boolean(payouts.value.payout_sepa_enabled)
})

const availableMethods = computed(() => {
  const methods = []

  if (cardEnabled.value) {
    methods.push({
      code: 'card',
      title: 'Credit/Debit card',
    })
  }

  if (sepaEnabled.value) {
    methods.push({
      code: 'sepa',
      title: 'SEPA',
    })
  }

  return methods
})

function toNumber(value) {
  const number = Number.parseFloat(value)

  return Number.isFinite(number) ? number : 0
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(toNumber(value))
}

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: payoutCurrencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(toNumber(value))
  } catch {
    return `${toNumber(value).toFixed(2)} ${
      currencyStore.currentCurrencySymbol || '€'
    }`
  }
}

async function selectPaymentMethod(method) {
  if (
    isSubmitting.value ||
    !selectedOffer.value ||
    !availableMethods.value.some(item => item.code === method)
  ) {
    return
  }

  isSubmitting.value = true
  selectedMethod.value = method
  error.value = ''

  try {
    offerFlowStore.setSelectedOffer(selectedOffer.value)
    offerFlowStore.setPaymentMethod(method)
    offerFlowStore.setStep('payment')

    emit('select', {
      paymentMethod: method,
      offer: selectedOffer.value,
    })

    /*
     * Close this modal before opening the payment form.
     */
    modalStore.close('paymentMethod')

    modalStore.open('payment', {
      paymentMethod: method,
      offer: selectedOffer.value,
    })

    emit('update:show', false)
    emit('close')
  } catch (selectionError) {
    console.error('Unable to select withdrawal method:', selectionError)

    error.value =
      selectionError?.response?.data?.message ||
      selectionError?.message ||
      'Unable to select the withdrawal method'
  } finally {
    isSubmitting.value = false
    selectedMethod.value = ''
  }
}

function handleClose() {
  if (isSubmitting.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

function handleShowUpdate(value) {
  emit('update:show', value)

  if (!value) {
    emit('close')
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      error.value = ''
      selectedMethod.value = ''
      isSubmitting.value = false
    }
  },
)
</script>

<style lang="scss" scoped>
.payment-method {
  width: 100%;

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.05em;
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 220px;

    text-align: center;
  }

  &__loader {
    width: 48px;
    height: 48px;
  }

  &__state-title,
  &__unavailable-title {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__state-text,
  &__unavailable-text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__summary {
    margin-bottom: 28px;
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-height: 42px;

    &_total {
      align-items: center;
    }
  }

  &__summary-label {
    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__total-price {
    justify-content: flex-end;

    color: var(--primary-color);
  }

  &__summary-divider {
    width: calc(100% + 80px);
    height: 1px;

    margin: 18px -40px;

    background-image: linear-gradient(
      to right,
      var(--border-secondary-color) 45%,
      transparent 45%
    );
    background-size: 7px 1px;
  }

  &__receive-label {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
  }

  &__receive-value {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__commission {
    margin-top: 7px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 140%;
    text-align: right;
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__method {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 42px;

    margin: 0;
    padding: 8px 18px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease;

    &:focus-visible {
      outline: 2px solid var(--hint-secondary-color);
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;

      cursor: wait;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--hint-third-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__method-name {
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__card-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }

  &__mastercard {
    position: relative;

    width: 25px;
    height: 16px;
  }

  &__mastercard-circle {
    position: absolute;
    top: 1px;
    left: 1px;

    width: 14px;
    height: 14px;

    border-radius: 50%;
    background-color: #eb001b;

    &_right {
      right: 1px;
      left: auto;

      background-color: #f79e1b;

      mix-blend-mode: screen;
    }
  }

  &__visa {
    color: var(--primary-color);
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-style: italic;
    font-weight: 800;
    line-height: 1;
  }

  &__sepa {
    display: flex;
    align-items: center;

    color: var(--primary-color);
    font-family: Arial, sans-serif;
    font-size: 17px;
    font-weight: 800;
    line-height: 1;
  }

  &__sepa-symbol {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    margin: 0 -1px;

    color: #ffd100;
  }

  &__method-loader {
    width: 19px;
    height: 19px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: payment-method-spin 0.75s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  &__unavailable {
    padding: 22px 0;

    text-align: center;
  }

  &__close-button {
    width: min(100%, 220px);

    margin: 0 auto;
  }

  &__error {
    margin-top: 16px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 150%;
    text-align: center;
  }

  @media (max-width: $md7) {
    &__summary-divider {
      width: calc(100% + 36px);

      margin-right: -18px;
      margin-left: -18px;
    }
  }
}

@keyframes payment-method-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.payment-method-modal) {
  max-width: 480px;
}

:global(.payment-method-modal .base-modal__frame) {
  padding: clamp(30px, 4vw, 40px);

  border: 1px solid var(--hint-primary-color);
  background-color: var(--bg-fifth-color);
}

:global(.payment-method-modal__content) {
  width: 100%;
}
</style>
