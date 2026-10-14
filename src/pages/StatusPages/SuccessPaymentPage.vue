<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { useCartStore } from '@/stores/cart'
import { useTopUpStore } from '@/stores/topup'

const router = useRouter()
const route = useRoute()

const cartStore = useCartStore()
const topupStore = useTopUpStore()

const isTopUp = computed(() => {
  return route.query.type === 'topup'
})

const statusTitle = computed(() => {
  return isTopUp.value ? 'Payment Successful!' : 'Purchase Successful!'
})

const statusText = computed(() => {
  return isTopUp.value
    ? 'Thank you for your payment. Your account has been topped up.'
    : 'Thank you for your purchase. Your payment was successful.'
})

const statusSubtext = computed(() => {
  return isTopUp.value
    ? 'You can view your transaction in your account.'
    : 'You can view your purchased items in your order history.'
})

const goHome = () => {
  router.push('/')
}

const goToOrders = () => {
  router.push({
    name: 'account-orders',
  })
}

const goToTransactions = () => {
  router.push({
    name: 'account-transactions',
  })
}

const continueShopping = () => {
  router.push({
    name: 'ProductListPage',
  })
}

onMounted(() => {
  if (isTopUp.value) {
    topupStore.reset()
    return
  }

  cartStore.resetState()
})
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t(statusTitle)"
      :text="$t(statusText)"
      :subtext="$t(statusSubtext)"
      tone="success"
    >
      <template #actions>
        <template v-if="isTopUp">
          <BaseButton type="button" variant="primary" @click="goToTransactions">
            {{ $t('View Transactions') }}
          </BaseButton>

          <BaseButton type="button" variant="hint-bordered" @click="goHome">
            {{ $t('Return to Home') }}
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton type="button" variant="primary" @click="goToOrders">
            {{ $t('View Order History') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="hint-bordered"
            @click="continueShopping"
          >
            {{ $t('Continue Shopping') }}
          </BaseButton>
        </template>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
