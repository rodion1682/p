<template>
  <section class="offer-details">
    <div v-if="isLoading" class="offer-details__loading">
      <LoadingSpinner />
    </div>

    <div v-else class="offer-details__content">
      <div class="offer-details__header">
        <h3 class="offer-details__title">
          {{ $t('Offer Details') }}
        </h3>

        <span class="offer-details__status" :class="statusClass">
          {{ statusLabel }}
        </span>
      </div>

      <div class="offer-details__layout">
        <div class="offer-details__main">
          <div class="offer-details__meta">
            <div class="offer-details__meta-item">
              <span class="offer-details__label">
                {{ $t('Offer ID') }}
              </span>

              <span class="offer-details__value">
                #{{ currentOffer.id ?? row.id ?? '—' }}
              </span>
            </div>

            <div class="offer-details__meta-item">
              <span class="offer-details__label">
                {{ $t('Date / Time') }}
              </span>

              <span class="offer-details__value">
                {{ formattedDate }}
              </span>
            </div>
          </div>

          <div v-if="items.length" class="offer-details__items">
            <div class="offer-details__items-heading">
              <h4 class="offer-details__subtitle">
                {{ $t('Items') }}
              </h4>

              <span class="offer-details__items-count">
                {{ items.length }}
                {{ $t('items') }}
              </span>
            </div>

            <div class="offer-details__items-list">
              <div
                v-for="(item, index) in items"
                :key="`${item.short_name}-${index}`"
                class="offer-details__item"
              >
                <div class="offer-details__item-main">
                  <span class="offer-details__item-number">
                    {{ String(index + 1).padStart(2, '0') }}
                  </span>

                  <div class="offer-details__item-info">
                    <span class="offer-details__label">
                      {{ $t('Item') }}
                    </span>

                    <span class="offer-details__item-name">
                      {{ item.short_name || '—' }}
                    </span>
                  </div>
                </div>

                <div class="offer-details__item-data">
                  <div class="offer-details__item-cell">
                    <span class="offer-details__label">
                      {{ $t('Quantity') }}
                    </span>

                    <span class="offer-details__value">
                      {{ item.quantity ?? '—' }}
                    </span>
                  </div>

                  <div class="offer-details__item-cell">
                    <span class="offer-details__label">
                      {{ $t('My Price') }}
                    </span>

                    <PriceFormatter
                      v-if="hasValue(item.price)"
                      :price="item.price"
                      :currency-code="currencyCode"
                      is-currency
                      raw-fiat
                      skip-conversion
                      size="size-14"
                      class="offer-details__item-price"
                    />

                    <span v-else>—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="offer-details__empty">
            {{ $t('No items available') }}
          </div>

          <div v-if="currentOffer.admin_note" class="offer-details__comment">
            <span class="offer-details__label">
              {{ $t('Admin Comment') }}
            </span>

            <p class="offer-details__comment-text">
              {{ currentOffer.admin_note }}
            </p>
          </div>
        </div>

        <aside class="offer-details__side">
          <div class="offer-details__summary">
            <h4 class="offer-details__subtitle">
              {{ $t('Price Summary') }}
            </h4>

            <div class="offer-details__summary-row">
              <span class="offer-details__label">
                {{ $t('Desired Price') }}
              </span>

              <PriceFormatter
                v-if="hasValue(currentOffer.total_amount)"
                :price="currentOffer.total_amount"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
                class="offer-details__summary-price"
              />

              <span v-else class="offer-details__value"> — </span>
            </div>

            <div
              v-if="hasCounterOffer"
              class="offer-details__summary-row offer-details__summary-row--counter"
            >
              <span class="offer-details__label">
                {{ $t('Admin Offer') }}
              </span>

              <PriceFormatter
                :price="currentOffer.counter_offer_amount"
                :currency-code="currencyCode"
                is-currency
                raw-fiat
                skip-conversion
                size="size-20"
                class="offer-details__summary-price offer-details__summary-price--counter"
              />
            </div>
          </div>

          <div v-if="canRespond" class="offer-details__actions">
            <BaseButton
              type="button"
              variant="primary"
              class="offer-details__button"
              :disabled="isSubmitting"
              @click="emit('accept')"
            >
              {{ isSubmitting ? $t('Processing...') : $t('Accept Offer') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="bordered"
              class="offer-details__button"
              :disabled="isSubmitting"
              @click="emit('decline')"
            >
              {{ $t('Decline Offer') }}
            </BaseButton>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

const props = defineProps({
  row: {
    type: Object,
    required: true,
  },
  offer: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['accept', 'decline'])

const currentOffer = computed(() => {
  return props.offer || props.row?._source || props.row || {}
})

const items = computed(() => {
  const sourceItems = currentOffer.value.items

  if (Array.isArray(sourceItems)) {
    return sourceItems
  }

  return Array.isArray(props.row?.skinItems)
    ? props.row.skinItems.map(item => ({
        short_name: item.title,
        quantity: item.quantity,
        price: item.price,
      }))
    : []
})

const currencyCode = computed(() => {
  return (
    currentOffer.value.currency ||
    props.row?.currencyCode ||
    props.row?.currency ||
    'EUR'
  )
})

const normalizedStatus = computed(() => {
  return String(currentOffer.value.status || props.row?.statusKey || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
})

const hasCounterOffer = computed(() => {
  return (
    currentOffer.value.counter_offer_amount !== null &&
    currentOffer.value.counter_offer_amount !== undefined &&
    currentOffer.value.counter_offer_amount !== ''
  )
})

const canRespond = computed(() => {
  return (
    hasCounterOffer.value &&
    ['counteroffer', 'counter_offer', 'offer'].includes(normalizedStatus.value)
  )
})

const statusLabel = computed(() => {
  const value = normalizedStatus.value

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    counteroffer: 'Offer',
    counter_offer: 'Offer',
    userdeclined: 'Declined',
    user_declined: 'Declined',
    ready_for_payout: 'Ready for Payout',
    payout_processing: 'Payout Processing',
  }

  return labels[value] || props.row?.status || value.replaceAll('_', ' ') || '—'
})

const statusClass = computed(() => {
  const value = normalizedStatus.value

  if (['approved', 'completed', 'ready_for_payout'].includes(value)) {
    return 'is-success'
  }

  if (
    [
      'rejected',
      'cancelled',
      'canceled',
      'userdeclined',
      'user_declined',
      'declined',
    ].includes(value)
  ) {
    return 'is-danger'
  }

  return 'is-pending'
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const formattedDate = computed(() => {
  const raw = currentOffer.value.created_at || props.row?.createdAt

  if (!raw) return '—'

  const numeric = Number(raw)

  const date =
    Number.isFinite(numeric) && numeric > 0
      ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
      : new Date(raw)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.offer-details {
  width: 100%;
  min-width: 0;

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;

    min-height: 160px;
  }

  &__content {
    width: 100%;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    gap: 10px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__title,
  &__subtitle {
    margin: 0;

    color: var(--primary-color);
    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }

  &__title {
    @include adaptiveValue('font-size', 21, 17);
  }

  &__subtitle {
    @include adaptiveValue('font-size', 18, 15);
  }

  &__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 24px;
    padding: 5px 10px;

    border-radius: 4px;

    color: var(--bg-third-color);
    font-family: var(--font-akshar);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;

    text-transform: uppercase;

    &.is-success {
      background-color: var(--success-color);
    }

    &.is-pending {
      background-color: var(--pending-color);
    }

    &.is-danger {
      background-color: var(--error-color);
    }
  }

  &__layout {
    display: grid;
    grid-template-columns:
      minmax(0, 1.5fr)
      minmax(0, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 16, 10);
  }

  &__main,
  &__side {
    min-width: 0;
  }

  &__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 10px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__meta-item {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 7px;

    @include adaptiveValue('padding', 14, 10);

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);
  }

  &__label {
    display: block;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;

    text-transform: uppercase;
  }

  &__value {
    display: block;

    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__items-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__items-count {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 500;
  }

  &__items-list {
    display: grid;
    gap: 5px;

    width: 100%;
    min-width: 0;
  }

  &__item {
    display: grid;
    grid-template-columns:
      minmax(0, 1.5fr)
      minmax(0, 1fr);

    align-items: center;

    width: 100%;
    min-width: 0;

    gap: 12px;

    @include adaptiveValue('padding', 14, 10);

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);
  }

  &__item-main {
    display: flex;
    align-items: center;

    min-width: 0;
    gap: 12px;
  }

  &__item-number {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 36px;

    width: 36px;
    height: 36px;

    border: 1px solid var(--border-primary-color);
    border-radius: 4px;

    background-color: var(--bg-fourth-color);
    color: var(--hint-primary-color);

    font-family: var(--font-akshar);
    font-size: 16px;
    font-weight: 700;
  }

  &__item-info {
    display: flex;
    flex-direction: column;

    min-width: 0;
    gap: 5px;
  }

  &__item-name {
    display: block;

    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__item-data {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: center;

    min-width: 0;
    gap: 10px;
  }

  &__item-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;
    gap: 5px;
  }

  &__item-price {
    justify-content: flex-start;

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 700;
    }
  }

  &__empty {
    padding: 20px;

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    text-align: center;
  }

  &__comment {
    @include adaptiveValue('margin-top', 16, 12);
    @include adaptiveValue('padding', 16, 12);

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);
  }

  &__comment-text {
    margin-top: 8px;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;

    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  &__summary {
    overflow: hidden;

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);
  }

  &__summary > .offer-details__subtitle {
    @include adaptiveValue('padding', 16, 12);

    border-bottom: 1px solid var(--border-primary-color);
  }

  &__summary-row {
    display: flex;
    flex-direction: column;

    min-width: 0;
    gap: 9px;

    @include adaptiveValue('padding', 16, 12);

    & + & {
      border-top: 1px solid var(--border-primary-color);
    }

    &--counter {
      background-color: var(--bg-fourth-color);
    }
  }

  &__summary-price {
    justify-content: flex-start;
    min-width: 0;

    :deep(.price__value),
    :deep(.price__currency) {
      color: var(--primary-color);
      font-family: var(--font-inter);
      font-weight: 700;

      @include adaptiveValue('font-size', 22, 18);
    }

    &--counter {
      :deep(.price__value),
      :deep(.price__currency) {
        color: var(--hint-primary-color);
      }
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 10px;

    @include adaptiveValue('margin-top', 14, 10);
  }

  &__button {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('min-height', 42, 38);

    padding: 8px 10px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;

    text-transform: uppercase;
    white-space: normal;
  }

  @media (max-width: 1200px) {
    &__layout {
      grid-template-columns: minmax(0, 1fr);
    }

    &__actions {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md4) {
    &__item {
      grid-template-columns: minmax(0, 1fr);
    }

    &__item-data {
      padding-top: 10px;
      border-top: 1px solid var(--border-primary-color);
    }
  }

  @media (max-width: $md6) {
    &__meta {
      grid-template-columns: minmax(0, 1fr);
    }

    &__actions {
      grid-template-columns: minmax(0, 1fr);
    }

    &__item-main {
      gap: 9px;
    }

    &__item-number {
      flex-basis: 32px;
      width: 32px;
      height: 32px;
    }
  }
}
</style>
