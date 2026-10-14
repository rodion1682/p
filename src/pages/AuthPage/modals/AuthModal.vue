<template>
  <BaseModal
    :show="show"
    size="medium"
    class="auth-modal"
    @update:show="handleShowUpdate"
    @close="close"
  >
    <div class="auth-modal__body">
      <div class="auth-modal__content">
        <SignInForm
          v-if="activeForm === FORM_TYPES.signin"
          @forgot-password="toggleForm(FORM_TYPES.reset)"
          @switch-form="toggleForm(FORM_TYPES.signup)"
        />

        <SignUpForm
          v-else-if="activeForm === FORM_TYPES.signup"
          @switch-form="toggleForm(FORM_TYPES.signin)"
        />

        <PasswordResetForm
          v-else
          @back-to-signin="toggleForm(FORM_TYPES.signin)"
        />
      </div>

      <div
        v-if="
          activeForm === FORM_TYPES.signin || activeForm === FORM_TYPES.signup
        "
        class="auth-modal__bottom"
      >
        <div class="auth-modal__bottom-inner">
          <template v-if="activeForm === FORM_TYPES.signup">
            <div class="auth-modal__title _h4">
              {{ $t('Already have an account?') }}
            </div>

            <BaseButton
              variant="hint-bordered"
              class="auth-modal__button"
              @click="toggleForm(FORM_TYPES.signin)"
            >
              {{ $t('LOGIN') }}
            </BaseButton>
          </template>

          <template v-else>
            <div class="auth-modal__title _h4">
              {{ $t("Don't have account?") }}
            </div>

            <BaseButton
              variant="hint-bordered"
              class="auth-modal__button"
              @click="toggleForm(FORM_TYPES.signup)"
            >
              {{ $t('Create Account') }}
            </BaseButton>
          </template>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import PasswordResetForm from '@/pages/AuthPage/components/PasswordResetForm.vue'
import SignInForm from '@/pages/AuthPage/components/SignInForm.vue'
import SignUpForm from '@/pages/AuthPage/components/SignUpForm.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },

  initialForm: {
    type: String,
    default: 'signin',
  },
})

const emit = defineEmits(['update:show', 'close'])

const FORM_TYPES = {
  signin: 'signin',
  signup: 'signup',
  reset: 'reset',
}

const VALID_FORM_TYPES = Object.values(FORM_TYPES)

const getValidForm = form => {
  return VALID_FORM_TYPES.includes(form) ? form : FORM_TYPES.signin
}

const activeForm = ref(getValidForm(props.initialForm))

const toggleForm = form => {
  activeForm.value = getValidForm(form)
}

const handleShowUpdate = value => {
  emit('update:show', value)
}

const close = () => {
  emit('update:show', false)
  emit('close')
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      activeForm.value = getValidForm(props.initialForm)
    }
  },
)

watch(
  () => props.initialForm,
  form => {
    if (props.show) {
      activeForm.value = getValidForm(form)
    }
  },
)
</script>

<style lang="scss" scoped>
.auth-modal {
  &__body {
    max-width: 380px;

    margin: 0 auto;
  }

  &__content {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 25);
    }
  }

  &__title {
    text-align: center;

    text-rendering: none;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__button {
    max-width: 190px;

    margin: 0 auto;
  }
}
</style>
