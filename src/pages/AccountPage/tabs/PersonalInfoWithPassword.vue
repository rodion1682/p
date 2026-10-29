<template>
  <div class="profile-info">
    <form class="profile-info__card" @submit.prevent="submitPersonalInfo">
      <h2 class="profile-info__title">
        {{ $t('Personal Information') }}
      </h2>

      <div class="profile-info__fields">
        <BaseInput
          v-model="form.name"
          class="profile-info__input"
          :label="$t('Name')"
          :placeholder="$t('Name')"
          autocomplete="given-name"
          :error="errors.name"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.surname"
          class="profile-info__input"
          :label="$t('Surname')"
          :placeholder="$t('Surname')"
          autocomplete="family-name"
          :error="errors.surname"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.email"
          class="profile-info__input"
          type="email"
          :label="$t('E-Mail')"
          :placeholder="$t('person@gmail.com')"
          autocomplete="email"
          :error="errors.email"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.phone"
          class="profile-info__input"
          type="tel"
          :label="$t('Phone')"
          :placeholder="'+1 234 5678 9000'"
          autocomplete="tel"
          :error="errors.phone"
          :disabled="isAnySubmitting"
        />
      </div>

      <BaseButton
        type="submit"
        variant="white-bordered"
        class="profile-info__save"
        :disabled="isAnySubmitting"
      >
        <span v-if="isSubmittingPersonal"> {{ $t('Saving') }}... </span>
        <span v-else>{{ $t('Save') }}</span>
      </BaseButton>
    </form>

    <form class="profile-info__card" @submit.prevent="submitBillingInfo">
      <h2 class="profile-info__title">
        {{ $t('Billing Information') }}
      </h2>

      <div class="profile-info__fields">
        <BaseSelect
          v-model="form.countryId"
          class="profile-info__input"
          :options="countryOptions"
          option-label="title"
          option-value="id"
          :label="$t('Country')"
          :placeholder="$t('Country')"
          :error="errors.countryId"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.city"
          class="profile-info__input"
          :label="$t('City')"
          :placeholder="$t('City')"
          autocomplete="address-level2"
          :error="errors.city"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.address"
          class="profile-info__input"
          :label="$t('Address')"
          :placeholder="$t('Address')"
          autocomplete="street-address"
          :error="errors.address"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="form.postCode"
          class="profile-info__input"
          :label="$t('Postcode')"
          :placeholder="$t('123456')"
          autocomplete="postal-code"
          :error="errors.postCode"
          :disabled="isAnySubmitting"
        />
      </div>

      <BaseButton
        type="submit"
        variant="white-bordered"
        class="profile-info__save"
        :disabled="isAnySubmitting"
      >
        <span v-if="isSubmittingBilling"> {{ $t('Saving') }}... </span>
        <span v-else>{{ $t('Save') }}</span>
      </BaseButton>
    </form>

    <form class="profile-info__card" @submit.prevent="submitPassword">
      <h2 class="profile-info__title">
        {{ $t('Password Change') }}
      </h2>

      <div class="profile-info__fields">
        <BaseInput
          v-model="passwordForm.currentPassword"
          class="profile-info__input"
          type="password"
          autocomplete="current-password"
          :label="$t('Current password')"
          :error="passwordErrors.currentPassword"
          :disabled="isAnySubmitting"
        />

        <p class="profile-info__hint">
          {{ $t('* Your new password must contain at least 8 characters.') }}
        </p>

        <BaseInput
          v-model="passwordForm.newPassword"
          class="profile-info__input"
          type="password"
          autocomplete="new-password"
          :label="$t('New password')"
          :error="passwordErrors.newPassword"
          :disabled="isAnySubmitting"
        />

        <BaseInput
          v-model="passwordForm.confirmPassword"
          class="profile-info__input"
          type="password"
          autocomplete="new-password"
          :label="$t('Confirm new password')"
          :error="passwordErrors.confirmPassword"
          :disabled="isAnySubmitting"
        />
      </div>

      <div
        v-if="passwordError"
        class="profile-info__error _text-error"
        role="alert"
      >
        {{ passwordError }}
      </div>

      <BaseButton
        type="submit"
        variant="white-bordered"
        class="profile-info__save"
        :disabled="isAnySubmitting"
      >
        <span v-if="isSubmittingPassword"> {{ $t('Saving') }}... </span>
        <span v-else>{{ $t('Save') }}</span>
      </BaseButton>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useToast } from '@/composables/useToast'
import { useCountriesStore } from '@/stores/countries'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()

