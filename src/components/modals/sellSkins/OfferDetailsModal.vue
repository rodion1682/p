<template>
  <BaseModal
    :show="show"
    size="large"
    class="offer-details-modal"
    content-class="offer-details-modal__content"
    :labelledby="titleId"
    @update:show="handleShowUpdate"
    @close="handleBaseModalClose"
  >
    <div class="offer-details">
      <template v-if="isLoading">
        <div class="offer-details__state" role="status" aria-live="polite">
          <LoadingSpinner class="offer-details__loader" />
          <p>{{ $t('Loading...') }}</p>
        </div>
      </template>

      <template v-else-if="!offer">
        <div class="offer-details__state">
          <h2 :id="titleId" class="offer-details__state-title _h5">
            {{ $t('Details not found') }}
          </h2>
          <p>{{ $t('Withdrawal information is unavailable') }}</p>
          <BaseButton
            type="button"
            variant="bordered"
            class="offer-details__state-button"
            @click="requestClose"
          >
            {{ $t('Close') }}
          </BaseButton>
        </div>
      </template>

      <template v-else>
        <header class="offer-details__header">
          <div class="offer-details__heading">
            <span class="offer-details__eyebrow">
              {{ $t('Withdrawals') }}
            </span>
            <h2 :id="titleId" class="offer-details__title _h5">
              {{ $t('Withdrawal details') }}
            </h2>
            <span v-if="offerIdentifier" class="offer-details__reference">
              {{ $t('Withdrawal ID') }} #{{ offerIdentifier }}
            </span>
          </div>

          <div
            v-if="formattedStatus"
            class="offer-details__status"
            :class="`offer-details__status_${statusTone}`"
          >
            <span class="offer-details__status-dot" aria-hidden="true" />
            {{ formattedStatus }}
          </div>
        </header>

        <div v-if="hasAmount || createdAt" class="offer-details__overview">
          <div v-if="hasAmount" class="offer-details__overview-primary">
            <span class="offer-details__overview-label">
              {{ $t('Amount') }}
            </span>
            <strong class="offer-details__amount">
              {{ formattedAmount }}
            </strong>
          </div>

          <div v-if="createdAt" class="offer-details__overview-secondary">
            <span class="offer-details__overview-label">
              {{ $t('Created') }}
            </span>
            <span class="offer-details__overview-date">
              {{ createdAt }}
            </span>
          </div>
        </div>

        <div
          v-for="group in detailGroups"
          :key="group.key"
          class="offer-details__div"
        >
          <h3 class="offer-details__div-title">
            {{ group.title }}
          </h3>

          <dl class="offer-details__details">
            <div
              v-for="item in group.items"
              :key="item.key"
              class="offer-details__detail"
            >
              <dt class="offer-details__detail-label">
                {{ item.label }}
              </dt>
              <dd class="offer-details__detail-value">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </div>

        <div v-if="statusDates.length" class="offer-details__div">
          <h3 class="offer-details__div-title">
            {{ $t('Status history') }}
          </h3>

          <ol class="offer-details__timeline">
            <li
              v-for="item in statusDates"
              :key="item.key"
              class="offer-details__timeline-item"
            >
              <span class="offer-details__timeline-marker" aria-hidden="true" />
              <span class="offer-details__timeline-label">
                {{ item.label }}
              </span>
              <time class="offer-details__timeline-date">
                {{ item.value }}
              </time>
            </li>
          </ol>
        </div>

        <div v-if="adminNote" class="offer-details__note">
          <h3 class="offer-details__div-title">
            {{ $t('Admin note') }}
          </h3>
          <p>{{ adminNote }}</p>
        </div>

        <footer class="offer-details__footer">
          <BaseButton
            type="button"
            variant="bordered"
            class="offer-details__close-button"
            @click="requestClose"
          >
            {{ $t('Close') }}
          </BaseButton>
        </footer>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useCurrencyStore } from '@/stores/currency'
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
const currencyStore = useCurrencyStore()
const offerFlowStore = useOfferFlowStore()

const titleId = 'offer-details-title'

const offer = computed(() => {
  const data = props.modalData

  return (
    props.offerData ||
    data?.withdrawal ||
    data?.offer ||
    data?.data ||
    offerFlowStore.selectedOffer ||
    null
  )
})

