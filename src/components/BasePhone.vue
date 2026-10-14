<template>
  <div
    v-if="isLoaded"
    :class="[wrapperClass, { 'flex flex-wrap items-center': label }]"
    class="relative"
  >
    <label
      v-if="label"
      :for="id"
      :class="[
        'block pr-3 text-[12px] font-normal leading-[14px] text-filter',
        { 'w-[110px]': amount },
        { 'w-[180px]': !amount },
      ]"
      @click="focusInput"
    >
      {{ label }}
      <!-- <span v-if="required" class="text-error">*</span> -->
    </label>
    <vue-tel-input
      v-bind="$attrs"
      :model-value="modelValue"
      :default-country="computedDefaultCountry"
      :only-countries="allowedCountries"
      mode="international"
      :auto-format="true"
      :dropdown-options="{
        showDialCodeInList: true,
        showDialCodeInSelection: false,
        showFlags: true,
        showSearchBox: false,
        tabindex: 0,
      }"
      @on-input="onInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @open="handleOpen"
      class="base-input phone-input flex-1"
      :valid-characters-only="true"
      :class="[
        inputClass,
        { 'has-value': hasValue, empty: !hasValue, 'invalid-value': error },
      ]"
      :input-options="inputOptions"
      :input-id="id"
      ref="phoneInputRef"
    />
    <div
      v-if="error"
      class="mt-1 w-full text-left text-[12px] leading-[14px] text-error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { VueTelInput } from 'vue-tel-input'
import { useThrottleFn } from '@vueuse/core'
import { useCountriesStore } from '@/stores/countries'
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  defaultCountry: {
    type: String,
    default: null,
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Phone number',
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `phone-${Math.random().toString(36).substring(2, 9)}`,
  },
  amount: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'phone-data'])

const countriesStore = useCountriesStore()
const hasValue = ref(props.modelValue && props.modelValue.trim() !== '')
const countriesFetchAttempted = ref(false)
const phoneInputRef = ref(null)
const isProcessingDropdown = ref(false)
const isFocused = ref(false)

const allowedCountries = computed(() => {
  return countriesStore.countries.length
    ? countriesStore.countries.map(country => country.iso.toLowerCase())
    : []
})

const computedDefaultCountry = computed(() => {
  return props.defaultCountry
    ? props.defaultCountry.toLowerCase()
    : allowedCountries.value[0] || ''
})

const isLoaded = computed(() => {
  if (countriesFetchAttempted.value && countriesStore.countries.length === 0) {
    return true
  }
  return countriesStore.countries.length > 0
})

const inputOptions = computed(() => ({
  placeholder: props.placeholder,
  required: props.required,
  disabled: props.disabled || !isLoaded.value,
  readonly: props.readonly,
}))

// Simple dropdown fix function
const fixDropdownPosition = () => {
  // Find dropdown list element
  const dropdownList = document.querySelector('.vti__dropdown-list')
  if (!dropdownList || !phoneInputRef.value) return

  // Hide initially to prevent flickering
  dropdownList.style.position = 'fixed'
  dropdownList.style.zIndex = '9999'

  // Position dropdown
  const inputRect = phoneInputRef.value.$el.getBoundingClientRect()
  dropdownList.style.top = `${inputRect.bottom + 2}px`
  dropdownList.style.left = `${inputRect.left}px`
  dropdownList.style.width = `${inputRect.width}px`

  // Make visible after positioning
  setTimeout(() => {
    dropdownList.style.opacity = '1'
    dropdownList.style.transition = 'opacity 0.15s ease-in-out'
  }, 50)
}

// Focus handler
const handleFocus = () => {
  if (props.disabled || props.readonly) return

  isFocused.value = true

  // If we previously had dropdown issues, help the library reset
  if (isProcessingDropdown.value) {
    isProcessingDropdown.value = false

    // Reset dropdown state if needed
    const dropdown = phoneInputRef.value?.$el.querySelector('.vti__dropdown')
    if (dropdown) {
      dropdown.classList.remove('open')
    }
  }
}

// Open handler
const handleOpen = () => {
  isProcessingDropdown.value = true

  // Short delay to let the dropdown render first
  setTimeout(fixDropdownPosition, 10)

  // Set up click outside handler
  document.addEventListener('mousedown', handleClickOutside)
}

// Blur handler
const handleBlur = () => {
  isFocused.value = false

  // Clean up click outside handler after a delay
  setTimeout(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  }, 100)
}

