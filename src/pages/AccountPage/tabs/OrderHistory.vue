<template>
  <ProfileTableLayout
    show-skin-name
    show-coin-amount
    coin-label="Total Price"
    :show-quantity="true"
    :show-price="false"
    :total-as-currency="false"
    :show-data-column="true"
    :show-order-image="false"
    :rows="paginatedRows"
    :is-loading="isLoading"
    :empty-text="$t('No orders found')"
    :loading-text="`${$t('Loading')}...`"
    :total-pages="totalPages"
    :current-page="currentPage"
    @update:current-page="onPageChange"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import axios from '@/plugins/axios'

import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

const PAGE_SIZE = 6

const isLoading = ref(false)
const orders = ref([])
const currentPage = ref(1)

const STATIC_DOMAIN =
  import.meta.env.VITE_STATIC_DOMAIN?.replace(/\/+$/, '') || ''

const UI_STATUS = {
  ACCEPTED: 'Accepted',
  PENDING: 'Pending',
  CANCELED: 'Canceled',
}

const normalizeStatus = status => {
  const value = String(status || '')
    .toLowerCase()
    .trim()

  if (
    value.includes('completed') ||
    value.includes('accepted') ||
    value.includes('success') ||
    value.includes('paid')
  ) {
    return UI_STATUS.ACCEPTED
  }

  if (
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('error') ||
    value.includes('failed') ||
    value.includes('denied') ||
    value.includes('deleted')
  ) {
    return UI_STATUS.CANCELED
  }

  return UI_STATUS.PENDING
}

const normalizeTimestamp = value => {
  const timestamp = Number(value || 0)

  if (!timestamp) {
    return 0
  }

  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
}

const getImageUrl = image => {
  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${STATIC_DOMAIN}${image}`
}

const normalizeItemTitle = title => {
  return String(title || '')
    .replace(/^★\s*/, '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/\s*\((.*?)\)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const fetchOrders = async () => {
  isLoading.value = true

  try {
    const res = await axios.get('/orders/history')

    orders.value = Array.isArray(res.data?.data) ? res.data.data : []

    currentPage.value = 1
  } catch (error) {
    console.error('OrderHistory fetch error:', error)

    orders.value = []
  } finally {
    isLoading.value = false
  }
}

const rows = computed(() => {
  return orders.value
    .map((order, index) => {
      const items = Array.isArray(order.items) ? order.items : []

      return {
        _key: `order-${index}`,
        id: String(index + 1),
        createdAt: normalizeTimestamp(order.date ?? order.created_at),
        type: '',

        skinItems: items.map(item => ({
          title: normalizeItemTitle(item.display_name),
          image: getImageUrl(item.image),
          quality: '',
        })),

        status: normalizeStatus(order.status),

        amount: Number(order.total_price || 0),
        total: Number(order.total_price || 0),

        coinAmount: order.total_price_internal ?? null,

        quantity: items.length
          ? items.reduce(
              (sum, item) =>
                sum + (Number(item.count ?? item.quantity ?? 0) || 0),
              0,
            )
          : null,

        currency: order.currency || '',
        currencyCode: order.currency || '',
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
})

const totalPages = computed(() => {
  return Math.ceil(rows.value.length / PAGE_SIZE) || 1
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  return rows.value.slice(start, end)
})

const onPageChange = page => {
  currentPage.value = Number(page)
}

onMounted(fetchOrders)
</script>
