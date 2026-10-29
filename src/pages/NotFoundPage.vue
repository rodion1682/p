<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push({
    name: 'HomePage',
  })
}

const goToMarket = () => {
  router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
    },
  })
}
</script>

<template>
  <section class="not-found">
    <div class="not-found__inner _cnt">
      <div class="not-found__content">
        <div class="not-found__visual">
          <div class="not-found__code" aria-hidden="true">
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </div>
        </div>

        <div class="not-found__information">
          <h1 class="not-found__title _h2">
            {{ $t('Oops! Page Not Found') }}
          </h1>

          <p class="not-found__text">
            {{ $t('Sorry, the page you are looking for does not exist.') }}
          </p>

          <div class="not-found__actions">
            <BaseButton
              type="button"
              variant="primary"
              class="not-found__button not-found__button_primary"
              @click="goHome"
            >
              <template #prefix>
                <svg
                  class="not-found__button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M19 12H5M5 12L11 18M5 12L11 6"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </template>

              {{ $t('Go Back Home') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="white-bordered"
              class="not-found__button not-found__button_secondary"
              @click="goToMarket"
            >
              {{ $t('Explore CS2 Skins') }}

              <template #postfix>
                <svg
                  class="not-found__button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.not-found {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 650px;

  @include adaptiveValue('padding-top', 150, 100);
  @include adaptiveValue('padding-bottom', 130, 65);

  background-color: var(--bg-primary-color);
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 35%;
    left: 50%;

    width: 850px;
    height: 500px;

    transform: translate(-50%, -50%);

    background: radial-gradient(
      ellipse at center,
      rgba(26, 115, 255, 0.09) 0%,
      rgba(26, 115, 255, 0.03) 40%,
      transparent 75%
    );

    pointer-events: none;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    max-width: 850px;
    min-width: 0;

    text-align: center;
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    color: var(--link-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.15em;
    text-transform: uppercase;

    span {
      color: var(--hint-primary-color);
      font-family: var(--font-orbitron);
      font-weight: 900;
      letter-spacing: 0;
    }

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__visual {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    max-width: 750px;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__code {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;

    font-family: var(--font-orbitron);
    font-size: clamp(90px, 17vw, 210px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.075em;
    white-space: nowrap;

    color: #f4f6fb;
    user-select: none;

    span {
      position: relative;
      display: block;

      &:nth-child(2) {
        background: linear-gradient(
          180deg,
          #8fbdff 0%,
          #1a73ff 55%,
          #0752c9 100%
        );

        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        filter: drop-shadow(0 0 35px rgba(26, 115, 255, 0.22));
      }
    }
  }

  &__visual-line {
    position: relative;
    width: min(100%, 500px);
    height: 1px;

    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(26, 115, 255, 0.25) 15%,
      #1a73ff 50%,
      rgba(26, 115, 255, 0.25) 85%,
      transparent 100%
    );

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;

      width: 7px;
      height: 7px;

      transform: translate(-50%, -50%) rotate(45deg);

      border: 1px solid #1a73ff;
      background-color: var(--bg-primary-color);
    }
  }

  &__information {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    max-width: 680px;
    min-width: 0;

    padding: clamp(25px, 4vw, 42px);

    border: 1px solid #303948;
    border-radius: 18px;

    background:
      radial-gradient(
        ellipse at 50% 0%,
        rgba(26, 115, 255, 0.045),
        transparent 70%
      ),
      #111821;

    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16);
  }

  &__title {
    margin: 0;
    color: #f4f6fb;

    font-family: var(--font-orbitron);
    font-size: clamp(21px, 3vw, 32px);
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__text {
    max-width: 450px;
    margin: 0;

    color: #99a1b0;

    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.65;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 35, 25);
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;

    width: 100%;
    max-width: 530px;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 10px 16px;

    border-radius: 8px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &_primary {
      border: 1px solid #1a73ff !important;
      background-color: #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #005fe8 !important;
          background-color: #005fe8 !important;
        }
      }
    }

    &_secondary {
      border: 1px solid #8794a6 !important;
      background-color: transparent !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #1a73ff !important;
          background-color: rgba(26, 115, 255, 0.1) !important;
          color: #ffffff !important;
        }
      }
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }
  }

  &__button-icon {
    display: block;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
    color: inherit;
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;

    width: 100%;
    margin-top: 35px;

    color: #596779;
    font-family: var(--font-orbitron);
    font-size: 10px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 0.18em;
  }

  &__bottom-line {
    display: block;
    width: 35px;
    height: 1px;
    background-color: #344050;
  }

  @media (max-width: $md4) {
    min-height: 550px;

    &__information {
      border-radius: 12px;
    }

    &__text {
      font-size: 14px;
    }

    &__actions {
      gap: 10px;
    }

    &__button {
      min-height: 44px;
      padding: 9px 10px;
      font-size: 12px;
    }
  }

  @media (max-width: $md6) {
    &__actions {
      grid-template-columns: minmax(0, 1fr);
      max-width: 340px;
    }

    &__code {
      font-size: clamp(80px, 23vw, 110px);
    }

    &__information {
      padding: 27px 18px;
    }

    &__bottom {
      margin-top: 25px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__button {
      transition: none;
    }
  }
}
</style>
