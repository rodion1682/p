<template>
  <div class="order-history">
    <h2 class="order-history__title">
      {{ $t('My Orders') }}
    </h2>

    <div class="order-history__panel">
      <div
        v-if="isLoading"
        class="order-history__state"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner />
      </div>

      <div v-else-if="error" class="order-history__state" role="alert">
        <h3 class="order-history__state-title">
          {{ $t('Unable to load orders') }}
        </h3>

        <p class="order-history__state-text">
          {{ error }}
        </p>

        <BaseButton type="button" variant="hint-bordered" @click="fetchOrders">
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="!items.length" class="order-history__state">
        <h3 class="order-history__state-title">
          {{ $t('No orders found') }}
        </h3>

        <p class="order-history__state-text">
          {{ $t('Your completed orders will appear here.') }}
        </p>
      </div>

      <template v-else>
        <table class="order-history__table">
          <colgroup>
            <col class="order-history__col-id" />
            <col class="order-history__col-date" />
            <col class="order-history__col-item" />
            <col class="order-history__col-total" />
            <col class="order-history__col-status" />
          </colgroup>

          <thead class="order-history__head">
            <tr>
              <th scope="col">{{ $t('ID') }}</th>
              <th scope="col">{{ $t('Date') }}</th>
              <th scope="col">{{ $t('Item') }}</th>
              <th scope="col">{{ $t('Total') }}</th>
              <th scope="col">{{ $t('Status') }}</th>
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
                <span class="order-history__id">
                  {{ item.id }}
                </span>
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
                class="order-history__cell order-history__cell_total"
                :data-label="$t('Total')"
              >
                <div class="order-history__amount">
                  <PriceFormatter :price="item.sum" size="size-14" />
                </div>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import Pagination from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import axios from '@/plugins/axios'
import { formatDate } from '@/utils/formatters'

const items = ref([])
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)

const itemsPerPage = 7

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

  return orderItems.map((item, index) => ({
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
  }))
}

