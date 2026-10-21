<template>
  <div class="adventure">
    <div class="adventure__bg _ibg">
      <img src="@/assets/img/adventure-bg.png" alt="" />
    </div>
    <div class="adventure__inner _cnt-home">
      <div class="adventure__subtitle">
        {{ $t('YOUR ADVENTURE BEGINS') }}
      </div>
      <div class="adventure__title _h2">
        {{ $t('Your Galaxy Awaits') }}
      </div>

      <div class="adventure__info _h7">
        {{
          $t('Choose your hero. Build your deck. Enter the celestial arena.')
        }}
      </div>
      <BaseButton @click="openPlayPage" variant="play" class="adventure__play">
        {{ $t('Play now') }}
      </BaseButton>
      <BaseButton @click="goToCardStore" class="adventure__explore">
        {{ $t('EXPLORE CARDS') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const goToCardStore = () => {
  router.push({ name: 'ProductListPage' })
}
</script>

<style lang="scss" scoped>
.adventure {
  @include adaptiveValue('padding-top', 93, 30);
  @include adaptiveValue('padding-bottom', 201, 30);
  position: relative;
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

    text-align: center;
  }

  &__subtitle {
    color: var(--third-color);
    font-size: 14px;
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 18);
    }
  }

  &__info {
    max-width: 448px;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 24);
    }
  }

  &__play {
    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 18);
    }
  }

  &__explore {
    max-width: 164px;

    margin: 0 auto;
  }
}
</style>