const toast = useToast()
const userStore = useUserStore()
const countriesStore = useCountriesStore()

const isSubmittingPersonal = ref(false)
const isSubmittingBilling = ref(false)
const isSubmittingPassword = ref(false)
const passwordError = ref('')

const isAnySubmitting = computed(
  () =>
    isSubmittingPersonal.value ||
    isSubmittingBilling.value ||
    isSubmittingPassword.value,
)

const countryOptions = computed(() => countriesStore.countries || [])

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  address: '',
  postCode: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  countryId: '',
  city: '',
  address: '',
  postCode: '',
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const normalize = value => String(value ?? '').trim()

const getProfilePayload = raw => raw?.payload || raw?.data || raw || null

const isPlaceholderName = value => {
  const name = normalize(value).toLowerCase()
  return name === 'name' || name === 'surname'
}

const fillFromUser = rawUser => {
  const user = getProfilePayload(rawUser)

  if (!user) return

  form.name = isPlaceholderName(user.name) ? '' : user.name || ''

  form.surname = isPlaceholderName(user.surname) ? '' : user.surname || ''

  form.email = user.email || ''
  form.phone = user.phone || ''

  form.countryId =
    user.country_id ??
    user.country?.id ??
    (typeof user.country === 'string' ? user.country : '') ??
    ''

  form.city = user.city || ''
  form.address = user.address || ''
  form.postCode = user.post_code || user.zip || ''
}

const clearErrors = fields => {
  fields.forEach(field => {
    errors[field] = ''
  })
}

const clearPasswordErrors = () => {
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
  passwordError.value = ''
}

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  clearPasswordErrors()
}

const validatePersonalInfo = () => {
  clearErrors(['name', 'surname', 'email', 'phone'])

  if (!normalize(form.name) || isPlaceholderName(form.name)) {
    errors.name = t('Please enter name')
  }

  if (!normalize(form.surname) || isPlaceholderName(form.surname)) {
    errors.surname = t('Please enter surname')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalize(form.email))) {
    errors.email = t('Invalid email format')
  }

  if (!normalize(form.phone)) {
    errors.phone = t('Phone number is required')
  }

  return ![errors.name, errors.surname, errors.email, errors.phone].some(
    Boolean,
  )
}

const validateBillingInfo = () => {
  clearErrors(['countryId', 'city', 'address', 'postCode'])

  if (!form.countryId) {
    errors.countryId = t('Country is required')
  }

  if (!normalize(form.city)) {
    errors.city = t('City is required')
  }

  if (!normalize(form.address)) {
    errors.address = t('Address is required')
  }

  if (!normalize(form.postCode)) {
    errors.postCode = t('Post Code is required')
  }

  return ![errors.countryId, errors.city, errors.address, errors.postCode].some(
    Boolean,
  )
}

const validatePassword = () => {
  clearPasswordErrors()

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = t('Current password is required')
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = t('New password is required')
  } else if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = t(
      'Password must contain at least 8 characters',
    )
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('Please confirm new password')
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = t('Passwords do not match')
  }

  return !Object.values(passwordErrors).some(Boolean)
}

const submitPersonalInfo = async () => {
  if (isAnySubmitting.value || !validatePersonalInfo()) return

  isSubmittingPersonal.value = true

  try {
    await userStore.updateProfile({
      name: normalize(form.name),
      surname: normalize(form.surname),
      email: normalize(form.email),
      phone: normalize(form.phone),
    })

    toast.success(t('Personal information updated successfully'))

    await userStore.fetchProfile()
    fillFromUser(userStore.user)
  } catch (error) {
    console.error('Profile update error:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to update personal information'),
    )
  } finally {
    isSubmittingPersonal.value = false
  }
}

const submitBillingInfo = async () => {
  if (isAnySubmitting.value || !validateBillingInfo()) return

  isSubmittingBilling.value = true

  try {
    await userStore.updateProfile({
      country: form.countryId,
      city: normalize(form.city),
      address: normalize(form.address),
      postCode: normalize(form.postCode),
    })

    toast.success(t('Address information updated successfully'))

    await userStore.fetchProfile()
    fillFromUser(userStore.user)
  } catch (error) {
    console.error('Billing update error:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to update address information'),
    )
  } finally {
    isSubmittingBilling.value = false
  }
}

const submitPassword = async () => {
  if (isAnySubmitting.value || !validatePassword()) return

  isSubmittingPassword.value = true
  userStore.clearError?.()

  try {
    await userStore.updatePassword({
      cur_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      repeat_password: passwordForm.confirmPassword,
    })

    toast.success(t('Password changed successfully'))
    resetPasswordForm()
  } catch (error) {
    console.error('Password update error:', error)

    passwordError.value =
      error?.response?.data?.message ||
      error?.message ||
      userStore.error ||
      t('Failed to update password')

    toast.error(passwordError.value)
  } finally {
    isSubmittingPassword.value = false
  }
}