const fetchOrders = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await axios.get('/transactions/orders')
    const orders = response.data?.data ?? []

    items.value = Array.isArray(orders) ? orders.flatMap(normalizeOrder) : []
  } catch (requestError) {
    console.error('Error fetching orders:', requestError)

    items.value = []
    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Failed to load orders'
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

  return sortedItems.value.slice(start, start + itemsPerPage)
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
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    [
      'completed',
      'accepted',
      'success',
      'successful',
      'paid',
      'approved',
    ].includes(normalizedStatus)
  ) {
    return 'order-history__status_success'
  }

  if (
    [
      'error',
      'failed',
      'rejected',
      'cancelled',
      'canceled',
      'declined',
    ].includes(normalizedStatus)
  ) {
    return 'order-history__status_error'
  }

  if (
    ['processing', 'in_process', 'pending', 'created'].includes(
      normalizedStatus,
    )
  ) {
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

  &__title {
    @include adaptiveValue('font-size', 24, 20);
    @include adaptiveValue('margin-bottom', 24, 18);

    margin-top: 0;

    color: var(--primary-color);
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.25;
    text-transform: none;
  }

  &__panel {
    @media (min-width: $md5) {
      @include adaptiveValue('padding-top', 18, 12);
      @include adaptiveValue('padding-right', 38, 14);
      @include adaptiveValue('padding-bottom', 20, 14);
      @include adaptiveValue('padding-left', 38, 14);

      width: 100%;
      min-width: 0;

      border: 1px solid var(--border-fourth-color);
      border-radius: 10px;
      background: rgb(25 22 60 / 35%);
    }
  }

  &__table {
    width: 100%;
    min-width: 0;

    border-collapse: collapse;
    table-layout: fixed;
  }

  &__col-id {
    width: 12%;
  }

  &__col-date {
    width: 22%;
  }

  &__col-item {
    width: 33%;
  }

  &__col-total {
    width: 16%;
  }

  &__col-status {
    width: 17%;
  }

  &__head {
    th {
      @include adaptiveValue('padding-top', 0, 0);
      @include adaptiveValue('padding-bottom', 14, 10);

      padding-right: 8px;
      padding-left: 0;

      border-bottom: 1px solid var(--border-priamry-color);

      color: var(--secondary-color);
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
      text-align: left;

      &:last-child {
        padding-right: 0;

        text-align: right;
      }
    }
  }

  &__row {
    border-bottom: 1px dashed var(--border-priamry-color);

    transition: background-color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: rgb(143 110 226 / 6%);
      }
    }
  }

  &__cell {
    @include adaptiveValue('padding-top', 14, 11);
    @include adaptiveValue('padding-bottom', 14, 11);

    min-width: 0;

    padding-right: 8px;
    padding-left: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.45;
    text-align: left;

    overflow-wrap: anywhere;
    vertical-align: middle;

    &_status {
      padding-right: 0;

      text-align: right;
    }
  }

  &__id {
    color: #f4d8c5;
    font-weight: 400;
  }

  &__date {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
  }

  &__date-day {
    color: var(--primary-color);
    white-space: nowrap;
  }

  &__date-time {
    color: var(--secondary-color);
    font-size: 12px;
    white-space: nowrap;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;

    min-width: 0;
  }

  &__item-image {
    overflow: hidden;
    flex: 0 0 30px;

    width: 30px;
    height: 36px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background: var(--bg-nineth-color);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__item-info {
    display: flex;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__item-title {
    color: var(--primary-color);
    font-size: 12px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__item-meta {
    color: var(--secondary-color);
    font-size: 10px;
    line-height: 1.4;

    overflow-wrap: anywhere;
  }

  &__amount {
    display: flex;
    align-items: center;

    min-width: 0;

    color: var(--primary-color);
    :deep(.price) {
      flex-direction: row-reverse;
    }
  }

  &__status {
    display: inline-block;

    max-width: 100%;

    color: var(--primary-color);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    text-align: right;

    overflow-wrap: anywhere;

    &_success {
      color: var(--primary-color);
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

  &__pagination {
    @include adaptiveValue('padding-top', 20, 16);
    display: flex;
    justify-content: flex-end;

    width: 100%;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    min-height: 340px;

    padding: 20px;

    text-align: center;
  }

  &__state-title {
    margin: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-size: 22px;
    font-weight: 500;
    line-height: 1.3;
  }

  &__state-text {
    max-width: 420px;

    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: $md3) {
    &__col-id {
      width: 11%;
    }

    &__col-date {
      width: 24%;
    }

    &__col-item {
      width: 30%;
    }

    &__col-total {
      width: 17%;
    }

    &__col-status {
      width: 18%;
    }

    &__head th,
    &__cell {
      padding-right: 5px;

      font-size: 11px;
    }
  }

  @media (max-width: $md4) {
    &__panel {
      min-height: 0;
    }

    &__table,
    &__body,
    &__row {
      display: block;

      width: 100%;
      min-width: 0;
    }

    &__head {
      display: none;
    }

    &__body {
      display: grid;
      gap: 12px;
    }

    &__row {
      display: grid;
      gap: 14px 12px;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      padding: 16px;

      border: 1px solid var(--border-fourth-color);
      border-radius: 8px;
      background: var(--bg-nineth-color);
    }

    &__cell {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      width: 100%;
      min-width: 0;

      padding: 0;

      font-size: 12px;
      text-align: left;

      &::before {
        display: block;

        color: var(--secondary-color);
        font-family: var(--font-inter);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;

        content: attr(data-label);
      }

      &_item {
        grid-column: 1 / -1;
      }

      &_status {
        text-align: left;
      }
    }

    &__date {
      gap: 5px;
    }

    &__item-image {
      flex-basis: 38px;

      width: 38px;
      height: 44px;
    }

    &__item-title {
      font-size: 13px;
    }

    &__status {
      text-align: left;
    }

    &__pagination {
      justify-content: center;
    }

    &__state {
      min-height: 260px;
    }
  }

  @media (max-width: $md6) {
    &__row {
      gap: 12px 10px;

      padding: 12px;
    }

    &__date {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    &__cell {
      font-size: 11px;
    }

    &__state {
      min-height: 220px;

      padding: 15px;
    }
  }
}
</style>
