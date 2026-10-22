<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const isTopUp = computed(() => {
  return route.query.type === 'topup'
})

const statusTitle = computed(() => {
  return isTopUp.value ? t('Payment Failed') : t('Order Payment Failed')
})

const errorMessage = computed(() => {
  const error = route.query.error

  if (Array.isArray(error)) {
    return String(error[0] || '')
  }

  return String(error || '')
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <AuthLayout>
    <StatusLayout
      :title="$t(statusTitle)"
      :text="errorMessage ? errorMessage : $t('payment_failed_description')"
      tone="error"
    >
      <template #actions>
        <BaseButton type="button" icon="arrow" variant="back" @click="goHome">
          {{ $t('Return to Home') }}
        </BaseButton>
      </template>
    </StatusLayout>
  </AuthLayout>
</template>
