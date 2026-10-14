<!-- ProductCarousel.vue -->
<template>
  <section v-if="products?.length" class="!m-0 flex w-full justify-center px-4">
    <div class="w-full max-w-[1320px] overflow-hidden">
      <!-- Heading ---------------------------------------------------- -->
      <header class="mb-9 flex flex-col items-center text-center">
        <h2 class="font-primary text-[42px] md:text-[96px]">
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mt-6 max-w-[600px] text-[14px] leading-6 text-secondary"
        >
          {{ description }}
        </p>
      </header>

      <!-- Slider ------------------------------------------------------ -->
      <Swiper
        :modules="[FreeMode]"
        slides-per-view="auto"
        :space-between="8"
        :centered-slides="centerOnMobile"
        :observer="true"
        :observe-parents="true"
        class="product-carousel"
      >
        <!-- arrows -->
        <template #navigation-prev>
          <button class="nav-btn left-0 md:-left-8">
            <ArrowIcon direction="left" fill-color="#fff" />
          </button>
        </template>
        <template #navigation-next>
          <button class="nav-btn right-0 md:-right-8">
            <ArrowIcon direction="right" fill-color="#fff" />
          </button>
        </template>

        <!-- cards -->
        <SwiperSlide
          v-for="item in products"
          :key="item.id"
          class="flex justify-center"
        >
          <div class="w-[213px]">
            <ProductCard :product="item" :new="isNew" :sale="isSale" />
          </div>
        </SwiperSlide>
      </Swiper>

      <!-- optional slot under slider -->
      <div class="flex justify-center">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core' // ← tiny helper
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import ArrowIcon from './icons/ArrowIcon.vue'
import ProductCard from './ProductCard.vue'

defineProps<{
  products: any[]
  title?: string
  description?: string
  isNew?: boolean
  isSale?: boolean
}>()

/* center slides only below tablet width */
const { width } = useWindowSize()
const centerOnMobile = computed(() => width.value < 768)
</script>

<style scoped>
.product-carousel :deep(.swiper-wrapper) {
  display: flex;
  align-items: stretch;
}
.product-carousel :deep(.swiper-slide) {
  width: 213px !important; /* fixed card width */
  display: flex;
  justify-content: center;
  align-items: stretch;
}

/* arrow buttons */
.nav-btn {
  @apply absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white md:flex;
}
.product-carousel :deep(.swiper-button-disabled) {
  @apply cursor-not-allowed opacity-50;
}
</style>
