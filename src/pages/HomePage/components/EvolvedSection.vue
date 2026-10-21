<template>
  <div class="evolved">
    <div class="evolved__bg _ibg">
      <img src="@/assets/img/evolved-bg.jpg" />
    </div>
    <div class="evolved__inner _cnt-home">
      <div class="evolved__top">
        <div class="evolved__subtitle _h6">
          {{ $t('THE OLD WORLD NEVER DISAPPEARED.') }}
        </div>
        <div class="evolved__title _h2">
          {{ $t('IT EVOLVED.') }}
        </div>
      </div>
      <BaseButton class="evolved__button" variant="play" @click="openPlayPage">
        {{ $t('PLAY NOW') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}
</script>

<style lang="scss" scoped>
.evolved {
  @include adaptiveValue('padding-top', 382, 90);
  @include adaptiveValue('padding-bottom', 130, 30);
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
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 297, 22);
    }
  }

  &__subtitle {
    @include adaptiveValue('font-size', 22, 16);
  }

  &__title {
  }

  &__button {
    margin: 0 auto;
  }
}
</style>
