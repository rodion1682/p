<template>
  <AuthLayout>
    <SignInForm @open-reset-password="openResetPassword" />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ref } from 'vue'
import SignInForm from './components/SignInForm.vue'

const isResetPasswordOpen = ref(false)

const openResetPassword = () => {
  isResetPasswordOpen.value = true
}

const closeResetPassword = () => {
  isResetPasswordOpen.value = false
}
</script>
