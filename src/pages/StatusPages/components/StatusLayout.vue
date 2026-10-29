<template>
  <div class="status-page" :class="`status-page_${tone}`">
    <div class="status-page__inner _cnt">
      <div class="status-page__content">
        <div class="status-page__icon" aria-hidden="true">
          <div v-if="showLoader" class="status-page__spinner"></div>

          <svg v-else-if="tone === 'success'" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M19 32L28 41L45 23"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <svg v-else-if="tone === 'error'" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M23 23L41 41M41 23L23 41"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>

          <svg v-else-if="tone === 'pending'" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M32 17V33L42 39"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <svg v-else viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M32 29V44M32 19V21"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <h1 v-if="title" class="status-page__title _h3">
          {{ title }}
        </h1>

        <div v-if="text || subtext" class="status-page__top" aria-live="polite">
          <p v-if="text" class="status-page__text">
            {{ text }}
          </p>

          <p v-if="subtext" class="status-page__subtext">
            {{ subtext }}
          </p>
        </div>

        <div v-if="$slots.default" class="status-page__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="status-page__actions">
          <slot name="actions" />
        </div>
      </div>
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

.status-page {
  --status-accent: #1a73ff;

  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  color: var(--third-color);

  &_success {
    --status-accent: #72d769;
  }

  &_error {
    --status-accent: #f25563;
  }

  &_pending {
    --status-accent: #ffb700;
  }

  &__inner {
    width: 100%;
    min-width: 0;
    padding-left: 0;
    padding-right: 0;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-width: 0;
    max-width: 500px;
    padding: clamp(28px, 3.5vw, 43px);

    border: 1px solid #344050;
    border-radius: 18px;

    background:
      radial-gradient(
        ellipse at 50% 0%,
        rgba(26, 115, 255, 0.065),
        transparent 65%
      ),
      #111821;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    text-align: center;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 20%;
      right: 20%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(26, 115, 255, 0.7),
        transparent
      );
      pointer-events: none;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 28px;
    }
  }

  &__label-line {
    display: block;
    width: 16px;
    height: 2px;
    border-radius: 2px;
    background-color: #1a73ff;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    width: 80px;
    height: 80px;

    border: 1px solid #303948;
    border-radius: 50%;

    background-color: #0d1520;
    color: var(--status-accent);

    svg {
      display: block;
      width: 60px;
      height: 60px;
    }

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__spinner {
    width: 46px;
    height: 46px;
    border: 3px solid rgba(255, 183, 0, 0.15);
    border-top-color: var(--status-accent);
    border-right-color: var(--status-accent);
    border-radius: 50%;
    animation: status-page-spin 1s linear infinite;
  }

  &__title {
    width: 100%;
    margin: 0;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(20px, 2.4vw, 26px);
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    text-transform: none;
    overflow-wrap: anywhere;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }

  &__top {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 380px;
    gap: 9px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__text {
    margin: 0;
    color: #b8c2d0;
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.65;
    overflow-wrap: anywhere;
  }

  &__subtext {
    margin: 0;
    color: #8995a7;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  &__body {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 12px;

    :deep(.btn) {
      width: 100%;
      min-height: 46px;
      padding: 9px 16px;
      border-radius: 7px;
      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
    }

    :deep(.btn.primary) {
      border: 1px solid #1a73ff;
      background-color: #1a73ff;
      color: #ffffff;

      @media (any-hover: hover) {
        &:hover {
          border-color: #005fe8;
          background-color: #005fe8;
          color: #ffffff;
        }
      }
    }

    :deep(.btn.bordered),
    :deep(.btn.white-bordered) {
      border: 1px solid #8794a6;
      background-color: transparent;
      color: #f4f6fb;

      @media (any-hover: hover) {
        &:hover {
          border-color: #1a73ff;
          background-color: rgba(26, 115, 255, 0.12);
          color: #ffffff;
        }
      }
    }
  }

  @media (max-width: $md4) {
    &__content {
      padding: 30px 22px;
      border-radius: 12px;
    }

    &__icon {
      width: 70px;
      height: 70px;

      svg {
        width: 52px;
        height: 52px;
      }
    }

    &__spinner {
      width: 40px;
      height: 40px;
    }

    &__label {
      margin-bottom: 22px;
    }

    &__text {
      font-size: 14px;
    }

    &__subtext {
      font-size: 12px;
    }

    &__actions {
      gap: 10px;

      :deep(.btn) {
        min-height: 42px;
        font-size: 13px;
      }
    }
  }

  @media (max-width: $md7) {
    &__content {
      padding: 26px 17px;
    }
  }
}

@keyframes status-page-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-page__spinner {
    animation-duration: 2s;
  }
}
</style>
