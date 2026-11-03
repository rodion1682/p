<template>
  <div
    class="status"
    :class="`status--${tone}`"
    role="status"
    :aria-busy="showLoader"
    aria-live="polite"
  >
    <div v-if="showLoader || tone !== 'primary'" class="status__indicator">
      <div v-if="showLoader" class="status__spinner" aria-hidden="true" />

      <div v-else class="status__icon" aria-hidden="true">
        <svg
          v-if="tone === 'success'"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M18 32L27 41L46 22"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <svg
          v-else-if="tone === 'error'"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M23 23L41 41M41 23L23 41"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>

        <svg
          v-else-if="tone === 'pending'"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M32 16V32L42 39"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <div v-if="title || text || subtext" class="status__content">
      <h1 v-if="title" class="status__title _h3">
        {{ title }}
      </h1>

      <p v-if="text" class="status__text">
        {{ text }}
      </p>

      <p v-if="subtext" class="status__subtext">
        {{ subtext }}
      </p>
    </div>

    <div v-if="$slots.default" class="status__body">
      <slot />
    </div>

    <div v-if="$slots.actions" class="status__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

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
    default: 'primary',
    validator: value =>
      ['primary', 'success', 'error', 'pending'].includes(value),
  },
  showLoader: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.status {
  --status-color: var(--hint-primary-color);

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  max-width: 440px;
  min-width: 0;
  margin: 0 auto;

  color: var(--primary-color);
  text-align: center;

  &--primary {
    --status-color: var(--hint-primary-color);
  }

  &--success {
    --status-color: var(--success-color);
  }

  &--error {
    --status-color: var(--error-color);
  }

  &--pending {
    --status-color: var(--pending-color);
  }

  &__indicator {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('width', 84, 64);
    @include adaptiveValue('height', 84, 64);

    color: var(--status-color);

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  &__spinner {
    @include adaptiveValue('width', 72, 56);
    @include adaptiveValue('height', 72, 56);

    border: 4px solid var(--border-primary-color);
    border-top-color: var(--status-color);
    border-radius: 50%;

    animation: status-spin 0.9s linear infinite;
  }

  &__content {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__title {
    color: var(--primary-color);
    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 110%;
    text-transform: uppercase;
    overflow-wrap: anywhere;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 10);
    }
  }

  &__text {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-weight: 500;
    line-height: 150%;
    overflow-wrap: anywhere;

    @include adaptiveValue('font-size', 16, 14);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  &__subtext {
    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-weight: 400;
    line-height: 160%;
    overflow-wrap: anywhere;

    @include adaptiveValue('font-size', 14, 12);
  }

  &__body {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }

    :deep(p) {
      color: var(--hint-third-color);
      font-family: var(--font-inter);
      font-size: 14px;
      line-height: 150%;
    }

    :deep(a) {
      color: var(--hint-primary-color);
      text-decoration: underline;
      text-underline-offset: 3px;

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--hint-secodnary-color);
        }
      }
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    width: 100%;
    max-width: 320px;

    @include adaptiveValue('gap', 12, 10);

    :deep(.btn) {
      width: 100%;
      min-width: 0;

      @include adaptiveValue('min-height', 46, 40);

      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
    }
  }

  @media (max-width: $md6) {
    max-width: 100%;

    &__actions {
      max-width: 100%;
    }
  }
}

@keyframes status-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status__spinner {
    animation-duration: 2s;
  }

  .status__body :deep(a) {
    transition: none;
  }
}
</style>
