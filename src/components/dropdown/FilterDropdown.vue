<script setup>
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'filter', // 'filter' (gray) or 'sort' (blue)
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const isOpen = ref(false)
const selectRef = ref(null)

onClickOutside(selectRef, () => {
  isOpen.value = false
})

const selectedOption = computed(() => {
  if (!props.modelValue) return null

  return props.options.find(
    option => String(option[props.optionValue]) === String(props.modelValue),
  )
})

const displayValue = computed(() => {
  return selectedOption.value
    ? selectedOption.value[props.optionLabel]
    : props.placeholder
})

const triggerClasses = computed(() => {
  if (props.variant === 'sort') {
    return `flex items-center gap-[10px] justify-between w-full h-[46px] text-[16px]
             text-white/40 cursor-pointer transition  font-medium
            ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}`
  }

  // filter (gray)
  return `flex items-center justify-between w-full h-[46px] gap-2 rounded-[8px] shadow-[inset_0px_4px_4px_0px_#00000040] px-[18px] font-medium text-[16px]
           bg-[#30302F] border-[1px] border-[#EEC98E3B]  cursor-pointer transition
          ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}`
})

const arrowColor = computed(() => {
  return props.variant === 'sort' ? '#fff' : 'rgba(3,0,27,0.5)'
})

const optionClasses = option => {
  const isSelected =
    String(option[props.optionValue]) === String(props.modelValue)

  const baseClasses =
    'px-[18px] py-[12px] text-[14px] cursor-pointer transition'

  if (isSelected) {
    return props.variant === 'sort'
      ? `${baseClasses} text-secondary`
      : `${baseClasses} text-secondary`
  }

  return props.variant === 'sort'
    ? `${baseClasses} text-secondary`
    : `${baseClasses} text-secondary`
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectOption = option => {
  emit('update:modelValue', option[props.optionValue])
  isOpen.value = false
}
</script>

<template>
  <div :class="['relative', props.fullWidth ? 'w-full' : '']">
    <div ref="selectRef">
      <div
        :class="triggerClasses"
        tabindex="0"
        @click="toggleDropdown"
        :aria-expanded="isOpen"
        role="combobox"
      >
        <span class="truncate" :class="{ 'opacity-40': !selectedOption }">{{
          displayValue
        }}</span>
        <span class="opacity-[56%]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            :class="[isOpen ? 'rotate-180' : '', 'transition-transform']"
          >
            <path
              d="M6.84512 9.02666L11.2021 4.66963C11.6709 4.20088 11.6709 3.44385 11.2021 2.9751C10.7334 2.50635 9.97637 2.50635 9.50762 2.9751L5.99902 6.48604L2.49043 2.9751C2.02168 2.50635 1.26465 2.50635 0.795898 2.9751C0.327148 3.44385 0.327148 4.20088 0.795898 4.66963L5.15293 9.02666C5.61934 9.49307 6.37871 9.49307 6.84512 9.02666Z"
              fill="#fff"
            />
          </svg>
        </span>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute left-0 right-0 z-50 mt-1 max-h-[260px] overflow-auto border-[1px] border-[#D8D0C640] bg-[#312c2c]"
        >
          <div
            v-for="option in props.options"
            :key="option[props.optionValue]"
            :class="optionClasses(option)"
            @click="selectOption(option)"
          >
            {{ option[optionLabel] }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
