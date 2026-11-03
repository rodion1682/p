<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const goToProducts = () => {
  router.push({ name: 'ProductListPage' })
}
</script>

<template>
  <section class="explore">
    <div class="explore__inner _cnt-home">
      <div class="explore__top">
        <div class="explore__info">
          <div class="explore__subtitle _h4">
            {{ $t('EVERYTHING YOU NEED TO SURVIVE.') }}
          </div>
          <div class="explore__bottom">
            <div class="explore__title _h2">
              {{ $t('EXPLORE THE SHOP') }}
            </div>
            <div class="explore__text">
              {{
                $t(
                  'From essential supplies to valuable equipment, the WastelandCore Shop gives players more ways to manage their in-game items.',
                )
              }}
            </div>
          </div>
        </div>
        <BaseButton
          class="explore__button"
          variant="shadow"
          @click="goToProducts"
        >
          {{ $t('EXPLORE THE SHOP') }}
        </BaseButton>
      </div>
      <div class="explore__items">
        <div class="explore__item">
          <div class="explore__image _ibg-contain">
            <img src="@/assets/img/explore-01.png" />
          </div>
          <div class="explore__label _h4">
            {{ $t('WEAPONS & EQUIPMENT') }}
          </div>
          <div class="explore__value">
            {{
              $t(
                'Find the gear you need to prepare for dangerous encounters and defend what you’ve built.',
              )
            }}
          </div>
        </div>
        <div class="explore__item">
          <div class="explore__image _ibg-contain">
            <img src="@/assets/img/explore-02.png" />
          </div>
          <div class="explore__label _h4">
            {{ $t('RESOURCES & SUPPLIES') }}
          </div>
          <div class="explore__value">
            {{
              $t(
                'Get access to useful materials and essential items for your next building project or expedition.',
              )
            }}
          </div>
        </div>
        <div class="explore__item">
          <div class="explore__image _ibg-contain">
            <img src="@/assets/img/explore-03.png" />
          </div>
          <div class="explore__label _h4">
            {{ $t('BUY & SELL ITEMS') }}
          </div>
          <div class="explore__value">
            {{
              $t(
                'Browse available items for purchase or list eligible items fr om your collection for sale through a simple, convenient process.',
              )
            }}
          </div>
        </div>
        <div class="explore__item">
          <div class="explore__image _ibg-contain">
            <img src="@/assets/img/explore-04.png" />
          </div>
          <div class="explore__label _h4">
            {{ $t('QUICK & CONVENIENT') }}
          </div>
          <div class="explore__value">
            {{
              $t(
                'Manage your purchases and sales through an intuitive interface designed to keep the process simple.',
              )
            }}
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

.explore {
  @include adaptiveValue('padding-top', 98, 30);
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 33, 10);
    }
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 20, 18);
    }
  }

  &__info {
    flex: 1 1 auto;
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 4);
    }
  }

  &__bottom {
    @media (min-width: $md3) {
      display: flex;
      @include adaptiveValue('gap', 28, 18);
    }
  }

  &__title {
    color: var(--hint-primary-color);
    white-space: nowrap;
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__text {
    height: fit-content;
    align-self: center;
  }

  &__button {
    @media (min-width: $md5) {
      align-self: flex-end;
      @include adaptiveValue('max-width', 243, 200);
      @include adaptiveValue('min-width', 243, 200);
      @include adaptiveValue('margin-bottom', 15, 0);
    }
    @media (max-width: $md6) {
      max-width: 243px;
    }
  }

  &__items {
    display: grid;
    @include adaptiveValue('gap', 24, 4);
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    text-align: center;
    @include adaptiveValue('padding', 26, 10);
    border-radius: 6px;
    background-color: var(--bg-third-color);
    border: 1px solid var(--border-primary-color);
  }

  &__image {
    max-width: 256px;
    margin-left: auto;
    margin-right: auto;
    aspect-ratio: 1 / 0.53;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__label {
    @include adaptiveValue('padding-top', 30, 15);
    position: relative;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 10);
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 1px;
      background-color: var(--border-primary-color);
    }
  }

  &__value {
  }
}
</style>
