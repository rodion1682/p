<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const goToCS2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'cs2' },
  })
}

const goToDota2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'dota2' },
  })
}
</script>

<template>
  <section class="ready">
    <div class="ready__inner _cnt">
      <div class="ready__image ready__image_left _ibg-cotnain">
        <img src="@/assets/img/ready-left.png" />
      </div>
      <div class="ready__image ready__image_right _ibg-cotnain">
        <img src="@/assets/img/ready-right.png" />
      </div>
      <div class="ready__bg _ibg-contian">
        <img src="@/assets/img/ready-bg.png" />
      </div>
      <div class="ready__content">
        <div class="ready__label">
          {{ $t('FINAL CALL TO ACTION') }}
        </div>
        <div class="ready__title _h2">
          <div>
            {{ $t('READY TO FIND YOUR') }}
          </div>
          <span>
            {{ $t('NEXT RELIC?') }}
          </span>
        </div>
        <div class="ready__text">
          {{
            $t(
              'Explore distinctive CS2 and Dota 2 skins, discover new favorites, and build a collection that reflects your style. Your next great find could be waiting at Relic Forge.',
            )
          }}
        </div>
        <div class="ready__actions">
          <BaseButton class="hero__button" variant="bordered" @click="goToDota2"
            >{{ $t('Browse Dota 2 Skins') }}
          </BaseButton>
          <BaseButton class="hero__button" @click="goToCS2">{{
            $t('Explore CS2 Skins')
          }}</BaseButton>
          <BaseButton variant="dark" class="hero__button" @click="goToCS2">{{
            $t('Create Account')
          }}</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.start {
  position: relative;
  z-index: 1;
  background-color: var(--bg-primary-color);
  @include adaptiveValue('padding-top', 120, 0);
  @include adaptiveValue('margin-top', 0, -25);
  @include adaptiveValue('padding-bottom', 170, 25);
  &__inner {
    position: relative;
  }

  &__iamge {
    width: 16vw;
    position: absolute;
    top: 50%;
    aspect-ratio: 1;
    transform: translate(0px, -50%);
    @media (max-width: $md2) {
      opacity: 0.8;
    }
    &_left {
      left: -5%;
    }

    &_right {
      right: -5%;
    }
  }

  &__info {
    text-align: center;
    position: relative;
    z-index: 1;
    text-shadow: 1px 1px 1px var(--bg-primary-color);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__text {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__link {
    display: block;
    max-width: 340px;
    margin: 0 auto;
  }
}
</style>
