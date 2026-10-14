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
    validator: value => {
      return ['primary', 'success', 'error', 'pending'].includes(value)
    },
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

const statusClasses = computed(() => {
  return [
    'status-layout',
    `status-layout_${props.tone}`,
    {
      'status-layout_loading': props.showLoader,
    },
  ]
})

const ariaLive = computed(() => {
  return props.tone === 'error' ? 'assertive' : 'polite'
})

const statusRole = computed(() => {
  return props.tone === 'error' ? 'alert' : 'status'
})
</script>

<template>
  <div
    :class="statusClasses"
    :role="statusRole"
    :aria-live="ariaLive"
    :aria-busy="showLoader"
  >
    <div class="status-layout__box">
      <div
        class="status-layout__decor status-layout__decor_top-left _ibg-contain"
        aria-hidden="true"
      >
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

      <div
        class="status-layout__decor status-layout__decor_top-right _ibg-contain"
        aria-hidden="true"
      >
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

      <div
        class="status-layout__decor status-layout__decor_bottom-left _ibg-contain"
        aria-hidden="true"
      >
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

      <div
        class="status-layout__decor status-layout__decor_bottom-right _ibg-contain"
        aria-hidden="true"
      >
        <img src="@/assets/img/modal-decor.png" alt="" />
      </div>

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

        <h1 v-if="title" class="status-layout__title _h3">
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
  --status-color: var(--hint-secondary-color);
  --status-color-rgb: 142 178 224;

  width: 100%;
  max-width: 620px;

  margin: 0 auto;

  &_primary {
    --status-color: var(--hint-secondary-color);
    --status-color-rgb: 142 178 224;
  }

  &_success {
    --status-color: var(--success-color);
    --status-color-rgb: 4 135 109;
  }

  &_error {
    --status-color: var(--error-color);
    --status-color-rgb: 192 67 113;
  }

  &_pending {
    --status-color: var(--pending-color);
    --status-color-rgb: 195 155 83;
  }

  &__box {
    position: relative;

    width: 100%;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-fifth-color);
  }

  &__decor {
    @include adaptiveValue('min-width', 58, 38);
    @include adaptiveValue('width', 58, 38);
    @include adaptiveValue('height', 48, 38);

    position: absolute;
    z-index: 3;

    pointer-events: none;

    &_top-left {
      @include adaptiveValue('left', -6, -8);

      top: -6px;

      transform: rotate(-90deg);
    }

    &_top-right {
      @include adaptiveValue('right', -6, -8);

      top: -6px;
    }

    &_bottom-left {
      @include adaptiveValue('left', -6, -8);

      bottom: -6px;

      transform: rotate(-180deg);
    }

    &_bottom-right {
      @include adaptiveValue('right', -6, -8);

      bottom: -6px;

      transform: rotate(90deg);
    }
  }

  &__inner {
    @include adaptiveValue('padding-top', 52, 32);
    @include adaptiveValue('padding-right', 48, 20);
    @include adaptiveValue('padding-bottom', 48, 32);
    @include adaptiveValue('padding-left', 48, 20);

    position: relative;

    display: flex;
    overflow: hidden;
    flex-direction: column;
    align-items: center;

    width: 100%;

    text-align: center;

    &::before {
      position: absolute;
      top: 0;
      left: 50%;

      width: 180px;
      height: 1px;

      background: linear-gradient(
        90deg,
        transparent 0%,
        rgb(var(--status-color-rgb) / 75%) 50%,
        transparent 100%
      );

      content: '';

      transform: translateX(-50%);
    }

    &::after {
      position: absolute;
      top: -70px;
      left: 50%;

      width: 260px;
      height: 130px;

      border-radius: 50%;
      background-color: rgb(var(--status-color-rgb) / 7%);

      pointer-events: none;

      content: '';

      transform: translateX(-50%);

      filter: blur(45px);
    }
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
    @include adaptiveValue('width', 58, 46);
    @include adaptiveValue('height', 58, 46);

    position: relative;

    display: block;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    animation: status-layout-spin 0.9s linear infinite;

    border-top-color: var(--status-color);

    &::before {
      position: absolute;
      inset: 5px;

      border: 1px solid var(--border-fourth-color);
      border-radius: 50%;

      content: '';
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 20);
    }
  }

  &__icon-inner {
    @include adaptiveValue('width', 72, 58);
    @include adaptiveValue('height', 72, 58);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--border-third-color);
    border-radius: 50%;
    background-color: var(--bg-primary-color);

    color: var(--status-color);

    &::before {
      position: absolute;
      inset: 5px;

      border: 1px solid rgb(var(--status-color-rgb) / 35%);
      border-radius: 50%;

      content: '';
    }

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;

      width: calc(100% + 12px);
      height: 1px;

      background: linear-gradient(
        90deg,
        transparent,
        rgb(var(--status-color-rgb) / 30%),
        transparent
      );

      content: '';

      transform: translate(-50%, -50%);
    }

    :deep(svg) {
      @include adaptiveValue('width', 34, 28);
      @include adaptiveValue('height', 34, 28);

      position: relative;
      z-index: 1;

      display: block;
    }
  }

  &__title {
    color: var(--primary-color);
    font-weight: 400;
    line-height: 120%;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }
  }

  &__information {
    width: 100%;
    max-width: 470px;

    margin-right: auto;
    margin-left: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 22);
    }
  }

  &__text,
  &__subtext {
    margin: 0;

    font-family: var(--font-inter);
    font-weight: 400;
    text-align: center;
  }

  &__text {
    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__subtext {
    color: var(--hint-third-color);
    font-size: 13px;
    line-height: 145%;
  }

  &__body {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 22);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px;

    width: 100%;

    :deep(.base-button) {
      flex: 0 1 170px;

      min-width: 150px;
    }
  }

  &_success {
    .status-layout__icon-inner {
      box-shadow: inset 0 0 18px rgb(4 135 109 / 7%);
    }
  }

  &_error {
    .status-layout__icon-inner {
      box-shadow: inset 0 0 18px rgb(192 67 113 / 7%);
    }
  }

  &_pending {
    .status-layout__icon-inner {
      box-shadow: inset 0 0 18px rgb(195 155 83 / 7%);
    }
  }

  @media (max-width: $md6) {
    &__actions {
      flex-direction: column;

      :deep(.base-button) {
        flex: 0 0 auto;

        width: 100%;
        max-width: 280px;
      }
    }
  }

  @media (max-width: $md8) {
    &__box {
      width: calc(100% - 10px);

      margin-right: 5px;
      margin-left: 5px;
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
    animation-duration: 1.8s;
  }
}
</style>
