<template>
  <BaseModal
    :show="show"
    size="medium"
    class="payment-method-modal"
    content-class="payment-method-modal__content"
    :labelledby="titleId"
    @update:show="handleShowUpdate"
  >
    <div class="payout-method">
      <div class="payout-method__eyebrow">{{ $t('WITHDRAWAL') }}</div>
      <h2 :id="titleId" class="payout-method__title _h5">
        {{ $t('Choose payout method') }}
      </h2>

      <div v-if="isLoading" class="payout-method__state" aria-busy="true">
        <LoadingSpinner class="payout-method__loader" />
      </div>

      <div v-else-if="!selectedWithdrawal" class="payout-method__state">
        <div class="payout-method__state-title">
          {{ $t('Withdrawal information is unavailable') }}
        </div>
        <p>{{ $t('Close this window and select the withdrawal again.') }}</p>
        <BaseButton type="button" variant="bordered" @click="closeModal">
          {{ $t('Close') }}
        </BaseButton>
      </div>

      <div v-else>
        <div class="payout-method__summary">
          <div class="payout-method__summary-meta">
            <span>{{ $t('Withdrawal request') }}</span>
            <strong>#{{ selectedWithdrawal.id }}</strong>
          </div>
          <div class="payout-method__summary-main">
            <div>
              <span class="payout-method__summary-caption">{{
                $t('Amount to receive')
              }}</span>
              <div class="payout-method__amount">{{ formattedAmount }}</div>
            </div>
            <span
              class="payout-method__status"
              :class="`payout-method__status_${normalizedStatus}`"
            >
              {{ formattedStatus }}
            </span>
          </div>
        </div>

        <template v-if="normalizedStatus === 'approved'">
          <div class="payout-method__section-heading">
            {{ $t('AVAILABLE PAYMENT METHODS') }}
          </div>

          <div v-if="availableMethods.length" class="payout-method__methods">
            <button
              v-for="method in availableMethods"
              :key="method.code"
              type="button"
              class="payout-method__method"
              :disabled="isSubmitting"
              @click="selectPaymentMethod(method.code)"
            >
              <span class="payout-method__method-symbol" aria-hidden="true">
                <span v-if="method.code === 'sepa'">€</span>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                  <path d="M2.5 10h19M6 15.5h4" />
                </svg>
              </span>
              <span class="payout-method__method-copy">
                <strong>{{ method.title }}</strong>
                <small>{{ method.description }}</small>
              </span>
              <span
                v-if="isSubmitting && selectedMethod === method.code"
                class="payout-method__spinner"
              />
              <span v-else class="payout-method__arrow" aria-hidden="true"
                >→</span
              >
            </button>
          </div>

          <div v-else class="payout-method__notice">
            {{
              lockedMethod
                ? $t(
                    'The selected payout method is currently unavailable. Please contact support.',
                  )
                : $t(
                    'There are no payout methods available right now. Please try again later.',
                  )
            }}
          </div>

          <p v-if="lockedMethod" class="payout-method__helper">
            {{
              $t(
                'The payout method for this approved request cannot be changed.',
              )
            }}
          </p>
        </template>
        <div v-else class="payout-method__notice">
          {{
            $t('Only approved withdrawal requests can receive payout details.')
          }}
        </div>

        <p v-if="error" class="payout-method__error" role="alert">
          {{ error }}
        </p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  show: { type: Boolean, required: true },
  modalData: { type: Object, default: null },
})

const emit = defineEmits(['close', 'update:show', 'select'])
const { t } = useI18n()
const modalStore = useModalStore()
const offerFlowStore = useOfferFlowStore()
const settingsStore = useSettingsStore()
const titleId = 'withdrawal-payment-method-title'

const isSubmitting = ref(false)
const selectedMethod = ref(null)
const error = ref('')

const selectedWithdrawal = computed(
  () =>
    props.modalData?.withdrawal ||
    props.modalData?.offer ||
    props.modalData?.data ||
    offerFlowStore.selectedOffer ||
    null,
)

const normalizedStatus = computed(() =>
  String(selectedWithdrawal.value?.status || '')
    .trim()
    .toLowerCase(),
)

const formattedStatus = computed(() => {
  const status = normalizedStatus.value
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'
})

const lockedMethod = computed(() => {
  const value = selectedWithdrawal.value?.payment_method
  return value === 'sepa' || value === 'card' ? value : null
})

const isLoading = computed(() =>
  Boolean(offerFlowStore.isLoading && !selectedWithdrawal.value),
)

const availableMethods = computed(() => {
  const payouts = settingsStore.settings?.payouts
  if (!payouts?.offer_enabled) return []

  const methods = [
    {
      code: 'sepa',
      title: t('SEPA bank transfer'),
      description: t('Receive your withdrawal directly to your IBAN.'),
      enabled: payouts.payout_sepa_enabled,
    },
    {
      code: 'card',
      title: t('Bank card'),
      description: t('Receive funds through the secure payout provider.'),
      enabled: payouts.payout_card_enabled,
    },
  ]

  return methods.filter(
    method =>
      Boolean(method.enabled) &&
      (!lockedMethod.value || lockedMethod.value === method.code),
  )
})

