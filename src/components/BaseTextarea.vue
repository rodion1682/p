<template>
  <div class="relative">
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <!-- <span v-if="required" class="text-error">*</span> -->
    </label>

    <textarea
      :id="id"
      :name="name"
      :value="modelValue"
      @input="updateValue"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :placeholder="isFocused || !label ? placeholder : ''"
      :maxlength="maxLength"
      :class="[
        'min-h-[106px] w-full resize-none rounded-[8px] border p-4 text-[14px] leading-[16px] text-primary transition-colors duration-200 placeholder:text-secondary focus:outline-none focus:ring-0',
        error
          ? 'border-error focus:border-error'
          : 'border-[rgba(3,0,27,0.1)] focus:border-accent',
        textareaBackground,
        textareaClasses,
      ]"
      :disabled="disabled"
      :readonly="readonly"
      v-bind="$attrs"
    ></textarea>

    <!-- Loading indicator -->
    <div v-if="loading" class="absolute right-3 top-3">
      <svg
        class="h-4 w-4 animate-spin text-accent"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- Character counter -->
    <div v-if="showCounter" class="mt-1 text-right text-[12px] text-secondary">
      {{ modelValue.length }}/{{ maxLength }} {{ counterLabel }}
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="mt-1 w-full text-left text-[12px] leading-[14px] text-error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  maxLength: {
    type: Number,
    default: 500,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showCounter: {
    type: Boolean,
    default: true,
  },
  counterLabel: {
    type: String,
    default: 'symbols',
  },
  textareaClasses: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`,
  },
  name: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const isFocused = ref(false)

const updateValue = event => {
  emit('update:modelValue', event.target.value)
}

const hasValue = computed(() => {
  return props.modelValue && props.modelValue.length > 0
})

const textareaBackground = computed(() => {
  if (props.disabled || props.readonly) {
    return 'bg-[#F0F0F0] cursor-not-allowed opacity-60'
  }
  return hasValue.value ? 'bg-white' : 'bg-[#F0F0F0]'
})

const labelClasses = computed(() => {
  return [
    'text-[12px] leading-[14px] transition-all duration-200',
    hasValue.value || isFocused.value
      ? 'absolute -top-[6px] left-[12px] px-1 bg-white text-secondary z-10'
      : 'absolute top-[14px] left-[16px] text-secondary',
  ]
})
</script>
