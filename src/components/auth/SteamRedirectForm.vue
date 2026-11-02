<template>
  <div class="sign-up">
    <div class="sign-up__title _h2">
      {{ $t('Welcome to') }}
      <span>{{ $t('WipeVault') }}</span>
    </div>

    <form class="sign-up__form" @submit.prevent="handleSteamSignUp">
      <div class="sign-up__terms">
        <BaseCheckbox v-model="termsAccepted" :error="termsError" terms />
      </div>

      <div v-if="termsError" class="sign-up__error _text-error">
        {{ termsError }}
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        class="sign-up__submit"
        :disabled="!termsAccepted"
      >
        {{ $t('Sign In with Steam') }}
        <SvgIcon :icon="SteamIcon" class="sign-up__submit-icon" />
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SteamIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const { t } = useI18n()

const authStore = useAuthStore()

const termsAccepted = ref(false)
const termsError = ref('')

const handleSteamSignUp = () => {
  termsError.value = ''

  if (!termsAccepted.value) {
    termsError.value = t('Please accept the terms and Privacy Notice')
    return
  }

  window.location.href = authStore.steamAuthUrl
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sign-up {
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 15);
    }
  }

  &__form {
  }

  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 20);
    }
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
    min-width: 150px;
    width: fit-content;
    margin: 0 auto;

    font-size: 16px;
    line-height: 100%;

    text-transform: uppercase;

    font-family: var(--font-condensed);

    @include adaptiveValue('min-height', 36, 40);

    height: fit-content;

    padding-top: 5px !important;
    padding-bottom: 5px !important;
    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}
</style>
