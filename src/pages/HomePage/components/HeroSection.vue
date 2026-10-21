<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.jpg" alt="" />
    </div>
    <div class="hero__decor hero__decor_left _ibg-contain">
      <img src="@/assets/img/hero-left-bg.png" />
    </div>
    <div class="hero__decor hero__decor_right _ibg-contain">
      <img src="@/assets/img/hero-right-bg.png" />
    </div>

    <div class="hero__inner _cnt-home">
      <div class="hero__title _h1">
        <div>{{ $t('Master the Power') }}</div>
        <div>{{ $t('of the Stars') }}</div>
      </div>
      <BaseButton @click="openPlayPage" variant="play" class="hero__button">
        {{ $t('Play now') }}
      </BaseButton>
      <div class="hero__info">
        {{
          $t(
            'Build your deck. Choose your hero. Command the magic of distant galaxies.',
          )
        }}
      </div>
      <button
        type="button"
        class="hero__scroll"
        aria-label="Scroll to universe section"
        @click="scrollToUniverse"
      >
        <SvgIcon class="hero__scroll-icon" :icon="ScrollIcon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { ScrollIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const scrollToUniverse = () => {
  const universe = document.getElementById('universe')

  if (!universe) return

  const header = document.querySelector('header')

  const headerHeight = header ? header.getBoundingClientRect().height : 0

  const universeTop = universe.getBoundingClientRect().top + window.scrollY

  const targetPosition = Math.max(0, universeTop - headerHeight - 25)

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  })
}
</script>

<style lang="scss" scoped>
.hero {
  @include adaptiveValue('padding-top', 185, 80);
  @include adaptiveValue('padding-bottom', 75, 60);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 97%;
  }

  &__decor {
    position: absolute;
    &_left {
      top: 25%;
      left: 0;

      width: 51%;
      aspect-ratio: 1 / 0.91;
    }

    &_right {
      top: 31%;
      right: 0;

      width: 44.5%;
      aspect-ratio: 1 / 0.96;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 102, 18);
    }
  }

  &__button {
    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 18);
    }
  }

  &__info {
    max-width: 448px;

    margin: 0 auto;

    text-align: center;
    @media (min-width: $md5) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 52, 18);
      }
    }
  }

  &__scroll {
    @include adaptiveValue('min-width', 64, 40);
    @include adaptiveValue('height', 64, 40);
    display: flex;
    align-items: center;
    justify-content: center;

    width: fit-content;
    width: fit-content;

    margin: 0 auto;

    background-color: transparent;

    color: var(--secondary-color);

    transition: opacity 0.3s ease 0s;
    @media (max-width: $md5) {
      @include hide-item;
    }
    &-icon {
      width: fit-content;
      min-width: 14px;
      height: 22px;

      animation: scrollDown 1.8s ease-in-out infinite;

      will-change: transform;
    }
    @media (any-hover: hover) {
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
  }
}

@keyframes scrollDown {
  0%,
  100% {
    transform: translateY(-5px);
  }

  50% {
    transform: translateY(5px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scroll-icon {
    animation: none;
  }
}
</style>