// Click outside handler
const handleClickOutside = event => {
  if (!phoneInputRef.value) return

  const phoneContainer = phoneInputRef.value.$el
  const dropdown = document.querySelector('.vti__dropdown-list')

  if (
    dropdown &&
    !phoneContainer.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    // Find dropdown trigger
    const dropdownTrigger =
      phoneInputRef.value.$el.querySelector('.vti__dropdown')
    if (dropdownTrigger && dropdownTrigger.classList.contains('open')) {
      // Force dropdown to close
      dropdownTrigger.click()

      // Clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }
}

// Throttled toast function
const throttledToast = useThrottleFn(message => {
  toast.error(message)
}, 500)

// Handle phone number input
const onInput = (number, phoneObject) => {
  emit('update:modelValue', number)
  hasValue.value = number && number.trim() !== ''

  if (!phoneObject || !phoneObject.countryCode) return

  if (countriesStore.countries.length > 0) {
    const isAllowedCountry = allowedCountries.value.includes(
      phoneObject.countryCode.toLowerCase(),
    )

    if (!isAllowedCountry) {
      throttledToast('This country is not supported')
      emit('update:modelValue', '')
      emit('phone-data', null)
      hasValue.value = false
      return
    }
  }

  const phoneData = {
    phone: phoneObject.number || '',
    phoneCountryCode: phoneObject.countryCallingCode || '',
    nationalNumber: phoneObject.nationalNumber?.replace(/\s+/g, '') || '',
    isValid: phoneObject.valid,
  }

  emit('update:modelValue', number)
  emit('phone-data', phoneData)
}

watch(
  () => props.modelValue,
  newVal => {
    hasValue.value = newVal && newVal.trim() !== ''
  },
)

const fetchCountries = async () => {
  if (countriesFetchAttempted.value) return

  countriesFetchAttempted.value = true
  try {
    await countriesStore.fetchCountries()
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

onMounted(() => {
  if (countriesStore.countries.length === 0 && !countriesFetchAttempted.value) {
    fetchCountries()
  }

  // Fix dropdown positioning on window events
  window.addEventListener('resize', () => {
    if (document.querySelector('.vti__dropdown.open')) {
      fixDropdownPosition()
    }
  })

  window.addEventListener(
    'scroll',
    () => {
      if (document.querySelector('.vti__dropdown.open')) {
        fixDropdownPosition()
      }
    },
    true,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', fixDropdownPosition)
  window.removeEventListener('scroll', fixDropdownPosition)
  document.removeEventListener('mousedown', handleClickOutside)
})

const focusInput = () => {
  if (phoneInputRef.value) {
    const inputElement = phoneInputRef.value.$el.querySelector('input')
    if (inputElement) {
      inputElement.focus()
    }
  }
}
</script>

<style scoped>
.phone-input {
  @apply h-[46px] w-full rounded-[8px] border border-[#EEC98E3B] bg-[#30302F] px-4 py-[13px] text-[16px] font-normal leading-[16px] text-primary shadow-[inset_0_4px_4px_0_rgba(0,0,0,0.25)] transition-colors duration-200 placeholder:text-secondary focus:border-accent focus:outline-none focus:ring-0;
}

/* Hide dropdown list initially to prevent flicker */
::v-deep(.vti__dropdown-list) {
  @apply max-h-[300px] overflow-y-auto border border-[rgba(3,0,27,0.1)] bg-[#292424] shadow-lg;
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

::v-deep(.vti__dropdown) {
  @apply bg-[#FFFFFF1A] hover:bg-transparent;
  position: static;
}

::v-deep(.vti__dropdown.open) {
  @apply bg-[#FFFFFF1A] hover:bg-transparent;
  position: static;
}

::v-deep(.vti__dropdown-item) {
  @apply bg-transparent text-secondary hover:bg-transparent;
}

::v-deep(.vti__dropdown-item.highlighted) {
  @apply bg-transparent;
}

::v-deep(.vti__input.vti__phone) {
  @apply bg-transparent placeholder:text-white/60;
}

.phone-input:focus {
  @apply border-accent;
  outline: none;
  box-shadow: none;
}

.vue-tel-input:focus-within {
  box-shadow: none;
  @apply border-accent;
}

.phone-input.empty {
  @apply bg-[#30302F] text-primary;
}

.phone-input.has-value {
  @apply bg-[#30302F] text-primary;
}

.phone-input.invalid-value {
  @apply border-error;
}

::v-deep(.vti__dropdown) {
  @apply bg-transparent p-0;
}

::v-deep(.vti__input) {
  @apply bg-transparent;
}

.phone-input[readonly],
.phone-input[disabled] {
  @apply cursor-not-allowed bg-[#F0F0F0] opacity-60;
}
</style>
