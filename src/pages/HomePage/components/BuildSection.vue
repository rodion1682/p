<template>
  <div class="build">
    <div class="build__inner _cnt-home">
      <div class="build__bg _ibg-contain">
        <img src="@/assets/img/cards-bg.png" />
      </div>
      <div class="build__content">
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
  @include adaptiveValue('padding-top', 38, 0);
  @include adaptiveValue('padding-bottom', 174, 30);
  &__inner {
    @include adaptiveValue('padding-top', 92, 0);
    position: relative;

    max-width: 1426px;

    text-align: center;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    aspect-ratio: 1 / 0.51;
    @media (max-width: $md4) {
      @include hide-item;
    }
  }
  &__content {
    position: relative;
    z-index: 1;
  }
  &__title {
    @include adaptiveValue('font-size', 42, 25);
    @media (min-width: $md4) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 629, 355, 1400, 992, 1);
      }
    }
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__cards {
    @media (min-width: $md4) {
      @include hide-item;
    }
    @media (max-width: $md4) {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__card {
    @media (max-width: $md3) {
      flex: 0 1 calc(33.333% - 14px);

      aspect-ratio: 1 / 1.5;
    }
  }

  &__button {
    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 52, 18);
    }
  }

  &__subtitle {
    @include adaptiveValue('font-size', 42, 18);
    color: var(--sixth-color);
  }
}
</style>
