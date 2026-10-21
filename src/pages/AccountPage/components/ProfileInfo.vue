<template>
  <div class="profile-info">
    <div class="profile-info__column">
      <h2 class="profile-info__column-title _h6">
        {{ $t('Personal Information') }}
      </h2>

      <div class="profile-info__frame">
        <form
          class="profile-info__box profile-form"
          @submit.prevent="handleProfileSubmit"
        >
          <div class="profile-form__fields">
            <BaseInput
              v-model="profileData.nickname"
              class="profile-form__input"
              :label="$t('Nickname')"
              :disabled="isProfileLoading"
              autocomplete="nickname"
              required
            />

            <BaseInput
              v-model="profileData.name"
              class="profile-form__input"
              :label="$t('First Name')"
              :disabled="isProfileLoading"
              autocomplete="given-name"
              required
            />

            <BaseInput
              v-model="profileData.surname"
              class="profile-form__input"
              :label="$t('Last Name')"
              :disabled="isProfileLoading"
              autocomplete="family-name"
              required
            />

            <BaseInput
              v-model="profileData.email"
              class="profile-form__input"
              type="email"
              :label="$t('Email')"
              :disabled="isProfileLoading"
              autocomplete="email"
              required
            />
          </div>

          <p
            v-if="profileError"
            class="profile-form__message _text-error"
            role="alert"
          >
            {{ profileError }}
          </p>

          <p
            v-if="profileSuccess"
            class="profile-form__message _text-success"
            role="status"
          >
            {{ profileSuccess }}
          </p>

          <BaseButton
            type="submit"
            class="profile-form__submit"
            variant="bordered"
            :loading="isProfileLoading"
            :disabled="isProfileLoading || !hasProfileChanges"
          >
            {{ isProfileLoading ? $t('Saving..') : $t('Save Changes') }}
          </BaseButton>
        </form>
      </div>
    </div>

    <div class="profile-info__column">
      <h2 class="profile-info__column-title _h6">
        {{ $t('Change Password') }}
      </h2>

      <div class="profile-info__frame">
        <form
          class="profile-info__box profile-form"
          @submit.prevent="handlePasswordSubmit"
        >
          <div class="profile-form__fields">
            <div class="profile-form__password-group">
              <BaseInput
                v-model="passwordData.currentPassword"
                class="profile-form__input"
                type="password"
                :label="$t('Current password')"
                :disabled="isPasswordLoading"
                autocomplete="current-password"
                required
              />

              <p class="profile-form__hint">
                {{
                  $t(
                    'The password must contain at least 8 characters, including letters and numbers.',
                  )
                }}
              </p>
            </div>

            <BaseInput
              v-model="passwordData.newPassword"
              class="profile-form__input"
              type="password"
              :label="$t('New password')"
              :disabled="isPasswordLoading"
              autocomplete="new-password"
              required
            />

            <BaseInput
              v-model="passwordData.confirmNewPassword"
              class="profile-form__input"
              type="password"
              :label="$t('Confirm new password')"
              :disabled="isPasswordLoading"
              autocomplete="new-password"
              required
            />
          </div>

          <p
            v-if="passwordError"
            class="profile-form__message _text-error"
            role="alert"
          >
            {{ passwordError }}
          </p>

          <p
            v-if="passwordSuccess"
            class="profile-form__message _text-success"
            role="status"
          >
            {{ passwordSuccess }}
          </p>

          <BaseButton
            type="submit"
            class="profile-form__submit"
            variant="bordered"
            :loading="isPasswordLoading"
            :disabled="isPasswordLoading || !isPasswordFormFilled"
          >
            {{ isPasswordLoading ? $t('Saving..') : $t('Save Changes') }}
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['profile-updated', 'password-updated'])

const userStore = useUserStore()
const toast = useToast()
const { t } = useI18n()

const profileData = reactive({
  nickname: '',
  name: '',
  surname: '',
  email: '',
})

const initialProfileData = reactive({
  nickname: '',
  name: '',
  surname: '',
  email: '',
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)

const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const normalizeValue = value => String(value ?? '').trim()

const hasProfileChanges = computed(() => {
  return (
    normalizeValue(profileData.nickname) !==
      normalizeValue(initialProfileData.nickname) ||
    normalizeValue(profileData.name) !==
      normalizeValue(initialProfileData.name) ||
    normalizeValue(profileData.surname) !==
      normalizeValue(initialProfileData.surname) ||
    normalizeValue(profileData.email) !==
      normalizeValue(initialProfileData.email)
  )
})

const isPasswordFormFilled = computed(() => {
  return Boolean(
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmNewPassword,
  )
})

const fillProfileData = user => {
  const nextData = {
    nickname: user?.nickname || '',
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
  }

  Object.assign(profileData, nextData)
  Object.assign(initialProfileData, nextData)
}

const clearProfileMessages = () => {
  profileError.value = ''
  profileSuccess.value = ''
}

const clearPasswordMessages = () => {
  passwordError.value = ''
  passwordSuccess.value = ''
}

const validateEmail = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateProfile = () => {
  const nickname = normalizeValue(profileData.nickname)
  const name = normalizeValue(profileData.name)
  const surname = normalizeValue(profileData.surname)
  const email = normalizeValue(profileData.email)

  if (!nickname) {
    return t('Nickname is required')
  }

  if (!name) {
    return t('First name is required')
  }

  if (!surname) {
    return t('Last name is required')
  }

  if (!email) {
    return t('Email is required')
  }

  if (!validateEmail(email)) {
    return t('Please enter a valid email address')
  }

  return ''
}

const validatePassword = () => {
  if (!passwordData.currentPassword) {
    return t('Current password is required')
  }

  if (!passwordData.newPassword) {
    return t('New password is required')
  }

  if (passwordData.newPassword.length < 8) {
    return t('The new password must contain at least 8 characters')
  }

  if (!/[a-zA-Z]/.test(passwordData.newPassword)) {
    return t('The new password must contain at least one letter')
  }

  if (!/\d/.test(passwordData.newPassword)) {
    return t('The new password must contain at least one number')
  }

  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    return t('Passwords do not match')
  }

  if (passwordData.currentPassword === passwordData.newPassword) {
    return t('The new password must be different from the current password')
  }

  return ''
}

