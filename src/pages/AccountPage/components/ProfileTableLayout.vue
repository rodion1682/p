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
            {{ $t('Count') }}
          </div>

          <div v-if="showPrice" class="profile-layout__th">
            {{ $t(totalLabel) }}
          </div>

          <div v-if="showCoinAmount" class="profile-layout__th">
            {{ $t('Points') }}
          </div>

          <div class="profile-layout__th">
            {{ $t('Status') }}
          </div>

          <div
            v-if="showAction"
            class="profile-layout__th profile-layout__th_action"
          >
            {{ $t(actionLabel || 'Action') }}
          </div>
        </div>

        <div class="profile-layout__table-body">
          <template v-for="(row, index) in rows" :key="row[rowKey] ?? index">
            <div
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
                    {{ row.id ?? '' }}
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
                        {{ formatDate(row.createdAt, 'DD.MM.YYYY') }}
                      </span>

                      <span>
                        {{ formatDate(row.createdAt, 'HH:mm') }}
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
                    {{ row.type || $t('Sell Request')  }}
                  </span>
                </div>

                <div
                  v-if="showSkinName"
                  class="profile-layout__td profile-layout__td_skin"
                >
                  <span
                    class="profile-layout__td-label"
                    :class="{
                      'is-hidden': hideSkinNameLabel,
                    }"
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
                        v-if="item.image && showOrderImage"
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
                          {{ item.title || '' }}
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
                    {{ $t('Count') }}
                  </span>

                  <span class="profile-layout__td-value">
                    {{ row.quantity ?? '' }}
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
                      :is-currency="totalAsCurrency"
                      :price="row.total"
                      :currency-symbol="row.currencySymbol"
                      :currency-code="row.currencyCode || row.currency"
                      size="size-14"
                    />
                  </div>
                </div>

                <div
                  v-if="showCoinAmount"
                  class="profile-layout__td profile-layout__td_coinAmount"
                >
                  <span class="profile-layout__td-label">
                    {{ $t('Points') }}
                  </span>

                  <div class="profile-layout__td-value">
                    <PriceFormatter
                      :price="formatPriceInCoins(row)"
                      skip-conversion
                      size="size-14"
                    />
                  </div>
                </div>

                <div class="profile-layout__td profile-layout__td_status">
                  <span class="profile-layout__td-label">
                    {{ $t('Status') }}
                  </span>

                  <span
                    class="profile-layout__status"
                    :class="statusClass(row.status)"
                  >
                    {{ row.status || '' }}
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
          </template>
        </div>
      </div>

      <div
        v-if="showItemsPerPage || totalPages > 1"
        class="profile-layout__bottom"
      >
        <div v-if="showItemsPerPage" class="profile-layout__per-page">
          <span class="profile-layout__per-page-label">
            {{ $t('Items per page:') }}
          </span>

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
          variant="products"
          @update:current-page="emit('update:current-page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

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

const columns = computed(() => {
  const result = []

  if (props.showIDColumn) result.push('0.9fr')
  if (props.showDataColumn) result.push('1.05fr')
  if (props.showType) result.push('1fr')
  if (props.showSkinName) result.push('1.65fr')
  if (props.showQuantity) result.push('0.7fr')
  if (props.showPrice) result.push('1fr')
  if (props.showCoinAmount) result.push('1fr')

  result.push('1fr')

  if (props.showAction) result.push('0.9fr')

  return result
})

const tableStyles = computed(() => ({
  '--profile-columns': columns.value
    .map(value => `minmax(0, ${value})`)
    .join(' '),
}))

const getSkinItems = row => {
  return row.skinItems?.length ? row.skinItems : [{ title: '', image: '' }]
}

const isRowExpanded = (row, index) => {
  return (
    props.expandedRowKey !== null &&
    props.expandedRowKey !== undefined &&
    props.expandedRowKey === (row[props.rowKey] ?? index)
  )
}

