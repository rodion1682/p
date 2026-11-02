<template>
  <div class="profile-layout">
    <LoadingSpinner v-if="isLoading" class="profile-layout__loading" />

    <div v-else-if="!rows.length" class="profile-layout__empty _h3">
      {{ emptyText }}
    </div>

    <div v-else class="profile-layout__content">
      <div class="profile-layout__table-wrap">
        <div class="profile-layout__table-head">
          <div
            v-if="showIDColumn"
            class="profile-layout__th profile-layout__th_id"
          >
            {{ $t('ID') }}
          </div>

          <div
            v-if="showDataColumn"
            class="profile-layout__th profile-layout__th_date"
          >
            {{ $t('Date') }}
          </div>

          <div
            v-if="showType"
            class="profile-layout__th profile-layout__th_type"
          >
            {{ $t('Type') }}
          </div>

          <div
            v-if="showSkinName"
            class="profile-layout__th profile-layout__th_skin"
          >
            {{ $t('Item') }}
          </div>
          <div
            v-if="showQuantity"
            class="profile-layout__th profile-layout__th_quantity"
          >
            {{ $t('Count') }}
          </div>
          <div
            v-if="showPrice"
            class="profile-layout__th profile-layout__th_total"
          >
            {{ $t('Summ') }}
          </div>

          <div
            v-if="showCoinAmount"
            class="profile-layout__th profile-layout__th_coinAmount"
          >
            {{ $t('Points') }}
          </div>

          <div class="profile-layout__th profile-layout__th_status">
            {{ $t('Status') }}
          </div>

          <div
            v-if="showAction"
            class="profile-layout__th profile-layout__th_action"
          >
            {{ $t(actionLabel) }}
          </div>
        </div>

        <div class="profile-layout__table-body">
          <template v-for="(row, index) in rows" :key="row[rowKey] ?? index">
            <transition name="fade">
              <div
                v-if="expandedRowKey === (row[rowKey] ?? index)"
                class="profile-layout__expanded"
              >
                <slot name="expanded" :row="row" />
              </div>
            </transition>

            <div
              class="profile-layout__tr"
              :class="{
                active: expandedRowKey === (row[rowKey] ?? index),
              }"
            >
              <div
                v-if="showIDColumn"
                class="profile-layout__td profile-layout__td_id"
              >
                <span>{{ $t('ID') }}</span>

                <span>
                  {{ row.id }}
                </span>
              </div>

              <div
                v-if="showDataColumn"
                class="profile-layout__td profile-layout__td_date"
              >
                <span>{{ $t('Date') }}</span>

                <span class="profile-layout__date">
                  <div>
                    {{ formatDate(row.createdAt, 'DD.MM.YYYY') }}
                  </div>

                  <div>
                    {{ formatDate(row.createdAt, 'HH:mm') }}
                  </div>
                </span>
              </div>

              <div
                v-if="showType"
                class="profile-layout__td profile-layout__td_type"
              >
                <span>{{ $t('Type') }}</span>

                <span>
                  {{ row.type }}
                </span>
              </div>

              <div
                v-if="showSkinName"
                class="profile-layout__td profile-layout__td_skin"
              >
                <span
                  :class="{
                    hide: hideSkinNameLabel,
                  }"
                >
                  {{ $t('Item') }}
                </span>

                <div class="profile-layout__skins">
                  <div
                    v-for="(item, itemIndex) in row.skinItems?.length
                      ? row.skinItems
                      : [{ title: '—', image: '' }]"
                    :key="`${row._key}-skin-${itemIndex}`"
                    class="profile-layout__skin"
                  >
                    <div
                      v-if="item.image && showOrderImage"
                      class="profile-layout__skin-wrapper"
                    >
                      <div class="profile-layout__skin-image _ibg-contain">
                        <img :src="item.image" :alt="item.title || ''" />
                      </div>
                    </div>

                    <div class="profile-layout__skin-info">
                      <div class="profile-layout__skin-name">
                        {{ item.title }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="showQuantity"
                class="profile-layout__td profile-layout__td_quantity"
              >
                <span>
                  {{ $t('Count') }}
                </span>

                <span>
                  {{ row.quantity }}
                </span>
              </div>
              <div
                v-if="showPrice"
                class="profile-layout__td profile-layout__td_total"
              >
                <span>
                  {{ $t(totalLabel) }}
                </span>

                <span>
                  <PriceFormatter
                    :is-currency="totalAsCurrency"
                    :price="row.total"
                    :currency-symbol="row.currencySymbol"
                    :currency-code="row.currencyCode || row.currency"
                    size="size-14"
                  />
                </span>
              </div>

              <div
                v-if="showCoinAmount"
                class="profile-layout__td profile-layout__td_coinAmount"
              >
                <span>
                  {{ $t('Points') }}
                </span>

                <span>
                  <PriceFormatter
                    :price="formatPriceInCoins(row)"
                    skip-conversion
                    size="size-14"
                  />
                </span>
              </div>

              <div class="profile-layout__td profile-layout__td_status">
                <span>
                  {{ $t('Status') }}
                </span>

                <span
                  class="profile-layout__status"
                  :class="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </div>

              <div
                v-if="showAction"
                class="profile-layout__td profile-layout__td_action"
              >
                <span>
                  {{ $t(actionLabel) }}
                </span>

                <span class="profile-layout__action">
                  <slot name="action" :row="row" />
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="showItemsPerPage || totalPages > 1"
        class="profile-layout__bottom"
      >
        <div v-if="showItemsPerPage" class="profile-layout__per-page">
          <div class="profile-layout__per-page-label">
            {{ $t('Items per page:') }}
          </div>

          <BaseDdropdown
            class="profile-layout__per-page-dropdown"
            :label="String(itemsPerPage)"
            absolute
          >
            <BaseCheckbox
              v-for="option in perPageOptions"
              :key="option"
              :model-value="Number(itemsPerPage) === Number(option)"
              class="profile-layout__per-page-option"
              @update:model-value="changeItemsPerPage(option)"
            >
              {{ option }}
            </BaseCheckbox>
          </BaseDdropdown>
        </div>

        <PaginationComponent
          v-if="totalPages > 1"
          class="profile-layout__pagination"
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:current-page="emit('update:current-page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'

import { useCurrencyStore } from '@/stores/currency'
import { formatDate } from '@/utils/formatters'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  isLoading: {
    type: Boolean,
    default: false,
  },

  emptyText: {
    type: String,
    default: 'No data found',
  },

  loadingText: {
    type: String,
    default: 'Loading...',
  },

  totalPages: {
    type: Number,
    default: 1,
  },

  currentPage: {
    type: Number,
    default: 1,
  },

  itemsPerPage: {
    type: Number,
    default: 5,
  },

  perPageOptions: {
    type: Array,
    default: () => [5, 10, 20],
  },

  showItemsPerPage: {
    type: Boolean,
    default: false,
  },

  rowKey: {
    type: String,
    default: '_key',
  },

  totalLabel: {
    type: String,
    default: 'Summ',
  },

  actionLabel: {
    type: String,
    default: '',
  },

  showAction: {
    type: Boolean,
    default: false,
  },

  showSkinName: {
    type: Boolean,
    default: false,
  },

  showType: {
    type: Boolean,
    default: false,
  },

  showCoinAmount: {
    type: Boolean,
    default: false,
  },

  showQuantity: {
    type: Boolean,
    default: false,
  },

  hideSkinNameLabel: {
    type: Boolean,
    default: false,
  },

  showIDColumn: {
    type: Boolean,
    default: false,
  },

  showDataColumn: {
    type: Boolean,
    default: true,
  },

  showPrice: {
    type: Boolean,
    default: true,
  },

  isAmountMultiplied: {
    type: Boolean,
    default: false,
  },

  showOrderImage: {
    type: Boolean,
    default: true,
  },

  totalAsCurrency: {
    type: Boolean,
    default: true,
  },

  expandedRowKey: {
    type: [String, Number, null],
    default: null,
  },
})

