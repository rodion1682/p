<template>
  <div class="sign-in">
    <!-- <div class="mb-[36px] flex items-center justify-center gap-2">
      <span class="text-[14px] text-[rgba(3,0,27,0.56)]">
        {{ $t('Already have an account?') }}
      </span>
      <button
        type="button"
        @click="$emit('switch-form')"
        class="text-[14px] font-bold text-accent hover:underline"
      >
        {{ $t('LOG IN') }}
      </button>
    </div> -->
    <div class="sign-in__title _h5">{{ $t('Register') }}</div>
    <form @submit.prevent="handleSignUp" class="sign-in__form">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="form.username"
          name="username"
          icon="username"
          autocomplete="given-name"
          :placeholder="$t('Username')"
          :error="fieldErrors.username"
          required
          maxlength="12"
          oninput="
            this.value = this.value.replace(
              /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?~` ]/g,
              '',
            )
          "
          class="sign-in__input"
        />

        <BaseInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          icon="email"
          :placeholder="$t('Email')"
          :error="fieldErrors.email"
          required
          class="sign-in__input"
        />
        <BaseInput
          v-model="form.password"
          type="password"
          name="password"
          icon="password"
          autocomplete="new-password"
          :placeholder="$t('Password')"
          :error="fieldErrors.password"
          required
          class="sign-in__input"
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          icon="password"
          autocomplete="new-password"
          :placeholder="$t('Confirm password')"
          :error="fieldErrors.confirmPassword"
          required
          class="sign-in__input"
        />
      </div>
      <BaseCheckbox
        v-model="form.termsAccepted"
        name="termsAccepted"
        :error="fieldErrors.termsAccepted"
        class="sign-in__terms"
        terms
        required
      />

      <div v-if="error && !hasFieldErrors" class="sign-in__error _text-error">
        {{ error }}
      </div>

      <BaseButton :disabled="isLoading" type="submit" class="sign-in__submit">
        <span v-if="isLoading">{{ $t('Creating account...') }}</span>
        <span v-else>{{ $t('Create Account') }}</span>
      </BaseButton>
    </form>

    <!-- Divider with OR text -->
    <!-- <div class="my-6 flex items-center">
      <div class="flex-grow border-t border-[rgba(3,0,27,0.1)]"></div>
      <div class="mx-4 text-[14px] text-[rgba(3,0,27,0.56)]">
        {{ $t('OR') }}
      </div>
      <div class="flex-grow border-t border-[rgba(3,0,27,0.1)]"></div>
    </div> -->

    <!-- Steam signup button -->
    <!-- <BaseButton
      type="button"
      @click="handleSteamSignup"
      variant="green2"
      class="w-full rounded-[8px] py-3"
    >
      {{ $t('SIGN UP WITH STEAM') }}
    </BaseButton> -->
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['switch-form'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const toast = useToast()

const { ensurePages } = useStaticPages()

const isLoading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})

const createEmptyFieldErrors = () => ({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

const fieldErrors = ref(createEmptyFieldErrors())

const hasFieldErrors = computed(() => {
  return Object.values(fieldErrors.value).some(Boolean)
})

const resetErrors = () => {
  error.value = ''
  fieldErrors.value = createEmptyFieldErrors()
}

const setFieldError = (field, message) => {
  fieldErrors.value[field] = message
  error.value = message
}

const validateForm = () => {
  resetErrors()

  form.username = form.username.trim()
  form.email = form.email.trim()

  if (!form.username) {
    setFieldError('username', t('Username is required'))
    return false
  }

  if (form.username.length > 12) {
    setFieldError('username', t('Username must be 12 characters or less'))
    return false
  }

  if (!form.email) {
    setFieldError('email', t('Email is required'))
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(form.email)) {
    setFieldError('email', t('Please enter a valid email address'))
    return false
  }

  if (!form.password) {
    setFieldError('password', t('Password is required'))
    return false
  }

  if (!form.confirmPassword) {
    setFieldError('confirmPassword', t('Please confirm your password'))
    return false
  }

  if (form.password !== form.confirmPassword) {
    const message = t('Passwords do not match')

    fieldErrors.value.password = message
    fieldErrors.value.confirmPassword = message
    error.value = message

    return false
  }

  if (!form.termsAccepted) {
    setFieldError(
      'termsAccepted',
      t('Please accept the terms and privacy policy'),
    )
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

const handleBackendErrors = err => {
  const responseData = err?.response?.data
  const backendErrors = responseData?.errors || err?.errors

  if (backendErrors && typeof backendErrors === 'object') {
    const fieldMapping = {
      username: 'username',
      email: 'email',
      password: 'password',
      passConfirm: 'confirmPassword',
      password_confirmation: 'confirmPassword',
      termsAccepted: 'termsAccepted',
    }

    Object.entries(backendErrors).forEach(([field, messages]) => {
      const formField = fieldMapping[field] || field

      if (!(formField in fieldErrors.value)) {
        return
      }

      fieldErrors.value[formField] = Array.isArray(messages)
        ? String(messages[0] || '')
        : String(messages || '')
    })
  }

  const firstFieldError = Object.values(fieldErrors.value).find(Boolean)

  error.value =
    responseData?.message ||
    firstFieldError ||
    (typeof err?.message === 'string' ? err.message : t('Registration failed'))

  toast.error(error.value)
}

const handleSignUp = async () => {
  if (isLoading.value) {
    return
  }

  if (!validateForm()) {
    toast.error(error.value || t('Please fill in all required fields'))
    return
  }

  isLoading.value = true

  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      passConfirm: form.confirmPassword,
    })

    if (authStore.isAuthenticated) {
      const redirectTo = getSafeRedirect(route.query.redirect)

      await router.replace(redirectTo || '/account')
      return
    }

    // Registration succeeded, but the user has not been
    // authenticated automatically. Show the sign-in form.
    toast.success(t('Account created successfully. Please log in.'))
    emit('switch-form')
  } catch (err) {
    handleBackendErrors(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    await ensurePages()
  } catch (err) {
    console.error('Failed to load static pages:', err)
  }
})
</script>
