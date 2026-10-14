<template>
  <BaseModal
    :show="props.show"
    class="offer-details-modal"
    content-class="offer-details-modal__content"
    size="medium"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div v-if="isLoading" class="offer-details offer-details_loading">
      <LoadingSpinner class="offer-details__loader" />
    </div>

    <div v-else-if="error" class="offer-details offer-details_error">
      <div class="offer-details__state">
        <h2 class="offer-details__state-title _h3">
          {{ $t('Unable to load details') }}
        </h2>

        <p class="offer-details__state-message">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="offer-details__state-button"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
      </div>
    </div>

    <div v-else-if="offer" class="offer-details">
      <div class="offer-details__top">
        <h2 :id="titleId" class="offer-details__title _h3">
          {{ $t('Withdrawal details') }}
        </h2>

        <div
          v-if="formattedStatus"
          class="offer-details__status"
          :class="`offer-details__status_${statusTone}`"
        >
          {{ formattedStatus }}
        </div>
      </div>

      <div v-if="hasSummary" class="offer-details__summary">
        <div v-if="hasAmount" class="offer-details__summary-item">
          <span class="offer-details__summary-label">
            {{ $t('Amount') }}
          </span>

          <strong class="offer-details__summary-value">
            {{ formattedAmount }}
          </strong>
        </div>

        <div v-if="offerIdentifier" class="offer-details__summary-item">
          <span class="offer-details__summary-label">
            {{ $t('Withdrawal ID') }}
          </span>

          <strong class="offer-details__summary-value">
            #{{ offerIdentifier }}
          </strong>
        </div>
      </div>

      <div v-if="generalAttributes.length" class="offer-details__section">
        <div class="offer-details__section-title">
          {{ $t('Request information') }}
        </div>

        <div class="offer-details__attributes">
          <div
            v-for="item in generalAttributes"
            :key="item.label"
            class="offer-details__attribute"
          >
            <span class="offer-details__attribute-label">
              {{ item.label }}
            </span>

            <span class="offer-details__attribute-value">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="contactAttributes.length" class="offer-details__section">
        <div class="offer-details__section-title">
          {{ $t('Contact information') }}
        </div>

        <div class="offer-details__attributes">
          <div
            v-for="item in contactAttributes"
            :key="item.label"
            class="offer-details__attribute"
          >
            <span class="offer-details__attribute-label">
              {{ item.label }}
            </span>

            <span class="offer-details__attribute-value">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="addressAttributes.length" class="offer-details__section">
        <div class="offer-details__section-title">
          {{ $t('Address') }}
        </div>

        <div class="offer-details__attributes">
          <div
            v-for="item in addressAttributes"
            :key="item.label"
            class="offer-details__attribute"
          >
            <span class="offer-details__attribute-label">
              {{ item.label }}
            </span>

            <span class="offer-details__attribute-value">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="paymentAttributes.length" class="offer-details__section">
        <div class="offer-details__section-title">
          {{ $t('Payment information') }}
        </div>

        <div class="offer-details__attributes">
          <div
            v-for="item in paymentAttributes"
            :key="item.label"
            class="offer-details__attribute"
          >
            <span class="offer-details__attribute-label">
              {{ item.label }}
            </span>

            <span class="offer-details__attribute-value">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="statusDates.length" class="offer-details__section">
        <div class="offer-details__section-title">
          {{ $t('Status history') }}
        </div>

        <div class="offer-details__attributes">
          <div
            v-for="item in statusDates"
            :key="item.label"
            class="offer-details__attribute"
          >
            <span class="offer-details__attribute-label">
              {{ item.label }}
            </span>

            <span class="offer-details__attribute-value">
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="offer.admin_note" class="offer-details__note">
        <div class="offer-details__section-title">
          {{ $t('Admin note') }}
        </div>

        <p>
          {{ offer.admin_note }}
        </p>
      </div>

      <div class="offer-details__actions">
        <BaseButton
          type="button"
          variant="hint-bordered"
          class="offer-details__action"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
      </div>
    </div>

    <div v-else class="offer-details offer-details_empty">
      <div class="offer-details__state">
        <h2 class="offer-details__state-title _h3">
          {{ $t('Details not found') }}
        </h2>

        <BaseButton
          type="button"
          variant="hint-bordered"
          class="offer-details__state-button"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
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
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  modalData: {
    type: Object,
    default: null,
  },

  offerData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show'])