const emit = defineEmits(['update:current-page', 'update:items-per-page'])

const currencyStore = useCurrencyStore()

const { currencies } = storeToRefs(currencyStore)

const getCurrencyByCode = code => {
  const normalizedCode = String(code || '').toUpperCase()

  return currencies.value.find(
    currency => String(currency.code).toUpperCase() === normalizedCode,
  )
}

const formatPriceInCoins = row => {
  if (
    row?.coinAmount !== undefined &&
    row?.coinAmount !== null &&
    row?.coinAmount !== ''
  ) {
    return Number(row.coinAmount || 0).toFixed(2)
  }

  const code = row?.currency
  const fiatNumber = row?.amount

  const currency = getCurrencyByCode(code)

  const rate = Number(currency?.value) || 1
  const amount = Number(fiatNumber) || 0

  const result = props.isAmountMultiplied ? amount * rate : amount / rate

  return result.toFixed(2)
}

const changeItemsPerPage = option => {
  const value = Number(option)

  if (!value) {
    return
  }

  if (value === Number(props.itemsPerPage)) {
    return
  }

  emit('update:items-per-page', value)
}

const statusClass = status => {
  const value = String(status || '')
    .toLowerCase()
    .trim()

  if (
    value.includes('accepted') ||
    value.includes('completed') ||
    value.includes('success') ||
    value.includes('approved') ||
    value.includes('ready for payout') ||
    value.includes('offer')
  ) {
    return 'is-success'
  }

  if (
    value.includes('pending') ||
    value.includes('processing') ||
    value.includes('awaiting') ||
    value.includes('payout processing')
  ) {
    return 'is-warn'
  }

  if (
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('declined') ||
    value.includes('denied') ||
    value.includes('error') ||
    value.includes('failed') ||
    value.includes('deleted')
  ) {
    return 'is-danger'
  }

  return 'is-muted'
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-layout {
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;

  &__loading {
    margin: auto;
  }

  &__empty {
    margin: auto;

    text-align: center;
  }

  &__content {
  }

  &__table {
    &-wrap {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 18, 20);
      }
    }

    &-head {
      @media (min-width: $md4) {
        display: flex;
        justify-content: space-between;

        @include adaptiveValue('gap', 40, 20, 1400, 992, 1);
        @include adaptiveValue('padding-bottom', 13, 10);
        @include adaptiveValue('padding-top', 13, 10);

        background-color: var(--bg-primary-color);
        @include adaptiveValue('padding-left', 18, 10, 1400, 992, 1);
        @include adaptiveValue('padding-right', 18, 10, 1400, 992, 1);
        @include adaptiveValue('border-radius', 10, 6);
      }
      @media (max-width: $md4) {
        @include hide-item;
      }
    }

    &-body {
      @media (max-width: $md4) {
        display: flex;
        flex-wrap: wrap;

        gap: 4px;
      }

      @media (max-width: $md6) {
        margin-left: -10px;
        margin-right: -10px;
      }
    }
  }

  &__th {
    @media (min-width: $md4) {
      color: var(--seconday-color);

      font-family: var(--font-condensed);
      font-weight: 700;
      font-size: 12px;
      line-height: 100%;
      text-transform: uppercase;

      &_id {
        flex: 0 0 10%;
      }

      &_date {
        flex: 0 0 10%;

        min-width: 110px;
      }

      &_type {
        flex: 0 0 10%;
      }

      &_skin {
        flex: 1 1 auto;

        min-width: 100px;
        max-width: 300px;
      }

      &_coinAmount {
        flex: 0 1 15%;
      }

      &_total {
        flex: 0 1 15%;
      }

      &_quantity {
        flex: 0 0 10%;
      }

      &_status {
        flex: 0 0 10%;

        min-width: 90px;
      }

      &_action {
        flex: 0 0 90px;

        min-width: 90px;
      }
    }
  }

  &__expanded {
    @media (min-width: $md4) {
      @include adaptiveValue('margin-top', 23, 10);
      @include adaptiveValue('margin-bottom', 33, 10);
    }

    @media (max-width: $md4) {
      margin: 0;

      flex: 1 1 100%;
    }
  }

  &__tr {
    @include adaptiveValue('padding-top', 13, 10);
    @include adaptiveValue('padding-bottom', 13, 10);
    @include adaptiveValue('padding-left', 18, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 18, 10, 1400, 992, 1);
    background-color: #12181c;
    @include adaptiveValue('border-radius', 10, 6);
    @media (min-width: $md4) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      @include adaptiveValue('gap', 40, 20, 1400, 992, 1);
      @include adaptiveValue('min-height', 74, 50);
      &:not(:last-child) {
        margin-bottom: 2px;
      }
    }

    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 2px);
      padding: 10px;
      overflow: hidden;
    }

    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__td {
    @media (max-width: $md4) {
      display: flex;
      justify-content: space-between;

      gap: 20px;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    > span {
      &:first-child {
        @media (min-width: $md4) {
          @include hide-item;
        }

        @media (max-width: $md4) {
          color: var(--seconday-color);
          font-family: var(--font-condensed);
          font-weight: 700;
          font-size: 14px;
          line-height: 24px;
          text-transform: uppercase;
        }
      }

      &:last-child {
        color: var(--primary-color);

        font-family: var(--font-open-sans);
        font-weight: 400;
        font-size: 14px;
        line-height: 24px;
      }

      @media (max-width: $md4) {
        flex: 0 1 50%;
      }
    }

    &_id {
      @media (min-width: $md4) {
        flex: 0 0 10%;

        min-width: 0;

        overflow: hidden;

        span {
          &:last-child {
            display: block;

            width: 100%;
            min-width: 0;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    &_date {
      @media (min-width: $md4) {
        flex: 0 0 10%;

        min-width: 110px;
      }
    }

    &_type {
      @media (min-width: $md4) {
        flex: 0 0 10%;
      }
    }

    &_skin {
      @media (min-width: $md4) {
        flex: 1 1 auto;

        min-width: 100px;
        max-width: 300px;

        overflow: hidden;
      }

      @media (max-width: $md4) {
        flex-direction: column !important;

        row-gap: 5px;
      }

      span {
        &.hide {
          @media (max-width: $md4) {
            @include hide-item;
          }
        }
      }
    }

    &_coinAmount {
      @media (min-width: $md4) {
        flex: 0 1 15%;
      }
    }

    &_quantity {
      @media (min-width: $md4) {
        flex: 0 0 10%;
      }

      span {
        &:last-child {
          font-weight: 700;
        }
      }
    }

    &_total {
      flex: 0 1 15%;

      span {
        &:last-child {
          display: flex;

          justify-self: flex-start;
        }
      }
    }

    &_status {
      flex: 0 0 10%;

      min-width: 90px;

      overflow: hidden;
    }

    &_action {
      flex: 0 0 90px;

      min-width: 90px;

      @media (max-width: $md4) {
        span {
          &:first-child {
            @include hide-item;
          }

          &:last-child {
            flex: 1 1 100% !important;
          }
        }
      }
    }
  }

  &__date {
  }

  &__skins {
    @media (max-width: $md4) {
      overflow: hidden;
    }

    @media (max-width: $md6) {
      margin-left: 0;
    }
  }

  &__skin {
    display: flex;

    flex: 1 1 auto;

    min-width: 0;

    gap: 10px;

    &:not(:last-child) {
      margin-bottom: 10px;
    }

    &-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;

      min-width: 79px;
      min-height: 50px;
      height: fit-content;

      overflow: hidden;

      background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 100%
      );

      @include adaptiveValue('border-radius', 12, 10);

      @media (max-width: $md4) {
        min-width: 59px;
      }
    }

    &-image {
      min-width: 49px;
      height: 37px;
    }

    &-info {
      align-self: center;

      min-width: 0;

      flex: 1 1 auto;
    }

    &-name {
      min-width: 0;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      font-size: 14px;
      line-height: 19px;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 90px;
    min-width: 0;
    height: fit-content;
    padding: 4px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-condensed);
    font-size: 14px;
    font-weight: 700 !important;
    line-height: 14px;
    border-radius: 6px;

    text-align: center;
    text-transform: capitalize;

    @media (min-width: $md4) {
      max-width: 90px;
    }

    @media (max-width: $md4) {
      margin-left: 0;
      margin-right: auto;
    }

    &.is-warn {
      background-color: var(--primary-color);
      background-color: #ffffff1a;
    }
    &.is-muted,
    &.is-danger {
      background-color: var(--error-bg-color);
      color: var(--error-color) !important;
    }

    &.is-success {
      background-color: rgb(77, 221, 139, 0.2);
      color: var(--success-color) !important;
    }
  }

  &__bottom {
  }

  &__per-page {
    @include hide-item;
  }

  &__pagination {
    margin-left: auto;
  }
}
</style>