const isLoading = computed(() => {
  return Boolean(offerFlowStore.isLoading && !offer.value)
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const firstValue = (...values) => values.find(hasValue)

const readableText = value => {
  if (!hasValue(value)) return ''
  if (typeof value !== 'string' && typeof value !== 'number') return ''

  return String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase())
}

const formatDate = value => {
  if (!hasValue(value)) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const currencyCode = computed(() => {
  const candidate = firstValue(
    offer.value?.currency?.code,
    offer.value?.currency_code,
    offer.value?.currency,
    currencyStore.currentCurrencyCode,
  )

  return typeof candidate === 'string' && /^[a-z]{3}$/i.test(candidate.trim())
    ? candidate.trim().toUpperCase()
    : 'EUR'
})

const rawAmount = computed(() => {
  return firstValue(
    offer.value?.amount,
    offer.value?.sum,
    offer.value?.total,
    offer.value?.sale_price,
  )
})

const hasAmount = computed(() => {
  return hasValue(rawAmount.value) && Number.isFinite(Number(rawAmount.value))
})

const formattedAmount = computed(() => {
  if (!hasAmount.value) return ''

  const amount = Number(rawAmount.value)

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
})

const offerIdentifier = computed(() => {
  return (
    firstValue(
      offer.value?.id,
      offer.value?.withdrawal_id,
      offer.value?.offer_id,
    ) ?? ''
  )
})

const normalizedStatus = computed(() => {
  return String(offer.value?.status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
})

const formattedStatus = computed(() => readableText(normalizedStatus.value))

const statusTone = computed(() => {
  const status = normalizedStatus.value

  if (
    [
      'approved',
      'accepted',
      'completed',
      'success',
      'successful',
      'paid',
      'withdrawn',
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
      'expired',
    ].includes(status)
  ) {
    return 'error'
  }

  if (
    ['pending', 'processing', 'in_process', 'created', 'offer'].includes(status)
  ) {
    return 'pending'
  }

  return 'default'
})

const createdAt = computed(() => formatDate(offer.value?.created_at))
const adminNote = computed(
  () => firstValue(offer.value?.admin_note, offer.value?.adminNote) ?? '',
)

const compactItems = items => items.filter(item => hasValue(item.value))

const detailGroups = computed(() => {
  const current = offer.value
  if (!current) return []

  const country = firstValue(
    current.country?.name,
    current.country?.title,
    current.country_name,
    typeof current.country === 'string' ? current.country : null,
  )

  const groups = [
    {
      key: 'request',
      title: t('Request information'),
      items: compactItems([
        { key: 'status', label: t('Status'), value: formattedStatus.value },
        {
          key: 'updated',
          label: t('Updated'),
          value: formatDate(current.updated_at),
        },
      ]),
    },
    {
      key: 'contact',
      title: t('Contact information'),
      items: compactItems([
        {
          key: 'name',
          label: t('First name'),
          value: firstValue(current.name, current.first_name),
        },
        {
          key: 'surname',
          label: t('Last name'),
          value: firstValue(current.surname, current.last_name),
        },
        { key: 'email', label: t('Email'), value: current.email },
        { key: 'phone', label: t('Phone'), value: current.phone },
      ]),
    },
    {
      key: 'address',
      title: t('Address'),
      items: compactItems([
        { key: 'country', label: t('Country'), value: country },
        { key: 'city', label: t('City'), value: current.city },
        {
          key: 'post-code',
          label: t('Post code'),
          value: firstValue(current.post_code, current.postCode),
        },
        { key: 'address', label: t('Address'), value: current.address },
      ]),
    },
    {
      key: 'payment',
      title: t('Payment information'),
      items: compactItems([
        {
          key: 'method',
          label: t('Payment method'),
          value: readableText(
            firstValue(
              current.payment_method,
              current.withdraw_type,
              current.withdrawType,
            ),
          ),
        },
        {
          key: 'provider',
          label: t('Payment provider'),
          value: readableText(current.payment_provider),
        },
        {
          key: 'transaction',
          label: t('Transaction ID'),
          value: current.provider_transaction_id,
        },
      ]),
    },
  ]

  return groups.filter(group => group.items.length)
})

const statusDates = computed(() => {
  const current = offer.value
  if (!current) return []

  return compactItems([
    {
      key: 'approved',
      label: t('Approved'),
      value: formatDate(current.approved_at),
    },
    {
      key: 'processing',
      label: t('Processing'),
      value: formatDate(current.processing_at),
    },
    {
      key: 'completed',
      label: t('Completed'),
      value: formatDate(current.completed_at),
    },
    {
      key: 'rejected',
      label: t('Rejected'),
      value: formatDate(current.rejected_at),
    },
    {
      key: 'cancelled',
      label: t('Cancelled'),
      value: formatDate(current.cancelled_at),
    },
    { key: 'failed', label: t('Failed'), value: formatDate(current.failed_at) },
  ])
})

// BaseModal already emits both events when its X button / Escape key closes it.
// Forward each event once to support App.vue and v-model:show consumers.
const handleShowUpdate = value => emit('update:show', value)
const handleBaseModalClose = () => emit('close')

// Used only by our own footer / empty-state buttons.
const requestClose = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style lang="scss" scoped>
.offer-details {
  width: 100%;
  min-width: 0;
  max-width: 730px;

  margin: 0 auto;

  font-family: var(--font-inter);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;

    padding-right: 26px;
    padding-bottom: 24px;

    border-bottom: 1px solid var(--border-third-color);
  }

  &__heading {
    min-width: 0;
  }

  &__eyebrow {
    display: block;

    margin-bottom: 10px;

    color: var(--third-color);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    line-height: 1.15;
  }

  &__reference {
    display: block;

    margin-top: 10px;

    color: var(--secondary-color);
    font-size: 13px;

    overflow-wrap: anywhere;
  }

  &__status {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;

    max-width: 100%;

    margin-top: 8px;
    padding: 8px 12px;

    border: 1px solid currentColor;
    border-radius: 6px;
    background: var(--bg-third-color);

    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;

    overflow-wrap: anywhere;

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

  &__status-dot {
    flex: 0 0 7px;

    width: 7px;
    height: 7px;

    border-radius: 50%;
    background: currentColor;
  }

  &__overview {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;

    margin-top: 22px;
    margin-bottom: 28px;
  }

  &__overview-primary,
  &__overview-secondary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;

    min-width: 0;

    padding: 18px 20px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 8px;
    background: var(--bg-fourth-color);
  }

  &__overview-primary {
    flex: 1 1 240px;
  }
  &__overview-secondary {
    flex: 1 1 180px;

    border-color: var(--border-third-color);
    background: var(--bg-secondary-color);
  }

  &__overview-label {
    color: var(--secondary-color);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  &__amount {
    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-size: clamp(26px, 4vw, 36px);
    font-weight: 600;
    line-height: 1.2;

    overflow-wrap: anywhere;
  }

  &__overview-date {
    color: var(--primary-color);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
  }

  &__div {
    margin-top: 24px;
  }

  &__div-title {
    margin: 0 0 12px;

    color: var(--fourth-color);
    font-family: var(--font-texturina);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.25;
  }

  &__details {
    display: grid;
    overflow: hidden;
    gap: 1px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    margin: 0;
    padding: 1px;

    border: 1px solid var(--border-third-color);
    border-radius: 8px;
    background: var(--border-third-color);
  }

  &__detail {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    min-width: 0;

    padding: 15px;

    background: var(--bg-primary-color);
  }

  &__detail-label {
    flex: 0 1 auto;

    color: var(--secondary-color);
    font-size: 12px;
    line-height: 1.45;
  }

  &__detail-value {
    min-width: 0;

    margin: 0;

    color: var(--primary-color);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.45;
    text-align: right;

    overflow-wrap: anywhere;
  }

  &__timeline {
    display: grid;
    gap: 0;

    margin: 0;
    padding: 4px 18px;

    border: 1px solid var(--border-third-color);
    border-radius: 8px;

    list-style: none;
  }

  &__timeline-item {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-width: 0;

    padding: 14px 0 14px 24px;

    &:not(:last-child) {
      border-bottom: 1px solid var(--border-seventh-color);
    }
  }

  &__timeline-marker {
    position: absolute;
    top: 50%;
    left: 0;

    width: 9px;
    height: 9px;

    border: 2px solid var(--third-color);
    border-radius: 50%;

    transform: translateY(-50%);
  }

  &__timeline-label {
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 600;
  }

  &__timeline-date {
    color: var(--secondary-color);
    font-size: 12px;
    line-height: 1.45;
    text-align: right;
  }

  &__note {
    margin-top: 24px;
    padding: 16px 18px;

    border: 1px solid var(--border-fourth-color);
    border-left: 3px solid var(--third-color);
    border-radius: 6px;
    background: var(--bg-secondary-color);

    .offer-details__div-title {
      margin-bottom: 8px;
    }

    p {
      margin: 0;

      color: var(--secondary-color);
      font-size: 13px;
      line-height: 1.65;
      white-space: pre-wrap;

      overflow-wrap: anywhere;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;

    margin-top: 28px;
    padding-top: 20px;

    border-top: 1px solid var(--border-third-color);
  }

  &__close-button {
    width: 170px;
    min-height: 44px;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    min-height: 275px;

    padding: 35px 10px;

    text-align: center;

    p {
      max-width: 400px;

      margin: 0;

      color: var(--secondary-color);
      font-size: 14px;
      line-height: 1.55;
    }
  }

  &__state-title {
    margin: 0;
  }
  &__state-button {
    width: min(100%, 185px);
  }

  @media (max-width: $md6) {
    &__header {
      flex-direction: column;
      gap: 12px;

      padding-right: 24px;
    }
    &__status {
      margin-top: 0;
    }
    &__details {
      grid-template-columns: 1fr;
    }
    &__overview {
      flex-direction: column;
    }
    &__overview-primary,
    &__overview-secondary {
      flex: 0 0 auto;
    }
    &__footer {
      justify-content: stretch;
    }
    &__close-button {
      width: 100%;
    }
  }

  @media (max-width: $md8) {
    &__detail {
      padding: 12px;
    }
    &__timeline-item {
      gap: 10px;
    }
    &__timeline-date {
      max-width: 56%;
    }
  }
}

:global(.offer-details-modal) {
  max-width: 760px;
}

:global(.offer-details-modal .base-modal__frame) {
  padding: clamp(28px, 3.2vw, 42px) clamp(18px, 3.8vw, 40px);

  background: var(--bg-primary-color);
}

:global(.offer-details-modal__content) {
  width: 100%;
}

@media (max-width: $md6) {
  :global(.offer-details-modal .base-modal__frame) {
    padding: 26px 18px 20px;
  }
}
</style>