const formattedAmount = computed(() => {
  const withdrawal = selectedWithdrawal.value
  const value = Number(withdrawal?.amount ?? withdrawal?.payout_amount ?? 0)
  const amount = Number.isFinite(value) ? value : 0
  const currency = /^[A-Z]{3}$/.test(
    String(withdrawal?.currency || '').toUpperCase(),
  )
    ? String(withdrawal.currency).toUpperCase()
    : 'EUR'

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} EUR`
  }
})

const selectPaymentMethod = method => {
  if (
    isSubmitting.value ||
    normalizedStatus.value !== 'approved' ||
    !availableMethods.value.some(item => item.code === method)
  )
    return

  const withdrawal = selectedWithdrawal.value
  if (!withdrawal?.id) {
    error.value = t('Withdrawal information is unavailable')
    return
  }

  error.value = ''
  isSubmitting.value = true
  selectedMethod.value = method

  try {
    offerFlowStore.setSelectedOffer(withdrawal)
    offerFlowStore.setPaymentMethod(method)
    offerFlowStore.setStep('payment')

    // The next modal reads this data through the modal store and Pinia.
    modalStore.close('paymentMethod')
    modalStore.open('payment', { offer: withdrawal, paymentMethod: method })
    emit('select', { offer: withdrawal, paymentMethod: method })
  } catch (err) {
    error.value = err?.message || t('Unable to select the payout method')
  } finally {
    isSubmitting.value = false
    selectedMethod.value = null
  }
}

const closeModal = () => {
  if (isSubmitting.value) return
  modalStore.close('paymentMethod')
  emit('close')
}

const handleShowUpdate = value => {
  emit('update:show', value)
  if (!value) closeModal()
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      error.value = ''
      selectedMethod.value = null
    }
  },
)
</script>

<style lang="scss" scoped>
.payout-method {
  width: 100%;
  max-width: 480px;

  margin-inline: auto;

  font-family: var(--font-inter);

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

  &__description {
    max-width: 370px;

    margin: 0 auto 26px;

    color: var(--secondary-color);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    text-align: center;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    min-height: 200px;

    color: var(--secondary-color);
    text-align: center;

    p {
      font-size: 13px;
      line-height: 1.5;
    }
  }

  &__state-title {
    color: var(--primary-color);
    font-weight: 600;
  }
  &__loader {
    width: 44px;
    height: 44px;
  }

  &__summary {
    margin-bottom: 26px;
    padding: 18px 20px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background: var(--bg-fourth-color);
  }

  &__summary-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;

    margin-bottom: 16px;
    padding-bottom: 12px;

    border-bottom: 1px solid var(--border-seventh-color);

    color: var(--secondary-color);
    font-size: 12px;

    strong {
      color: var(--fourth-color);
      font-weight: 600;
    }
  }

  &__summary-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  &__summary-caption {
    color: var(--secondary-color);
    font-size: 12px;
  }
  &__amount {
    margin-top: 5px;

    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-size: clamp(24px, 5vw, 32px);
    font-weight: 600;
    line-height: 1.2;
  }
  &__status {
    padding: 5px 10px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 100px;

    color: var(--secondary-color);
    font-size: 11px;
    text-transform: capitalize;
  }
  &__status_approved {
    border-color: var(--sixth-color);

    color: var(--third-color);
  }
  &__status_completed {
    color: var(--success-color);
  }

  &__section-heading {
    margin-bottom: 12px;

    color: var(--secondary-color);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.11em;
  }

  &__methods {
    display: grid;
    gap: 12px;
  }
  &__method {
    display: flex;
    align-items: center;
    gap: 14px;

    width: 100%;
    min-height: 78px;

    padding: 14px 15px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 9px;
    background-color: var(--bg-primary-color);

    color: var(--primary-color);
    text-align: left;

    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;

    &:focus-visible {
      outline: 2px solid var(--third-color);
      outline-offset: 3px;
    }
    &:disabled {
      opacity: 0.6;

      cursor: wait;
    }
    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--third-color);
        background-color: var(--bg-fourth-color);

        transform: translateY(-2px);
      }
    }
  }

  &__method-symbol {
    display: flex;
    flex: 0 0 45px;
    align-items: center;
    justify-content: center;

    width: 45px;
    height: 45px;

    border: 1px solid var(--sixth-color);
    border-radius: 9px;
    background-color: var(--bg-secondary-color);

    color: var(--fourth-color);
    font-size: 25px;
    font-weight: 600;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &__method-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;

    min-width: 0;

    strong {
      font-size: 14px;
      font-weight: 600;
    }
    small {
      color: var(--secondary-color);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.45;
    }
  }

  &__arrow {
    color: var(--third-color);
    font-size: 23px;
    line-height: 1;
  }
  &__spinner {
    width: 19px;
    height: 19px;

    border: 2px solid var(--third-color);
    border-radius: 50%;

    animation: payout-spin 0.7s linear infinite;

    border-top-color: transparent;
  }
  &__notice {
    padding: 16px;

    border: 1px solid var(--border-sixth-color);
    border-radius: 8px;
    background-color: var(--bg-third-color);

    color: var(--secondary-color);
    font-size: 13px;
    line-height: 1.55;
  }
  &__helper {
    margin-top: 12px;

    color: var(--secondary-color);
    font-size: 12px;
    line-height: 1.5;
  }
  &__error {
    margin-top: 16px;

    color: var(--error-color);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }
  &__footnote {
    margin: 22px 0 0;
    padding-top: 15px;

    border-top: 1px solid var(--border-seventh-color);

    color: var(--secondary-color);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.65;
    text-align: center;
  }

  @media (max-width: $md7) {
    &__summary {
      padding: 15px;
    }
    &__method {
      gap: 10px;

      min-height: 74px;

      padding: 11px;
    }
    &__method-symbol {
      flex-basis: 40px;

      width: 40px;
      height: 40px;
    }
    &__summary-main {
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 10px;
    }
  }
}

@keyframes payout-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.payment-method-modal .base-modal__frame) {
  padding: clamp(26px, 4vw, 42px);

  border: 1px solid var(--border-fourth-color);
  background-color: var(--bg-primary-color);
}

:global(.payment-method-modal__content) {
  width: 100%;
}
</style>
