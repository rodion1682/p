<script setup>
import { computed } from 'vue'

const props = defineProps({
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
  loadingLabel: {
    type: String,
    default: 'Loading',
  },
})

const statusClasses = computed(() => [
  'status-layout',
  `status-layout_${props.tone}`,
  {
    'status-layout_loading': props.showLoader,
  },
])

const ariaLive = computed(() =>
  props.tone === 'error' ? 'assertive' : 'polite',
)

const statusRole = computed(() => (props.tone === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div
    :class="statusClasses"
    :role="statusRole"
    :aria-live="ariaLive"
    :aria-busy="showLoader"
  >
    <div class="status-layout__box">
      <div class="status-layout__inner">
        <div
          v-if="showLoader"
          class="status-layout__loader"
          :aria-label="loadingLabel"
        >
          <span class="status-layout__spinner" aria-hidden="true" />
        </div>

        <div v-if="$slots.icon" class="status-layout__icon">
          <div class="status-layout__icon-inner">
            <slot name="icon" />
          </div>
        </div>

        <h1 v-if="title" class="status-layout__title _h4">
          {{ title }}
        </h1>

        <div v-if="text || subtext" class="status-layout__information">
          <p v-if="text" class="status-layout__text">
            {{ text }}
          </p>

          <p v-if="subtext" class="status-layout__subtext">
            {{ subtext }}
          </p>
        </div>

        <div v-if="$slots.default" class="status-layout__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="status-layout__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.status-layout {
  --status-color: var(--hint-primary-color);

  position: relative;

  width: 100%;
  max-width: 620px;

  margin: 0 auto;

  &_success {
    --status-color: var(--success-color);
  }

  &_error {
    --status-color: var(--error-color);
  }

  &_pending {
    --status-color: var(--pending-color);
  }

  &__box {
    @include adaptiveValue('border-radius', 22, 10);

    position: relative;

    overflow: hidden;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-priamry-color);
    background: linear-gradient(180deg, #111624 0%, #111624 100%);
    box-shadow: 0 12px 36px rgb(0 0 0 / 12%);

    &::before {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 2px;

      background: var(--status-color);

      content: '';
    }
  }

  &__inner {
    @include adaptiveValue('padding-top', 48, 28);
    @include adaptiveValue('padding-right', 40, 16);
    @include adaptiveValue('padding-bottom', 44, 28);
    @include adaptiveValue('padding-left', 40, 16);

    position: relative;
    z-index: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 260px;

    text-align: center;
  }

  &__loader,
  &__icon,
  &__title,
  &__information,
  &__body,
  &__actions {
    position: relative;
    z-index: 1;
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__spinner {
    @include adaptiveValue('width', 60, 46);
    @include adaptiveValue('height', 60, 46);

    display: block;
    flex: 0 0 auto;

    border: 3px solid var(--border-priamry-color);
    border-radius: 50%;

    animation: status-layout-spin 0.9s linear infinite;

    border-top-color: var(--status-color);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__icon-inner {
    @include adaptiveValue('width', 84, 64);
    @include adaptiveValue('height', 84, 64);

    position: relative;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--border-priamry-color);
    border-radius: 50%;
    background: var(--bg-primary-color);

    color: var(--status-color);

    &::before {
      position: absolute;
      inset: 6px;

      border: 1px solid var(--border-priamry-color);
      border-radius: 50%;

      content: '';
    }

    :deep(svg) {
      @include adaptiveValue('width', 38, 28);
      @include adaptiveValue('height', 38, 28);

      position: relative;
      z-index: 1;

      display: block;

      max-width: 100%;

      color: inherit;
    }
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-weight: 600;
    line-height: 130%;
    text-align: center;
    text-transform: none;

    overflow-wrap: anywhere;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__information {
    width: 100%;
    max-width: 470px;

    margin-right: auto;
    margin-left: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__text,
  &__subtext {
    margin: 0;

    font-family: var(--font-open-sans);
    font-weight: 400;
    text-align: center;

    overflow-wrap: anywhere;
  }

  &__text {
    @include adaptiveValue('font-size', 15, 14);

    color: var(--fourth-color);
    line-height: 160%;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__subtext {
    color: var(--fifth-color);
    font-size: 13px;
    line-height: 165%;
  }

  &__body {
    width: 100%;
    min-width: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 160%;

    overflow-wrap: anywhere;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    :deep(strong),
    :deep(b) {
      color: var(--fourth-color);
      font-weight: 600;
    }

    :deep(a) {
      color: var(--hint-primary-color);
      text-decoration: underline;

      transition: color 0.3s ease;

      text-underline-offset: 3px;

      @media (any-hover: hover) {
        &:hover {
          color: var(--fourth-color);
        }
      }
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px;

    width: 100%;
    min-width: 0;

    :deep(.base-button),
    :deep(.btn) {
      flex: 0 1 auto;

      min-width: 150px;
    }
  }

  &_success {
    .status-layout__icon-inner {
      border-color: var(--success-color);
      background: var(--bg-primary-color);
    }
  }

  &_error {
    .status-layout__icon-inner {
      border-color: var(--error-color);
      background: var(--bg-primary-color);
    }
  }

  &_pending {
    .status-layout__icon-inner {
      border-color: var(--pending-color);
      background: var(--bg-primary-color);
    }
  }

  &_loading {
    .status-layout__box::before {
      opacity: 0.7;
    }
  }

  @media (max-width: $md6) {
    width: 100%;
    max-width: 100%;

    &__inner {
      min-height: 240px;
    }

    &__actions {
      flex-direction: column;
      gap: 10px;

      :deep(.base-button),
      :deep(.btn) {
        flex: 0 0 auto;

        width: 100%;
        max-width: 280px;
      }
    }
  }

  @media (max-width: $md8) {
    &__inner {
      padding-right: 16px;
      padding-left: 16px;
    }

    &__information {
      max-width: 100%;
    }
  }
}

@keyframes status-layout-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-layout__spinner {
    animation: none;
  }
}
</style>
