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
  <section class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.png" />
    </div>
    <div class="hero__inner _cnt">
      <div class="hero__content">
        <div class="hero__title _h1">
          <div>{{ $t('FORGE YOUR') }}</div>
          <span>{{ $t('COLLECTION.') }}</span>
          <div>{{ $t('FIND YOUR') }}</div>
          <span>{{ $t('NEXT RELIC.') }}</span>
        </div>
        <div class="hero__text">
          {{
            $t(
              'Discover a world of unique CS2 and Dota 2 skins at Relic Forge. Explore iconic weapon finishes, rare knives, distinctive gloves, legendary hero cosmetics, and other sought-after items. Find the perfect additions to your collection and get the items you want through a simple, convenient shopping experience.',
            )
          }}
        </div>
        <div class="hero__actions">
          <BaseButton class="hero__button" @click="goToCS2">{{
            $t('Explore CS2 Skins')
          }}</BaseButton>
          <BaseButton
            class="hero__button"
            variant="bordered"
            @click="goToDota2"
            >{{ $t('Browse Dota 2 Skins') }}</BaseButton
          >
        </div>
        <div class="hero__lists">
          <div class="hero__list">
            <div class="hero__list-line"></div>
            <div class="hero__list-label">
              {{ $t('CS2 SKINS') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Weapons') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Knives') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Gloves') }}
            </div>
          </div>
          <div class="hero__list">
            <div class="hero__list-line"></div>
            <div class="hero__list-label">
              {{ $t('DOTA 2 SKINS') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Hero Sets') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Immortals') }}
            </div>
            <div class="hero__list-item">
              {{ $t('Couriers') }}
            </div>
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

.hero {
  @include adaptiveValue('padding-top', 214, 80);
  @include adaptiveValue('padding-bottom', 446, 60);
  position: relative;
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    img {
      object-position: center;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__content {
    text-shadow: 1px 1px 2px rgba(255, 255, 255);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__text {
    max-width: 588px;
    color: var(--fourth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('gap', 20, 10);
    @media (max-width: $md4) {
      justify-content: center;
    }
  }

  &__button {
    max-width: 284px;
  }
  &__lists {
    position: absolute;
    right: 3%;
    top: 2%;
    display: flex;
    @include adaptiveValue('gap', 77, 20);
    @media (max-width: $md2) {
      @include hide-item;
    }
  }
  &__list {
    padding-left: 29px;
    padding-bottom: 24px;
    line-height: 120%;
    position: relative;
    text-shadow: 1px 1px 2px var(--secondary-color);
    height: fit-content;
    &:not(:last-child) {
      margin-top: 30%;
    }
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: var(--hint-primary-color);
      left: 0;
      transform: translate(-50%, 0px);
    }
    &::before {
      top: 0;
    }
    &::after {
      bottom: 0;
    }
    &-line {
      position: absolute;
      height: 60%;
      left: 0;
      top: 50%;
      transform: translate(0px, -50%);
      width: 1px;
      background-color: var(--hint-primary-color);
    }
    &-label {
      text-transform: uppercase;
      color: var(--third-color);
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    &-item {
      color: var(--border-primary-color);
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