const { t } = useI18n()

const offerFlowStore = useOfferFlowStore()

const error = ref('')

const selectedStoreOffer = computed(() => {
  const value =
    offerFlowStore.selectedWithdrawal ??
    offerFlowStore.selectedOffer ??
    offerFlowStore.currentOffer ??
    offerFlowStore.offer

  return typeof value === 'function' ? value() : value
})

const offer = computed(() => {
  return (
    props.offerData ||
    props.modalData?.withdrawal ||
    props.modalData?.offer ||
    props.modalData?.data ||
    selectedStoreOffer.value ||
    null
  )
})

const isLoading = computed(() => {
  const storeLoading =
    offerFlowStore.isLoading ??
    offerFlowStore.loading ??
    offerFlowStore.isFetching

  return Boolean(storeLoading) && !offer.value
})

const titleId = computed(() => {
  return offer.value?.id
    ? `offer-details-title-${offer.value.id}`
    : 'offer-details-title'
})

const offerIdentifier = computed(() => {
  return offer.value?.id ?? offer.value?.offer_id ?? ''
})

const normalizedStatus = computed(() => {
  return String(offer.value?.status || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
})

const formattedStatus = computed(() => {
  return formatText(normalizedStatus.value)
})

const statusTone = computed(() => {
  const status = normalizedStatus.value

  if (
    [
      'accepted',
      'approved',
      'completed',
      'success',
      'successful',
      'paid',
    ].includes(status)
  ) {
    return 'success'
  }

  if (
    [
      'declined',
      'rejected',
      'failed',
      'error',
      'cancelled',
      'canceled',
    ].includes(status)
  ) {
    return 'error'
  }

  if (['pending', 'processing'].includes(status)) {
    return 'pending'
  }

  return 'default'
})

const currencyCode = computed(() => {
  const currency = offer.value?.currency

  if (typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency.trim())) {
    return currency.trim().toUpperCase()
  }

  return 'EUR'
})

const hasAmount = computed(() => {
  return hasValue(offer.value?.amount)
})

const formattedAmount = computed(() => {
  return hasAmount.value ? formatMoney(offer.value.amount) : ''
})

const hasSummary = computed(() => {
  return Boolean(hasAmount.value || offerIdentifier.value)
})

const generalAttributes = computed(() => {
  return compactAttributes([
    {
      label: t('Status'),
      value: formattedStatus.value,
    },
    {
      label: t('Created'),
      value: formatDate(offer.value?.created_at),
    },
    {
      label: t('Updated'),
      value: formatDate(offer.value?.updated_at),
    },
  ])
})

const contactAttributes = computed(() => {
  return compactAttributes([
    {
      label: t('First name'),
      value: offer.value?.name,
    },
    {
      label: t('Last name'),
      value: offer.value?.surname,
    },
    {
      label: t('Email'),
      value: offer.value?.email,
    },
    {
      label: t('Phone'),
      value: offer.value?.phone,
    },
  ])
})

const addressAttributes = computed(() => {
  return compactAttributes([
    {
      label: t('Country'),
      value:
        offer.value?.country?.name ??
        offer.value?.country_name ??
        offer.value?.country?.title ??
        '',
    },
    {
      label: t('City'),
      value: offer.value?.city,
    },
    {
      label: t('Post code'),
      value: offer.value?.post_code,
    },
    {
      label: t('Address'),
      value: offer.value?.address,
    },
  ])
})

const paymentAttributes = computed(() => {
  return compactAttributes([
    {
      label: t('Payment method'),
      value: formatText(offer.value?.payment_method),
    },
    {
      label: t('Payment provider'),
      value: formatText(offer.value?.payment_provider),
    },
    {
      label: t('Transaction ID'),
      value: offer.value?.provider_transaction_id,
    },
  ])
})

