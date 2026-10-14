<!-- SignUpForm.vue -->
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
    <div class="sign-in__title _h3">{{ $t('Register') }}</div>
    <form @submit.prevent="handleSignUp" class="sign-in__form">
      <div class="sign-in__inputs">
        <BaseInput
          v-model="form.username"
          name="username"
          autocomplete="given-name"
          :placeholder="$t('Name')"
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
          :placeholder="$t('Email')"
          :error="fieldErrors.email"
          required
          class="sign-in__input"
        />
        <BaseInput
          v-model="form.password"
          type="password"
          name="password"
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
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const isLoading = ref(false)
const error = ref('')
const fieldErrors = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})
const toast = useToast()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})

// Add submission throttling variable
let isSubmitting = false

const validateForm = () => {
  // Reset field errors first
  Object.keys(fieldErrors.value).forEach(key => {
    fieldErrors.value[key] = ''
  })

  if (!form.username) {
    error.value = t('Username name is required')
    fieldErrors.value.username = t('Username is required')
    return false
  }

  if (!form.email) {
    error.value = t('Email is required')
    fieldErrors.value.email = t('Email is required')
    return false
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    error.value = t('Please enter a valid email address')
    fieldErrors.value.email = t('Please enter a valid email address')
    return false
  }

  if (!form.password) {
    error.value = t('Password is required')
    fieldErrors.value.password = t('Password is required')
    return false
  }

  if (!form.confirmPassword) {
    error.value = t('Please confirm your password')
    fieldErrors.value.confirmPassword = t('Please confirm your password')
    return false
  }

  if (form.password !== form.confirmPassword) {
    error.value = t('Passwords do not match')
    fieldErrors.value.password = t('Passwords do not match')
    fieldErrors.value.confirmPassword = t('Passwords do not match')
    return false
  }

  if (!form.termsAccepted) {
    error.value = t('Please accept the terms and privacy policy')
    fieldErrors.value.termsAccepted = t(
      'Please accept the terms and privacy policy',
    )
    return false
  }

  return true
}

// const handleSteamSignup = () => {
//   window.location.href = `${import.meta.env.VITE_DOMAIN}auth/steam/redirect`
// }

const handleSignUp = async () => {
  // Prevent multiple rapid submissions
  if (isSubmitting) {
    return
  }

  isSubmitting = true

  try {
    // Reset all errors
    error.value = ''
    Object.keys(fieldErrors.value).forEach(key => {
      fieldErrors.value[key] = ''
    })

    if (!validateForm()) {
      // Show toast with the error message for better visibility
      toast.error(error.value || t('Please fill in all required fields'))

      // Release the lock after validation failure
      setTimeout(() => {
        isSubmitting = false
      }, 300)
      return
    }

    isLoading.value = true

    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password,
      passConfirm: form.confirmPassword,
    })

    router.push({ name: 'account' })
  } catch (err) {
    // Handle backend validation errors
    if (
      err?.response?.data?.errors &&
      Object.keys(err.response.data.errors).length > 0
    ) {
      // Map backend field names to our form field names
      const fieldMapping = {
        username: 'username',
        email: 'email',
        password: 'password',
        passConfirm: 'confirmPassword',
      }

      // Distribute specific errors to each field
      Object.entries(err.response.data.errors).forEach(([field, messages]) => {
        const formField = fieldMapping[field] || field
        if (formField in fieldErrors.value) {
          fieldErrors.value[formField] = messages[0]
        }
      })

      // Set general error message if we have one
      if (err?.response?.data?.message) {
        error.value = err.response.data.message
        toast.error(error.value)
      } else if (Object.values(err.errors).length > 0) {
        // Set first error as general error if no message provided
        error.value = Object.values(err.errors)[0][0]
        toast.error(error.value)
      }
    } else if (err?.response?.data?.message) {
      error.value = err.response.data.message
      toast.error(error.value)
    } else {
      error.value = err?.message || err || t('Registration failed')
      toast.error(error.value)
    }
  } finally {
    isLoading.value = false
    // Add a small delay before allowing another submission
    setTimeout(() => {
      isSubmitting = false
    }, 500)
  }
}

// const handlePhoneData = data => {
//   if (data) {
//     form.phoneData = data
//   } else {
//     form.phoneData = {
//       phone: '',
//       phoneCountryCode: '',
//       nationalNumber: '',
//       isValid: false,
//     }
//   }
// }

// Add computed property for checking if we have any field errors
const hasFieldErrors = computed(() => {
  return Object.values(fieldErrors.value).some(error => error !== '')
})

onMounted(async () => {
  await ensurePages()
})

defineEmits(['switch-form'])
</script>
