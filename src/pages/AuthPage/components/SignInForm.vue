<template>
  <div class="sign-in sign-in_in">
    <div class="sign-in__title sign-in__title_large _h5">{{ $t('Login') }}</div>
    <form @submit.prevent="handleSignIn" class="sign-in__form">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="form.username"
          type="text"
          icon="username"
          name="username"
          autocomplete="username"
          :placeholder="$t('Username')"
          class="sign-in__input"
        />
        <BaseInput
          v-model="form.password"
          type="password"
          name="password"
          icon="password"
          autocomplete="current-password"
          :placeholder="$t('Password')"
          class="sign-in__input"
        />
      </div>

      <button
        type="button"
        @click="$emit('forgot-password')"
        class="sign-in__forgot _link"
      >
        {{ $t('Forgot password?') }}
      </button>
      <div v-if="error" class="sign-in__error _text-error">
        {{ error }}
      </div>
      <BaseButton type="submit" class="sign-in__submit" :disabled="isLoading">
        <span v-if="isLoading">{{ $t('Signing in...') }}</span>
        <span v-else>{{ $t('LOGIN') }}</span></BaseButton
      >
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'

defineEmits(['forgot-password', 'switch-form'])

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
})

const validateForm = () => {
  if (!form.username.trim() || !form.password) {
    error.value = t('Username and password are required')
    return false
  }

  return true
}

const getSafeRedirect = redirect => {
  if (
    typeof redirect !== 'string' ||
    !redirect.startsWith('/') ||
    redirect.startsWith('//') ||
    redirect.startsWith('/\\')
  ) {
    return null
  }

  return redirect
}

const handleSignIn = async () => {
  if (isLoading.value) {
    return
  }

  error.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.login(form.username.trim(), form.password)

    if (!authStore.isAuthenticated) {
      throw new Error(t('Unable to sign in. Please try again.'))
    }

    const redirectTo = getSafeRedirect(route.query.redirect)

    await router.replace(redirectTo || '/account')
  } catch (err) {
    if (err?.errors && Object.keys(err.errors).length > 0) {
      const firstError = Object.values(err.errors)[0]

      error.value = Array.isArray(firstError)
        ? firstError[0]
        : String(firstError)
    } else {
      error.value =
        typeof err?.message === 'string' ? err.message : t('An error occurred')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss">
.sign-in {
  &_in {
    @include adaptiveValue('padding-bottom', 58, 0);
  }
  &__title {
    color: var(--secondary-color);
    font-weight: 500;
    line-height: 120%;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
    &_large {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 90, 18);
      }
    }
  }
  &__text {
    color: var(--primary-color);
    font-size: 16px;
    font-weight: 500;
    line-height: 120%;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__form {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 131, 18);
    }
  }

  &__inputs {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__input {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  &__forgot {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }
  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__forgot {
    display: block;

    width: fit-content;

    margin-left: auto;
  }

  &__error {
    margin-bottom: 8px;

    text-align: center;
  }

  &__submit {
    &_reset {
      @include adaptiveValue('margin-top', 131, 18);
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
  &__back {
  }
}
</style>
