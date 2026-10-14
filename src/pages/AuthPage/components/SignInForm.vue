<template>
  <div class="sign-in">
    <div class="sign-in__title sign-in__title_large _h3">{{ $t('Login') }}</div>
    <form @submit.prevent="handleSignIn" class="sign-in__form">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="form.username"
          type="text"
          name="username"
          autocomplete="username"
          :placeholder="$t('Username')"
          class="sign-in__input"
        />
        <BaseInput
          v-model="form.password"
          type="password"
          name="password"
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
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')
const form = reactive({
  username: '',
  password: '',
})

const validateForm = () => {
  if (!form.username || !form.password) {
    error.value = t('Username and password are required')
    return false
  }
  // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
  //   error.value = t('Invalid email format')
  //   return false
  // }
  return true
}

const handleSteamLogin = () => {
  window.location.href = `${import.meta.env.VITE_DOMAIN}auth/steam/redirect`
}

const handleSignIn = async () => {
  error.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await authStore.login(form.username, form.password)
    const redirectTo = router.currentRoute.value.query.redirect
    if (redirectTo) {
      router.push(redirectTo)
    } else {
      router.replace({
        path: '/account',
      })
    }
  } catch (err) {
    // Handle Laravel validation errors or generic error
    if (err?.errors && Object.keys(err.errors).length > 0) {
      // Get first error message from the errors object
      error.value = Object.values(err.errors)[0][0]
    } else {
      error.value = err?.message || err || t('An error occurred')
    }
  } finally {
    isLoading.value = false
  }
}

defineEmits(['forgot-password', 'switch-form'])
</script>

<style lang="scss">
.sign-in {
  &__title {
    color: var(--primary-color);
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
    &_large {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 100, 15);
      }
    }
  }
  &__text {
    color: var(--secondary-color);
    font-size: 14px;
    line-height: 120%;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__form {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 104, 15);
    }
  }

  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 20);
    }
  }

  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }
  &__forgot {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 100, 20);
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
  }
  &__back {
    max-width: 130px;

    margin: 0 auto;
  }
}
</style>
