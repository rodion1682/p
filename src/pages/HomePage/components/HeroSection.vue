<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.jpg" alt="" />
    </div>
    <div class="hero__inner _cnt-home">
      <div class="hero__subtitle _line-title">
        <span>{{ $t('LUNAR DARK FANTASY COLLECTIBLE CARD GAME') }}</span>
      </div>
      <div class="hero__title _h1">
        {{ $t('THE MOON REMEMBERS') }}
      </div>
      <div class="hero__label _h3">
        {{ $t('WHAT THE WORLD HAS FORGOTTEN') }}
      </div>
      <div class="hero__info _h5">
        {{ $t('Command forgotten powers.') }}
      </div>
      <div class="hero__actions">
        <BaseButton
          @click="openPlayPage"
          class="hero__button hero__button_play"
        >
          {{ $t('Play now') }}
        </BaseButton>

        <BaseButton
          @click="goToMarketPage"
          variant="hint-bordered"
          class="hero__button hero__button_market"
        >
          {{ $t('Build your deck') }}
        </BaseButton>
      </div>
      <div class="hero__bottom">
        <BaseButton icon="arrow" variant="arrow" class="hero__bottom-arrow" />
        <div class="hero__bottom-label _h5">
          <div>{{ $t('Scroll down') }}</div>
          <div>{{ $t('to learn more about the game') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const goToMarketPage = () => {
  router.push({
    name: 'ProductListPage',
  })
}
</script>

<style lang="scss" scoped>
.hero {
  @include adaptiveValue('padding-top', 130, 75);
  @include adaptiveValue('padding-bottom', 96, 25);
  position: relative;

  display: flex;
  align-items: center;

  @media (min-width: $md5) {
    min-height: 100vh;
  }
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;

    text-align: center;
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 96, 15);
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__info {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__actions {
    @include adaptiveValue('gap', 16, 4);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 155, 15);
    }
  }

  &__button {
    @include adaptiveValue('min-height', 48, 40);
    max-width: 250px;
    &_play {
    }

    &_market {
    }
  }

  &__bottom {
    @media (max-width: $md5) {
      @include hide-item;
    }
    &-arrow {
      margin-right: auto;
      margin-left: auto;

      pointer-events: none;

      animation: scrollArrow 2s ease-in-out infinite;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 15);
      }
    }

    &-label {
      font-size: 14px;
      line-height: 150%;
    }
  }
}

@keyframes scrollArrow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(8px);
  }
}
</style>
