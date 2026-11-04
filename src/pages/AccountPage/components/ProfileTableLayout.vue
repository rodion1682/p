<template>
  <div class="profile-layout">
    <div v-if="isLoading" class="profile-layout__state">
      <LoadingSpinner class="profile-layout__loading" />
    </div>

    <div v-else-if="!rows.length" class="profile-layout__empty">
      {{ emptyText }}
    </div>

    <div v-else class="profile-layout__content">
      <div class="profile-layout__table-wrap" :style="tableStyles">
        <div class="profile-layout__table-head">
          <div v-if="showIDColumn" class="profile-layout__th">
            {{ $t('ID') }}
          </div>

          <div v-if="showStatusAfterId" class="profile-layout__th">
            {{ $t('Status') }}
          </div>

          <div v-if="showDataColumn" class="profile-layout__th">
            {{ $t('Date') }}
          </div>

          <div v-if="showType" class="profile-layout__th">
            {{ $t('Type') }}
          </div>

          <div v-if="showSkinName" class="profile-layout__th">
            {{ $t('Item') }}
          </div>

          <div v-if="showQuantity" class="profile-layout__th">
            {{ $t(quantityLabel) }}
          </div>

          <div v-if="showPrice" class="profile-layout__th">
            {{ $t(totalLabel) }}
          </div>

          <div v-if="showCoinAmount" class="profile-layout__th">
            {{ $t(coinLabel) }}
          </div>

          <div v-if="!showStatusAfterId" class="profile-layout__th">
            {{ $t('Status') }}
          </div>

          <div
            v-if="showAction"
            class="profile-layout__th profile-layout__th_action"
          >
            {{ actionLabel ? $t(actionLabel) : '' }}
          </div>
        </div>

        <div class="profile-layout__table-body">
          <div
            v-for="(row, index) in rows"
            :key="row[rowKey] ?? index"
            class="profile-layout__item"
            :class="{
              'is-expanded': isRowExpanded(row, index),
            }"
          >
            <div
              class="profile-layout__tr"
              :class="{
                active: isRowExpanded(row, index),
              }"
            >
              <div
                v-if="showIDColumn"
                class="profile-layout__td profile-layout__td_id"
              >
                <span class="profile-layout__td-label">
                  {{ $t('ID') }}
                </span>

                <span class="profile-layout__td-value">
                  {{ displayValue(row.id) }}
                </span>
              </div>

              <div
                v-if="showStatusAfterId"
                class="profile-layout__td profile-layout__td_status"
              >
                <span class="profile-layout__td-label">
                  {{ $t('Status') }}
                </span>

                <span
                  v-if="hasValue(row.status)"
                  class="profile-layout__status"
                  :class="getStatusClass(row.statusKey || row.status)"
                >
                  {{ row.status }}
                </span>
              </div>

              <div
                v-if="showDataColumn"
                class="profile-layout__td profile-layout__td_date"
              >
                <span class="profile-layout__td-label">
                  {{ $t('Date') }}
                </span>

                <div class="profile-layout__td-value">
                  <div class="profile-layout__date">
                    <span>
                      {{ formatRowDate(row.createdAt) }}
                    </span>

                    <span v-if="row.createdAt">
                      {{ formatRowTime(row.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                v-if="showType"
                class="profile-layout__td profile-layout__td_type"
              >
                <span class="profile-layout__td-label">
                  {{ $t('Type') }}
                </span>

                <span class="profile-layout__td-value">
                  {{ displayValue(row.type) }}
                </span>
              </div>

              <div
                v-if="showSkinName"
                class="profile-layout__td profile-layout__td_skin"
              >
                <span
                  class="profile-layout__td-label"
                  :class="{ 'is-hidden': hideSkinNameLabel }"
                >
                  {{ $t('Item') }}
                </span>

                <div class="profile-layout__td-value profile-layout__skins">
                  <div
                    v-for="(item, itemIndex) in getSkinItems(row)"
                    :key="`${row[rowKey] ?? index}-${itemIndex}`"
                    class="profile-layout__skin"
                  >
                    <div
                      v-if="showOrderImage && item.image"
                      class="profile-layout__skin-wrapper"
                    >
                      <div class="profile-layout__skin-image">
                        <img
                          :src="item.image"
                          :alt="item.title || ''"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div class="profile-layout__skin-info">
                      <span class="profile-layout__skin-name">
                        {{ displayValue(item.title) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="showQuantity"
                class="profile-layout__td profile-layout__td_quantity"
              >
                <span class="profile-layout__td-label">
                  {{ $t(quantityLabel) }}
                </span>

                <span class="profile-layout__td-value">
                  {{ displayValue(row.quantity) }}
                </span>
              </div>

              <div
                v-if="showPrice"
                class="profile-layout__td profile-layout__td_total"
              >
                <span class="profile-layout__td-label">
                  {{ $t(totalLabel) }}
                </span>

                <div class="profile-layout__td-value">
                  <PriceFormatter
                    v-if="hasValue(row.total)"
                    :price="row.total"
                    :is-currency="totalAsCurrency"
                    :currency-symbol="row.currencySymbol"
                    :currency-code="row.currencyCode || row.currency"
                    size="size-14"
                  />

                  <span v-else></span>
                </div>
              </div>

              <div
                v-if="showCoinAmount"
                class="profile-layout__td profile-layout__td_coinAmount"
              >
                <span class="profile-layout__td-label">
                  {{ $t(coinLabel) }}
                </span>

                <div class="profile-layout__td-value">
                  <PriceFormatter
                    v-if="hasValue(row.coinAmount)"
                    :price="formatCoinAmount(row.coinAmount)"
                    skip-conversion
                    size="size-14"
                  />

                  <span v-else></span>
                </div>
              </div>

              <div
                v-if="!showStatusAfterId"
                class="profile-layout__td profile-layout__td_status"
              >
                <span class="profile-layout__td-label">
                  {{ $t('Status') }}
                </span>

                <span
                  class="profile-layout__status"
                  :class="getStatusClass(row.statusKey || row.status)"
                >
                  {{ displayValue(row.status) }}
                </span>
              </div>

              <div
                v-if="showAction"
                class="profile-layout__td profile-layout__td_action"
              >
                <span class="profile-layout__td-label">
                  {{ $t(actionLabel || 'Action') }}
                </span>

                <div class="profile-layout__action">
                  <slot name="action" :row="row" />
                </div>
              </div>
            </div>

            <Transition name="profile-details">
              <div
                v-if="isRowExpanded(row, index)"
                class="profile-layout__expanded"
              >
                <slot name="expanded" :row="row" />
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="profile-layout__bottom">
        <PaginationComponent
          class="profile-layout__pagination"
          :total-pages="totalPages"
          :current-page="currentPage"
          variant="products"
          @update:current-page="emit('update:current-page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

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

  rowKey: {
    type: String,
    default: '_key',
  },

  totalLabel: {
    type: String,
    default: 'Total Price',
  },

  quantityLabel: {
    type: String,
    default: 'Count',
  },

  coinLabel: {
    type: String,
    default: 'Points',
  },

  showStatusAfterId: {
    type: Boolean,
    default: false,
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

const emit = defineEmits(['update:current-page'])

const columns = computed(() => {
  const result = []

  if (props.showIDColumn) {
    result.push('minmax(0, 0.85fr)')
  }

  if (props.showStatusAfterId) {
    result.push('minmax(0, 1.08fr)')
  }

  if (props.showDataColumn) {
    result.push('minmax(0, 1.05fr)')
  }

  if (props.showType) {
    result.push('minmax(0, 1fr)')
  }

  if (props.showSkinName) {
    result.push('minmax(0, 1.6fr)')
  }

  if (props.showQuantity) {
    result.push('minmax(0, 0.65fr)')
  }

  if (props.showPrice) {
    result.push('minmax(0, 1fr)')
  }

  if (props.showCoinAmount) {
    result.push('minmax(0, 1fr)')
  }

  if (!props.showStatusAfterId) {
    result.push('minmax(0, 0.95fr)')
  }

  if (props.showAction) {
    result.push('minmax(62px, 0.75fr)')
  }

  return result
})

const tableStyles = computed(() => ({
  '--profile-columns': columns.value.join(' '),
}))

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const getSkinItems = row => {
  return Array.isArray(row.skinItems)
    ? row.skinItems.filter(item => hasValue(item.title))
    : []
}

const displayValue = value => {
  return hasValue(value) ? value : ''
}

const isRowExpanded = (row, index) => {
  if (props.expandedRowKey === null || props.expandedRowKey === undefined) {
    return false
  }

  return String(props.expandedRowKey) === String(row[props.rowKey] ?? index)
}

const formatRowDate = timestamp => {
  if (!hasValue(timestamp)) return ''

  return formatDate(timestamp, 'DD.MM.YYYY')
}

const formatRowTime = timestamp => {
  if (!hasValue(timestamp)) return ''

  return formatDate(timestamp, 'HH:mm')
}

const formatCoinAmount = amount => {
  const value = Number(amount)

  return Number.isFinite(value) ? value.toFixed(2) : ''
}

const getStatusClass = status => {
  const value = String(status || '')
    .toLowerCase()
    .trim()
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')

  if (
    value.includes('declined') ||
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('denied') ||
    value.includes('rejected') ||
    value.includes('failed') ||
    value.includes('error') ||
    value.includes('deleted')
  ) {
    return 'is-danger'
  }

  if (
    value.includes('counter offer') ||
    value.includes('counteroffer') ||
    value.includes('pending') ||
    value.includes('processing') ||
    value.includes('awaiting')
  ) {
    return 'is-warn'
  }

  if (
    value.includes('accepted') ||
    value.includes('completed') ||
    value.includes('success') ||
    value.includes('approved') ||
    value.includes('paid') ||
    value.includes('ready for payout') ||
    value === 'offer'
  ) {
    return 'is-success'
  }

  return 'is-muted'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-layout {
  width: 100%;
  min-width: 0;

  &__state,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 150px;

    padding: 20px;

    text-align: center;
  }

  &__empty {
    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: var(--bg-third-color);
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  &__loading {
    margin: auto;
  }

  &__content,
  &__table-wrap,
  &__table-body,
  &__item {
    width: 100%;
    min-width: 0;
  }

  &__table-head,
  &__tr {
    display: grid;
    grid-template-columns: var(--profile-columns);

    align-items: center;

    width: 100%;
    min-width: 0;

    column-gap: clamp(4px, 0.8vw, 12px);

    @include adaptiveValue('padding-left', 16, 8);
    @include adaptiveValue('padding-right', 16, 8);

    border-radius: 5px;

    background-color: var(--bg-third-color);
  }

  &__table-head {
    min-height: 36px;

    padding-top: 10px;
    padding-bottom: 10px;

    margin-bottom: 2px;
  }

  &__th {
    min-width: 0;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;

    text-transform: uppercase;
    overflow-wrap: anywhere;

    &_action {
      text-align: right;
    }
  }

  &__table-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__item {
    border-radius: 5px;
  }

  &__tr {
    min-height: 61px;

    padding-top: 12px;
    padding-bottom: 12px;

    transition: background-color 0.3s ease;

    &.active {
      border-radius: 5px 5px 0 0;
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
      }
    }
  }

  &__td {
    display: flex;
    align-items: center;

    min-width: 0;
    max-width: 100%;

    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;

    overflow-wrap: anywhere;

    &-label {
      display: none;
    }

    &-value {
      display: block;

      min-width: 0;
      max-width: 100%;

      color: var(--primary-color);

      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;

      overflow-wrap: anywhere;
    }

    &_id,
    &_date,
    &_type,
    &_quantity,
    &_total,
    &_coinAmount,
    &_skin,
    &_status,
    &_action {
      min-width: 0;
    }

    &_status {
      justify-content: flex-start;
    }

    &_action {
      justify-content: flex-end;
    }
  }

  &__date {
    display: flex;
    flex-direction: column;

    min-width: 0;
    gap: 2px;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.4;
  }

  &__skins {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
    gap: 6px;
  }

  &__skin {
    display: flex;
    align-items: center;

    width: 100%;
    min-width: 0;
    gap: 6px;
  }

  &__skin-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    min-width: 36px;
    height: 36px;

    overflow: hidden;

    border-radius: 4px;
    background-color: var(--bg-fourth-color);
  }

  &__skin-image {
    width: 100%;
    height: 100%;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__skin-info {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__skin-name {
    display: block;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    max-width: 100%;
    min-height: 23px;

    padding: 5px 7px;

    border-radius: 4px;

    background-color: var(--bg-primary-color);
    color: var(--hint-third-color);

    font-family: var(--font-akshar);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.1;

    text-align: center;
    text-transform: uppercase;
    overflow-wrap: anywhere;

    &.is-success {
      background-color: var(--success-color);
      color: #fff;
    }

    &.is-warn {
      background-color: var(--pending-color);
      color: #fff;
    }

    &.is-danger {
      background-color: var(--error-color);
      color: #fff;
    }
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;
    max-width: 100%;

    :deep(.btn),
    :deep(.base-button) {
      display: inline-flex;
      flex: 0 1 auto;

      width: auto;
      max-width: 100%;
      min-width: 0;
      min-height: 30px;

      padding: 6px 7px;

      font-family: var(--font-inter);
      font-size: 10px;
      font-weight: 500;
      line-height: 1.2;

      gap: 4px;
      white-space: nowrap;
    }

    :deep(.offers__button-icon) {
      width: 10px;
      min-width: 10px;
      height: 10px;
    }
  }

  &__expanded {
    width: 100%;
    min-width: 0;

    padding: 14px;

    border: 1px solid var(--border-primary-color);
    border-top: 0;
    border-radius: 0 0 6px 6px;

    background-color: var(--bg-fourth-color);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('margin-top', 22, 15);
  }

  &__pagination {
    width: fit-content;
    max-width: 100%;
    min-width: 0;

    margin-left: auto;
  }

  @media (max-width: $md4) {
    &__table-head {
      display: none;
    }

    &__table-body {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      align-items: start;
      gap: 12px;
    }

    &__item {
      width: 100%;
      min-width: 0;
      height: 100%;
    }

    &__tr {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      width: 100%;
      min-width: 0;
      min-height: 0;
      height: 100%;

      gap: 11px;
      padding: 14px;

      border: 1px solid var(--border-primary-color);
      border-radius: 6px;

      background-color: var(--bg-third-color);

      &.active {
        height: auto;
        border-radius: 6px 6px 0 0;
      }
    }

    &__td {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      width: 100%;
      min-width: 0;
      max-width: 100%;

      gap: 10px;

      &-label {
        display: block;
        flex: 0 1 40%;

        min-width: 0;

        color: var(--hint-third-color);

        font-family: var(--font-inter);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.4;

        text-transform: uppercase;
        overflow-wrap: anywhere;

        &.is-hidden {
          display: none;
        }
      }

      &-value {
        flex: 1 1 60%;

        min-width: 0;
        max-width: 100%;

        text-align: right;
      }

      &_skin {
        .profile-layout__skins {
          flex: 1 1 60%;

          width: auto;
          min-width: 0;
        }

        .profile-layout__skin {
          justify-content: flex-end;
        }

        .profile-layout__skin-info {
          text-align: right;
        }
      }

      &_status {
        .profile-layout__status {
          margin-left: auto;
        }
      }

      &_action {
        .profile-layout__action {
          flex: 1 1 60%;
          justify-content: flex-end;
        }
      }
    }

    &__expanded {
      padding: 12px;
    }
  }

  @media (max-width: $md6) {
    &__table-body {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    &__item {
      width: 100%;
      min-width: 0;
    }

    &__tr {
      padding: 14px 12px;
    }

    &__bottom {
      justify-content: center;
    }

    &__pagination {
      margin-left: 0;
    }
  }
}

.profile-details-enter-active,
.profile-details-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.profile-details-enter-from,
.profile-details-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .profile-layout__tr,
  .profile-details-enter-active,
  .profile-details-leave-active {
    transition: none;
  }
}
</style>