const getErrorMessage = (error, fallback) => {
  if (typeof error === 'string') {
    return error
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

const handleProfileSubmit = async () => {
  if (isProfileLoading.value || !hasProfileChanges.value) {
    return
  }

  clearProfileMessages()

  const validationError = validateProfile()

  if (validationError) {
    profileError.value = validationError
    return
  }

  isProfileLoading.value = true

  try {
    const payload = {
      nickname: normalizeValue(profileData.nickname),
      name: normalizeValue(profileData.name),
      surname: normalizeValue(profileData.surname),
      email: normalizeValue(profileData.email),
    }

    await userStore.updateProfile(payload)
    await userStore.fetchProfile()

    fillProfileData(userStore.user)

    profileSuccess.value = t('Profile updated successfully')
    toast.success(profileSuccess.value)

    emit('profile-updated', userStore.user)
  } catch (error) {
    console.error('Failed to update profile:', error)

    profileError.value = getErrorMessage(error, t('Failed to update profile'))

    toast.error(profileError.value)
  } finally {
    isProfileLoading.value = false
  }
}

const resetPasswordForm = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmNewPassword = ''
}

const handlePasswordSubmit = async () => {
  if (isPasswordLoading.value) {
    return
  }

  clearPasswordMessages()

  const validationError = validatePassword()

  if (validationError) {
    passwordError.value = validationError
    return
  }

  isPasswordLoading.value = true

  try {
    await userStore.updatePassword({
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      new_password_confirmation: passwordData.confirmNewPassword,
    })

    resetPasswordForm()

    passwordSuccess.value = t('Password changed successfully')
    toast.success(passwordSuccess.value)

    emit('password-updated')
  } catch (error) {
    console.error('Failed to change password:', error)

    passwordError.value = getErrorMessage(error, t('Failed to change password'))

    toast.error(passwordError.value)
  } finally {
    isPasswordLoading.value = false
  }
}

watch(
  () => userStore.user,
  user => {
    if (user && !isProfileLoading.value) {
      fillProfileData(user)
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => [
    profileData.nickname,
    profileData.name,
    profileData.surname,
    profileData.email,
  ],
  clearProfileMessages,
)

watch(
  () => [
    passwordData.currentPassword,
    passwordData.newPassword,
    passwordData.confirmNewPassword,
  ],
  clearPasswordMessages,
)

onMounted(async () => {
  if (userStore.user) {
    fillProfileData(userStore.user)
    return
  }

  isProfileLoading.value = true

  try {
    await userStore.fetchProfile()
    fillProfileData(userStore.user)
  } catch (error) {
    console.error('Failed to load profile:', error)

    profileError.value = getErrorMessage(
      error,
      t('Failed to load profile data'),
    )
  } finally {
    isProfileLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.profile-info {
  @include adaptiveValue('gap', 16, 12);

  display: grid;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  width: 100%;
  min-width: 0;

  &__column {
    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  &__column-title {
    color: var(--primary-color);
    font-family: var(--font-texturina);
    font-weight: 500;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__frame {
    @include adaptiveValue('padding-top', 32, 10);
    @include adaptiveValue('padding-right', 46, 10);
    @include adaptiveValue('padding-bottom', 32, 10);
    @include adaptiveValue('padding-left', 46, 10);

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-width: 0;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background: var(--bg-third-color);
  }

  &__box {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  @media (max-width: $md4) {
    gap: 28px;
    grid-template-columns: 1fr;

    &__frame {
      min-height: 0;
    }
  }
}

.profile-form {
  &__fields {
    @include adaptiveValue('gap', 24, 18);
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__input {
    display: block;

    width: 100%;
    min-width: 0;
  }

  &__password-group {
    display: flex;
    flex-direction: column;
    gap: 10px;

    width: 100%;
    min-width: 0;

    margin-bottom: auto;
  }

  &__hint {
    color: var(--seventh-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 150%;
  }

  &__message {
    margin: 0 0 8px;

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__submit {
    width: 100%;
    max-width: none;

    margin-top: auto;
    margin-left: 0;

    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
