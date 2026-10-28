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
          :modules="[Autoplay, FreeMode]"
          :loop="randomProducts.length >= 12"
          :free-mode="{
            enabled: true,
            momentum: false,
          }"
          :allow-touch-move="true"
          :grab-cursor="true"
          :speed="5000"
          @swiper="onSwiper"
          :autoplay="{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }"
          :breakpoints="{
            320: {
              slidesPerView: 1.5,
              spaceBetween: 4,
            },
            439.98: {
              slidesPerView: 2.25,
              spaceBetween: 4,
            },
            767.98: {
              slidesPerView: 3,
              spaceBetween: 4,
            },
            991.82: {
              slidesPerView: 4,
              spaceBetween: 4,
            },
            1099.98: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
            1199.98: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
          }"
          class="col__swiper"
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
            @click="slidePrev"
          >
            <SvgIcon :icon="ChevronDownIcon" class="col__arrow-icon" />
          </button>

          <button
            type="button"
            class="col__arrow col__arrow_next"
            aria-label="Next slide"
            @click="slideNext"
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

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { Autoplay, FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, onMounted, ref, watch } from 'vue'

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

const onSwiper = swiper => {
  swiperInstance.value = swiper
}

const slidePrev = () => {
  swiperInstance.value?.slidePrev()
}

const slideNext = () => {
  swiperInstance.value?.slideNext()
}

const randomProducts = computed(() =>
  Array.isArray(productStore.randomProducts) ? productStore.randomProducts : [],
)

const sliderKey = computed(() =>
  randomProducts.value.map((item, index) => `${item.id}-${index}`).join('-'),
)

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
  &__inner {
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 20);
    }
  }
  &__label {
    text-transform: uppercase;
    color: var(--fifth-color);
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
    @media (min-width: $md2) {
      position: relative;
      width: 100%;
      @include adaptiveValue('padding-left', 0, 40, 1900, 1470, 1);
      @include adaptiveValue('padding-right', 0, 40, 1900, 1470, 1);
    }
  }

  &__swiper {
  }

  &__slide {
  }

  &__navigation {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  &__arrow {
    position: absolute;
    top: 50%;
    @include adaptiveValue('width', 50, 40, 1900, 1470, 1);
    @include adaptiveValue('height', 50, 40, 1900, 1470, 1);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-third-color);
    border: 1px solid inherit;
    transition: all 0.3s ease 0s;
    color: rgb(153, 161, 176, 0.5);
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    @media (max-width: $md2) {
      @include hide-item;
    }
    &_prev {
      @include adaptiveValue('left', -100, -30, 1900, 1470, 1);
      transform: rotate(90deg) translate(0px, -50%);
    }

    &_next {
      @include adaptiveValue('right', -70, 10, 1900, 1470, 1);
      transform: rotate(-90deg) translate(0px, 50%);
    }

    &-icon {
      width: 15px;
      height: 15px;
    }
  }

  &__state {
    &_error {
    }
  }

  &__retry {
  }
}
</style>
