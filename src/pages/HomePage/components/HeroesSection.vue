<template>
  <div class="heros">
    <div v-if="isBgActive" class="heros__bg _ibg">
      <img src="@/assets/img/heros-bg.jpg" alt="" />
    </div>

    <div class="heros__inner _cnt-home">
      <div class="heros__top">
        <h2 class="heros__title _h2">
          {{ $t('Choose Your Star') }}
        </h2>

        <div class="heros__subtitle _h7">
          {{ $t('Five heroes. Five galaxies. Five ways to shape the battle.') }}
        </div>
      </div>

      <div v-if="heroes.length" class="heros__slider">
        <Swiper
          :key="swiperKey"
          class="heros__swiper"
          :modules="[Pagination]"
          :initial-slide="0"
          :slides-per-view="1.5"
          :centered-slides="true"
          :space-between="0"
          :speed="700"
          :loop="heroes.length >= 5"
          :loop-additional-slides="0"
          :watch-overflow="true"
          :breakpoints="{
            300: {
              slidesPerView: 1,
              centeredSlides: true,
              spaceBetween: 0,
            },
            480: {
              slidesPerView: 2,
              centeredSlides: true,
              spaceBetween: 0,
            },

            768: {
              slidesPerView: 3,
              centeredSlides: true,
              spaceBetween: 0,
            },
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
              <div class="heros__image _ibg-contain">
                <img
                  :src="item.image_plain"
                  :alt="item.name"
                  draggable="false"
                />
              </div>

              <div class="heros__info">
                <div class="heros__name _h5">
                  {{ item.name }}
                </div>

                <div v-if="item.short_description" class="heros__class">
                  {{ item.short_description }}
                </div>

                <p v-if="item.hero_power" class="heros__description _h7">
                  {{ item.hero_power }}
                </p>
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

        <div class="heros__pagination"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/pagination'

import BaseButton from '@/components/base/BaseButton.vue'
import { useHeroesStore } from '@/stores/heroes'

defineProps({
  isBgActive: {
    type: Boolean,
    default: true,
  },
})

const heroesStore = useHeroesStore()

const heroes = computed(() => heroesStore.heroes || [])

const swiperInstance = ref(null)

const swiperKey = computed(() => heroes.value.map(hero => hero.id).join('-'))

const onSwiper = async swiper => {
  swiperInstance.value = swiper

  await nextTick()

  if (swiper.destroyed) return

  swiper.slideToLoop(0, 0, false)
}

watch(swiperKey, async () => {
  await nextTick()

  const swiper = swiperInstance.value

  if (!swiper || swiper.destroyed) return

  swiper.update()
  swiper.slideToLoop(0, 0, false)
})

const nextSlide = () => {
  const swiper = swiperInstance.value

  if (!swiper || swiper.destroyed || swiper.animating) return

  swiper.slideNext()
}

const prevSlide = () => {
  const swiper = swiperInstance.value

  if (!swiper || swiper.destroyed || swiper.animating) return

  swiper.slidePrev()
}
</script>

<style lang="scss" scoped>
.heros {
  @include adaptiveValue('padding-top', 120, 30);
  @include adaptiveValue('padding-bottom', 70, 30);
  position: relative;

  overflow: hidden;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 56, 18);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 18);
    }
  }

  &__subtitle {
    max-width: 448px;

    margin: 0 auto;
  }

  &__slider {
    position: relative;

    overflow: hidden;

    width: 100%;
    max-width: 1376px;

    margin: 0 auto;
    @media (max-width: 1375.98px) {
      width: auto;

      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__swiper {
    overflow: hidden;

    width: 100%;

    direction: ltr;
  }

  &__swiper :deep(.swiper-wrapper) {
    direction: ltr;
  }

  &__slide {
    position: relative;
    z-index: 1;

    height: auto;

    opacity: 0.64;

    transition: opacity 0.7s ease;

    &.swiper-slide-active {
      z-index: 3;

      opacity: 1;
    }

    &.swiper-slide-prev,
    &.swiper-slide-next {
      z-index: 2;

      opacity: 0.64;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 100%;
    height: 100%;

    text-align: center;
  }

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;

    transform: scale(0.692);
    transform-origin: center center;
    transition: transform 0.7s ease;

    img {
      display: block;

      width: 100%;
      height: 100%;

      user-select: none;

      object-fit: contain;
    }
  }

  &__slide.swiper-slide-active &__image {
    transform: scale(1);
  }

  &__image {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    padding-bottom: 100%;
  }

  &__info {
    @include adaptiveValue('margin-top', -11, 10);
    visibility: hidden;

    width: 100%;

    padding: 0px 10px;

    opacity: 0;

    transition:
      opacity 0.4s ease,
      visibility 0.4s ease;
  }

  &__slide.swiper-slide-active &__info {
    visibility: visible;

    opacity: 1;
  }

  &__name {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__class {
    font-size: 14px;
    text-transform: uppercase;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__description {
  }

  &__arrow {
    position: absolute;
    top: 35%;
    z-index: 10;

    width: fit-content;
    @media (max-width: $md6) {
      @include hide-item;
    }
    &_prev {
      left: 10px;

      transform: translateY(-50%);
    }

    &_next {
      right: 10px;

      transform: translateY(-50%);
      :deep(.svg-icon) {
        transform: rotate(-180deg);
      }
    }
  }

  &__pagination {
    @include adaptiveValue('margin-top', 32, 18);
    position: relative;
    z-index: 5;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;

    :deep(.swiper-pagination-bullet) {
      width: fit-content;
      min-width: 12px;
      height: 12px;

      margin: 0 !important;

      border: 3px solid var(--fifth-color);
      border-radius: 50%;
      background: transparent;
      opacity: 1;

      transition: all 0.3s ease 0s;
      @media (any-hover: hover) {
        &:hover {
          border-color: var(--secondary-color);
        }
      }
    }

    :deep(.swiper-pagination-bullet-active) {
      border-color: transparent;
      background-color: var(--secondary-color);
    }
  }
}
</style>
