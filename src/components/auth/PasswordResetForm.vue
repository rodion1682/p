<template>
  <div class="reset">
    <div class="reset__top">
      <div class="reset__title _l">
        {{ $t('Get a backup password') }}
      </div>
      <form @submit.prevent="handlePasswordReset" class="reset__form">
        <BaseInput
          class="reset__input"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="$t('Enter your email')"
          required
          :error="errorMessage"
        />
        <div v-if="serverMessage" class="reset__success _text-success">
          {{ serverMessage }}
        </div>
        <BaseButton
          type="submit"
          :disabled="isLoading"
          variant="primary"
          class="reset__submit"
        >
          <span v-if="isLoading">{{ $t('Sending') }}...</span>
          <span v-else>{{ $t('Send') }}</span>
        </BaseButton>
      </form>
    </div>
    <!--       @click="$emit('back-to-sign-in')" -->
    <BaseButton
      variant="bordered"
      class="reset__switch"
      type="button"
      @click="router.push({ name: 'LoginPage' })"
    >
      {{ $t('Sign In') }}
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineEmits(['back-to-sign-in'])

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()

const email = ref('')
const isLoading = ref(false)

const errorMessage = ref('')
const serverMessage = ref('')

const handlePasswordReset = async () => {
  errorMessage.value = ''
  serverMessage.value = ''

  if (!email.value) {
    errorMessage.value = t('Email is required')
    return
  }

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

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.reset {
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  &__top {
    flex: 1 1 100%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 80, 20);
    }
  }
  &__title {
    text-align: center;
    line-height: 130%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }
  &__form {
  }
  &__input {
    margin-bottom: 20px;
  }
  &__success {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  &__submit {
    margin-left: auto;
    margin-right: auto;
    max-width: 209px;
  }

  &__switch {
    margin-top: auto;
    max-width: 116px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
