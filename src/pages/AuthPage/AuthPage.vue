<template>
  <AuthLayout :is-red-decor="activeForm === 'reset'">
    <div class="auth">
      <div class="auth__top">
        <button v-if="false" @click="close()" class="auth__clsoe">
          <SvgIcon :icon="CloseIcon" class="auth__clsoe-icon" />
        </button>
        <div class="auth__form">
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

      <div
        v-if="activeForm === 'signup' || activeForm === 'signin'"
        class="auth__bottom"
      >
        <div v-if="activeForm === 'signup'" class="auth__box">
          <div class="auth__title">
            {{ $t('Already have an account?') }}
          </div>
          <BaseButton
            @click="toggleForm('signin')"
            variant="bordered"
            class="auth__button"
            >{{ $t('Login') }}</BaseButton
          >
        </div>
        <div v-else-if="activeForm === 'signin'" class="auth__box">
          <div class="auth__title">
            {{ $t("Don't have account?") }}
          </div>
          <BaseButton
            @click="toggleForm('signup')"
            variant="bordered"
            class="auth__button"
          >
            {{ $t('REGISTER') }}
          </BaseButton>
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

const VALID_FORM_TYPES = Object.values(FORM_TYPES)

const { t } = useI18n()

function isValidFormType(formType) {
  return VALID_FORM_TYPES.includes(formType)
}

const activeForm = ref(
  isValidFormType(route.query.form) ? route.query.form : FORM_TYPES.signin,
)
watch(
  () => route.query.form,
  newForm => {
    if (newForm === undefined && route.path === '/auth') {
      router.replace({ name: 'Auth', query: { form: activeForm.value } })
    } else {
      activeForm.value = isValidFormType(newForm) ? newForm : FORM_TYPES.signin
    }
  },
  { immediate: true },
)

const toggleForm = form => {
  if (isValidFormType(form)) {
    activeForm.value = form
    // eslint-disable-next-line no-unused-vars
    const { form: _form, ...otherQueryParams } = route.query

    router
      .push({
        name: 'Auth',
        query: { form, ...otherQueryParams },
      })
      .catch(err => {
        console.error('Navigation error:', err)
      })
  } else {
    activeForm.value = FORM_TYPES.signin

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
  if (route.path === '/auth' && !route.query.form) {
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
    @include adaptiveValue('border-radius', 22, 10);
    background: linear-gradient(180deg, #111624 0%, #111624 100%);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }
  &__top {
    @include adaptiveValue('padding-top', 50, 30);
    @include adaptiveValue('padding-bottom', 42, 10);
    padding-right: 10px;
    padding-left: 10px;
  }
  &__form {
    max-width: 328px;

    margin: 0 auto;
  }
  &__bottom {
    @include adaptiveValue('padding-top', 18, 10);
    @include adaptiveValue('padding-right', 50, 10);
    @include adaptiveValue('padding-bottom', 18, 10);
    @include adaptiveValue('padding-left', 50, 10);
  }

  &__box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    width: 100%;
    @media (max-width: $md8) {
      flex-direction: column;
      justify-content: center;
    }
  }

  &__title {
    color: var(--fifth-color);
    font-size: 14px;
    line-height: 120%;
  }

  &__button {
    max-width: 147px;
  }
}
</style>
