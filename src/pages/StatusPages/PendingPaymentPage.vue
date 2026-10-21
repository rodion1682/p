<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { useTopUpStore } from '@/stores/topup'

const router = useRouter()
const route = useRoute()
const topupStore = useTopUpStore()

const isChecking = ref(false)
const paymentStatus = ref('')

const depositId = computed(() => {
  const value = route.query.order ?? route.query.order_id ?? null

  if (Array.isArray(value)) {
    return value[0] || null
  }

  return value
})

const statusMessage = computed(() => {
  if (!paymentStatus.value) {
    return 'Your payment is being processed. Please wait...'
  }

  return `Payment is being processed. Status: ${paymentStatus.value}`
})

const redirectToFailure = error => {
  return router.replace({
    path: '/fail-payment',
    query: {
      type: 'topup',
      error: error || 'Payment processing failed',
    },
  })
}

const redirectToSuccess = () => {
  return router.replace({
    path: '/success-payment',
    query: {
      type: 'topup',
    },
  })
}

const checkStatus = async () => {
  if (!depositId.value || isChecking.value) {
    return
  }

  isChecking.value = true

  try {
    const status = await topupStore.checkDepositStatus(depositId.value)

    if (status === null || status === undefined) {
      await redirectToFailure('Payment processing failed')
      return
    }

    const normalizedStatus = String(status).trim().toLowerCase()

    if (
      normalizedStatus === 'success' ||
      normalizedStatus === 'successful' ||
      normalizedStatus === 'completed'
    ) {
      await redirectToSuccess()
      return
    }

    if (
      normalizedStatus === 'error' ||
      normalizedStatus === 'failed' ||
      normalizedStatus === 'failure' ||
      normalizedStatus === 'cancelled' ||
      normalizedStatus === 'canceled'
    ) {
      await redirectToFailure('Payment processing failed')
      return
    }

    paymentStatus.value = String(status || 'Pending')
  } catch (error) {
    console.error('Error checking payment status:', error)
    paymentStatus.value = 'Pending'
  } finally {
    isChecking.value = false
  }
}

const goToTransactions = () => {
  router.push({
    name: 'account-transactions',
  })
}

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  if (!depositId.value) {
    await redirectToFailure('Payment processing failed')
    return
  }

  await checkStatus()

  if (route.path !== '/pending-payment') {
    return
  }

  topupStore.startStatusPolling(depositId.value)
})

onUnmounted(() => {
  topupStore.stopStatusPolling()
})
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t('Payment Processing')"
      :text="$t(statusMessage)"
      :subtext="
        $t('This page will automatically update when the payment is complete.')
      "
      :loading-label="$t('Checking payment status')"
      tone="pending"
      show-loader
    >
      <template #actions>
        <BaseButton type="button" variant="primary" @click="goToTransactions">
          {{ $t('View Transaction History') }}
        </BaseButton>

        <BaseButton type="button" variant="bordered" @click="goHome">
          {{ $t('Return to Home') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
