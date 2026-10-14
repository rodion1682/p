<template>
  <div class="order-history">
    <div class="order-history__heading">
      <div class="order-history__subtitle _h4">
        {{ $t('My Orders') }}
      </div>
    </div>

    <div
      v-if="isLoading"
      class="order-history__box order-history__loading"
      aria-live="polite"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="order-history__skeleton"
      >
        <span class="order-history__skeleton-line" />
        <span class="order-history__skeleton-line" />
        <span class="order-history__skeleton-line" />
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!items.length"
      class="order-history__box order-history__empty"
    >
      <div class="order-history__empty-title _h3">
        {{ $t('No orders found') }}
      </div>

      <p class="order-history__empty-text">
        {{ $t('Your completed orders will appear here.') }}
      </p>
    </div>

    <!-- Orders -->
    <div v-else class="order-history__box">
      <table class="order-history__table">
        <colgroup>
          <col class="order-history__column order-history__column_id" />
          <col class="order-history__column order-history__column_date" />
          <col class="order-history__column order-history__column_item" />
          <col class="order-history__column order-history__column_amount" />
          <col class="order-history__column order-history__column_status" />
        </colgroup>

        <thead class="order-history__head">
          <tr class="order-history__row order-history__row_head">
            <th class="order-history__header">
              {{ $t('ID') }}
            </th>

            <th class="order-history__header">
              {{ $t('Date') }}
            </th>

            <th class="order-history__header">
              {{ $t('Item') }}
            </th>

            <th class="order-history__header order-history__header_amount">
              {{ $t('Total') }}
            </th>

            <th class="order-history__header order-history__header_status">
              {{ $t('Status') }}
            </th>
          </tr>
        </thead>

        <tbody class="order-history__body">
          <tr
            v-for="(item, index) in paginatedItems"
            :key="`${item.id}-${index}`"
            class="order-history__row"
          >
            <td
              class="order-history__cell order-history__cell_id"
              :data-label="$t('ID')"
            >
              <span class="order-history__value"> #{{ item.id }} </span>
            </td>

            <td
              class="order-history__cell order-history__cell_date"
              :data-label="$t('Date')"
            >
              <div class="order-history__date">
                <span class="order-history__date-day">
                  {{ formatDate(item.created_at, 'DD.MM.YYYY') }}
                </span>

                <span class="order-history__date-time">
                  {{ formatDate(item.created_at, 'HH:mm') }}
                </span>
              </div>
            </td>

            <td
              class="order-history__cell order-history__cell_item"
              :data-label="$t('Item')"
            >
              <div class="order-history__item">
                <div v-if="item.img_url" class="order-history__item-image">
                  <img
                    :src="getItemImageUrl(item.img_url)"
                    :alt="item.title"
                    loading="lazy"
                  />
                </div>

                <div class="order-history__item-info">
                  <span class="order-history__item-title">
                    {{ item.title }}
                  </span>

                  <span
                    v-if="item.item_type || item.item_quality"
                    class="order-history__item-meta"
                  >
                    {{ getItemMeta(item) }}
                  </span>
                </div>
              </div>
            </td>

            <td
              class="order-history__cell order-history__cell_amount"
              :data-label="$t('Total')"
            >
              <PriceFormatter
                :price="item.sum"
                size="size-24"
                class="order-history__price"
              />
            </td>

            <td
              class="order-history__cell order-history__cell_status"
              :data-label="$t('Status')"
            >
              <span
                class="order-history__status"
                :class="statusClass(item.status)"
              >
                {{ formatStatus(item.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="order-history__pagination">
        <Pagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import Pagination from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import axios from '@/plugins/axios'
import { formatDate } from '@/utils/formatters'

const items = ref([])
const isLoading = ref(false)
const currentPage = ref(1)

const itemsPerPage = 8

const normalizeOrder = order => {
  const orderItems = Array.isArray(order.items) ? order.items : []

  if (!orderItems.length) {
    return [
      {
        id: order.order_id ?? order.id,
        created_at: order.created_at,
        title: order.name ?? order.title ?? 'Unknown Item',
        quantity: order.quantity ?? 1,
        sum: order.total_price_in_game ?? order.sum ?? 0,
        currency: order.currency ?? 'Credits',
        status: order.status ?? '',
        img_url: order.img_url ?? '',
        item_quality: order.item_quality ?? '',
        item_type: order.item_type ?? '',
      },
    ]
  }

  return orderItems.map((item, index) => {
    return {
      ...item,

      id: item.order_id ?? item.id ?? order.order_id ?? order.id ?? index,

      created_at: item.created_at ?? order.created_at,

      title:
        item.name ?? item.title ?? order.name ?? order.title ?? 'Unknown Item',

      quantity: item.quantity ?? order.quantity ?? 1,

      sum:
        item.total_price_in_game ??
        item.sum ??
        item.price ??
        order.total_price_in_game ??
        order.sum ??
        0,

      currency: item.currency ?? order.currency ?? 'Credits',

      status: item.status ?? order.status ?? '',

      img_url: item.img_url ?? order.img_url ?? '',

      item_quality: item.item_quality ?? order.item_quality ?? '',

      item_type: item.item_type ?? order.item_type ?? '',
    }
  })
}

const fetchOrders = async () => {
  isLoading.value = true

  try {
    const response = await axios.get('/transactions/orders')
    const orders = response.data?.data ?? []

    items.value = Array.isArray(orders) ? orders.flatMap(normalizeOrder) : []
  } catch (error) {
    console.error('Error fetching orders:', error)
    items.value = []
  } finally {
    isLoading.value = false
  }
}

const getTimestamp = value => {
  if (!value) {
    return 0
  }

  if (typeof value === 'number') {
    return value < 1000000000000 ? value * 1000 : value
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortedItems = computed(() => {
  return [...items.value].sort((firstItem, secondItem) => {
    return (
      getTimestamp(secondItem.created_at) - getTimestamp(firstItem.created_at)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedItems.value.length / itemsPerPage))
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage

  return sortedItems.value.slice(start, end)
})

const getItemImageUrl = imgUrl => {
  if (!imgUrl) {
    return ''
  }

  if (/^https?:\/\//i.test(imgUrl)) {
    return imgUrl
  }

  const staticDomain = import.meta.env.VITE_STATIC_DOMAIN ?? ''
  const normalizedDomain = staticDomain.replace(/\/$/, '')
  const normalizedPath = String(imgUrl).replace(/^\//, '')

  return normalizedDomain
    ? `${normalizedDomain}/${normalizedPath}`
    : `/${normalizedPath}`
}

const getItemMeta = item => {
  return [item.item_type, item.item_quality].filter(Boolean).join(' • ')
}

const normalizeStatus = status => {
  return String(status ?? '')
    .trim()
    .toLowerCase()
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    ['completed', 'accepted', 'success', 'successful'].includes(
      normalizedStatus,
    )
  ) {
    return 'order-history__status_success'
  }

  if (
    ['error', 'failed', 'rejected', 'cancelled', 'canceled'].includes(
      normalizedStatus,
    )
  ) {
    return 'order-history__status_error'
  }

  if (['processing', 'in_process', 'pending'].includes(normalizedStatus)) {
    return 'order-history__status_pending'
  }

  return 'order-history__status_default'
}

const formatStatus = status => {
  const normalizedStatus = normalizeStatus(status)

  if (!normalizedStatus) {
    return '—'
  }

  return normalizedStatus
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

onMounted(fetchOrders)
</script>

<style lang="scss" scoped>
.order-history {
  width: 100%;
  min-width: 0;

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__subtitle {
    font-weight: 400;
    text-transform: capitalize;
  }

  &__box {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    @media (min-width: $md4) {
      @include adaptiveValue('padding-top', 30, 0);
      @include adaptiveValue('padding-bottom', 30, 0);
      @include adaptiveValue('padding-left', 60, 0);
      @include adaptiveValue('padding-right', 60, 0);
      border: 1px solid var(--border-sixth-color);
      background-color: var(--bg-primary-color);
    }
    @media (max-width: $md5) {
      width: auto;

      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__table {
    width: 100%;

    border-collapse: collapse;
    border-spacing: 0;

    table-layout: fixed;
  }

  &__column {
    &_id {
      width: 7%;
    }

    &_date {
      width: 17%;
    }

    &_item {
      width: 28%;
    }

    &_quantity {
      width: 12%;
    }

    &_amount {
      width: 18%;
    }

    &_status {
      width: 18%;
    }
  }

  &__header,
  &__cell {
    min-width: 0;

    padding: 16px clamp(8px, 1.25vw, 18px);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 120%;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__header {
    border-bottom: 1px solid #4e5566;

    color: var(--hint-third-color);
    font-size: 12px;
  }

  &__header_amount,
  &__cell_amount {
    text-align: left;
  }

  &__header_status,
  &__cell_status {
    text-align: right;
  }

  &__body {
    .order-history__row {
      transition: background-color 0.3s ease;

      &:last-child {
        .order-history__cell {
          border-bottom: 0;
        }
      }

      @media (any-hover: hover) {
        &:hover {
          background-color: var(--bg-fourth-color);
        }
      }
    }
  }
  &__row {
    &:not(:last-child) {
      border-bottom: 1px dashed var(--border-sixth-color);
    }
  }

  &__cell {
    color: var(--secondary-color);
  }

  &__value {
    display: block;

    min-width: 0;

    overflow-wrap: anywhere;
  }

  &__date {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &__date-day {
    color: var(--primary-color);
  }

  &__date-time {
    color: var(--secondary-color);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
  }

  &__item-image {
    overflow: hidden;
    flex: 0 0 42px;

    width: 42px;
    aspect-ratio: 1;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-primary-color);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
    }
  }

  &__item-info {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__item-title {
    overflow: hidden;

    color: var(--secondary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-meta {
    overflow: hidden;

    color: var(--third-color);
    font-size: 11px;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;
  }

  &__price {
    display: inline-flex;
    flex-direction: row-reverse;
    justify-content: flex-end;

    max-width: 100%;

    color: var(--primary-color);
  }

  &__status {
    display: inline-block;

    max-width: 100%;

    font-weight: 500;
    text-transform: capitalize;

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
      color: var(--pending-color);
    }
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;

    padding: 24px clamp(14px, 2vw, 30px);
  }

  &__loading {
    padding: clamp(12px, 2vw, 24px);
  }

  &__skeleton {
    display: grid;
    align-items: center;
    gap: 18px;
    grid-template-columns: 10% 55% 25%;

    min-height: 64px;

    padding: 12px;

    border-bottom: 1px dashed var(--border-secondary-color);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__skeleton-line {
    height: 12px;

    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: order-history-pulse 1.5s infinite linear;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 280px;

    padding: 30px;

    text-align: center;
  }

  &__empty-title {
    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__empty-text {
    max-width: 420px;

    color: var(--secondary-color);
    font-size: 14px;
  }

  @media (max-width: $md3) {
    &__header,
    &__cell {
      padding-right: 10px;
      padding-left: 10px;
    }
  }

  /*
   * Responsive card layout.
   * It does not use horizontal scrolling.
   */
  @media (max-width: $md4) {
    &__box {
      overflow: visible;

      background-color: transparent;
      box-shadow: none;
    }

    &__table,
    &__body,
    &__row,
    &__cell {
      display: block;

      width: 100%;
    }

    &__table {
      table-layout: auto;
    }

    &__head,
    &__column {
      display: none;
    }

    &__body {
      display: grid;
      gap: 12px;
    }

    &__body &__row {
      overflow: hidden;

      border: 1px solid var(--border-fourth-color);
      background-color: var(--bg-primary-color);
    }

    &__cell {
      display: grid;
      align-items: center;
      gap: 15px;
      grid-template-columns: minmax(90px, 36%) minmax(0, 1fr);

      min-height: 48px;

      padding: 12px 14px;

      border-bottom: 1px dashed var(--border-secondary-color);

      text-align: right;

      &::before {
        color: var(--hint-primary-color);
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        text-transform: uppercase;

        content: attr(data-label);
      }

      &:last-child {
        border-bottom: 0;
      }
    }

    &__cell_item {
      align-items: start;
    }

    &__date {
      justify-content: flex-end;
    }

    &__item {
      justify-content: flex-end;
    }

    &__item-info {
      text-align: right;
    }

    &__item-title {
      white-space: normal;
    }

    &__price {
      justify-content: flex-end;

      margin-left: auto;
    }

    &__pagination {
      justify-content: center;

      margin-top: 18px;
      padding: 12px 0;
    }

    &__loading {
      background-color: var(--bg-third-color);
    }
  }

  @media (max-width: $md7) {
    &__heading {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__cell {
      gap: 10px;
      grid-template-columns: minmax(82px, 34%) minmax(0, 1fr);

      padding: 11px 12px;
    }

    &__item-image {
      flex-basis: 36px;

      width: 36px;
    }

    &__skeleton {
      gap: 10px;
      grid-template-columns: 20% 45% 25%;
    }

    &__empty {
      min-height: 220px;

      padding: 25px 15px;
    }
  }
}

@keyframes order-history-pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
