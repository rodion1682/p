<template>
  <BaseModal
    v-model:show="show"
    wrapper-classes="contact-modal__inner"
    @close="closeModal"
  >
    <div class="contact-modal">
      <h2 class="contact-modal__title _h3">
        {{ $t('Contact Us') }}
      </h2>

      <p class="contact-modal__description">
        {{
          $t(
            'Have a question? The Relic Forge team is here to help. Send us a message.',
          )
        }}
      </p>

      <form
        class="contact-modal__form"
        @submit.prevent="handleSubmit"
        novalidate
      >
        <div class="contact-modal__fields">
          <BaseInput
            v-model="form.email"
            class="contact-modal__field"
            type="email"
            name="email"
            autocomplete="email"
            :label="$t('E-Mail')"
            :placeholder="$t('person@gmail.com')"
            :error="errors.email"
            :disabled="isLoading"
            required
          />

          <BaseInput
            v-model="form.name"
            class="contact-modal__field"
            name="name"
            autocomplete="name"
            :label="$t('Name')"
            :placeholder="$t('Name')"
            :error="errors.name"
            :disabled="isLoading"
            required
          />

          <BaseTextarea
            v-model="form.message"
            class="contact-modal__field contact-modal__textarea"
            name="message"
            :label="$t('Message:')"
            :placeholder="$t('Write your message ...')"
            :rows="5"
            :max-length="500"
            :show-counter="false"
            :error="errors.message"
            :disabled="isLoading"
            required
          />
        </div>

        <div
          v-if="submitError"
          class="contact-modal__error _text-error"
          role="alert"
        >
          {{ submitError }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          class="contact-modal__submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading"> {{ $t('Sending') }}... </span>

          <span v-else>
            {{ $t('Send Link') }}
          </span>
        </BaseButton>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'success'])

const { t } = useI18n()
const toast = useToast()

const authStore = useAuthStore()
const userStore = useUserStore()

const isLoading = ref(false)
const submitError = ref('')

const form = reactive({
  email: '',
  name: '',
  message: '',
})

const errors = reactive({
  email: '',
  name: '',
  message: '',
})

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const normalize = value => String(value ?? '').trim()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clearErrors = () => {
  errors.email = ''
  errors.name = ''
  errors.message = ''
  submitError.value = ''
}

const clearForm = () => {
  form.email = ''
  form.name = ''
  form.message = ''
  clearErrors()
}

const prefillFromProfile = async () => {
  if (!authStore.isAuthenticated) return

  if (!userStore.user) {
    try {
      await userStore.fetchProfile()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      return
    }
  }

  if (!props.modelValue) return

  const user = userStore.user

  if (!user) return

  form.email = user.email || ''

  form.name = [user.name, user.surname].filter(Boolean).join(' ')
}

const closeModal = () => {
  if (isLoading.value) return

  show.value = false
  emit('close')
}

const validateForm = () => {
  clearErrors()

  const email = normalize(form.email)
  const name = normalize(form.name)
  const message = normalize(form.message)

  if (!email) {
    errors.email = t('Email is required')
  } else if (!emailRegex.test(email)) {
    errors.email = t('Invalid email format')
  }

  if (!name) {
    errors.name = t('Name is required')
  } else if (name.length < 2) {
    errors.name = t('Name must be at least 2 characters')
  }

  if (!message) {
    errors.message = t('Message is required')
  } else if (message.length < 10) {
    errors.message = t('Message must be at least 10 characters')
  }

  return !Object.values(errors).some(Boolean)
}

const handleBackendErrors = backendErrors => {
  Object.entries(backendErrors || {}).forEach(([field, messages]) => {
    if (!(field in errors)) return

    errors[field] = Array.isArray(messages)
      ? String(messages[0] || '')
      : String(messages || '')
  })
}

const handleSubmit = async () => {
  if (isLoading.value) return
  if (!validateForm()) return

  isLoading.value = true

  try {
    const payload = {
      name: normalize(form.name),
      email: normalize(form.email),
      message: normalize(form.message),
    }

    const { data } = await axios.post('/send-question', payload)

    if (data?.status && data.status !== 'OK') {
      throw new Error(data?.message || t('Something went wrong'))
    }

    toast.success(t('Message sent successfully!'))

    emit('success')

    clearForm()
    show.value = false
  } catch (error) {
    const backendErrors = error?.response?.data?.errors

    const backendMessage = error?.response?.data?.message

    if (backendErrors) {
      handleBackendErrors(backendErrors)
    }

    submitError.value =
      backendMessage ||
      Object.values(errors).find(Boolean) ||
      error?.message ||
      t('Something went wrong')

    toast.error(submitError.value)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      clearErrors()
      await prefillFromProfile()
    } else {
      clearForm()
    }
  },
  { immediate: true },
)

