<script setup>
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
  <section class="games">
    <div class="games__bg _ibg">
      <img src="@/assets/img/games-bg.png" />
    </div>
    <div class="games__inner _cnt">
      <button class="games__button games__button_cs" @click="goToCS2">
        <div class="games__title _h2">
          <div>{{ $t('CS2') }}</div>
          <div>{{ $t('SECTION') }}</div>
        </div>
        <div class="games__iamge _ibg-contain">
          <img src="@/assets/img/games-cs.png" />
        </div>
      </button>
      <button class="games__button games__button_dota _h2" @click="goToDota2">
        <div class="games__title _h2">
          <div>{{ $t('DOTA 2') }}</div>
          <div>{{ $t('SECTION') }}</div>
        </div>
        <div class="games__iamge _ibg-contain">
          <img src="@/assets/img/games-dota.png" />
        </div>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.games {
  position: relative;
  @include adaptiveValue('padding-bottom', 150, 60);
  @include adaptiveValue('padding-top', 40, 60);
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  &__inner {
    display: flex;
    justify-content: center;
    @include adaptiveValue('gap', 64, 4);
  }

  &__button {
    position: relative;
    background-color: transparent;
    width: 100%;
    max-width: 588px;
    @include adaptiveValue('padding-left', 30, 10);
    @include adaptiveValue('padding-right', 30, 10);
    @include adaptiveValue('padding-bottom', 50, 10);
    @include adaptiveValue('padding-top', 200, 80);
    height: fit-content;
    transition: transform 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        transform: scale(0.98);
      }
    }
    &::before {
      content: '';
      z-index: -1;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      @include adaptiveValue('border-radius', 18, 8);
      overflow: hidden;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    &_cs {
      &::before {
        background-image: url('@/assets/img/games-cs-bg.jpg');
      }
    }

    &_dota {
      @include adaptiveValue('margin-top', 80, 0);
      &::before {
        background-image: url('@/assets/img/games-dota-bg.jpg');
      }
    }
  }

  &__title {
    text-align: left;
    position: relative;
    z-index: 1;
    @include adaptiveValue('font-size', 48, 16);
  }

  &__iamge {
    position: absolute;
    right: -28%;
    bottom: 0;
    width: 100%;
    aspect-ratio: 1 / 0.8;
  }
}
</style>
