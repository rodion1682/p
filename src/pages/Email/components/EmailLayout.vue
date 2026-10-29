<template>
  <StatusLayout
    :title="title"
    :text="text"
    :tone="statusTone"
    :class="['email-layout', containerClass]"
  >
    <template #actions>
      <div v-if="hint" class="email-layout__hint">
        <span class="email-layout__hint-dot"></span>
        {{ hint }}
      </div>

      <div v-if="$slots.default" class="email-layout__body">
        <slot />
      </div>

      <BaseButton
        v-if="buttonText"
        type="button"
        variant="primary"
        class="email-layout__button"
        :disabled="buttonDisabled"
        @click="emit('button-click')"
      >
        {{ buttonText }}
      </BaseButton>

      <div v-if="$slots.bottom" class="email-layout__bottom">
        <slot name="bottom" />
      </div>
    </template>
  </StatusLayout>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import StatusLayout from '@/pages/StatusPages/components/StatusLayout.vue'

const props = defineProps({
  hint: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  titleColor: {
    type: String,
    default: 'primary',
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonDisabled: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['button-click'])

const statusTone = computed(() => {
  const color = String(props.titleColor || '')
    .trim()
    .toLowerCase()

  if (color === 'success' || color.includes('--success-color')) {
    return 'success'
  }

  if (color === 'error' || color.includes('--error-color')) {
    return 'error'
  }

  return 'primary'
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.email-layout {
  width: 100%;
  min-width: 0;

  &__hint {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    gap: 9px;

    width: fit-content;
    max-width: 100%;
    padding: 9px 14px;

    border: 1px solid rgba(26, 115, 255, 0.25);
    border-radius: 6px;
    background: rgba(26, 115, 255, 0.07);

    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    text-align: center;
  }

  &__hint-dot {
    display: block;
    flex: 0 0 7px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #1a73ff;
    box-shadow: 0 0 10px rgba(26, 115, 255, 0.45);
  }

  &__body,
  &__bottom {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    gap: 12px;
  }

  &__button {
    width: 100%;
    min-height: 46px;

    border: 1px solid #1a73ff !important;
    border-radius: 7px !important;
    background-color: #1a73ff !important;

    color: #ffffff !important;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.4;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease;

    &:not(:disabled):hover {
      border-color: #005fe8 !important;
      background-color: #005fe8 !important;
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  &__body {
    :deep(.verify-email__button) {
      width: 100%;
      min-height: 46px;

      border: 1px solid #1a73ff !important;
      border-radius: 7px !important;
      background-color: #1a73ff !important;

      color: #ffffff !important;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;

      &:not(:disabled):hover {
        border-color: #005fe8 !important;
        background-color: #005fe8 !important;
      }
    }

    :deep(.verify-email__message) {
      display: block;
      width: 100%;
      margin: 2px 0 0;
      padding: 12px 14px;

      border: 1px solid #344050;
      border-radius: 7px;
      background-color: #19212c;

      color: #99a1b0;
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 500;
      line-height: 1.6;
      text-align: center;
      overflow-wrap: anywhere;
    }

    :deep(.verify-email__message.is-success) {
      border-color: rgba(114, 215, 105, 0.3);
      background-color: rgba(114, 215, 105, 0.07);
      color: #72d769;
    }

    :deep(.verify-email__message.is-error) {
      border-color: rgba(242, 85, 99, 0.3);
      background-color: rgba(242, 85, 99, 0.07);
      color: #f25563;
    }
  }

  &__bottom {
    :deep(.btn) {
      width: 100%;
      min-height: 46px;

      border: 1px solid #8794a6 !important;
      border-radius: 7px !important;
      background-color: transparent !important;

      color: #f4f6fb !important;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 700;

      &:hover {
        border-color: #1a73ff !important;
        background-color: rgba(26, 115, 255, 0.12) !important;
      }
    }

    :deep(.verify-email__link) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      color: #f4f6fb;
      font-family: var(--font-inter);
      font-size: inherit;
      font-weight: 700;
      line-height: 1.4;
      text-align: center;
      text-decoration: none;
    }
  }

  @media (max-width: $md5) {
    &__hint {
      padding: 8px 11px;
      font-size: 11px;
    }

    &__button,
    &__body :deep(.verify-email__button),
    &__bottom :deep(.btn) {
      min-height: 43px;
      font-size: 13px;
    }

    &__body :deep(.verify-email__message) {
      padding: 11px;
      font-size: 12px;
    }
  }
}
</style>
