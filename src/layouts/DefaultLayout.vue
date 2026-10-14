
<template>
  <div class="default-layout">
    <DefaultHeader />

    <div class="default-layout__main">
      <slot />
    </div>

    <Footer />

    <Transition name="cookies-modal">
      <CookiesModal v-if="cookiesModalStore.isModalOpen" />
    </Transition>

    <Transition name="cookies-button">
      <button
        v-if="!cookiesModalStore.isModalOpen"
        type="button"
        class="default-layout__cookies-button"
        :aria-label="$t('Open cookie preferences')"
        :title="$t('Cookie preferences')"
        @click="cookiesModalStore.openModal"
      >
        <span class="default-layout__cookies-button-glow" aria-hidden="true" />

        <span class="default-layout__cookies-button-frame" aria-hidden="true" />

        <span class="default-layout__cookies-button-inner" aria-hidden="true">
          <img
            src="@/assets/img/favicon.svg"
            alt=""
            class="default-layout__cookies-icon"
          />
        </span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import Footer from '@/components/footer/Footer.vue'
import DefaultHeader from '@/components/headers/DefaultHeader.vue'
import CookiesModal from '@/components/modals/CookieModal.vue'

import { useCookiesModalStore } from '@/stores/cookiesModal'

const route = useRoute()
const cookiesModalStore = useCookiesModalStore()

const isBannerActive = computed(() => {
  return Object.prototype.hasOwnProperty.call(route.query, 'banner-active')
})

watch(
  isBannerActive,
  isActive => {
    if (isActive) {
      cookiesModalStore.openModal()
    }
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100vh;

  background-color: var(--bg-primary-color);

  &__main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-width: 0;
  }

  &__cookies-button {
    @include adaptiveValue('bottom', 32, 15);
    @include adaptiveValue('left', 32, 15);
    @include adaptiveValue('width', 54, 46);
    @include adaptiveValue('height', 54, 46);

    position: fixed;
    z-index: calc(var(--header-z-index) - 1);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;

    border: 1px solid var(--border-sixth-color);
    outline: none;
    background-color: var(--bg-primary-color);
    box-shadow:
      0 4px 4px rgb(0 0 0 / 25%),
      0 12px 28px rgb(0 0 0 / 35%);

    color: var(--hint-secondary-color);

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;

    &::before,
    &::after {
      position: absolute;
      z-index: 2;

      width: 10px;
      height: 10px;

      border-style: solid;
      border-color: var(--hint-primary-color);
      opacity: 0.7;

      content: '';

      transition:
        border-color 0.3s ease,
        opacity 0.3s ease;
    }

    &::before {
      top: -2px;
      left: -2px;

      border-width: 1px 0 0 1px;
    }

    &::after {
      right: -2px;
      bottom: -2px;

      border-width: 0 1px 1px 0;
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);
      box-shadow:
        0 0 0 1px var(--hint-secondary-color),
        0 4px 4px rgb(0 0 0 / 25%),
        0 12px 28px rgb(0 0 0 / 35%);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--bg-fifth-color);
        box-shadow:
          0 4px 4px rgb(0 0 0 / 25%),
          0 14px 34px rgb(0 0 0 / 45%),
          0 0 20px rgb(74 119 178 / 14%);

        transform: translateY(-3px);

        &::before,
        &::after {
          border-color: var(--hint-secondary-color);
          opacity: 1;
        }

        .default-layout__cookies-button-frame {
          border-color: var(--hint-secondary-color);
        }

        .default-layout__cookies-button-glow {
          opacity: 1;

          transform: scale(1.08);
        }

        .default-layout__cookies-icon {
          transform: scale(1.06) rotate(8deg);
        }
      }
    }

    &:active {
      transform: translateY(-1px) scale(0.97);
    }
  }

  &__cookies-button-glow {
    position: absolute;
    inset: -8px;
    z-index: -1;

    background: radial-gradient(
      circle,
      rgb(74 119 178 / 22%) 0%,
      rgb(139 122 170 / 10%) 45%,
      transparent 72%
    );
    opacity: 0;

    pointer-events: none;

    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  &__cookies-button-frame {
    position: absolute;
    inset: 4px;

    border: 1px solid var(--border-fourth-color);

    pointer-events: none;

    transition: border-color 0.3s ease;
  }

  &__cookies-button-inner {
    position: relative;
    z-index: 1;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    background:
      radial-gradient(
        circle at 50% 40%,
        rgb(142 178 224 / 10%) 0%,
        rgb(24 28 37 / 30%) 55%,
        transparent 100%
      ),
      var(--bg-third-color);

    pointer-events: none;

    &::before {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 1px;

      background: var(--primary-gradient);
      opacity: 0.65;

      content: '';
    }
  }

  &__cookies-icon {
    @include adaptiveValue('width', 34, 29);
    @include adaptiveValue('height', 34, 29);

    display: block;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;

    filter: drop-shadow(0 3px 5px rgb(0 0 0 / 30%));
  }

  @media (max-width: $md5) {
    &__cookies-button {
      z-index: calc(var(--header-z-index) - 1);
    }
  }
}

.cookies-modal-enter-active,
.cookies-modal-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.cookies-modal-enter-from,
.cookies-modal-leave-to {
  opacity: 0;

  transform: translateY(30px);
}

.cookies-button-enter-active,
.cookies-button-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.cookies-button-enter-from,
.cookies-button-leave-to {
  opacity: 0;

  transform: translateY(12px) scale(0.9);
}

.cookies-button-enter-to,
.cookies-button-leave-from {
  opacity: 1;

  transform: translateY(0) scale(1);
}
</style>
