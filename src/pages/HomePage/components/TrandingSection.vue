<template>
  <section class="col">
    <div class="col__inner _cnt">
      <div class="col__top">
        <div class="col__label">
          {{ $t('FEATURED ITEMS') }}
        </div>

        <div class="col__title _h2">
          {{ $t('EXPLORE') }}
          <span>{{ $t('THE COLLECTION') }}</span>
        </div>

        <div class="col__text">
          {{
            $t(
              'Check out selected CS2 and Dota 2 skins and find something worth adding to your inventory.',
            )
          }}
        </div>
      </div>

      <div class="col__slider">
        <Swiper
          v-if="randomProducts.length > 0"
          :key="sliderKey"
          :modules="[Autoplay]"
          :slides-per-view="1.5"
          :space-between="4"
          :slides-per-group="1"
          :loop="randomProducts.length >= 12"
          :allow-touch-move="true"
          :grab-cursor="true"
          :prevent-clicks="false"
          :prevent-clicks-propagation="false"
          :speed="650"
          :autoplay="{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: true,
          }"
          :breakpoints="{
            320: {
              slidesPerView: 1.5,
              spaceBetween: 4,
            },
            440: {
              slidesPerView: 2.25,
              spaceBetween: 4,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 4,
            },
            992: {
              slidesPerView: 4,
              spaceBetween: 4,
            },
            1100: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
          }"
          class="col__swiper"
          @swiper="onSwiper"
        >
          <SwiperSlide
            v-for="(item, index) in randomProducts"
            :key="`${item.id}-${index}`"
          >
            <div class="col__slide">
              <ProductCard
                :product="item"
                :accent-color="getAccentColor(index)"
              />
            </div>
          </SwiperSlide>
        </Swiper>

        <div v-if="randomProducts.length > 0" class="col__navigation">
          <button
            type="button"
            class="col__arrow col__arrow_prev"
            aria-label="Previous slide"
            @click.stop.prevent="slidePrev"
          >
            <SvgIcon :icon="ChevronDownIcon" class="col__arrow-icon" />
          </button>

          <button
            type="button"
            class="col__arrow col__arrow_next"
            aria-label="Next slide"
            @click.stop.prevent="slideNext"
          >
            <SvgIcon :icon="ChevronDownIcon" class="col__arrow-icon" />
          </button>
        </div>

        <div v-else-if="isLoading" class="col__state">
          {{ $t('Loading products...') }}
        </div>

        <div v-else-if="error" class="col__state col__state_error">
          <p>{{ $t('Failed to load products.') }}</p>

          <button type="button" class="col__retry" @click="loadProducts">
            {{ $t('Try again') }}
          </button>
        </div>

        <div v-else class="col__state">
          {{ $t('No products available.') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import 'swiper/css'

import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, onMounted, ref, watch } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

import ProductCard from '@/components/ProductCard.vue'

import { useCurrencyStore } from '@/stores/currency'
import { useProductStore } from '@/stores/product'

defineProps({
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
})

const productStore = useProductStore()
const currencyStore = useCurrencyStore()

const isLoading = ref(false)
const error = ref(false)

const swiperInstance = ref(null)

const randomProducts = computed(() =>
  Array.isArray(productStore.randomProducts) ? productStore.randomProducts : [],
)

const sliderKey = computed(() =>
  randomProducts.value.map((item, index) => `${item.id}-${index}`).join('-'),
)

const onSwiper = swiper => {
  swiperInstance.value = swiper
}

const slidePrev = () => {
  const swiper = swiperInstance.value

  if (!swiper || swiper.destroyed || swiper.animating) return

  swiper.slidePrev(650)
}

const slideNext = () => {
  const swiper = swiperInstance.value

  if (!swiper || swiper.destroyed || swiper.animating) return

  swiper.slideNext(650)
}

const accentColors = [
  '#3F9088',
  '#CAA327',
  '#B5442F',
  '#7B4C8D',
  '#F0EAE0',
  '#C1587B',
]

const getAccentColor = index => {
  return accentColors[index % accentColors.length]
}

const loadProducts = async () => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = false

  try {
    const products = await productStore.fetchRandomProducts({
      category: 'cs2',
      limit: 24,
    })

    if (!Array.isArray(products) || !products.length) {
      error.value = true
    }
  } catch (err) {
    console.error('Failed to load random products:', err)
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProducts()
})