watch(
  () => form.email,
  () => {
    errors.email = ''
    submitError.value = ''
  },
)

watch(
  () => form.name,
  () => {
    errors.name = ''
    submitError.value = ''
  },
)

watch(
  () => form.message,
  () => {
    errors.message = ''
    submitError.value = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

:global(.modal .modal__inner.contact-modal__inner) {
  width: min(567px, calc(100% - 30px));
  max-width: 567px;
  max-height: calc(100dvh - 32px);

  padding: 58px 49px 63px;

  border: 1px solid #344050;
  border-radius: 18px;

  background-color: #111821;
  background-image: none;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);

  overflow-x: hidden;
  overflow-y: auto;
}

:global(.modal .modal__inner.contact-modal__inner .modal__close) {
  top: 15px;
  right: 15px;

  width: 34px;
  min-width: 34px;
  height: 34px;

  border-radius: 6px;

  color: #f4f6fb;
  background-color: transparent;
}

:global(.modal .modal__inner.contact-modal__inner .modal__close:hover) {
  color: #1a73ff;
}

.contact-modal {
  width: 100%;
  min-width: 0;

  &__title {
    margin: 0;

    color: #f4f6fb;

    font-family: var(--font-orbitron);
    font-size: 30px;
    font-weight: 700;
    line-height: 1.3;

    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 20);
    }
  }

  &__description {
    margin: 0;

    color: #99a1b0;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;

    @include adaptiveValue('gap', 18, 14);
  }

  &__field {
    display: block;
    width: 100%;
    min-width: 0;

    :deep(.base-input__label),
    :deep(.base-textarea__label) {
      margin-bottom: 7px;

      color: #99a1b0;

      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
    }

    :deep(.base-input),
    :deep(.base-textarea) {
      width: 100%;

      border: 1px solid rgba(153, 161, 176, 0.1);
      border-radius: 8px;

      background-color: #222934;

      transition:
        border-color 0.3s ease,
        background-color 0.3s ease;
    }

    :deep(.base-input) {
      min-height: 50px;
      height: 50px;
    }

    :deep(.base-input.is-focused),
    :deep(.base-textarea.is-focused),
    :deep(.base-input:focus-within),
    :deep(.base-textarea:focus-within) {
      border-color: #1a73ff;
    }

    :deep(.base-input.has-error),
    :deep(.base-textarea.has-error) {
      border-color: var(--error-color);
    }

    :deep(.base-input__control),
    :deep(.base-textarea__control) {
      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: 16px;
      font-weight: 400;
    }

    :deep(.base-input__placeholder),
    :deep(.base-textarea__placeholder) {
      color: #b7c0cd;
      font-size: 16px;
    }
  }

  &__textarea {
    :deep(.base-textarea) {
      min-height: 120px;
      height: 120px;
    }

    :deep(.base-textarea__control) {
      min-height: 120px;
      height: 120px;

      padding-top: 14px;
      padding-bottom: 14px;

      resize: none;
      overflow-y: auto;
    }

    :deep(.base-textarea__placeholder) {
      top: 14px;
    }
  }

  &__error {
    margin-top: 16px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 50px;
    height: 50px;

    margin-top: 40px;
    padding: 10px 20px;

    border: 1px solid #1a73ff;
    border-radius: 8px;

    background-color: #1a73ff;
    color: #ffffff;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        background-color: #005fe8;
        border-color: #005fe8;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  @media (max-width: $md5) {
    &__title {
      font-size: 25px;
    }

    &__description {
      font-size: 14px;
    }

    &__field {
      :deep(.base-input__label),
      :deep(.base-textarea__label),
      :deep(.base-input__control),
      :deep(.base-textarea__control),
      :deep(.base-input__placeholder),
      :deep(.base-textarea__placeholder) {
        font-size: 14px;
      }

      :deep(.base-input) {
        min-height: 45px;
        height: 45px;
      }
    }

    &__submit {
      margin-top: 25px;
      min-height: 45px;
      height: 45px;
      font-size: 14px;
    }
  }
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.contact-modal__inner) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;

    padding: 52px 20px 30px;

    border-radius: 16px 16px 0 0;
  }
}
</style>
