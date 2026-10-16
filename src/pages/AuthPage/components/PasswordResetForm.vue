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
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const emit = defineEmits(['back-to-signin'])

const email = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const userStore = useUserStore()

const handlePasswordReset = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    await userStore.resetPassword(email.value)
    toast.success('Password reset link sent. Please check your email.')
    email.value = ''
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
  }
}

const backToSignIn = () => {
  emit('back-to-signin')
}
</script>