const statusDates = computed(() => {
  return compactAttributes([
    {
      label: t('Approved'),
      value: formatDate(offer.value?.approved_at),
    },
    {
      label: t('Processing'),
      value: formatDate(offer.value?.processing_at),
    },
    {
      label: t('Completed'),
      value: formatDate(offer.value?.completed_at),
    },
    {
      label: t('Rejected'),
      value: formatDate(offer.value?.rejected_at),
    },
    {
      label: t('Cancelled'),
      value: formatDate(offer.value?.cancelled_at),
    },
    {
      label: t('Failed'),
      value: formatDate(offer.value?.failed_at),
    },
  ])
})

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function compactAttributes(items) {
  return items.filter(item => {
    return hasValue(item.value)
  })
}

function formatText(value) {
  if (!hasValue(value)) {
    return ''
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatMoney(value) {
  if (!hasValue(value)) {
    return ''
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return ''
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode.value}`
  }
}

function formatDate(value) {
  if (!hasValue(value)) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function handleClose() {
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
    }
  },
)
</script>

<style lang="scss" scoped>
.offer-details {
  width: 100%;
  max-width: 680px;

  margin: 0 auto;

  &_loading,
  &_error,
  &_empty {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 320px;
  }

  &__loader {
    width: 46px;
    height: 46px;
  }

  &__state {
    width: min(100%, 420px);

    margin: auto;

    text-align: center;
  }

  &__state-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__state-message {
    margin: 0;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__state-button {
    width: min(100%, 180px);

    margin: 0 auto;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    padding-bottom: 22px;

    border-bottom: 1px solid var(--border-sixth-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);
    font-weight: 400;
    text-transform: none;
  }

  &__status {
    flex: 0 0 auto;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    text-transform: capitalize;

    &_success {
      color: var(--success-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: var(--pending-color);
    }

    &_default {
      color: var(--secondary-color);
    }
  }

  &__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 22);
    }
  }

  &__summary-item {
    display: flex;
    flex: 1 1 180px;
    flex-direction: column;
    gap: 8px;

    min-width: 0;

    padding: 16px 18px;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
  }

  &__summary-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 120%;
  }

  &__summary-value {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-size: 24px;
    font-weight: 600;
    line-height: 120%;
    text-overflow: ellipsis;
  }

  &__section {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 22);
    }
  }

  &__section-title {
    margin-bottom: 14px;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__attributes {
    display: grid;
    gap: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    border-top: 1px solid var(--border-sixth-color);
  }

  &__attribute {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;

    min-width: 0;

    padding: 13px 14px;

    border-bottom: 1px solid var(--border-sixth-color);

    &:nth-child(odd) {
      border-right: 1px solid var(--border-sixth-color);
    }
  }

  &__attribute-label {
    flex: 0 0 auto;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 145%;
  }

  &__attribute-value {
    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    line-height: 145%;
    text-align: right;

    overflow-wrap: anywhere;
  }

  &__note {
    padding: 16px 18px;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }

    p {
      margin: 0;

      color: var(--secondary-color);
      font-family: var(--font-inter);
      font-size: 13px;
      line-height: 150%;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    padding-top: 22px;

    border-top: 1px solid var(--border-sixth-color);
  }

  &__action {
    width: min(100%, 170px);
    min-height: 40px;
  }

  @media (max-width: $md6) {
    &__top {
      flex-direction: column;
      align-items: flex-start;
    }

    &__attributes {
      grid-template-columns: 1fr;
    }

    &__attribute {
      &:nth-child(odd) {
        border-right: 0;
      }
    }
  }

  @media (max-width: $md7) {
    &__summary {
      flex-direction: column;
    }

    &__summary-item {
      flex: 0 0 auto;
    }

    &__actions {
      justify-content: stretch;
    }

    &__action {
      width: 100%;
      max-width: none;
    }
  }
}

:global(.offer-details-modal) {
  max-width: 760px;
}

:global(.offer-details-modal .base-modal__frame) {
  padding: clamp(28px, 3vw, 46px) clamp(18px, 3vw, 42px);

  background-color: var(--bg-fifth-color);
}

:global(.offer-details-modal__content) {
  width: 100%;
}
</style>
