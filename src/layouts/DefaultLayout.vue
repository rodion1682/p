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
        <span class="default-layout__cookies-button-inner" aria-hidden="true">
          <SvgIcon :icon="FavIcon" class="default-layout__cookies-icon" />
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
import { FavIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
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

    width: 100%;
    min-width: 0;
  }

  &__cookies-button {
    @include adaptiveValue('bottom', 32, 16);
    @include adaptiveValue('left', 32, 16);
    @include adaptiveValue('width', 58, 40);
    @include adaptiveValue('height', 58, 40);

    position: fixed;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    outline: none;
    background: var(--bg-fourth-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &:focus-visible {
      border-color: var(--hint-primary-color);
      outline: 2px solid #8e73ee;
      outline-offset: 3px;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: #8e73ee;
        background: var(--bg-secondary-color);

        transform: translateY(-3px);

        &::before {
          opacity: 1;

          transform: scale(1.08);
        }

        .default-layout__cookies-button-inner {
          border-color: #8e73ee;
        }

        .default-layout__cookies-icon {
          transform: scale(1.1);
        }
      }
    }

    &:active {
      transform: translateY(0) scale(0.96);
    }
  }

  &__cookies-button-inner {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;

    pointer-events: none;

    transition: border-color 0.25s ease;
  }

  &__cookies-icon {
    @include adaptiveValue('width', 32, 26);
    @include adaptiveValue('height', 32, 26);

    position: relative;

    display: block;
    flex: 0 0 auto;

    transition: transform 0.25s ease;

    filter: drop-shadow(0 2px 5px rgb(0 0 0 / 25%));
  }

  @media (max-width: $md6) {
    &__cookies-button {
      padding: 4px;

      border-radius: 10px;
    }

    &__cookies-button-inner {
      border-radius: 6px;
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

@media (prefers-reduced-motion: reduce) {
  .cookies-modal-enter-active,
  .cookies-modal-leave-active,
  .cookies-button-enter-active,
  .cookies-button-leave-active {
    transition: none;
  }
}
</style>
