<template>
  <div class="sign-up">
    <div class="sign-up__subtitle _h4">
      {{ $t('Welcome TO') }}
    </div>
    <div class="sign-up__title _h2">
      <span>{{ $t('WASTELANDCORE') }}</span>
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
        variant="shadow"
        class="sign-up__submit"
        :disabled="!termsAccepted"
      >
        {{ $t('Login with') }}
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
  &__subtitle {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 4);
    }
  }
  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__form {
  }

  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
    max-width: 207px;
    @include adaptiveValue('min-height', 48, 40);
    margin: 0 auto;
    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }
}
</style>
