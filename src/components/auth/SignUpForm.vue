<template>
  <div class="sign-up">
    <div class="sign-up__top">
      <div class="sign-up__title _l">
        {{ $t('Create your account') }}
      </div>
      <form @submit.prevent="handleSignUp" class="sign-up__form">
        <div class="sign-up__inputs">
          <div class="sign-up__row">
            <BaseInput
              class="sign-up__input"
              v-model="form.firstName"
              name="firstName"
              autocomplete="given-name"
              :placeholder="$t('Enter your name')"
              :error="fieldErrors.firstName"
            />
            <BaseInput
              class="sign-up__input"
              v-model="form.lastName"
              name="lastName"
              autocomplete="family-name"
              :placeholder="$t('Enter your surname')"
              :error="fieldErrors.lastName"
            />
          </div>

          <BaseInput
            class="sign-up__input"
            v-model="form.email"
            type="email"
            name="email"
            autocomplete="email"
            :placeholder="$t('Enter your email')"
            :error="fieldErrors.email"
          />
          <BaseInput
            class="sign-up__input"
            v-model="form.phone"
            type="tel"
            :placeholder="$t('Enter your phone')"
            :error="fieldErrors.phone"
          />
          <!--<BasePhone
        class="sign-up__input"
        v-model="form.phoneDisplay"
        name="phone"
        autocomplete="tel"
        :placeholder="$t('Your Phone')"
        :error="fieldErrors.phone"
        @phone-data="handlePhoneData"
      />-->

          <BaseInput
            class="sign-up__input"
            v-model="form.password"
            type="password"
            name="password"
            autocomplete="new-password"
            :placeholder="$t('Enter your password')"
            :error="fieldErrors.password"
          />
          <BaseInput
            class="sign-up__input"
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            autocomplete="new-password"
            :placeholder="$t('Confirm your password')"
            :error="fieldErrors.confirmPassword"
          />
        </div>
        <div class="sign-up__terms">
          <BaseCheckbox
            v-model="form.termsAccepted"
            :error="fieldErrors.termsAccepted"
            terms
          />
        </div>
        <div v-if="error && !hasFieldErrors" class="sign-up__error _text-error">
          {{ error }}
        </div>
        <BaseButton
          type="submit"
          :disabled="isLoading"
          variant="primary"
          class="sign-up__submit"
        >
          <span v-if="isLoading">{{ $t('Signing up') }}...</span>
          <span v-else>{{ $t('Sign Up') }}</span>
        </BaseButton>
      </form>
    </div>
    <div class="sign-up__bottom">
      <!--<div class="sign-up__text">{{ $t('Already have an account?') }}</div>-->
      <!--  @click="$emit('open-sign-in')" -->
      <BaseButton
        variant="bordered"
        class="sign-up__switch"
        type="button"
        @click="router.push({ name: 'LoginPage' })"
      >
        {{ $t('Sign In') }}
      </BaseButton>
    </div>
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

defineEmits(['open-sign-in'])

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const { termsPage, privacyPage, ensurePages, getPageUrl } = useStaticPages()

const isLoading = ref(false)
const error = ref('')

const fieldErrors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  //phoneDisplay: '',
  //phoneData: {
  //  phone: '',
  //  phoneCountryCode: '',
  //  nationalNumber: '',
  //  isValid: false,
  //},
  password: '',
  confirmPassword: '',
  termsAccepted: false,
})

let isSubmitting = false

const clearFieldErrors = () => {
  Object.keys(fieldErrors.value).forEach(k => (fieldErrors.value[k] = ''))
}