watch(
  () => currencyStore.currentCurrencyCode,
  (newCurrency, oldCurrency) => {
    if (!newCurrency || newCurrency === oldCurrency) return

    loadProducts()
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.col {
  @include adaptiveValue('padding-bottom', 165, 30);

  width: 100%;
  min-width: 0;

  &__inner {
    width: 100%;
    min-width: 0;
  }

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 20);
    }
  }

  &__label {
    color: var(--fifth-color);
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }

    @media (max-width: $md6) {
      span {
        display: block;
      }
    }
  }

  &__text {
    max-width: 601px;
    margin: 0 auto;
  }

  &__slider {
    position: relative;
    width: 100%;
    min-width: 0;

    @media (min-width: $md2) {
      @include adaptiveValue('padding-left', 0, 40, 1900, 1470, 1);

      @include adaptiveValue('padding-right', 0, 40, 1900, 1470, 1);
    }
  }

  &__swiper {
    width: 100%;
    min-width: 0;
    overflow: hidden;

    @media (hover: hover) and (pointer: fine) {
      padding-bottom: 110px;
    }

    :deep(.swiper-wrapper) {
      align-items: stretch;
    }

    :deep(.swiper-slide) {
      position: relative;
      height: auto;
      min-width: 0;
      overflow: visible;

      @media (hover: hover) and (pointer: fine) {
        &:hover,
        &:focus-within {
          z-index: 10;
        }
      }
    }
  }

  &__slide {
    display: flex;
    height: 100%;
    min-width: 0;
  }

  &__navigation {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;

    @media (hover: hover) and (pointer: fine) {
      bottom: 110px;
    }
  }
  &__arrow {
    position: absolute;
    top: 50%;
    z-index: 21;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 48px;
    height: 48px;
    padding: 0;

    transform: translateY(-50%);

    border: 1px solid #344050;
    border-radius: 8px;
    background-color: #192330;

    color: #f4f6fb;
    cursor: pointer;
    pointer-events: auto;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease,
      box-shadow 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: #1a73ff;
        background-color: #1a73ff;
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(26, 115, 255, 0.2);
      }
    }

    &:active {
      background-color: #005fe8;
      border-color: #005fe8;
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }

    &_prev {
      left: 6px;

      .col__arrow-icon {
        transform: rotate(90deg);
      }
    }

    &_next {
      right: 6px;

      .col__arrow-icon {
        transform: rotate(-90deg);
      }
    }
  }

  &__arrow-icon {
    display: block;
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 200px;
    padding: 24px;

    border: 1px solid #303948;
    border-radius: 10px;
    background-color: #111821;

    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;

    &_error {
      flex-direction: column;
      gap: 14px;
    }
  }

  &__retry {
    min-height: 36px;
    padding: 8px 20px;

    border: 1px solid #1a73ff;
    border-radius: 6px;
    background-color: #1a73ff;

    color: #ffffff;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    transition: background-color 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: #005fe8;
      }
    }
  }

  @media (max-width: $md2) {
    &__arrow {
      width: 42px;
      height: 42px;
    }
  }

  @media (max-width: $md5) {
    &__slider {
      padding-bottom: 58px;
    }

    &__navigation {
      inset: auto 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 44px;
    }

    &__arrow {
      position: static;
      top: auto;
      left: auto;
      right: auto;

      width: 42px;
      height: 42px;

      transform: none;
    }

    &__arrow-icon {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
