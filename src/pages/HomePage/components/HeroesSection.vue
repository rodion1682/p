<template>
  <div class="heros">
    <div v-if="isBgActive" class="heros__bg _ibg">
      <img src="@/assets/img/heros-bg.jpg" alt="" />
    </div>

    <div class="heros__inner _cnt-home">
      <div class="heros__top">
        <div class="heros__subtitle _line-title">
          <span>{{ $t('LEGENDS OF VARELLUNE') }}</span>
        </div>

        <div class="heros__title _h3">
          {{ $t('CHOOSE YOUR POWER.') }}
        </div>

        <div class="heros__description _h5">
          {{ $t('Five legends. Five paths. One coming Eclipse.') }}
        </div>
      </div>

      <div v-if="heroes?.length" class="heros__slider">
        <Swiper
          class="heros__swiper"
          :modules="[Navigation, Pagination]"
          :slides-per-view="1"
          :space-between="30"
          :speed="700"
          :loop="heroes.length > 1"
          :navigation="{
            prevEl: '.heros__arrow_prev',
            nextEl: '.heros__arrow_next',
          }"
          :pagination="{
            el: '.heros__pagination',
            clickable: true,
          }"
          @swiper="onSwiper"
        >
          <SwiperSlide
            v-for="item in heroes"
            :key="item.id"
            class="heros__slide"
          >
            <div class="heros__item">
              <div class="heros__left">
                <div class="heros__name _h2">
                  {{ item.name }}
                </div>

                <div v-if="item.short_description" class="heros__class">
                  {{ item.short_description }}
                </div>
              </div>

              <div class="heros__image _ibg-contain">
                <img :src="item.image_plain" :alt="item.name" />
              </div>

              <div class="heros__right">
                <div v-if="item.hero_power" class="heros__property">
                  <div>
                    {{ $t('Unique Power:') }}
                  </div>

                  <span>
                    {{ item.hero_power }}
                  </span>
                </div>

                <div v-if="item.playstyle" class="heros__property">
                  <div>
                    {{ $t('Style:') }}
                  </div>

                  <span>
                    {{ item.playstyle }}
                  </span>
                </div>

                <BaseButton class="heros__play" @click="open()">
                  {{ $t('Play now') }}
                </BaseButton>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <BaseButton
          icon="arrow"
          variant="arrow"
          class="heros__arrow heros__arrow_prev"
          aria-label="Previous hero"
          @click="prevSlide"
        />

        <BaseButton
          icon="arrow"
          variant="arrow"
          class="heros__arrow heros__arrow_next"
          aria-label="Next hero"
          @click="nextSlide"
        />

        <div class="heros__pagination" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import BaseButton from '@/components/base/BaseButton.vue'

import { useHeroesStore } from '@/stores/heroes'

defineProps({
  isBgActive: {
    type: Boolean,
    default: true,
  },
})

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const heroesStore = useHeroesStore()

const swiperInstance = ref(null)

const heroes = computed(() => heroesStore.heroes)

const onSwiper = swiper => {
  swiperInstance.value = swiper
}

const nextSlide = () => {
  swiperInstance.value?.slideNext()
}

const prevSlide = () => {
  swiperInstance.value?.slidePrev()
}

const open = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}
</script>

<style lang="scss" scoped>
.heros {
  @include adaptiveValue('padding-top', 174, 25);
  @include adaptiveValue('padding-bottom', 57, 25);
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
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 54, 15);
    }
  }

  &__description {
    color: var(--hint-third-color);
  }

  &__slider {
  }

  &__swiper {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__slide {
  }

  &__item {
    @include adaptiveValue('min-height', 654, 385, 1370, 768, 1);
    position: relative;

    display: flex;
    flex: 1 1 100%;
    @media (min-width: $md4) {
      @include adaptiveValue('padding-left', 116, 0);
      @include adaptiveValue('padding-right', 116, 0);
    }
    @media (max-width: $md3) {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }
    @media (max-width: $md4) {
      display: block;
    }
  }

  &__left {
    position: relative;
    z-index: 1;

    align-self: center;

    max-width: 280px;
    @media (max-width: $md3) {
      margin-right: auto;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
    @media (max-width: $md4) {
      max-width: none;
    }
  }

  &__name {
    @media (max-width: $md4) {
      text-align: center;
    }
  }

  &__class {
    @media (max-width: $md4) {
      text-align: center;
    }
  }

  &__image {
    @media (min-width: $md3) {
      left: 50%;

      transform: translate(-50%, 0px);
    }
    @media (max-width: $md3) {
      right: 0;
    }
    @media (min-width: $md4) {
      position: absolute;
      top: 0;
      left: 50%;

      width: 50%;
      height: 100%;
    }
    @media (max-width: $md4) {
      position: relative;

      width: 100%;
      max-width: 400px;
      aspect-ratio: 1 / 1;

      margin-right: auto;
      margin-left: auto;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  &__right {
    align-self: center;

    max-width: 331px;

    @media (min-width: $md3) {
      margin-left: auto;
    }
    @media (max-width: $md3) {
      margin-right: auto;
    }
    @media (max-width: $md4) {
      max-width: none;
    }
  }

  &__property {
    position: relative;
    z-index: 1;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
    @media (max-width: $md4) {
      text-align: center;
    }
    div {
      display: inline-block;

      margin-right: 4px;

      font-weight: 700;
    }
    span {
      color: var(--secondary-color);
    }
  }

  &__play {
    @include adaptiveValue('margin-top', 64, 15);
    @include adaptiveValue('min-height', 48, 40);
    @media (max-width: $md4) {
      margin-right: auto;
      margin-left: auto;
    }
    max-width: 250px;
  }

  &__arrow {
    position: absolute;
    top: 50%;
    @media (max-width: $md4) {
      @include hide-item;
    }
    &_prev {
      left: 10px;

      transform: translate(0px, -50%) rotate(90deg);
    }

    &_next {
      right: 10px;

      transform: translate(0px, -50%) rotate(-90deg);
    }
  }

  &__pagination {
    @include adaptiveValue('gap', 32, 10);
    position: relative;
    z-index: 1;

    display: flex;
    justify-content: center;

    :deep(.swiper-pagination-bullet) {
      @include adaptiveValue('width', 10, 20);
      @include adaptiveValue('height', 10, 20);
      border: 4px solid var(--border-seventh-color);
      border-radius: 50%;
      background-color: transparent;

      transition: all 0.3s ease 0s;
      @media (any-hover: hover) {
        &:hover {
          border-color: #8d96a5;
        }
      }
    }
    :deep(.swiper-pagination-bullet-active) {
      background-color: var(--border-seventh-color);
    }
  }
}
</style>
