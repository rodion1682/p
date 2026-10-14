<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#120B0BB2]"
      @click="handleBackdropClick"
    >
      <div
        class="relative max-h-full w-full max-w-[484px] overflow-auto rounded-[2px] bg-[url(/src/assets/images/modalBg3.webp)] bg-full px-[32px] pb-[42px] pt-[36px]"
        @click.stop
      >
        <!-- Close Button (X) -->
        <button
          @click="close"
          class="absolute right-[16px] top-[16px]"
          aria-label="Close modal"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.32713 13.9123C0.983892 13.9323 0.646328 13.8182 0.385622 13.5941C-0.128541 13.0768 -0.128541 12.2415 0.385622 11.7243L11.6441 0.465744C12.1789 -0.0346629 13.018 -0.00684553 13.5184 0.527929C13.9709 1.01152 13.9973 1.75482 13.5802 2.26924L2.25537 13.5941C1.99803 13.8149 1.66588 13.9288 1.32713 13.9123Z"
              fill="#D8D0C6"
            />
            <path
              d="M12.5726 13.9124C12.2247 13.9109 11.8913 13.7728 11.6443 13.5278L0.385759 2.26923C-0.090586 1.71297 -0.0258243 0.875829 0.530436 0.39944C1.02691 -0.0257248 1.75912 -0.0257248 2.25555 0.39944L13.5804 11.658C14.115 12.1585 14.1427 12.9977 13.6421 13.5323C13.6222 13.5536 13.6016 13.5742 13.5804 13.5941C13.3031 13.8352 12.9381 13.9505 12.5726 13.9124Z"
              fill="#D8D0C6"
            />
          </svg>
        </button>

        <!-- Success Icon -->
        <!-- <div class="mb-[16px] flex justify-center">
          <div
            class="flex h-[38px] w-[38px] items-center justify-center rounded-full"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 38 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="19" cy="19" r="19" fill="white" />
              <path
                d="M19 2.375C9.85645 2.375 2.375 9.85645 2.375 19C2.375 28.1436 9.85645 35.625 19 35.625C28.1436 35.625 35.625 28.1436 35.625 19C35.625 9.85645 28.1436 2.375 19 2.375ZM19 2.375V35.625Z"
                fill="#00BA00"
              />
              <path
                d="M26.4561 14.0439L16.3939 24.1061L11.5439 19.2561"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div> -->

        <!-- Message Content -->
        <div class="flex flex-col items-center text-center">
          <h2
            class="mb-[32px] text-center font-secondary text-[24px] font-semibold text-accent"
          >
            {{ $t('Your request has been successfully accepted') }}
          </h2>

          <p class="max-w-[366px] text-[14px] font-normal text-filter">
            {{
              $t(
                'We will notify you about the processing of your request within 3 working days.',
              )
            }}
          </p>

          <!-- Confirmation Button -->
          <!-- <BaseButton @click="close" variant="green2" class="min-w-[187px]">
            {{ $t('Accept') }}
          </BaseButton> -->
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

// Computed properties
const isVisible = computed(() => props.show)

// Methods
const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  close()
}
</script>
