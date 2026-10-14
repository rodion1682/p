<template>
  <div class="library">
    <div class="library__decor library__decor_center _ibg-contain">
      <img src="@/assets/img/heros-decor-top.png" />
    </div>
    <div class="library__decor library__decor_right _ibg-contain">
      <img src="@/assets/img/library-decor-right.png" />
    </div>
    <div class="library__bg _ibg">
      <img src="@/assets/img/library-bg.jpg" />
    </div>
    <div class="library__inner _cnt-home">
      <div class="library__top">
        <div class="library__subtitle _h5">{{ $t('The world of magic') }}</div>
        <div class="library__title _h2">
          {{ $t('Enter the ') }}
          <span>{{ $t('Great Library') }}</span>
        </div>
      </div>
      <div class="library__items">
        <div class="library__item">
          {{ $t('Every forgotten corridor hides another secret.') }}
        </div>
        <div class="library__item">
          {{ $t('Every ancient manuscript reveals another spell.') }}
        </div>
        <div class="library__item">
          {{ $t('Every relic recalls a civilization that wouldn1 fade away.') }}
        </div>
      </div>
      <div class="library__actions">
        <BaseButton
          @click="openPlayPage"
          class="library__button library__button_play"
        >
          {{ $t('Play now') }}
        </BaseButton>

        <BaseButton
          @click="goToMarketPage"
          variant="bordered"
          class="library__button library__button_market"
        >
          {{ $t('Explore the card market') }}
        </BaseButton>
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
.library {
  @include adaptiveValue('padding-top', 192, 25);
  @include adaptiveValue('padding-bottom', 191, 25);
  position: relative;
  &__decor {
    position: absolute;
    top: 0;
    z-index: 1;
    &_center {
      left: 50%;

      width: 15vw;
      height: 1.4vw;

      transform: translate(-50%, -50%);
    }
    &_right {
      right: 0;

      width: 15.7vw;
      height: 10.4vw;

      transform: translate(0px, -50%);
    }
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
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    max-width: 700px;

    margin: 0 auto;
  }

  &__items {
    width: fit-content;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__item {
    &::before {
      margin-right: 9px;

      color: var(--hint-secondary-color);

      content: '◈';
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  &__button {
    &_play {
      max-width: 229px;
    }
    &_market {
      max-width: 345px;
    }
  }
}
</style>