const getCurrencyByCode = code => {
  const normalized = String(code || '').toUpperCase()

  return currencies.value.find(
    currency => String(currency.code).toUpperCase() === normalized,
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

  const currency = getCurrencyByCode(row?.currency)
  const rate = Number(currency?.value) || 1
  const amount = Number(row?.amount) || 0

  const result = props.isAmountMultiplied ? amount * rate : amount / rate

  return result.toFixed(2)
}

const changeItemsPerPage = option => {
  const value = Number(option)

  if (!value || value === Number(props.itemsPerPage)) {
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
    value === 'offer'
  ) {
    return 'is-success'
  }

  if (
    value.includes('pending') ||
    value.includes('processing') ||
    value.includes('awaiting')
  ) {
    return 'is-warn'
  }

  if (
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('declined') ||
    value.includes('denied') ||
    value.includes('rejected') ||
    value.includes('error') ||
    value.includes('failed') ||
    value.includes('deleted')
  ) {
    return 'is-danger'
  }

  return 'is-muted'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-layout {
  display: flex;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 180px;
  }

  &__loading {
    margin: auto;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 150px;
    padding: 24px;

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: var(--bg-third-color);
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  &__content {
    width: 100%;
    min-width: 0;
  }

  &__table-wrap {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }
  }

  &__table-head {
    display: grid;
    grid-template-columns: var(--profile-columns);
    align-items: center;

    width: 100%;
    min-width: 0;
    min-height: 36px;

    gap: 8px;

    @include adaptiveValue('padding-left', 18, 10);
    @include adaptiveValue('padding-right', 18, 10);

    padding-top: 10px;
    padding-bottom: 10px;

    border-radius: 5px;
    background-color: var(--bg-third-color);

    &:not(:last-child) {
      margin-bottom: 2px;
    }
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

    width: 100%;
    min-width: 0;
    gap: 2px;
  }

  &__item {
    width: 100%;
    min-width: 0;

    border-radius: 5px;
  }

  &__tr {
    display: grid;
    grid-template-columns: var(--profile-columns);
    align-items: center;

    width: 100%;
    min-width: 0;
    min-height: 60px;

    gap: 8px;

    @include adaptiveValue('padding-left', 18, 10);
    @include adaptiveValue('padding-right', 18, 10);

    padding-top: 12px;
    padding-bottom: 12px;

    border-radius: 5px;

    background-color: var(--bg-third-color);
    color: var(--primary-color);

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
      }
    }

    &.active {
      border-radius: 5px 5px 0 0;
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

    &_quantity {
      .profile-layout__td-value {
        font-weight: 500;
      }
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
    gap: 2px;

    min-width: 0;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.4;
  }

  &__skins {
    display: flex;
    flex-direction: column;

    min-width: 0;
    width: 100%;
    gap: 8px;
  }

  &__skin {
    display: flex;
    align-items: center;

    width: 100%;
    min-width: 0;
    gap: 8px;
  }

  &__skin-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 45px;
    min-width: 45px;
    height: 40px;

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

    min-width: 0;

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

    max-width: 100%;
    min-height: 23px;

    padding: 5px 8px;

    border-radius: 4px;

    color: var(--primary-color);
    background-color: var(--bg-primary-color);

    font-family: var(--font-akshar);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;

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

    &.is-muted {
      background-color: var(--bg-primary-color);
      color: var(--hint-third-color);
    }
  }

  &__action {
    display: flex;
    justify-content: flex-end;

    width: 100%;
    min-width: 0;

    :deep(.btn) {
      width: fit-content;
      max-width: 100%;
      min-width: 0;
      min-height: 32px;

      padding: 7px 10px;

      font-family: var(--font-inter);
      font-size: 11px;
      font-weight: 500;

      white-space: normal;
    }
  }

  &__expanded {
    width: 100%;
    min-width: 0;

    padding: 15px;

    border: 1px solid var(--border-primary-color);
    border-top: 0;
    border-radius: 0 0 6px 6px;

    background-color: var(--bg-fourth-color);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;

    @include adaptiveValue('gap', 16, 10);
    @include adaptiveValue('margin-top', 22, 15);
  }

  &__per-page {
    display: flex;
    align-items: center;
    gap: 10px;

    min-width: 0;
  }

  &__per-page-label {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
  }

  &__per-page-dropdown {
    width: 90px;
    min-width: 90px;
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

      gap: 12px;
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
      justify-content: space-between;
      align-items: flex-start;

      width: 100%;
      min-width: 0;
      max-width: 100%;

      gap: 12px;

      &-label {
        display: block;
        flex: 0 1 42%;

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
        flex: 1 1 58%;

        min-width: 0;
        max-width: 100%;

        text-align: right;
      }

      &_skin {
        .profile-layout__skins {
          flex: 1 1 58%;
          width: auto;
          min-width: 0;
        }

        .profile-layout__skin {
          justify-content: flex-end;
        }

        .profile-layout__skin-info {
          flex: 0 1 auto;
          text-align: right;
        }
      }

      &_status {
        .profile-layout__status {
          margin-left: auto;
        }
      }

      &_action {
        align-items: center;

        .profile-layout__action {
          flex: 1 1 58%;
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

    &__td {
      gap: 10px;

      &-label {
        flex-basis: 40%;
      }

      &-value {
        flex-basis: 60%;
      }
    }

    &__bottom {
      flex-wrap: wrap;
      justify-content: center;
    }

    &__per-page {
      width: 100%;
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
