<template>
  <div class="details">
    <LoadingSpinner v-if="isLoading" class="details__loading" />

    <div v-else class="details__content">
      <div class="details__title _h5">
        {{ $t('Offer Details') }}
      </div>

      <div class="details__layout">
        <div class="details__main">
          <div class="details__meta">
            <div class="details__meta-item">
              <div class="details__label">
                {{ $t('ID') }}
              </div>

              <div class="details__value">
                {{ currentOffer?.id || row?.id || '—' }}
              </div>
            </div>

            <div class="details__meta-item">
              <div class="details__label">
                {{ $t('Date/time') }}
              </div>

              <div class="details__value">
                {{ getDate(currentOffer?.created_at || row?.createdAt) }}
              </div>
            </div>
          </div>

          <div v-if="items.length" class="details__items">
            <div
              v-for="(item, index) in items"
              :key="`${item.short_name}-${index}`"
              class="details__item"
            >
              <div class="details__item-main">
                <div class="details__item-number">
                  {{ String(index + 1).padStart(2, '0') }}
                </div>

                <div class="details__item-info">
                  <div class="details__label">
                    {{ $t('Item') }}
                  </div>

                  <div class="details__item-name">
                    {{ item.short_name || '—' }}
                  </div>
                </div>
              </div>

              <div class="details__item-grid">
                <div class="details__item-cell">
                  <div class="details__label">
                    {{ $t('Quantity') }}
                  </div>

                  <div class="details__value">
                    {{ item.quantity ?? '—' }}
                  </div>
                </div>

                <div class="details__item-cell">
                  <div class="details__label">
                    {{ $t('My price') }}
                  </div>

                  <div class="details__price">
                    {{ formatPriceWithSymbol(item.price) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentOffer?.admin_note" class="details__comment">
            <div class="details__label">
              {{ $t('Comment') }}
            </div>

            <div class="details__comment-value">
              {{ currentOffer.admin_note }}
            </div>
          </div>
        </div>

        <div class="details__side">
          <div class="details__price-block">
            <div class="details__price-row">
              <div class="details__price-info">
                <div class="details__label">
                  {{ $t('Desired price') }}
                </div>

                <div class="details__price-value">
                  {{ formatPriceWithSymbol(currentOffer?.total_amount) }}
                </div>
              </div>
            </div>

            <div
              v-if="hasCounterOffer"
              class="details__price-row details__price-row_offer"
            >
              <div class="details__price-info">
                <div class="details__label">
                  {{ $t('Offer price') }}
                </div>

                <div class="details__price-value">
                  {{
                    formatPriceWithSymbol(currentOffer?.counter_offer_amount)
                  }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="canRespond" class="details__actions">
            <BaseButton
              variant="primary"
              class="details__button"
              :disabled="isSubmitting"
              @click="$emit('accept')"
            >
              <span v-if="isSubmitting">
                {{ $t('Processing...') }}
              </span>

              <span v-else>
                {{ $t('Accept') }}
              </span>
            </BaseButton>

            <BaseButton
              variant="secondary"
              class="details__button"
              :disabled="isSubmitting"
              @click="$emit('decline')"
            >
              {{ $t('Decline') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import { useCurrencyStore } from '@/stores/currency'

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

defineEmits(['accept', 'decline'])

const currencyStore = useCurrencyStore()

const currentOffer = computed(() => {
  return props.offer || props.row?._source || props.row || {}
})

const items = computed(() => {
  return Array.isArray(currentOffer.value?.items)
    ? currentOffer.value.items
    : []
})

const normalizedStatus = computed(() => {
  return String(currentOffer.value?.status || props.row?.statusKey || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
})

const hasCounterOffer = computed(() => {
  return (
    currentOffer.value?.counter_offer_amount !== null &&
    currentOffer.value?.counter_offer_amount !== undefined
  )
})

const canRespond = computed(() => {
  return (
    hasCounterOffer.value &&
    ['counteroffer', 'counter_offer', 'offer'].includes(normalizedStatus.value)
  )
})

const rowCurrency = computed(() => {
  return currentOffer.value?.currency || props.row?.currency || 'EUR'
})

const currencySymbol = computed(() => {
  const currency = currencyStore.currencies.find(currency => {
    return (
      String(currency.code).toUpperCase() ===
      String(rowCurrency.value).toUpperCase()
    )
  })

  return currency?.symbol || rowCurrency.value
})

const formatPrice = price => {
  const value = Number(price)

  if (!Number.isFinite(value)) {
    return '0.00'
  }

  return value.toFixed(2)
}

const formatPriceWithSymbol = price => {
  return `${currencySymbol.value} ${formatPrice(price)}`
}

const getDate = value => {
  if (!value) {
    return '—'
  }

  const timestamp = Number(value)

  if (!timestamp) {
    return '—'
  }

  const date = new Date(
    timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp,
  )

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')

  const month = String(date.getMonth() + 1).padStart(2, '0')

  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')

  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.details {
  width: 100%;

  &__loading {
    margin: auto;
  }

  &__content {
    width: 100%;
  }

  &__title {
    text-transform: uppercase;
    font-weight: 600;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__layout {
    display: flex;

    @include adaptiveValue('gap', 16, 10);

    @media (max-width: $md3) {
      flex-direction: column;
    }
  }

  &__main {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__side {
    flex: 0 0 280px;

    @media (max-width: $md2) {
      flex: 0 0 240px;
    }

    @media (max-width: $md3) {
      flex: 1 1 100%;
    }
  }

  &__meta {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    border: 1px solid var(--border-secondary-color);

    background-color: var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }

    @media (max-width: $md5) {
      grid-template-columns: 1fr;
    }
  }

  &__meta-item {
    @include adaptiveValue('padding', 16, 10);

    &:not(:last-child) {
      border-right: 1px solid var(--border-secondary-color);

      @media (max-width: $md5) {
        border-right: 0;

        border-bottom: 1px solid var(--border-secondary-color);
      }
    }
  }

  &__label {
    color: var(--secondary-color);

    font-family: var(--font-barlow);

    font-size: 12px;
    font-weight: 500;
    line-height: 120%;

    text-transform: uppercase;

    opacity: 0.7;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__value {
    color: var(--primary-color);

    font-family: var(--font-barlow);

    font-size: 16px;
    font-weight: 500;
    line-height: 130%;
  }

  &__items {
    width: 100%;
  }

  &__item {
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    @include adaptiveValue('gap', 20, 10);

    border: 1px solid var(--border-secondary-color);

    background-color: var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }

    @media (max-width: $md5) {
      flex-direction: column;

      gap: 0;
    }
  }

  &__item-main {
    display: flex;
    align-items: center;

    flex: 1 1 auto;

    min-width: 0;

    @include adaptiveValue('gap', 16, 10);

    @include adaptiveValue('padding', 16, 10);
  }

  &__item-number {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 46px;

    width: 46px;
    height: 46px;

    background-color: var(--bg-fourth-color);

    color: var(--secondary-color);

    font-family: var(--font-condensed);

    font-size: 18px;
    font-weight: 600;
    line-height: 1;
  }

  &__item-info {
    min-width: 0;
  }

  &__item-name {
    overflow: hidden;

    color: var(--primary-color);

    font-family: var(--font-condensed);

    @include adaptiveValue('font-size', 20, 18);

    font-weight: 500;
    line-height: 120%;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-grid {
    display: grid;

    grid-template-columns: repeat(2, minmax(110px, 1fr));

    border-left: 1px solid var(--border-secondary-color);

    @media (max-width: $md5) {
      border-top: 1px solid var(--border-secondary-color);

      border-left: 0;
    }
  }

  &__item-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;

    min-width: 0;

    @include adaptiveValue('padding', 16, 10);

    &:not(:last-child) {
      border-right: 1px solid var(--border-secondary-color);
    }
  }

  &__price {
    color: var(--primary-color);

    font-family: var(--font-barlow);

    font-size: 16px;
    font-weight: 700;
    line-height: 120%;
  }

  &__comment {
    border: 1px solid var(--border-secondary-color);

    background-color: var(--bg-primary-color);

    @include adaptiveValue('padding', 16, 10);

    &:not(:first-child) {
      @include adaptiveValue('margin-top', 8, 4);
    }
  }

  &__comment-value {
    color: var(--primary-color);

    font-family: var(--font-barlow);

    font-size: 14px;
    line-height: 150%;

    white-space: pre-wrap;
    word-break: break-word;
  }

  &__price-block {
    border: 1px solid var(--border-secondary-color);

    background-color: var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }
  }

  &__price-row {
    display: flex;
    align-items: center;

    min-height: 82px;

    @include adaptiveValue('padding', 16, 10);

    &:not(:last-child) {
      border-bottom: 1px solid var(--border-secondary-color);
    }

    &_offer {
      background-color: var(--bg-third-color);

      .details__price-value {
        color: var(--hint-primary-color);
      }
    }
  }

  &__price-info {
    width: 100%;
  }

  &__price-value {
    color: var(--primary-color);

    font-family: var(--font-condensed);

    @include adaptiveValue('font-size', 28, 22);

    font-weight: 600;
    line-height: 100%;
  }

  &__actions {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 8, 4);

    @media (max-width: $md3) {
      flex-direction: row;
    }

    @media (max-width: $md6) {
      flex-direction: column;
    }
  }

  &__button {
    width: 100%;

    text-transform: uppercase;

    @media (max-width: $md3) {
      flex: 1 1 50%;
    }
  }
}
</style>
