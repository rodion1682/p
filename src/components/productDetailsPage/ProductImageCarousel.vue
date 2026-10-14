<template>
  <div class="w-full">
    <div
      class="group relative"
      @mouseover="showButtons = true"
      @mouseleave="showButtons = false"
    >
      <button
        v-if="images?.length > 1"
        @click="prevSlide"
        class="prev-button"
        :disabled="!swiperInstance || isBeginning"
        :class="{
          'opacity-0': !showButtons,
          'opacity-50': (!swiperInstance || isBeginning) && showButtons,
          'opacity-100': showButtons,
        }"
      >
        <ArrowIcon direction="left" :fillColor="'#0C0E2F'" />
      </button>

      <swiper
        :modules="modules"
        :loop="false"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
        :navigation="{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }"
      >
        <swiper-slide v-for="(image, index) in images" :key="index">
          <img
            :src="image"
            alt="Product Image"
            class="h-auto max-h-[636px] w-full max-w-[636px] rounded object-contain"
          />
        </swiper-slide>
      </swiper>

      <button
        v-if="images?.length > 1"
        @click="nextSlide"
        class="next-button"
        :disabled="!swiperInstance || isEnd"
        :class="{
          'opacity-0': !showButtons,
          'opacity-50': (!swiperInstance || isEnd) && showButtons,
          'opacity-100': showButtons,
        }"
      >
        <ArrowIcon direction="right" :fillColor="'#0C0E2F'" />
      </button>
    </div>

    <div
      v-if="images?.length > 1"
      class="mx-auto mt-2 grid max-w-[636px] grid-cols-auto-fill-100 gap-[13px]"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        class="mx-auto flex-shrink-0"
      >
        <img
          :src="image"
          alt="Product Thumbnail"
          class="h-[118px] w-[118px] cursor-pointer rounded-[36px] object-contain"
          :class="{ 'border border-secondary': selectedIndex === index }"
          @click="selectImage(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import ArrowIcon from '@/components/icons/ArrowIcon.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => [],
  },
  selectedImage: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select-image'])
const modules = ref([Navigation])
const swiperInstance = ref(null)
const selectedIndex = ref(0)
const showButtons = ref(false)

const isBeginning = computed(() => {
  return swiperInstance.value ? swiperInstance.value.isBeginning : true
})

const isEnd = computed(() => {
  return swiperInstance.value ? swiperInstance.value.isEnd : false
})

const selectImage = index => {
  selectedIndex.value = index
  emit('select-image', props.images[index])
}

const onSwiper = swiper => {
  swiperInstance.value = swiper
}

const onSlideChange = () => {
  if (swiperInstance.value) {
    const activeIndex = swiperInstance.value.activeIndex
    selectedIndex.value = activeIndex
    emit('select-image', props.images[activeIndex])
  }
}

watch(
  () => props.selectedImage,
  newVal => {
    if (swiperInstance.value) {
      const index = props.images.indexOf(newVal)
      if (index !== -1) {
        swiperInstance.value.slideTo(index)
        selectedIndex.value = index
      }
    }
  },
)

const nextSlide = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slideNext()
  }
}

const prevSlide = () => {
  if (swiperInstance.value) {
    swiperInstance.value.slidePrev()
  }
}
</script>

<style scoped>
.product-carousel {
  overflow: visible !important;
}
:deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.prev-button,
.next-button {
  @apply absolute top-1/2 z-[2] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-small bg-[#2E303B] transition-colors transition-opacity duration-300 hover:bg-secondary disabled:cursor-not-allowed;
}
.prev-button {
  @apply left-0;
}
.next-button {
  @apply right-0;
}
</style>
