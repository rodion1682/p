<template>
  <div
    class="flex h-12 w-32 items-center justify-between rounded-full border border-gray-300"
  >
    <button
      @click="decrement"
      :disabled="disabled || modelValue <= 1 || isUpdating"
      class="flex h-full w-12 items-center justify-center disabled:opacity-50"
      aria-label="Decrease quantity"
    >
      <img src="@/assets/images/minus.svg" alt="Minus" class="h-4 w-4" />
    </button>

    <input
      type="text"
      :value="modelValue"
      @input="updateValue($event)"
      @blur="handleBlur"
      :disabled="disabled || isUpdating"
      min="1"
      class="quantity-input w-8 appearance-none border-none bg-transparent text-center text-[14px] focus:outline-none"
      aria-label="Quantity"
    />

    <button
      @click="increment"
      :disabled="disabled || isUpdating"
      class="flex h-full w-12 items-center justify-center disabled:opacity-50"
      aria-label="Increase quantity"
    >
      <img src="@/assets/images/plus.svg" alt="Plus" class="h-4 w-4" />
    </button>

    <!-- Optional loading indicator -->
    <div
      v-if="isUpdating"
      class="absolute inset-0 flex items-center justify-center rounded-full bg-[#2E303B] bg-opacity-50"
    >
      <div
        class="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import debounce from 'lodash/debounce'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  debounceTime: {
    type: Number,
    default: 500,
  },
})

const emit = defineEmits(['update:modelValue', 'quantity-change'])

const isUpdating = ref(false)
const localValue = ref(props.modelValue)

// Create debounced function
const debouncedEmit = debounce(value => {
  isUpdating.value = true

  // Emit the change event (which will trigger the cart update)
  emit('quantity-change', value)

  // Reset updating state after a short delay to account for API call time
  // In a real implementation, this should be set by the parent component
  // when the API call completes
  setTimeout(() => {
    isUpdating.value = false
  }, 1000)
}, props.debounceTime)

// Watch for external model changes
watch(
  () => props.modelValue,
  newValue => {
    localValue.value = newValue
  },
)

const decrement = () => {
  if (props.modelValue > 1 && !isUpdating.value) {
    const newValue = props.modelValue - 1
    emit('update:modelValue', newValue)
    debouncedEmit(newValue)
  }
}

const increment = () => {
  if (!isUpdating.value) {
    const newValue = props.modelValue + 1
    emit('update:modelValue', newValue)
    debouncedEmit(newValue)
  }
}

const updateValue = event => {
  const newValue = parseInt(event.target.value, 10)
  if (!isNaN(newValue) && newValue > 0 && !isUpdating.value) {
    emit('update:modelValue', newValue)
    debouncedEmit(newValue)
  }
}

const handleBlur = event => {
  const newValue = parseInt(event.target.value, 10)
  if (isNaN(newValue) || newValue < 1) {
    emit('update:modelValue', 1)
    debouncedEmit(1)
  }
}

// Clean up on component unmount
onUnmounted(() => {
  debouncedEmit.cancel()
})
</script>

<style scoped>
.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input {
  -moz-appearance: textfield;
}
</style>
