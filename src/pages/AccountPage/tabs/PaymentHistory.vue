<template>
  <ProfileTableLayout
    showType
    showPrice
    showCoinAmount
    :rows="paginatedRows"
    :is-loading="isLoading"
    :empty-text="$t('No transactions found')"
    :loading-text="`${$t('Loading')}...`"
    :total-pages="totalPages"
    :current-page="currentPage"
    total-label="Total"
    @update:current-page="onPageChange"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import axios from '@/plugins/axios'

import ProfileTableLayout from '@/pages/AccountPage/components/ProfileTableLayout.vue'

const PAGE_SIZE = 6

const isLoading = ref(false)
const payments = ref([])
const currentPage = ref(1)

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
    value.includes('success') ||
    value.includes('completed') ||
    value.includes('accepted') ||
    value.includes('paid')
  ) {
    return UI_STATUS.ACCEPTED
  }

  if (
    value.includes('error') ||
    value.includes('failed') ||
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('declined')
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

const fetchPayments = async () => {
  isLoading.value = true

  try {
    const res = await axios.get('/payments/history')

    payments.value = Array.isArray(res.data?.data) ? res.data.data : []

    currentPage.value = 1
  } catch (error) {
    console.error('PaymentHistory fetch error:', error)

    payments.value = []
  } finally {
    isLoading.value = false
  }
}

const rows = computed(() => {
  return payments.value
    .map((payment, index) => ({
      _key: `payment-${index}`,

      id: String(index + 1),

      createdAt: normalizeTimestamp(payment.date ?? payment.created_at),

      type: String(payment.type || 'Deposit')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase()),

      status: normalizeStatus(payment.status),

      total: Number(payment.amount || 0),
      amount: Number(payment.amount || 0),

      currency: payment.currency || '',
      currencyCode: payment.currency || '',

      coinAmount:
        payment.amount_internal ??
        payment.points ??
        payment.credits ??
        payment.coin_amount,
    }))
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

onMounted(fetchPayments)
</script>
