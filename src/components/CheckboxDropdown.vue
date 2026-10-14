<template>
  <div :class="containerClasses" ref="containerRef">
    <div class="relative flex items-center">
      <div :class="checkboxClasses" @click="toggle">
        <transition name="fade">
          <CheckIcon
            v-if="modelValue"
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-secondary"
          />
        </transition>
      </div>
      <label @click="toggle" :class="labelClasses" class="flex-grow">
        <slot></slot>
      </label>

      <!-- Angle bracket indicator if hasOptions is true -->
      <div v-if="hasOptions" class="relative">
        <div
          @click="toggleOptions"
          class="group ml-2 cursor-pointer p-[5px]"
          ref="arrowRef"
        >
          <svg
            width="8"
            height="13"
            viewBox="0 0 8 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            :class="[
              'transition-transform',
              showOptions
                ? 'rotate-90 stroke-accent'
                : 'stroke-primary group-hover:stroke-accent',
            ]"
          >
            <path
              d="M1 12.5L7.1142 7.25926C7.57981 6.86016 7.57981 6.13984 7.1142 5.74074L1 0.5"
            />
          </svg>
        </div>

        <!-- Custom dropdown implementation instead of using vue3-popper -->
        <Teleport to="body">
          <div v-if="showOptions" class="custom-popper" :style="popperStyles">
            <div class="options-container">
              <div class="options-columns">
                <div class="options-column">
                  <div
                    v-for="(option, index) in leftColumnOptions"
                    :key="`left-${index}`"
                    class="option-item"
                    :class="{ selected: isSelected(option) }"
                    @click="selectOption(option)"
                  >
                    {{ option }}
                  </div>
                </div>
                <div class="options-column">
                  <div
                    v-for="(option, index) in rightColumnOptions"
                    :key="`right-${index}`"
                    class="option-item"
                    :class="{ selected: isSelected(option) }"
                    @click="selectOption(option)"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<script setup>
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { twMerge } from 'tailwind-merge'
import {
  computed,
  useAttrs,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue'

const attrs = useAttrs()
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  // Selected option if any
  selectedOption: {
    type: String,
    default: '',
  },
  // Allow multiple selections
  multiple: {
    type: Boolean,
    default: false,
  },
  // If true, selecting an option doesn't close the dropdown
  keepOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'optionSelected',
  'update:selectedOption',
])

const showOptions = ref(false)
const containerRef = ref(null)
const arrowRef = ref(null)
const popperStyles = ref({
  top: '0px',
  left: '0px',
})
const selectedOptions = ref(props.selectedOption ? [props.selectedOption] : [])

// Watch for clicks outside to close the dropdown
const setupOutsideClickListener = () => {
  const handleClickOutside = event => {
    if (
      showOptions.value &&
      containerRef.value &&
      !containerRef.value.contains(event.target)
    ) {
      // Check if the click was inside any popper elements
      const poppers = document.querySelectorAll('.custom-popper')
      let isInsidePopper = false
      poppers.forEach(popper => {
        if (popper.contains(event.target)) {
          isInsidePopper = true
        }
      })

      if (!isInsidePopper) {
        showOptions.value = false
      }
    }
  }

  window.addEventListener('click', handleClickOutside)

  onBeforeUnmount(() => {
    window.removeEventListener('click', handleClickOutside)
  })
}

onMounted(() => {
  setupOutsideClickListener()
})

// Update popper position when toggled
const updatePopperPosition = () => {
  nextTick(() => {
    if (!arrowRef.value || !showOptions.value) return

    // Position relative to the arrow icon rather than the container
    const rect = arrowRef.value.getBoundingClientRect()
    popperStyles.value = {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.right + window.scrollX + 5}px`, // 5px offset
    }
  })
}

// If "All" is selected, internally we'll select all options
watch(
  () => props.selectedOption,
  newVal => {
    if (newVal === 'All') {
      selectedOptions.value = ['All']
    } else if (newVal) {
      selectedOptions.value = [newVal]
    } else {
      selectedOptions.value = []
    }
  },
)

watch(showOptions, newVal => {
  if (newVal) {
    updatePopperPosition()
  }
})

const hasOptions = computed(() => props.options && props.options.length > 0)

const containerClasses = computed(() =>
  twMerge('flex flex-col items-start relative', attrs.class),
)

const checkboxClasses = computed(() =>
  twMerge(
    'relative h-[24px] w-[24px] min-w-[24px] cursor-pointer rounded-[5px] transition-all hover:filter hover:drop-shadow-[4px_4px_4px_rgba(0,0,0,0.25)]',
    props.modelValue
      ? `bg-accent border-2 border-accent`
      : 'border-2 border-accent bg-transparent',
  ),
)

const labelClasses = computed(() =>
  twMerge('cursor-pointer text-[20px] leading-[23px] text-primary ml-4', attrs.labelClasses),
)

// Split options into two columns
const leftColumnOptions = computed(() => {
  const half = Math.ceil(props.options.length / 2)
  return props.options.slice(0, half)
})

const rightColumnOptions = computed(() => {
  const half = Math.ceil(props.options.length / 2)
  return props.options.slice(half)
})

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}

const toggleOptions = () => {
  showOptions.value = !showOptions.value
  if (showOptions.value) {
    updatePopperPosition()
  }
}

const isSelected = option => {
  if (selectedOptions.value.includes('All') && option !== 'All') {
    return true
  }
  return selectedOptions.value.includes(option)
}

const selectOption = option => {
  if (props.multiple) {
    // For multiple selections
    if (option === 'All') {
      // If "All" is selected, clear other selections
      selectedOptions.value = ['All']
    } else {
      // Remove "All" if it was selected
      const index = selectedOptions.value.indexOf('All')
      if (index !== -1) {
        selectedOptions.value.splice(index, 1)
      }

      // Toggle the option
      const optionIndex = selectedOptions.value.indexOf(option)
      if (optionIndex !== -1) {
        selectedOptions.value.splice(optionIndex, 1)
      } else {
        selectedOptions.value.push(option)
      }
    }
  } else {
    // For single selection
    selectedOptions.value = [option]
  }

  emit('optionSelected', option)
  emit('update:selectedOption', option)

  if (!props.keepOpen) {
    showOptions.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom popper styles */
.custom-popper {
  position: absolute;
  max-width: 286px;
  background-color: #2e303b;
  border: 1px solid #faa720;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  z-index: 9999;
}

.options-container {
  padding: 25px 20px 15px;
}

.options-columns {
  display: flex;
  justify-content: space-between;
  gap: 50px;
}

@media (max-width: 768px) {
  .options-columns {
    flex-direction: column;
    gap: 20px;
  }
}

.options-column {
  flex: 1;
  min-width: 0;
}

.option-item {
  padding: 5px 0;
  color: #f5f5f5;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.option-item:hover {
  color: #faa720;
}

.option-item.selected {
  color: #faa720;
}
</style>
