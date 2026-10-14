<!-- AuthPage.vue -->
<template>
  <AuthLayout>
    <div class="auth">
      <div class="auth__top">
        <button @click="close()" class="auth__clsoe">
          <SvgIcon :icon="CloseIcon" class="auth__clsoe-icon" />
        </button>
        <div class="auth__box">
          <div class="auth__content">
            <SignInForm
              v-if="activeForm === 'signin'"
              @forgot-password="toggleForm('reset')"
              @switch-form="toggleForm('signup')"
            />
            <SignUpForm
              v-else-if="activeForm === 'signup'"
              @switch-form="toggleForm('signin')"
            />
            <PasswordResetForm v-else @back-to-signin="toggleForm('signin')" />
          </div>
        </div>
      </div>

      <div
        v-if="activeForm === 'signup' || activeForm === 'signin'"
        class="auth__bottom"
      >
        <div v-if="activeForm === 'signup'" class="auth__box">
          <div class="auth__content">
            <div class="auth__title _h3">
              {{ $t('Already have an account?') }}
            </div>
            <BaseButton
              @click="toggleForm('signin')"
              variant="bordered"
              class="auth__button"
              >{{ $t('Sign In') }}</BaseButton
            >
          </div>
        </div>
        <div v-else-if="activeForm === 'signin'" class="auth__box">
          <div class="auth__content">
            <div class="auth__title _h3">
              {{ $t("Don't have account?") }}
            </div>
            <BaseButton
              @click="toggleForm('signup')"
              variant="bordered"
              class="auth__button"
            >
              {{ $t('Sign Up') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import router from '@/router'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PasswordResetForm from './components/PasswordResetForm.vue'
import SignInForm from './components/SignInForm.vue'
import SignUpForm from './components/SignUpForm.vue'

const route = useRoute()
const FORM_TYPES = {
  signin: 'signin',
  signup: 'signup',
  reset: 'reset',
}
// Create an array of valid form types for easier validation
const VALID_FORM_TYPES = Object.values(FORM_TYPES)

const { t } = useI18n()
const getFormTitle = () => {
  if (activeForm.value === FORM_TYPES.signin) {
    return t('Login')
  } else if (activeForm.value === FORM_TYPES.signup) {
    return t('Create new account')
  } else if (activeForm.value === FORM_TYPES.reset) {
    return t('Reset Password')
  }
}

// const getFormDesc = () => {
//   if (activeForm.value === FORM_TYPES.signin) {
//     return t('Welcome back!')
//   } else if (activeForm.value === FORM_TYPES.signup) {
//     return t('Create your account!')
//   }
// }

// Function to validate if a form type is valid
function isValidFormType(formType) {
  return VALID_FORM_TYPES.includes(formType)
}

// Initialize with validated form type or fallback to signin
const activeForm = ref(
  isValidFormType(route.query.form) ? route.query.form : FORM_TYPES.signin,
)

// Watch for route query changes and validate the form type
watch(
  () => route.query.form,
  newForm => {
    if (newForm === undefined && route.path === '/auth') {
      // If refreshed without query param, add it back
      router.replace({ name: 'Auth', query: { form: activeForm.value } })
    } else {
      activeForm.value = isValidFormType(newForm) ? newForm : FORM_TYPES.signin
    }
  },
  { immediate: true }, // Run immediately on component creation
)

const toggleForm = form => {
  if (isValidFormType(form)) {
    activeForm.value = form

    // Create a new query object without the existing form parameter
    // eslint-disable-next-line no-unused-vars
    const { form: _form, ...otherQueryParams } = route.query

    router
      .push({
        name: 'Auth',
        query: { form, ...otherQueryParams },
      })
      .catch(err => {
        // Handle navigation errors - usually happens with duplicated navigation
        console.error('Navigation error:', err)
      })
  } else {
    // If invalid form type, default to signin
    activeForm.value = FORM_TYPES.signin

    // Create a new query object without the existing form parameter
    // eslint-disable-next-line no-unused-vars
    const { form: _form, ...otherQueryParams } = route.query

    router
      .push({
        name: 'Auth',
        query: { form: FORM_TYPES.signin, ...otherQueryParams },
      })
      .catch(err => {
        console.error('Navigation error:', err)
      })
  }
}

onMounted(() => {
  // Ensure there's always a form query parameter
  if (route.path === '/auth' && !route.query.form) {
    // Make a copy of the current query parameters
    const newQuery = { ...route.query, form: FORM_TYPES.signin }

    router
      .replace({
        name: 'Auth',
        query: newQuery,
      })
      .catch(err => {
        console.error('Navigation error:', err)
      })
  }
})

const close = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.auth {
  &__top,
  &__bottom {
    @include adaptiveValue('border-radius', 10, 6);
    position: relative;

    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__clsoe {
    @include adaptiveValue('min-width', 64, 40);
    @include adaptiveValue('height', 64, 40);
    @include adaptiveValue('top', 12, 2);
    @include adaptiveValue('right', 12, 2);
    position: absolute;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--hint-primary-color);

    transition: color 0.3s ease 0s;
    &-icon {
      min-width: 24px;
      height: 24px;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__box {
    @include adaptiveValue('padding-top', 30, 10);
    @include adaptiveValue('padding-bottom', 30, 10);
    @include adaptiveValue('border-radius', 10, 6);
    padding-right: 10px;
    padding-left: 10px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fifth-color);
  }

  &__content {
    max-width: 384px;

    margin: 0 auto;

    text-align: center;
  }

  &__title {
    color: var(--primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__button {
    font-family: var(--font-inter) !important;
    font-size: 14px !important;
    font-weight: 500 !important;
  }
}
</style>
