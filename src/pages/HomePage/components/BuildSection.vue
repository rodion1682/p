<template>
  <div class="build">
    <div class="build__inner _cnt-home">
      <div class="build__bg _ibg-contain">
        <img src="@/assets/img/cards-bg.png" />
      </div>
      <div class="build__title _h4">
        {{ $t('BUILD YOUR POWER.') }}
      </div>
      <div class="build__cards">
        <div class="build__card _ibg-contain">
          <img src="@/assets/img/cards-01.png" />
        </div>
        <div class="build__card _ibg-contain">
          <img src="@/assets/img/cards-02.png" />
        </div>
        <div class="build__card _ibg-contain">
          <img src="@/assets/img/cards-03.png" />
        </div>
        <div class="build__card _ibg-contain">
          <img src="@/assets/img/cards-04.png" />
        </div>
        <div class="build__card _ibg-contain">
          <img src="@/assets/img/cards-05.png" />
        </div>
      </div>
      <BaseButton
        variant="discover"
        class="build__button"
        @click="goToCardStore"
      >
        {{ $t('DISCOVER ETERNITY') }}
      </BaseButton>
      <div class="build__subtitle _h4">
        {{ $t('SOME POWERS WERE NEVER MEANT TO AWAKEN.') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCardStore = () => {
  router.push({ name: 'ProductListPage' })
}
</script>

<style lang="scss" scoped>
.build {
  @include adaptiveValue('padding-top', 204, 30);
  @include adaptiveValue('padding-bottom', 145, 30);
  position: relative;
  &__decor {
    position: absolute;
    left: 50%;
    z-index: 1;

    height: fit-content;

    padding-bottom: 12.5%;
    &_top {
      @include adaptiveValue('width', 392, 132);
      top: 0;

      transform: translate(-50%, -50%);
    }
    &_bottom {
      @include adaptiveValue('width', 448, 158);
      bottom: 0;

      transform: translate(-50%, 50%);
    }
  }
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    @media (max-width: $md5) {
      opacity: 0.64;
    }
  }

  &__inner {
    @include adaptiveValue('gap', 82, 20);
    position: relative;
    z-index: 1;

    display: flex;
  }

  &__image {
    @include adaptiveValue('margin-left', 82, 0, 1870, 1370, 1);
    flex: 0 1 54.5%;

    aspect-ratio: 1 / 0.56;
    @media (max-width: $md5) {
      @include hide-item;
    }
  }

  &__content {
    align-self: center;

    text-shadow: 1px 1px 5px var(--bg-primary-color);
    @media (min-width: $md5) {
      max-width: 448px;
    }
  }

  &__subtitle {
    color: var(--third-color);
    font-size: 14px;
    text-transform: uppercase;
    &:not(:last-child) {
      margin-bottom: 9px;
    }
  }

  &__title {
    font-weight: 500;
    line-height: 120%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__text {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__button {
    max-width: 164px;
  }
}
</style>
