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
      <div class="status-layout__decoration" aria-hidden="true">
        <img src="@/assets/img/product-list-decor.png" alt="" />
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

  width: 100%;
  max-width: 620px;

  margin: 0 auto;
  padding-top: 25px;

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
    position: relative;

    width: 100%;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: rgb(48 43 91 / 90%);
    box-shadow: 0 16px 50px rgb(8 6 28 / 12%);
  }

  &__decoration {
    position: absolute;
    bottom: calc(100% + 1px);
    left: 0;
    z-index: 2;

    display: flex;
    align-items: flex-end;
    justify-content: center;

    width: 100%;
    height: 25px;

    pointer-events: none;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;

      height: 1px;

      background: var(--border-priamry-color);

      content: '';
    }

    img {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 1;

      display: block;

      width: min(230px, 55vw);
      max-height: 45px;

      object-fit: contain;
      object-position: center bottom;

      transform: translateX(-50%);
    }
  }

  &__inner {
    @include adaptiveValue('padding-top', 48, 30);
    @include adaptiveValue('padding-right', 48, 20);
    @include adaptiveValue('padding-bottom', 44, 28);
    @include adaptiveValue('padding-left', 48, 20);

    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-width: 0;

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
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__spinner {
    @include adaptiveValue('width', 60, 46);
    @include adaptiveValue('height', 60, 46);

    display: block;

    border: 3px solid var(--border-fourth-color);
    border-radius: 50%;

    animation: status-layout-spin 0.9s linear infinite;

    border-top-color: var(--status-color);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__icon-inner {
    @include adaptiveValue('width', 78, 60);
    @include adaptiveValue('height', 78, 60);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--border-priamry-color);
    border-radius: 50%;
    background: rgb(25 22 60 / 65%);

    color: var(--status-color);

    &::before {
      position: absolute;
      inset: 6px;

      border: 1px solid var(--border-fourth-color);
      border-radius: 50%;

      content: '';
    }

    :deep(svg) {
      @include adaptiveValue('width', 36, 28);
      @include adaptiveValue('height', 36, 28);

      position: relative;
      z-index: 1;

      display: block;

      color: inherit;
    }
  }

  &__title {
    @include adaptiveValue('font-size', 32, 24);

    margin: 0;

    color: #f4d8c5;
    font-family: var(--font-spectral);
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    text-transform: none;

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

    overflow-wrap: anywhere;
  }

  &__text {
    @include adaptiveValue('font-size', 15, 14);

    color: var(--primary-color);
    line-height: 1.6;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__subtext {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 1.6;
  }

  &__body {
    width: 100%;
    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.6;

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
      flex: 0 1 180px;

      min-width: 150px;
    }
  }

  &_success {
    .status-layout__icon-inner {
      border-color: var(--success-color);
    }
  }

  &_error {
    .status-layout__icon-inner {
      border-color: var(--error-color);
    }
  }

  &_pending {
    .status-layout__icon-inner {
      border-color: var(--pending-color);
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
    animation-duration: 1.8s;
  }
}
</style>
