<template>
  <AuthLayout>
    <div class="flex w-full flex-col">
      <h2 
        class="mb-2 text-center font-secondary text-[18px] font-semibold uppercase text-accent"
      >
        {{ $t('Verification Required') }}
      </h2>
      
      <h1 
        class="mb-6 text-center font-secondary text-[42px] font-semibold uppercase text-primary"
      >
        {{ $t('Email Verification') }}
      </h1>

      <div class="mb-6 w-full text-center">
        <p class="mb-6 text-center text-[14px] text-[rgba(3,0,27,0.56)]">
          {{ $t('Please verify your email address to continue using your account.') }}
        </p>

        <BaseButton
          @click="resendVerification"
          :disabled="isLoading"
          class="w-full rounded-[8px] py-3"
        >
          <span v-if="isLoading">{{ $t('Sending...') }}</span>
          <span v-else>{{ $t('Resend Verification Email') }}</span>
        </BaseButton>

        <p
          v-if="message"
          class="mt-4 text-center text-[14px]"
          :class="{
            'text-success': status === 'OK',
            'text-error': status === 'ERROR',
          }"
        >
          {{ message }}
        </p>
      </div>

      <div class="flex items-center justify-center">
        <RouterLink to="/" class="text-[14px] font-bold text-accent hover:underline">
          {{ $t('Back to Home') }}
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/plugins/axios'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/BaseButton.vue'

const isLoading = ref(false)
const message = ref('')
const status = ref('')

const resendVerification = async () => {
  isLoading.value = true
  message.value = ''
  status.value = ''

  try {
    const response = await axios.post('/email/verify/resend')
    message.value = response.data.message
    status.value = response.data.status
  } catch (error) {
    message.value =
      error.response?.data?.message || 'Failed to send verification email'
    status.value = 'ERROR'
  } finally {
    isLoading.value = false
  }
}
</script>
