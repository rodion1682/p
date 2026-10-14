<template>
  <div class="colection">
    <div class="colection__inner _cnt-home">
      <div class="colection__bg _ibg">
        <img src="@/assets/img/colection-bg.png" />
      </div>
      <div class="colection__card colection__card_left _ibg-contain">
        <img src="@/assets/img/colection-card-left.png" />
      </div>
      <div class="colection__card colection__card_right _ibg-contain">
        <img src="@/assets/img/colection-card-right.png" />
      </div>
      <div class="colection__content">
        <div class="colection__subtitle _h5">{{ $t('The Collection') }}</div>
        <div class="colection__title _h2">
          <div>
            {{ $t('Ancient') }}
            <span>{{ $t('Magic Lives') }}</span>
          </div>
          {{ $t('Within Every Card') }}
        </div>
        <div class="colection__items">
          <div class="colection__item">
            {{ $t('Every card tells a story.') }}
          </div>
          <div class="colection__item">
            {{ $t('Every spell belongs to a forgotten school.') }}
          </div>
          <div class="colection__item">
            {{
              $t(
                'Every artifact carries the legacy of an ancient civilization.',
              )
            }}
          </div>
        </div>
        <div class="colection__text">
          {{
            $t(
              'Build your deck from hundreds of beautifully illustrated cards inspired by legendary archives, magical academies, ancient temples, and mystical relics.',
            )
          }}
        </div>
        <BaseButton
          @click="goToMarketPage"
          variant="bordered"
          class="colection__button"
        >
          {{ $t('Explore the card market') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMarketPage = () => {
  router.push({
    name: 'ProductListPage',
  })
}
</script>

<style lang="scss" scoped>
.colection {
  @include adaptiveValue('padding-top', 108, 0);
  @include adaptiveValue('padding-bottom', 72, 0);
  &__inner {
    @include adaptiveValue('padding-top', 193, 100);
    @include adaptiveValue('padding-bottom', 305, 195);
    position: relative;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__card {
    position: absolute;

    width: 23vw;
    height: 30vw;
    &_left {
      bottom: 10%;
      left: 0;

      transform: translate(-40%, 0px);
    }
    &_right {
      top: 3%;
      right: 0;

      transform: translate(40%, 0px);
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    max-width: 915px;

    margin: 0 auto;
  }

  &__subtitle {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
    @media (max-width: $md8) {
      div {
        display: inline;
      }
    }
  }

  &__items {
    @include adaptiveValue('margin-left', 170, 0);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__item {
    &::before {
      margin-right: 9px;

      color: var(--hint-secondary-color);

      content: '◈';
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__text {
    max-width: 696px;

    margin-right: auto;
    margin-left: auto;

    color: var(--secondary-color);
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__button {
    max-width: 263px;

    margin: 0 auto;

    font-family: var(--font-inter) !important;
    font-size: 14px !important;
  }
}
</style>
