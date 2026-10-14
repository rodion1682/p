<template>
  <div class="profile-info">
    <div class="profile-info__column">
      <div class="profile-info__column-title _h4">
        {{ $t('Personal Information') }}
      </div>

      <div class="profile-info__frame">
        <form
          class="profile-info__box profile-form"
          @submit.prevent="handleProfileSubmit"
        >
          <div class="profile-form__fields">
            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('Nickname') }}
              </span>

              <BaseInput
                v-model="profileData.nickname"
                class="profile-form__input"
                :placeholder="$t('Nickname')"
                :disabled="isProfileLoading"
                autocomplete="nickname"
                required
              />
            </label>

            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('First Name') }}
              </span>

              <BaseInput
                v-model="profileData.name"
                class="profile-form__input"
                :placeholder="$t('Name')"
                :disabled="isProfileLoading"
                autocomplete="given-name"
                required
              />
            </label>

            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('Last Name') }}
              </span>

              <BaseInput
                v-model="profileData.surname"
                class="profile-form__input"
                :placeholder="$t('Surname')"
                :disabled="isProfileLoading"
                autocomplete="family-name"
                required
              />
            </label>

            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('Email') }}
              </span>

              <BaseInput
                v-model="profileData.email"
                class="profile-form__input"
                type="email"
                :placeholder="$t('Email')"
                :disabled="isProfileLoading"
                autocomplete="email"
                required
              />
            </label>
          </div>

          <p v-if="profileError" class="profile-form__message _text-error">
            {{ profileError }}
          </p>

          <p v-if="profileSuccess" class="profile-form__message _text-success">
            {{ profileSuccess }}
          </p>

          <BaseButton
            type="submit"
            class="profile-form__submit"
            variant="hint-bordered"
            :loading="isProfileLoading"
            :disabled="isProfileLoading || !hasProfileChanges"
          >
            {{ isProfileLoading ? $t('Saving..') : $t('Save Changes') }}
          </BaseButton>
        </form>
      </div>
    </div>

    <div class="profile-info__column">
      <div class="profile-info__column-title _h4">
        {{ $t('Change Password') }}
      </div>

      <div class="profile-info__frame">
        <form
          class="profile-info__box profile-form"
          @submit.prevent="handlePasswordSubmit"
        >
          <div class="profile-form__fields">
            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('Current password') }}
              </span>

              <BaseInput
                v-model="passwordData.currentPassword"
                class="profile-form__input"
                type="password"
                :placeholder="$t('Current password')"
                :disabled="isPasswordLoading"
                autocomplete="current-password"
                required
              />
            </label>

            <p class="profile-form__hint">
              {{
                $t(
                  'The password must contain at least 8 characters, including letters and numbers.',
                )
              }}
            </p>

            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('New password') }}
              </span>

              <BaseInput
                v-model="passwordData.newPassword"
                class="profile-form__input"
                type="password"
                :placeholder="$t('New password')"
                :disabled="isPasswordLoading"
                autocomplete="new-password"
                required
              />
            </label>

            <label class="profile-form__field">
              <span class="profile-form__label">
                {{ $t('Confirm new password') }}
              </span>

              <BaseInput
                v-model="passwordData.confirmNewPassword"
                class="profile-form__input"
                type="password"
                :placeholder="$t('Confirm new password')"
                :disabled="isPasswordLoading"
                autocomplete="new-password"
                required
              />
            </label>
          </div>

          <p v-if="passwordError" class="profile-form__message _text-error">
            {{ passwordError }}
          </p>

          <p v-if="passwordSuccess" class="profile-form__message _text-success">
            {{ passwordSuccess }}
          </p>

          <BaseButton
            type="submit"
            class="profile-form__submit"
            variant="hint-bordered"
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

const normalizeValue = value => {
  return String(value ?? '').trim()
}

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

    /*
     * Refresh the profile so the sidebar/header immediately
     * receives the latest nickname and email.
     */
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
  () => {
    profileError.value = ''
    profileSuccess.value = ''
  },
)

watch(
  () => [
    passwordData.currentPassword,
    passwordData.newPassword,
    passwordData.confirmNewPassword,
  ],
  () => {
    passwordError.value = ''
    passwordSuccess.value = ''
  },
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
  @media (min-width: $md3) {
    @include adaptiveValue('gap', 16, 10);
    display: flex;
  }

  &__column {
    display: flex;
    flex: 0 1 50%;
    flex: 1 1 100%;
    flex-direction: column;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
    &-title {
      font-weight: 400;
      text-transform: capitalize;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 15);
      }
    }
  }

  &__frame {
    @include adaptiveValue('padding-top', 32, 10);
    @include adaptiveValue('padding-bottom', 32, 10);
    @include adaptiveValue('padding-left', 48, 10);
    @include adaptiveValue('padding-right', 48, 10);
    height: 100%;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
    @media (max-width: $md5) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__box {
    display: flex;
    flex-direction: column;

    height: 100%;
  }
}

.profile-form {
  &__fields {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__field {
    @media (min-width: $md5) {
      display: flex;
      flex: 1 1 100%;
      gap: 10px;
    }
    @media (max-width: $md5) {
      display: block;
    }

    width: 100%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__label {
    overflow: hidden;

    margin-right: auto;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    @media (min-width: $md5) {
      flex: 0 1 33.333%;
      align-self: center;

      min-width: 33.333%;
    }
    @media (max-width: $md5) {
      &:not(:last-child) {
        display: block;

        margin-bottom: 8px;
      }
    }
  }

  &__input {
    width: 100%;
    @media (min-width: $md3) {
      max-width: 400px;
    }
  }

  &__message {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__hint {
    color: var(--hint-third-color);
    font-size: 14px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 15);
    }
  }

  &__submit {
    max-width: 163px;

    margin-top: auto;
    margin-left: auto;
  }
}
</style>
