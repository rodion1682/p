<!-- components/modals/TopUpModal.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#131111]"
      @click="handleBackdropClick"
    >
      <div class="max-h-full overflow-auto p-8">
        <div
          class="relative max-h-full w-full max-w-[1320px] rounded-[16px] bg-[#1A1A1AB8] px-10 py-[30px] shadow-[0px_2px_12px_0px_#000000AB]"
          @click.stop
        >
          <img
            src="@/assets/images/magiculus/heroModalBorder.webp"
            alt="border"
            class="pointer-events-none absolute right-0 top-0 h-full w-full select-none object-fill"
          />
          <img
            src="@/assets/images/magiculus/gem.webp"
            alt="gem"
            class="pointer-events-none absolute left-1/2 top-[-9px] w-5 -translate-x-1/2 select-none object-contain"
          />

          <!-- Close Button (X) -->
          <button
            @click="close"
            class="group absolute right-[-22px] top-[-29px] flex h-[64px] w-[64px] min-w-[64px] items-center justify-center text-[#fff]"
            aria-label="Close modal"
          >
            <img
              src="@/assets/images/magiculus/socialBg.webp"
              alt="socialBg"
              class="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
            />
            <CloseIcon
              class="relative text-[#fff] opacity-[56%] transition duration-300 group-hover:text-accent group-hover:opacity-100"
            />
          </button>

          <!-- Modal Content -->
          <div
            class="group relative flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:gap-[136px]"
          >
            <div class="relative h-[280px] w-[280px] lg:h-[536px] lg:w-[536px]">
              <img
                :src="item.image_plain"
                :alt="item.name"
                class="pointer-events-none h-full w-full select-none object-contain"
              />
              <div
                class="absolute bottom-0 left-0 h-full w-full bg-gradient-to-b from-transparent from-50% to-[#181818] to-90%"
              ></div>
            </div>
            <div class="flex-1 text-left">
              <div class="w-full max-w-[536px]">
                <div class="font-secondary text-[24px] text-accent">
                  {{ item.name }}
                </div>
                <div class="mt-4 text-base leading-[150%] opacity-60">
                  {{ item.description }}
                </div>
                <div class="mt-6 text-base leading-[150%]">
                  <b>{{ $t('Unique Power') }}</b
                  >:
                </div>
                <div class="mt-4 text-base leading-[150%] opacity-60">
                  {{ item.hero_power }}
                </div>
                <div class="mt-6 text-base leading-[150%]">
                  <b>{{ $t('Playstyle') }}</b
                  >:
                </div>
                <div class="mt-4 text-base leading-[150%] opacity-60">
                  {{ item.playstyle }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useModalStore } from '@/stores/modal'
const modalStore = useModalStore()
import CloseIcon from '@/components/icons/CloseIcon.vue'

const emit = defineEmits(['close'])

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const isVisible = computed(() => props.show)
const item = computed(() => modalStore.getData('hero'))

const handleBackdropClick = e => {
  if (e.target === e.currentTarget) {
    close()
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped></style>
