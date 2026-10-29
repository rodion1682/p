<template>
  <div class="profile-layout">
    <div v-if="isLoading" class="profile-layout__loading" role="status">
      <LoadingSpinner />
      <span>{{ loadingText }}</span>
    </div>

    <div v-else-if="!rows.length" class="profile-layout__empty">
      {{ emptyText }}
    </div>

    <div v-else class="profile-layout__content">
      <div
        class="profile-layout__table"
        role="table"
        :style="{ '--profile-columns': gridColumns }"
      >
        <div class="profile-layout__head" role="row">
          <div class="profile-layout__th" role="columnheader">
            {{ $t('ID') }}
          </div>

          <div
            v-if="showDataColumn"
            class="profile-layout__th"
            role="columnheader"
          >
            {{ $t('Date / Time') }}
          </div>

          <div v-if="showType" class="profile-layout__th" role="columnheader">
            {{ $t('Type') }}
          </div>

          <div
            v-if="showItemGame"
            class="profile-layout__th"
            role="columnheader"
          >
            {{ $t('Game') }}
          </div>

          <div
            v-if="showSkinName"
            class="profile-layout__th"
            role="columnheader"
          >
            {{ $t('Item') }}
          </div>

          <div
            v-if="showCoinAmount"
            class="profile-layout__th"
            role="columnheader"
          >
            {{ $t('Amount') }}
          </div>

          <div v-if="showPrice" class="profile-layout__th" role="columnheader">
            {{ $t(totalLabel) }}
          </div>

          <div
            v-if="showQuantity"
            class="profile-layout__th"
            role="columnheader"
          >
            {{ $t('Quantity') }}
          </div>

          <div class="profile-layout__th" role="columnheader">
            {{ $t('Status') }}
          </div>

          <div v-if="showAction" class="profile-layout__th" role="columnheader">
            {{ $t(actionLabel) }}
          </div>
        </div>

        <div class="profile-layout__body" role="rowgroup">
          <div
            v-for="(row, index) in rows"
            :key="getRowKey(row, index)"
            class="profile-layout__row-group"
            :class="{
              'is-expanded': expandedRowKey === getRowKey(row, index),
            }"
          >
            <div class="profile-layout__tr" role="row">
              <div class="profile-layout__td profile-layout__td_id" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('ID') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.id ?? '-' }}
                </span>
              </div>

              <div v-if="showDataColumn" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Date / Time') }}
                </span>

                <span class="profile-layout__date">
                  <span>{{ dateText(row.createdAt) }}</span>

                  <span class="profile-layout__date-time">
                    {{ timeText(row.createdAt) }}
                  </span>
                </span>
              </div>

              <div v-if="showType" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Type') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.type || $t('-') }}
                </span>
              </div>

              <div v-if="showItemGame" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Game') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.gameLabel || '—' }}
                </span>
              </div>

              <div
                v-if="showSkinName"
                class="profile-layout__td profile-layout__td_skin"
                role="cell"
              >
                <span
                  v-if="!hideSkinNameLabel"
                  class="profile-layout__mobile-label"
                >
                  {{ $t('Item') }}
                </span>

                <div class="profile-layout__skins">
                  <div
                    v-for="(item, itemIndex) in skinItemsFor(row)"
                    :key="`${getRowKey(row, index)}-skin-${itemIndex}`"
                    class="profile-layout__skin"
                  >
                    <div
                      v-if="showOrderImage && item.image"
                      class="profile-layout__skin-image"
                    >
                      <img
                        :src="resolveImage(item.image)"
                        :alt="formatSkinName(item)"
                        loading="lazy"
                      />
                    </div>

                    <span
                      class="profile-layout__skin-name"
                      :title="formatSkinName(item)"
                    >
                      {{ formatSkinName(item) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="showCoinAmount" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Amount') }}
                </span>

                <PriceFormatter
                  class="profile-layout__price profile-layout__price_coin"
                  :price="toNumber(row.amount)"
                  size="size-16"
                  skip-conversion
                  reverse
                />
              </div>

              <div v-if="showPrice" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t(totalLabel) }}
                </span>

                <PriceFormatter
                  v-if="row.total != null"
                  class="profile-layout__price"
                  :price="row.total"
                  :currency-symbol="row.currencySymbol || ''"
                  :currency-code="currencyCodeFor(row)"
                  :is-currency="totalAsCurrency"
                  :raw-fiat="totalAsCurrency"
                  :skip-conversion="totalAsCurrency"
                  size="size-16"
                  reverse
                />

                <span v-else class="profile-layout__value"> — </span>
              </div>

              <div v-if="showQuantity" class="profile-layout__td" role="cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Quantity') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.quantity ?? '—' }}
                </span>
              </div>

              <div
                class="profile-layout__td profile-layout__td_status"
                role="cell"
              >
                <span class="profile-layout__mobile-label">
                  {{ $t('Status') }}
                </span>

                <span
                  class="profile-layout__status"
                  :class="row.statusClass || statusClass(row.status)"
                >
                  {{ row.status || '—' }}
                </span>
              </div>

              <div
                v-if="showAction"
                class="profile-layout__td profile-layout__td_action"
                role="cell"
              >
                <span class="profile-layout__mobile-label">
                  {{ $t(actionLabel) }}
                </span>

                <div class="profile-layout__action">
                  <slot name="action" :row="row" />
                </div>
              </div>
            </div>

            <Transition name="profile-expand">
              <div
                v-if="expandedRowKey === getRowKey(row, index)"
                class="profile-layout__expanded"
              >
                <slot name="expanded" :row="row" />
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="profile-layout__pagination">
        <PaginationComponent
          :total-pages="totalPages"
          :current-page="currentPage"
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
  rowKey: {
    type: String,
    default: '_key',
  },
  totalLabel: {
    type: String,
    default: 'Total',
  },
  actionLabel: {
    type: String,
    default: 'Action',
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
  showItemGame: {
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

const emit = defineEmits(['update:current-page'])

const currencyStore = useCurrencyStore()
const staticDomain = import.meta.env.VITE_STATIC_DOMAIN || ''

const gridColumns = computed(() => {
  const columns = ['minmax(60px, 0.8fr)']

  if (props.showDataColumn) {
    columns.push('minmax(128px, 1.4fr)')
  }

  if (props.showType) {
    columns.push('minmax(85px, 1fr)')
  }

  if (props.showItemGame) {
    columns.push('minmax(75px, 0.9fr)')
  }

  if (props.showSkinName) {
    columns.push('minmax(180px, 3.4fr)')
  }

  if (props.showCoinAmount) {
    columns.push('minmax(90px, 1fr)')
  }

  if (props.showPrice) {
    columns.push('minmax(90px, 1fr)')
  }

  if (props.showQuantity) {
    columns.push('minmax(65px, 0.8fr)')
  }

  columns.push('minmax(90px, 1fr)')

  if (props.showAction) {
    columns.push('minmax(76px, 0.8fr)')
  }

  return columns.join(' ')
})

const getRowKey = (row, index) => {
  return row?.[props.rowKey] ?? index
}

const skinItemsFor = row => {
  return Array.isArray(row?.skinItems) && row.skinItems.length
    ? row.skinItems
    : [{ title: '—', image: '' }]
}

const formatSkinName = item => {
  const name = String(item?.title || '—')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = name.split('|').map(part => part.trim())

  return parts.length > 1 ? parts.slice(1).join(' | ') : name
}

const resolveImage = raw => {
  const url = String(raw || '').trim()

  if (!url || /^(https?:)?\/\//i.test(url) || /^(data:|blob:)/i.test(url)) {
    return url
  }

  const base = staticDomain.replace(/\/+$/, '')
  const path = url.replace(/^\/+/, '')

  return base ? `${base}/${path}` : `/${path}`
}

const toNumber = raw => {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : 0
  }

  let value = String(raw ?? '').replace(/[^\d,.-]/g, '')

  const comma = value.lastIndexOf(',')
  const dot = value.lastIndexOf('.')

  if (comma >= 0 && dot >= 0) {
    if (comma > dot) {
      value = value.replace(/\./g, '').replace(',', '.')
    } else {
      value = value.replace(/,/g, '')
    }
  } else if (comma >= 0) {
    value = value.replace(',', '.')
  }

  const amount = Number(value)

  return Number.isFinite(amount) ? amount : 0
}

const currencyCodeFor = row => {
  const code = row?.currencyCode || row?.currency?.code || row?.currency

  if (typeof code === 'string' && /^[A-Z]{3}$/i.test(code.trim())) {
    return code.trim().toUpperCase()
  }

  return currencyStore.currentCurrencyCode || 'EUR'
}

const dateText = date => {
  return date ? formatDate(date, 'DD.MM.YYYY') : '—'
}

const timeText = date => {
  return date ? formatDate(date, 'HH:mm') : ''
}

const statusClass = status => {
  const value = String(status || '')
    .trim()
    .toLowerCase()

  if (/success|complete|accepted|approved|sold|ready.for.payout/.test(value)) {
    return 'is-success'
  }

  if (/cancel|declined|denied|failed|error|deleted|refused/.test(value)) {
    return 'is-danger'
  }

  if (/pending|processing|awaiting|payout.processing/.test(value)) {
    return 'is-warn'
  }

  if (/offer|received/.test(value)) {
    return 'is-info'
  }

  return 'is-muted'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.profile-layout {
  width: 100%;
  min-width: 0;

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    min-height: 180px;
    padding: 28px;
    border: 1px solid #303948;
    border-radius: 12px;
    background: #111821;
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    text-align: center;
  }

  &__content,
  &__table,
  &__body {
    width: 100%;
    min-width: 0;
  }

  &__table {
    padding: 10px 32px;
    border: 1px solid #293342;
    border-radius: 12px;
    background: #111821;
  }

  &__head,
  &__tr {
    display: grid;
    grid-template-columns: var(--profile-columns);
    align-items: center;
    gap: clamp(12px, 1.7vw, 24px);
    min-width: 0;
  }

  &__head {
    min-height: 54px;
    padding: 12px 6px;
    border-bottom: 1px solid rgba(153, 161, 176, 0.1);
  }

  &__th {
    min-width: 0;
    color: #667182;
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.4;
    font-weight: 400;
  }

  &__row-group {
    &:not(:last-child) {
      border-bottom: 1px solid rgba(153, 161, 176, 0.1);
    }
  }

  &__tr {
    min-height: 64px;
    padding: 10px 6px;
    transition: background-color 0.2s ease;
  }

  &__td {
    display: flex;
    align-items: center;
    min-width: 0;
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  &__value {
    min-width: 0;
  }

  &__mobile-label {
    display: none;
  }

  &__date {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  &__date-time {
    color: #647084;
    font-size: 11px;
  }

  &__skins {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  &__skin {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  &__skin-image {
    display: flex;
    flex: 0 0 50px;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 43px;
    border-radius: 4px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__skin-name {
    display: -webkit-box;
    min-width: 0;
    overflow: hidden;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    color: #f4f6fb;
    font-weight: 600;
  }

  &__price {
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    min-width: 0;
    color: #f4f6fb;

    :deep(.price__value),
    :deep(.price__currency) {
      color: inherit;
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 700;
      line-height: 1.35;
    }

    :deep(.price__icon) {
      width: 13px;
      min-width: 13px;
      height: 13px;
    }
  }

  &__status {
    display: inline-block;
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;

    &.is-success {
      color: #72d769;
    }

    &.is-danger {
      color: #f25563;
    }

    &.is-warn {
      color: #ffb700;
    }

    &.is-info {
      color: #65a7ff;
    }

    &.is-muted {
      color: #99a1b0;
    }
  }

  &__action {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;

    :deep(.btn) {
      width: 100%;
      min-height: 30px;
      border-radius: 5px;
    }
  }

  &__expanded {
    padding: 14px 6px 20px;
    min-width: 0;
  }

  &__pagination {
    display: flex;
    justify-content: center;
    margin-top: 28px;
  }

  @media (max-width: 1050px) {
    &__table {
      padding: 0;
      border: 0;
      background: transparent;
    }

    &__head {
      display: none;
    }

    &__body {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    &__row-group {
      min-width: 0;
      padding: 16px;
      border: 1px solid #303948;
      border-radius: 10px;
      background: #111821;

      &:not(:last-child) {
        border-bottom: 1px solid #303948;
      }
    }

    &__tr {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 15px 12px;
      padding: 0;
      min-height: 0;
    }

    &__td {
      align-items: flex-start;
      flex-direction: column;
      justify-content: flex-start;
      gap: 6px;
      min-width: 0;
    }

    &__td_skin,
    &__td_action {
      grid-column: 1 / -1;
    }

    &__mobile-label {
      display: block;
      color: #8995a7;
      font-weight: 400;
      font-size: 11px;
    }

    &__skins {
      gap: 10px;
    }

    &__skin-name {
      -webkit-line-clamp: 3;
    }

    &__action {
      :deep(.btn) {
        max-width: 180px;
      }
    }
  }

  @media (max-width: 640px) {
    &__body {
      grid-template-columns: minmax(0, 1fr);
    }

    &__row-group {
      padding: 16px;
    }

    &__tr {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    &__td {
      display: grid;
      grid-template-columns: minmax(78px, 0.8fr) minmax(0, 1.2fr);
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(153, 161, 176, 0.08);
    }

    &__td_skin,
    &__td_action {
      grid-column: auto;
    }

    &__td_skin {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    &__td:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    &__mobile-label {
      font-size: 12px;
    }

    &__date,
    &__price,
    &__value,
    &__status {
      justify-self: end;
      text-align: right;
    }

    &__skins {
      width: 100%;
    }

    &__action {
      justify-content: flex-end;

      :deep(.btn) {
        max-width: 165px;
      }
    }

    &__pagination {
      margin-top: 22px;
    }
  }
}

.profile-expand-enter-active,
.profile-expand-leave-active {
  transition: opacity 0.2s ease;
}

.profile-expand-enter-from,
.profile-expand-leave-to {
  opacity: 0;
}
</style>
