<template>
  <div class="sign-in sign-in_rest">
    <div class="sign-in__title _h3">
      {{ $t('Forgot your password?') }}
    </div>

    <form class="sign-in__form" @submit.prevent="handlePasswordReset">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="email"
          class="sign-in__input"
          type="email"
          name="email"
          autocomplete="email"
          :label="$t('Enter your E-Mail to get a reset link')"
          :placeholder="$t('person@gmail.com')"
          required
          :error="errorMessage"
        />
      </div>

      <div v-if="serverMessage" class="sign-in__success _text-success">
        {{ serverMessage }}
      </div>

      <div v-if="errorMessage" class="sign-in__error _text-error">
        {{ errorMessage }}
      </div>

      <div class="sign-in__actions">
        <BaseButton
          type="submit"
          :disabled="isLoading"
          class="sign-in__submit sign-in__submit_reset"
        >
          <span v-if="isLoading"> {{ $t('Sending') }}... </span>
          <span v-else>
            {{ $t('Send') }}
          </span>
        </BaseButton>

        <BaseButton
          variant="white-bordered"
          class="sign-in__switch sign-in__switch_full"
          type="button"
          @click="handleBackToSignIn"
        >
          {{ $t('Back') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  isAuthModalActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['back-to-sign-in'])

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const serverMessage = ref('')

const handleBackToSignIn = () => {
  if (props.isAuthModalActive) {
    emit('back-to-sign-in')
    return
  }

  router.push({ name: 'LoginPage' })
}

const handlePasswordReset = async () => {
  errorMessage.value = ''
  serverMessage.value = ''

  if (!email.value) {
    errorMessage.value = t('Email is required')
    return
  }

  if (isLoading.value) return

  isLoading.value = true

  try {
    await userStore.resetPassword(email.value)

    serverMessage.value = t(
      'Password reset link sent. Please check your email.',
    )

    toast.success(serverMessage.value)
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to send reset link')

    errorMessage.value = apiMessage
    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}
</script>
