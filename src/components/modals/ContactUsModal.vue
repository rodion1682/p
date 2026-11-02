<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['contact-modal__inner']"
    @close="handleClose"
  >
    <div class="contact-modal">
      <div class="contact-modal__title _h3">
        {{ $t('ASK A QUESTION') }}
      </div>

      <template v-if="isSuccess">
        <div class="contact-modal__success">
          <div class="contact-modal__success-icon _ibg-contain">
          </div>

          <div class="contact-modal__success-text">
            {{
              $t(
                'Your question has been sent successfully. You will receive a response via email shortly.',
              )
            }}
          </div>

          <BaseButton
            type="button"
            variant="secondary"
            class="contact-modal__success-close"
            @click="closeAfterSuccess"
          >
            {{ $t('CLICK TO CLOSE') }}
          </BaseButton>
        </div>
      </template>

      <form v-else class="contact-modal__form" @submit.prevent="handleSubmit">
        <div class="contact-modal__row">
          <div class="contact-modal__field">
            <BaseInput
              v-model="form.name"
              :label="$t('Name:')"
              :error="errors.name"
              :disabled="isSubmitting"
              autocomplete="name"
              class="contact-modal__input"
              @blur="validateField('name')"
              @input="clearFieldError('name')"
            />
          </div>

          <div class="contact-modal__field">
            <BaseInput
              v-model="form.email"
              type="email"
              :label="$t('Email:')"
              :error="errors.email"
              :disabled="isSubmitting"
              autocomplete="email"
              class="contact-modal__input"
              @blur="validateField('email')"
              @input="clearFieldError('email')"
            />
          </div>
        </div>

        <div class="contact-modal__field">
          <BaseTextarea
            v-model="form.message"
            :label="$t('Question:')"
            :error="errors.message"
            :disabled="isSubmitting"
            :max-length="1000"
            :rows="6"
            show-counter
            class="contact-modal__textarea"
            @blur="validateField('message')"
            @input="clearFieldError('message')"
          />
        </div>

        <div v-if="submitError" class="contact-modal__error _text-error">
          {{ submitError }}
        </div>

        <div class="contact-modal__bottom">
          <div class="contact-modal__recaptcha">
            <RecaptchaV2
              v-if="show"
              ref="recaptchaRef"
              @load-callback="onCaptchaVerified"
              @expired-callback="onCaptchaExpired"
              @error-callback="onCaptchaError"
            />
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            class="contact-modal__submit"
            :loading="isSubmitting"
            :disabled="isSubmitting || !isFormComplete || !recaptchaToken"
          >
            {{ $t('CONFIRM') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RecaptchaV2 } from 'vue3-recaptcha-v2'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

import axios from '@/plugins/axios'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const isSubmitting = ref(false)
const isSuccess = ref(false)
const submitError = ref('')

const recaptchaToken = ref('')
const recaptchaRef = ref(null)

let successTimer = null

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const errors = reactive({
  name: '',
  email: '',
  message: '',
})

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const norm = value => {
  return String(value ?? '').trim()
}

const clearSuccessTimer = () => {
  if (!successTimer) {
    return
  }

  clearTimeout(successTimer)
  successTimer = null
}

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.message = ''

  submitError.value = ''
}

const clearFieldError = field => {
  if (errors[field]) {
    errors[field] = ''
  }

  submitError.value = ''
}

const validateField = field => {
  errors[field] = ''

  if (field === 'name') {
    if (!norm(form.name)) {
      errors.name = t('Name is required')
    }

    return
  }

  if (field === 'email') {
    const email = norm(form.email)

    if (!email) {
      errors.email = t('Email is required')
      return
    }

    if (!emailRe.test(email)) {
      errors.email = t('Enter a valid email address')
    }

    return
  }

  if (field === 'message') {
    const message = norm(form.message)

    if (!message) {
      errors.message = t('Question is required')
      return
    }

    if (message.length > 1000) {
      errors.message = t('Question cannot exceed 1000 characters')
    }
  }
}

const validateForm = () => {
  clearErrors()

  validateField('name')
  validateField('email')
  validateField('message')

  if (Object.values(errors).some(Boolean)) {
    submitError.value = t('Please fill in all required fields correctly.')

    return false
  }

  if (!recaptchaToken.value) {
    submitError.value = t('Please confirm you are not a robot.')

    return false
  }

  return true
}

const isFormComplete = computed(() => {
  const name = norm(form.name)
  const email = norm(form.email)
  const message = norm(form.message)

  return Boolean(
    name && email && emailRe.test(email) && message && message.length <= 1000,
  )
})

const onCaptchaVerified = token => {
  recaptchaToken.value = token
  submitError.value = ''
}

