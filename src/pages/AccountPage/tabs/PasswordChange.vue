<template>
  <div class="password-change">
    <div class="password-change__block">
      <div class="password-change__subtitle _l">
        {{ $t('Password Change') }}
      </div>

      <div class="password-change__content">
        <BaseButton
          class="password-change__save"
          variant="bordered"
          @click="submit"
          :disabled="userStore.isLoading"
        >
          <span v-if="userStore.isLoading">{{ $t('Saving') }}...</span>
          <span v-else>{{ $t('Change Password') }}</span>
        </BaseButton>

        <BaseInput
          v-model="form.currentPassword"
          type="password"
          autocomplete="off"
          :placeholder="t('Current password')"
          class="password-change__input"
          :error="errors.currentPassword"
          :disabled="userStore.isLoading"
        />

        <BaseInput
          v-model="form.newPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="t('New password')"
          class="password-change__input"
          :error="errors.newPassword"
          :disabled="userStore.isLoading"
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          autocomplete="new-password"
          :placeholder="t('Confirm new password')"
          class="password-change__input"
          :error="errors.confirmPassword"
          :disabled="userStore.isLoading"
        />

        <div v-if="userStore.error" class="password-change__error _text-error">
          {{ userStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const clearErrors = () => {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
}

const validate = () => {
  clearErrors()

  if (!form.currentPassword) {
    errors.currentPassword = t('Current password is required')
  }

  if (!form.newPassword) {
    errors.newPassword = t('New password is required')
  } else if (String(form.newPassword).length < 6) {
    errors.newPassword = t('Password is too short')
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('Please confirm new password')
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = t('Passwords do not match')
  }

  return (
    !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
  )
}

const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  clearErrors()
}

const submit = async () => {
  if (!validate()) return

  userStore.clearError?.()

  try {
    await userStore.updatePassword({
      cur_password: form.currentPassword,
      new_password: form.newPassword,
      repeat_password: form.confirmPassword,
    })

    toast.success(t('Password changed successfully'))
    resetForm()
  } catch {}
}

watch(
  () => form.currentPassword,
  () => {
    errors.currentPassword = ''
  },
)

watch(
  () => form.newPassword,
  () => {
    errors.newPassword = ''
  },
)

watch(
  () => form.confirmPassword,
  () => {
    errors.confirmPassword = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.password-change {
  &__block {
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 70, 20, 1280, 992, 1);
    }
  }

  &__subtitle {
    flex: 0 1 50%;
    font-weight: 700;
    height: fit-content;

    @media (min-width: $md5) {
      @include adaptiveValue('padding-bottom', 23, 15);
      border-bottom: 1px solid var(--bg-secondary-color);
    }

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__content {
    flex: 0 1 50%;
  }

  &__save {
    min-width: 217px;
    width: fit-content;
    margin-left: auto;

    @media (min-width: $md5) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 50, 20);
      }
    }

    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__input {
    :deep(.base-input) {
      border: 1px solid var(--bg-secondary-color);

      &:focus,
      &:focus-within {
        border: 1px solid var(--hint-color);
      }
    }

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__error {
    margin-top: 8px;
  }
}
</style>
