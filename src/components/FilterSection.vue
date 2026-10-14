<template>
  <div class="filter-section">
    <!-- Header -->
    <div
      class="relative flex cursor-pointer items-center justify-between"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-[12px]">
        <button class="flex h-[21px] w-[21px] items-center justify-center">
          <div class="relative h-[12px] w-[12px]">
            <div
              class="absolute left-0 top-[5px] h-[2px] w-[12px] rounded-[1px] bg-[#D9D9D9]"
            ></div>
            <div
              v-if="!isExpanded"
              class="absolute left-[5px] top-0 h-[12px] w-[2px] rounded-[1px] bg-[#D9D9D9]"
            ></div>
          </div>
        </button>
        <h3
          class="title-medium text-[18px] font-[500] capitalize text-[#2A2A2B]"
        >
          {{ $t(title) }}
        </h3>
      </div>
      <span
        v-if="modelValue.length"
        @click.stop="$emit('clear')"
        class="cursor-pointer text-[14px] text-[#56BBFF]"
      >
        clear
      </span>
    </div>

    <!-- Content -->
    <div
      class="filter-content-wrapper overflow-hidden transition-all duration-300"
      :style="{
        maxHeight: isExpanded ? '240px' : '0px',
        marginTop: isExpanded ? '20px' : '0px',
      }"
    >
      <div class="scrollbar-parent rounded-[12px]">
        <!-- Main content -->
        <div class="scrollbar-container">
          <div
            v-for="(option, index) in options"
            :key="option"
            :class="{
              'pb-[8px]': index === 0,
              'py-[8px]': index !== 0,
            }"
          >
            <BaseCheckbox
              :model-value="modelValue.includes(option)"
              @update:model-value="updateOption(option, $event)"
              class="text-[14px] capitalize text-[#2A2A2B]"
            >
              {{ option }}
            </BaseCheckbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'clear'])

const isExpanded = ref(true)

const updateOption = (option, checked) => {
  const newValue = [...props.modelValue]
  if (checked) {
    if (!newValue.includes(option)) {
      newValue.push(option)
    }
  } else {
    const index = newValue.indexOf(option)
    if (index > -1) {
      newValue.splice(index, 1)
    }
  }
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
/* Parent container for the scrollbar */
.scrollbar-parent {
  position: relative;

  overflow: hidden;

  padding: 14px 10px 14px 14px;
}

/* Container for the scrollable content */
.scrollbar-container {
  position: relative;

  overflow-y: auto;

  width: 100%; /* Fill available width */
  max-height: 160px; /* Adjusted for parent padding */
}

/* Chrome scrollbar styling */
.scrollbar-container::-webkit-scrollbar {
  width: 6px; /* Narrow scrollbar */
}

.scrollbar-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-container::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #b8bdcc;
}

.scrollbar-container::-webkit-scrollbar-thumb:hover {
  background-color: #9fa3b1;
}

/* Smooth transition for all animated properties */
.filter-content-wrapper {
  transition: all 0.3s ease;
}

/* Firefox */
@supports (scrollbar-width: thin) {
  .scrollbar-container {
    scrollbar-color: #b8bdcc transparent;
    scrollbar-width: thin;
  }
}
</style>