const onCaptchaExpired = () => {
  recaptchaToken.value = ''

  submitError.value = t('Captcha expired. Please verify again.')
}

const onCaptchaError = () => {
  recaptchaToken.value = ''

  submitError.value = t('Captcha verification failed. Please try again.')
}

const resetCaptcha = async () => {
  recaptchaToken.value = ''

  await nextTick()

  if (recaptchaRef.value?.reset) {
    recaptchaRef.value.reset()
  }
}

const resetForm = async () => {
  form.name = ''
  form.email = ''
  form.message = ''

  clearErrors()

  await resetCaptcha()
}

const closeAfterSuccess = () => {
  clearSuccessTimer()

  isSuccess.value = false
  recaptchaToken.value = ''

  emit('close')
}

const showSuccess = async () => {
  await resetForm()

  isSuccess.value = true

  clearSuccessTimer()

  successTimer = setTimeout(() => {
    isSuccess.value = false
    successTimer = null

    emit('close')
  }, 3000)
}

const handleSubmit = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validateForm()) {
    return
  }

  try {
    isSubmitting.value = true
    submitError.value = ''

    const payload = {
      name: norm(form.name),
      email: norm(form.email),
      message: norm(form.message),
      recaptcha_token: recaptchaToken.value,
    }

    const { data } = await axios.post('/contact-us', payload)

    if (data?.status !== 'OK') {
      throw new Error(data?.message || t('Failed to send message'))
    }

    await showSuccess()
  } catch (error) {
    const response = error?.response?.data
    const apiErrors = response?.errors

    if (
      apiErrors &&
      typeof apiErrors === 'object' &&
      !Array.isArray(apiErrors)
    ) {
      if (apiErrors.name) {
        errors.name = Array.isArray(apiErrors.name)
          ? apiErrors.name[0]
          : apiErrors.name
      }

      if (apiErrors.email) {
        errors.email = Array.isArray(apiErrors.email)
          ? apiErrors.email[0]
          : apiErrors.email
      }

      if (apiErrors.message) {
        errors.message = Array.isArray(apiErrors.message)
          ? apiErrors.message[0]
          : apiErrors.message
      }
    }

    if (!errors.name && !errors.email && !errors.message) {
      submitError.value =
        response?.message || error?.message || t('Failed to send message')
    }

    /*
     * reCAPTCHA tokens are single-use.
     * If submission failed, reset it so the user can verify again.
     */
    await resetCaptcha()
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = async () => {
  if (isSubmitting.value) {
    return
  }

  clearSuccessTimer()

  isSuccess.value = false

  clearErrors()

  await resetCaptcha()

  emit('close')
}

watch(
  () => props.show,
  async isOpen => {
    if (isOpen) {
      clearSuccessTimer()

      isSuccess.value = false
      recaptchaToken.value = ''

      clearErrors()

      return
    }

    clearSuccessTimer()

    isSuccess.value = false

    await resetCaptcha()
  },
)

onBeforeUnmount(() => {
  clearSuccessTimer()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.contact-modal {
  width: 100%;

  &__title {
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 25);
    }
  }

  &__form {
    width: 100%;
  }

  &__row {
    display: flex;

    @include adaptiveValue('gap', 16, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }

    @media (max-width: $md5) {
      flex-direction: column;
    }

    .contact-modal__field {
      margin-bottom: 0;

      @media (max-width: $md5) {
        &:not(:last-child) {
          margin-bottom: 15px;
        }
      }
    }
  }

  &__field {
    flex: 1 1 50%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }

  &__input,
  &__textarea {
    width: 100%;
  }

  &__error {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 30, 15);

    @media (max-width: $md5) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /*
   * Real Google reCAPTCHA container.
   * The old fake CAPTCHA styles have been removed.
   */
  &__recaptcha {
    flex: 0 0 auto;
    min-width: 304px;

    @media (max-width: $md5) {
      width: 100%;
      min-width: 0;
    }
  }

  &__submit {
    flex: 1 1 auto;

    width: 100%;

    text-transform: uppercase;

    font-family: var(--font-condensed);

    @include adaptiveValue('min-height', 46, 40);

    @media (min-width: $md5) {
      max-width: 455px;
    }
  }

  &__success {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__success-icon {
    width: 64px;
    height: 65px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 62, 15);
    }
  }

  &__success-text {
    max-width: 318px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;

    color: var(--secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 85, 20);
    }
  }

  &__success-close {
    width: auto;
    min-width: 140px;

    margin-top: auto;

    font-family: var(--font-barlow);
    font-size: 16px;
    text-transform: uppercase;
  }
}

:deep(.contact-modal__inner) {
  width: 100%;
  max-width: 1040px;
}
</style>
