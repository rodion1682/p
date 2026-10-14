<template>
  <!-- Hero Section -->
  <section class="relative">
    <div class="relative text-center font-primary text-[96px]">
      {{ $t('FAQ') }}
    </div>
    <div class="mx-auto mt-[70px] max-w-[1096px]">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="relative overflow-hidden"
      >
        <div
          class="absolute bottom-0 left-0 h-[2px] w-full bg-[linear-gradient(90deg,rgba(112,94,68,0)_0%,rgba(244,206,145,0.44)_47.12%,rgba(112,94,68,0)_100%)]"
        ></div>
        <!-- Accordion Header -->
        <div
          class="relative mx-auto flex w-full max-w-[648px] items-center justify-center py-[40px] text-center"
          :aria-expanded="activeIndex === index"
        >
          <!-- <div
            v-if="activeIndex === index"
            class="flex h-[42px] w-[42px] min-w-[42px]"
          ></div> -->
          <button
            @click="open(index)"
            class="mx-auto min-h-[42px] w-full max-w-[548px] flex-1 font-secondary text-[24px] transition duration-300 hover:text-accent"
            :class="activeIndex === index ? '!text-[#FC812A]' : 'text-primary'"
          >
            {{ item.question }}
          </button>
          <!-- <button
            v-if="activeIndex === index"
            @click="close()"
            class="group relative flex h-[42px] w-[42px] min-w-[42px] items-center justify-center"
          >
            <div
              class="absolute left-1/2 top-1/2 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 bg-[#00000091] blur-[12px]"
            ></div>
            <img
              src="@/assets/images/magiculus/settingsBtnBg.webp"
              alt="settingsBtnBg"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <CloseIcon
              class="relative text-[#fff] opacity-[56%] transition duration-300 group-hover:text-accent group-hover:opacity-100"
            />
          </button> -->
        </div>

        <!-- Accordion Content (Animated) -->
        <div
          class="grid text-center transition-all duration-300 ease-in-out"
          :class="
            activeIndex === index
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          "
        >
          <div class="overflow-hidden">
            <div
              class="mx-auto w-full max-w-[648px] pb-[46px] text-base leading-[150%] opacity-60"
            >
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFaqStore } from '@/stores/faq'

const faqStore = useFaqStore()
const items = computed(() => faqStore.faq)

const activeIndex = ref(null)

const open = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<style scoped></style>
