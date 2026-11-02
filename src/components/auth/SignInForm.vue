<template>
  <div class="sign-in">
    <div class="sign-in__top">
      <div class="sign-in__title _l">
        {{ $t('Sign in to your account') }}
      </div>
      <form @submit.prevent="handleSignIn" class="sign-in__form">
        <div class="sign-in__inputs">
          <BaseInput
            class="sign-in__input"
            v-model="form.email"
            type="email"
            autocomplete="email"
            :placeholder="$t('Enter your email')"
          />
          <BaseInput
            class="sign-in__input"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('Enter your password')"
          />
        </div>
        <!--     @click="$emit('open-reset-password')" -->
        <button
          class="sign-in__forgot _link"
          type="button"
          @click="router.push({ name: 'ForgotPasswordPage' })"
        >
          {{ $t('Forgot password?') }}
        </button>
        <div v-if="error" class="sign-in__error _text-error">
          {{ error }}
        </div>
        <BaseButton
          type="submit"
          :disabled="isLoading"
          variant="primary"
          class="sign-in__submit"
        >
          <span v-if="isLoading">{{ $t('Logging in') }}...</span>
          <span v-else>{{ $t('Sign In') }}</span>
        </BaseButton>
      </form>
    </div>
    <div class="sign-in__bottom">
      <!--<div class="sign-in__text">{{ $t('Don`t have an account?') }}</div>-->
      <!--         @click="$emit('open-sign-up')" -->
      <BaseButton
        variant="bordered"
        class="sign-in__switch"
        type="button"
        @click="router.push({ name: 'RegisterPage' })"
      >
        {{ $t('Sign Up') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

defineEmits(['open-sign-up', 'open-reset-password'])

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const form = reactive({
  email: '',
  password: '',
})

const handleSteamLogin = () => {
  window.location.href = authStore.steamAuthUrl
}

const validateForm = () => {
  if (!form.email || !form.password) {
    error.value = t('Email and password are required')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    error.value = t('Invalid email format')
    return false
  }
  return true
}

const handleSignIn = async () => {
  error.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.login(form.email, form.password)
    const redirectTo = router.currentRoute.value.query.redirect
    if (redirectTo) {
      router.push(redirectTo)
    } else {
      router.replace({
        path: '/account',
      })
    }
  } catch (err) {
    if (err?.errors && Object.keys(err.errors).length > 0) {
      error.value = Object.values(err.errors)[0][0]
    } else {
      error.value = err?.message || err || t('An error occurred')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sign-in {
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
  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10, 14);
    }
  }
  &__input {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  &__forgot {
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }
  &__error {
    text-align: center;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  &__submit {
    margin-left: auto;
    margin-right: auto;
    max-width: 209px;
  }
  &__bottom {
    margin-top: auto;
  }
  &__switch {
    max-width: 116px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