onMounted(async () => {
  try {
    if (!countriesStore.countries?.length) {
      await countriesStore.fetchCountries()
    }

    await userStore.fetchProfile()
    fillFromUser(userStore.user)
  } catch (error) {
    console.error('Profile load error:', error)
    toast.error(t('Failed to load profile data'))
  }
})

watch(
  () => userStore.user,
  user => {
    if (user) fillFromUser(user)
  },
)

watch(
  () => form.name,
  () => {
    errors.name = ''
  },
)
watch(
  () => form.surname,
  () => {
    errors.surname = ''
  },
)
watch(
  () => form.email,
  () => {
    errors.email = ''
  },
)
watch(
  () => form.phone,
  () => {
    errors.phone = ''
  },
)
watch(
  () => form.countryId,
  () => {
    errors.countryId = ''
  },
)
watch(
  () => form.city,
  () => {
    errors.city = ''
  },
)
watch(
  () => form.address,
  () => {
    errors.address = ''
  },
)
watch(
  () => form.postCode,
  () => {
    errors.postCode = ''
  },
)

watch(
  () => passwordForm.currentPassword,
  () => {
    passwordErrors.currentPassword = ''
    passwordError.value = ''
  },
)

watch(
  () => passwordForm.newPassword,
  () => {
    passwordErrors.newPassword = ''
    passwordError.value = ''
  },
)

watch(
  () => passwordForm.confirmPassword,
  () => {
    passwordErrors.confirmPassword = ''
    passwordError.value = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
  width: 100%;
  min-width: 0;

  &__card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 460px;
    padding: clamp(20px, 2.5vw, 36px);

    border: 1px solid #303948;
    border-radius: 10px;
    background-color: #111821;
    color: var(--third-color);

    transition: border-color 0.25s ease;

    &:focus-within {
      border-color: rgba(101, 167, 255, 0.35);
    }
  }

  &__title {
    margin: 0 0 23px;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;
    text-transform: none;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    min-width: 0;
  }

  &__input {
    width: 100%;
    min-width: 0;

    :deep(.base-input__label),
    :deep(.base-select__field-label) {
      margin-bottom: 5px;
      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-input),
    :deep(.base-select) {
      min-height: 40px;
      height: 40px;
      border: 1px solid rgba(153, 161, 176, 0.12);
      border-radius: 6px;
      background-color: #222934;
      color: #f4f6fb;
    }

    :deep(.base-input.is-focused),
    :deep(.base-select.is-open),
    :deep(.base-input:focus-within) {
      border-color: var(--hint-primary-color);
    }

    :deep(.base-input__control),
    :deep(.base-select__value-text),
    :deep(.base-select__placeholder) {
      font-family: var(--font-inter);
      font-size: 12px;
      line-height: 1.4;
    }

    :deep(.base-input__control),
    :deep(.base-select__value-text) {
      color: #f4f6fb;
    }

    :deep(.base-input__placeholder) {
      color: #b8c1ce;
      font-family: var(--font-inter);
      font-size: 12px;
    }

    :deep(.base-input__error),
    :deep(.base-select__error) {
      margin-top: 5px;
      font-size: 11px;
      line-height: 1.4;
    }

    :deep(.base-select__dropdown) {
      z-index: 30;
      background-color: #222934;
      border: 1px solid #344050;
      border-radius: 6px;
    }
  }

  &__hint {
    margin: 8px 0 12px;
    color: #e3e7ee;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.65;
  }

  &__error {
    margin-top: 12px;
    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.5;
  }

  &__save {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 40px;
    height: 40px;
    margin-top: auto;
    padding: 7px 15px;

    border: 1px solid #8794a6 !important;
    border-radius: 6px !important;
    background-color: transparent !important;
    color: #f4f6fb !important;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-primary-color) !important;
        background-color: var(--hint-primary-color) !important;
        color: #ffffff !important;
      }
    }
  }

  @media (max-width: $md2) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &__card {
      min-height: 440px;
    }

    &__card:last-child {
      grid-column: 1 / -1;
      min-height: 0;
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;

    &__card,
    &__card:last-child {
      grid-column: auto;
      min-height: 0;
      padding: 22px 18px;
    }

    &__save {
      margin-top: 28px;
    }
  }
}
</style>
