<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.png" alt="" />
    </div>

    <div class="hero__inner _cnt-home">
      <div class="hero__iamge _ibg-cotnain">
        <img src="@/assets/img/hero-title.png" />
      </div>
      <div class="hero__title _h4">
        {{ $t('RISE OF THE FIVE') }}
      </div>
      <div class="hero__text">
        {{ $t('Five were awakened. The old world is returning.') }}
      </div>
      <div class="hero__actions">
        <BaseButton @click="openPlayPage" variant="play" class="hero__button">
          {{ $t('Play now') }}
        </BaseButton>
        <BaseButton
          @click="goToCardStore"
          variant="discover"
          class="hero__button"
        >
          {{ $t('DISCOVER ETERNITY') }}
        </BaseButton>
      </div>
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
.hero {
  @include adaptiveValue('padding-top', 418, 80);
  @include adaptiveValue('padding-bottom', 107, 30);
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

  &__iamge {
    width: 100%;
    max-width: 883px;
    aspect-ratio: 1 / 0.35;

    margin-right: auto;
    margin-left: auto;
  }
  &__title {
    @include adaptiveValue('margin-top', -90, -20);
  }
  &__title,
  &__text {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 18);
    }
  }

  &__text {
  }

  &__actions {
    @include adaptiveValue('gap', 42, 10);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__button {
  }
}
</style>
