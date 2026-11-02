<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  subtext: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'primary', // primary | success | error | pending
  },
  showLoader: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="payment-status">
    <div v-if="showLoader" class="payment-status__loader">
      <div class="payment-status__spinner"></div>
    </div>

    <div v-if="title" class="payment-status__title _h4" :class="tone">
      {{ title }}
    </div>
    <div class="payment-status__top">
      <div v-if="text" class="payment-status__text">
        {{ text }}
      </div>

      <div v-if="subtext" class="payment-status__subtext">
        {{ subtext }}
      </div>
    </div>

    <div v-if="$slots.default" class="payment-status__body">
      <slot />
    </div>

    <div v-if="$slots.actions" class="payment-status__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.payment-status {
  margin: 0 auto;
  width: 100%;
  max-width: 380px;
  text-align: center;
  &__loader {
    display: flex;
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__spinner {
    min-width: 64px;
    height: 64px;
    border-radius: 50%;
    border-style: solid;
    border-color: var(--pending-color);
    border-width: 4px;
    border-top-color: transparent;
    animation: payment-status-spin 1s linear infinite;
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 3, 15);
    }

    &.primary {
      color: var(--primary-color);
    }

    &.success {
      color: var(--success-color);
    }

    &.error {
      color: var(--error-color);
    }

    &.pending {
      color: var(--pending-color);
    }
  }
  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }
  &__text {
    color: var(--primary-color);
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__subtext {
    color: var(--seconday-color);
  }

  &__body {
    @include adaptiveValue('margin-bottom', 25, 15);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

@keyframes payment-status-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
