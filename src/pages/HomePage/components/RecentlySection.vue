<template>
  <section v-if="products.length" class="recently">
    <div class="recently__inner _cnt-home">
      <div class="recently__top">
        <div class="recently__arrows">
          <BaseButton
            variant="secondary"
            ref="prevButton"
            type="button"
            class="recently__arrow recently__arrow_prev"
            aria-label="Previous products"
          >
            <SvgIcon :icon="ArrowIcon" class="recently__arrow-icon" />
          </BaseButton>

          <BaseButton
            variant="secondary"
            ref="nextButton"
            type="button"
            class="recently__arrow recently__arrow_next"
            aria-label="Next products"
          >
            <SvgIcon
              :icon="ArrowIcon"
              class="recently__arrow-icon recently__arrow-icon_next"
          /></BaseButton>
        </div>
        <div class="recently__title _h4">
          <span>{{ $t('Recently added Items') }}</span>
        </div>
        <BaseButton class="recently__join" @click="joinNow">
          <span> {{ $t('JOIN NOW') }}</span>
          <SvgIcon :icon="ArrowIcon" class="recently__join-icon" />
        </BaseButton>
      </div>
    </div>

    <Swiper
      :modules="[Navigation]"
      :slides-per-view="1"
      :space-between="10"
      :breakpoints="breakpoints"
      :navigation="navigation"
      :watch-overflow="true"
      :observer="true"
      :observe-parents="true"
      :observe-slide-children="true"
      class="recently__slider"
      @before-init="onBeforeInit"
    >
      <SwiperSlide
        v-for="item in products"
        :key="item.id"
        class="recently__slide"
      >
        <div class="recently__card">
          <ProductCard :product="item" />
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { ArrowIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import ProductCard from '@/components/ProductCard.vue'

import axios from '@/plugins/axios'

import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'

import 'swiper/css'
import 'swiper/css/navigation'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: '',
  },

  limit: {
    type: Number,
    default: 18,
  },
})

const products = ref([])
const isLoading = ref(false)

const prevButton = ref(null)
const nextButton = ref(null)

const joinNow = () => {
  router.push({
    name: 'ProductListPage',
  })
}

const navigation = {
  prevEl: null,
  nextEl: null,
}

const onBeforeInit = swiper => {
  swiper.params.navigation.prevEl = prevButton.value?.$el || null
  swiper.params.navigation.nextEl = nextButton.value?.$el || null
}

const breakpoints = {
  320: {
    slidesPerView: 2,
    spaceBetween: 4,
  },

  767.98: {
    slidesPerView: 3,
    spaceBetween: 4,
  },

  991.98: {
    slidesPerView: 4,
    spaceBetween: 4,
  },
  1199.98: {
    slidesPerView: 5,
    spaceBetween: 4,
  },
  1379.98: {
    slidesPerView: 6,
    spaceBetween: 4,
  },

  1599.98: {
    slidesPerView: 8,
    spaceBetween: 4,
  },

  1859.98: {
    slidesPerView: 9,
    spaceBetween: 10,
  },
}

const fetchRandomProducts = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    const { data } = await axios.get('/items', {
      params: {
        per_page: props.limit,
        sales: 1,
      },
    })

    products.value = data?.data || data?.payload || []
  } catch (error) {
    console.error('Failed to fetch random products:', error)

    products.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRandomProducts()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.recently {
  @include adaptiveValue('padding-top', 64, 25);
  @include adaptiveValue('padding-bottom', 93, 25);
  &__inner {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: space-between;
    @media (max-width: $md4) {
      row-gap: 15px;
      flex-wrap: wrap;
    }
  }

  &__title {
    @media (max-width: $md4) {
      order: 1;
      flex: 1 1 100%;
      text-align: center;
    }
  }
  &__arrows {
    display: flex;
    @include adaptiveValue('gap', 16, 10);
    @media (max-width: $md4) {
      order: 2;
    }
  }
  &__arrow {
    @include adaptiveValue('max-width', 42, 40);
    @include adaptiveValue('min-width', 42, 40);
    @include adaptiveValue('min-height', 42, 42);
    padding: 0px !important;
    &_prev {
    }

    &_next {
    }

    &-icon {
      min-width: 16px;
      height: 16px;
      &_next {
        transform: rotate(-180deg);
      }
    }
  }

  &__join {
    max-width: 140px;
    font-size: 16px;
    font-family: var(--font-condensed);
    @include adaptiveValue('min-height', 36, 40);
    &-icon {
      min-width: 16px;
      height: 16px;
      transform: rotate(-180deg);
    }
    @media (max-width: $md4) {
      order: 3;
    }
  }

  &__slider {
    width: 100%;

    overflow: hidden;
  }

  &__slide {
    display: flex;
    align-items: stretch;

    height: auto;
  }

  &__card {
    display: flex;

    width: 100%;
    height: 100%;

    > * {
      width: 100%;
    }
  }

  :deep(.swiper-wrapper) {
    display: flex;
    align-items: stretch;
  }

  :deep(.swiper-slide) {
    height: auto;
  }

  :deep(.swiper-button-prev::after),
  :deep(.swiper-button-next::after) {
    display: none;
  }
}
</style>
