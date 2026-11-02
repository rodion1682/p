<script setup>
import EmailLayout from '@/pages/Email/components/EmailLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAccount = () => {
  router.push({ name: 'account-balance' })
}
</script>

<template>
  <EmailLayout
    :title="$t('Email Verified Successfully!')"
    :text="$t('Your email has been verified. You can now access all features.')"
    titleColor="var(--success-color)"
    :buttonText="$t('Go to My Account')"
    @button-click="goToAccount"
  />
</template>