const validateForm = () => {
  clearFieldErrors()
  error.value = ''

  if (!form.firstName) {
    fieldErrors.value.firstName = t('First name is required')
    error.value = fieldErrors.value.firstName
    return false
  }

  if (!form.lastName) {
    fieldErrors.value.lastName = t('Last name is required')
    error.value = fieldErrors.value.lastName
    return false
  }

  if (!form.email) {
    fieldErrors.value.email = t('Email is required')
    error.value = fieldErrors.value.email
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    fieldErrors.value.email = t('Please enter a valid email address')
    error.value = fieldErrors.value.email
    return false
  }

  if (!form.phone) {
    error.value = t('Phone number is required')
    error.value = fieldErrors.value.phone
    return false
  }

  //if (!form.phoneDisplay) {
  //  fieldErrors.value.phone = t('Phone number is required')
  //  error.value = fieldErrors.value.phone
  //  return false
  //}

  //if (form.phoneDisplay && !form.phoneData?.isValid) {
  //  fieldErrors.value.phone = t('Please enter a valid phone number')
  //  error.value = fieldErrors.value.phone
  //  return false
  //}

  if (!form.password) {
    fieldErrors.value.password = t('Password is required')
    error.value = fieldErrors.value.password
    return false
  }

  if (!form.confirmPassword) {
    fieldErrors.value.confirmPassword = t('Please confirm your password')
    error.value = fieldErrors.value.confirmPassword
    return false
  }

  if (form.password !== form.confirmPassword) {
    fieldErrors.value.password = t('Passwords do not match')
    fieldErrors.value.confirmPassword = t('Passwords do not match')
    error.value = fieldErrors.value.confirmPassword
    return false
  }

  if (!form.termsAccepted) {
    fieldErrors.value.termsAccepted = t(
      'Please accept the terms and Privacy Notice',
    )
    error.value = fieldErrors.value.termsAccepted
    return false
  }

  return true
}

const handleSteamSignup = () => {
  window.location.href = authStore.steamAuthUrl
}

const handlePhoneData = data => {
  form.phoneData = data || {
    phone: '',
    phoneCountryCode: '',
    nationalNumber: '',
    isValid: false,
  }
}

const hasFieldErrors = computed(() =>
  Object.values(fieldErrors.value).some(v => v && v.length > 0),
)

const handleSignUp = async () => {
  if (isSubmitting) return
  isSubmitting = true

  try {
    if (!validateForm()) {
      toast.error(error.value || t('Please fill in all required fields'))
      return
    }

    isLoading.value = true

    //await authStore.register({
    //  name: form.firstName,
    //  surname: form.lastName,
    //  email: form.email,
    //  phone: form.phoneData?.phone || form.phoneDisplay,
    //  phoneE164: form.phoneData?.phone,
    //  password: form.password,
    //  passConfirm: form.confirmPassword,
    //})
    await authStore.register({
      name: form.firstName,
      surname: form.lastName,
      email: form.email,
      phone: form.phone,
      //phone: form.phoneData?.phone || form.phoneDisplay,
      //phoneE164: form.phoneData?.phone,
      password: form.password,
      passConfirm: form.confirmPassword,
    })

    router.push({ name: 'account' })
  } catch (err) {
    // backend validation
    const backendErrors = err?.response?.data?.errors
    const backendMessage = err?.response?.data?.message

    if (backendErrors && Object.keys(backendErrors).length) {
      const map = {
        name: 'firstName',
        surname: 'lastName',
        email: 'email',
        phone: 'phone',
        password: 'password',
        passConfirm: 'confirmPassword',
      }

      Object.entries(backendErrors).forEach(([field, messages]) => {
        const key = map[field] || field
        if (key in fieldErrors.value)
          fieldErrors.value[key] = messages?.[0] || ''
      })

      if (backendMessage) {
        error.value = backendMessage
        toast.error(error.value)
      }
      return
    }

    error.value =
      backendMessage || err?.message || err || t('Registration failed')
    toast.error(error.value)
  } finally {
    isLoading.value = false
    setTimeout(() => (isSubmitting = false), 500)
  }
}

onMounted(async () => {
  await ensurePages()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sign-up {
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
      margin-bottom: 20px;
    }
  }
  &__row {
    @media (min-width: $md6) {
      display: flex;
      gap: 14px;
    }
    @media (max-width: $md6) {
      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }
  &__input {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
    &-text {
    }
    &-link {
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
