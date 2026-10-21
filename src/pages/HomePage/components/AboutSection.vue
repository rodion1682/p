<template>
  <div class="about">
    <div class="about__bg _ibg">
      <img src="@/assets/img/about-bg.png" />
    </div>
    <div class="about__inner _cnt-home">
      <div class="about__content">
        <div class="about__title _h4">
          {{ $t('ETERNITY WAS NEVER GONE.') }}
        </div>
        <div class="about__text">
          {{
            $t(
              'Long before cities rose and technology reshaped the world, Eternity was already here. Now its ancient power flows through modern machines, forgotten structures, and the systems built above them.',
            )
          }}
        </div>
        <div class="about__items">
          <div class="about__item">
            {{ $t('Ancient power') }}
          </div>
          <div class="about__item">
            {{ $t('Modern control') }}
          </div>
          <div class="about__item">
            {{ $t('One force connecting both worlds') }}
          </div>
        </div>
        <BaseButton class="about__button" variant="play" @click="openPlayPage">
          {{ $t('PLAY NOW') }}
        </BaseButton>
      </div>
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
.about {
  @include adaptiveValue('padding-top', 329, 30);
  @include adaptiveValue('padding-bottom', 270, 30);
  @include adaptiveValue('margin-top', -30, 0);
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

  &__content {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 118, 0, 1800, 1370, 1);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 18);
    }
  }

  &__text {
    max-width: 670px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 18);
    }
  }

  &__items {
    @include adaptiveValue('gap', 14, 12);
    display: flex;
    flex-wrap: wrap;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 52, 22);
    }
  }

  &__item {
    color: var(--hint-third-color);
    font-family: var(--font-audiowide);
    line-height: 18px;
    text-transform: uppercase;
    &:not(:first-child) {
      position: relative;

      padding-left: 20px;

      &::before {
        position: absolute;
        top: 50%;
        left: 0;

        width: 6px;
        height: 6px;

        border-radius: 50%;
        background-color: var(--fourth-color);

        content: '';

        transform: translate(0px, -50%);
      }
    }
  }

  &__button {
  }
}
</style>
