<template>
  <div class="sign-in">
    <!-- <div class="mb-[36px] flex items-center justify-center gap-2">
      <span class="text-[14px] text-[rgba(3,0,27,0.56)]">
        {{ $t('Back to Sign In') }}
      </span>
      <button
        type="button"
        @click="$emit('back-to-signin')"
        class="text-[14px] font-bold text-accent hover:underline"
      >
        {{ $t('LOG IN') }}
      </button>
    </div> -->
    <div class="sign-in__title _h5">
      <div>{{ $t('Reset Your') }}</div>
      <div>{{ $t('Password') }}</div>
    </div>
    <div class="sign-in__text">
      {{
        $t(
          'Enter the email address associated with your account and we`ll send you a link to reset your password.',
        )
      }}
    </div>
    <form
      @submit.prevent="handlePasswordReset"
      class="sign-in__form sign-in__form_large"
    >
      <BaseInput
        v-model="email"
        type="email"
        name="email"
        autocomplete="email"
        icon="email"
        :error="errorMessage"
        :placeholder="$t('Email')"
        required
        class="sign-in__input"
      />
      <BaseButton
        :disabled="isLoading"
        type="submit"
        class="sign-in__submit sign-in__submit_reset"
      >
        <span v-if="isLoading">{{ $t('Sending...') }}</span>
        <span v-else>{{ $t('Apply') }}</span>
      </BaseButton>
      <BaseButton
        type="button"
        :disabled="isLoading"
        @click="backToSignIn"
        class="sign-in__back"
        variant="bordered"
      >
        {{ $t('Back') }}
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['back-to-signin'])

const { t } = useI18n()
const userStore = useUserStore()

const email = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const validateEmail = () => {
  const normalizedEmail = email.value.trim()

  if (!normalizedEmail) {
    errorMessage.value = t('Please enter your email address')
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(normalizedEmail)) {
    errorMessage.value = t('Please enter a valid email address')
    return false
  }

  email.value = normalizedEmail
  errorMessage.value = ''

  return true
}

const handlePasswordReset = async () => {
  if (isLoading.value) {
    return
  }

  if (!validateEmail()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await userStore.resetPassword(email.value)

    toast.success(t('Password reset link sent. Please check your email.'))

    email.value = ''
  } catch (error) {
    const responseData = error?.response?.data

    const emailErrors = responseData?.errors?.email

    if (Array.isArray(emailErrors) && emailErrors.length > 0) {
      errorMessage.value = String(emailErrors[0])
    } else {
      errorMessage.value =
        responseData?.message ||
        (typeof error?.message === 'string'
          ? error.message
          : t('Failed to send password reset link. Please try again.'))
    }
  } finally {
    isLoading.value = false
  }
}

const backToSignIn = () => {
  if (isLoading.value) {
    return
  }

  errorMessage.value = ''

  emit('back-to-signin')
}
</script>
