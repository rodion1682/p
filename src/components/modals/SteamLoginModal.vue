<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['steam-login-modal__inner']"
    @close="handleClose"
  >
    <div class="steam-login-modal">
      <div class="steam-login-modal__title _h3">
        {{ $t('Welcome to scrap-lands') }}
      </div>

      <form class="steam-login-modal__form" @submit.prevent="handleSteamLogin">
        <div class="steam-login-modal__terms">
          <BaseCheckbox v-model="termsAccepted" :error="termsError" terms />
        </div>

        <div v-if="termsError" class="steam-login-modal__error _text-error">
          {{ termsError }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          class="steam-login-modal__submit"
          :disabled="!termsAccepted"
        >
          <SvgIcon :icon="SteamIcon" class="steam-login-modal__icon" />
          <span>{{ $t('Login with Steam') }}</span>
        </BaseButton>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useAuthStore } from '@/stores/auth'
import { SteamIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const authStore = useAuthStore()

const termsAccepted = ref(false)
const termsError = ref('')

const handleSteamLogin = () => {
  termsError.value = ''

  if (!termsAccepted.value) {
    termsError.value = t('Please accept the terms and Privacy Notice')

    return
  }

  if (!authStore.steamAuthUrl) {
    termsError.value = t('Steam login is currently unavailable')

    return
  }

  window.location.href = authStore.steamAuthUrl
}

const handleClose = () => {
  termsError.value = ''

  emit('close')
}

watch(
  () => props.show,
  isOpen => {
    if (!isOpen) {
      return
    }

    termsAccepted.value = false
    termsError.value = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.steam-login-modal {
  width: 100%;

  &__title {
    text-align: center;
    line-height: 130%;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__form {
    width: 100%;
  }

  &__terms {
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
    width: 100%;
    max-width: 190px;

    margin-right: auto;

    font-size: 16px !important;
    text-transform: uppercase !important;
    font-family: var(--font-condensed) !important;
  }
  &__icon {
    min-width: 24px;
    height: 24px;
  }
}

:deep(.steam-login-modal__inner) {
  width: 100%;
  max-width: 520px;
}
</style>
