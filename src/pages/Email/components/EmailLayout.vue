<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
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
    default: 'primary', // primary | hint | success
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
    type: String,
    default: '',
  },
})

const emit = defineEmits(['button-click'])
</script>

<template>
  <div class="status-page" :class="containerClass">
    <div class="status-page__inner _cnt">
      <div class="status-page__content">
        <div v-if="hint" class="status-page__hint _l">
          {{ hint }}
        </div>

        <div
          v-if="title"
          class="status-page__title _h3"
          :style="{ color: titleColor }"
        >
          {{ title }}
        </div>

        <div v-if="text" class="status-page__text">
          {{ text }}
        </div>

        <div v-if="$slots.default" class="status-page__body">
          <slot />
        </div>

        <BaseButton
          v-if="buttonText"
          class="status-page__button"
          :disabled="buttonDisabled"
          @click="emit('button-click')"
        >
          {{ buttonText }}
        </BaseButton>

        <div v-if="$slots.bottom" class="status-page__bottom">
          <slot name="bottom" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.status-page {
  &__inner {
    width: 100%;
  }

  &__content {
    text-align: center;
    width: 100%;
  }

  &__hint {
    text-transform: uppercase;
    color: var(--hint-color);
    font-size: 20px;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__title {
    text-align: center;
    font-weight: 700;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
    &.primary {
      color: var(--primary-color);
    }
    &.hint {
      color: var(--hint-color);
    }
    &.success {
      color: var(--success-color);
    }
  }

  &__text {
    opacity: 0.5;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__body {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__button {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__bottom {
  }
}
</style>
