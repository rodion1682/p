<template>
  <div ref="rootRef" :class="rootClasses" :style="attrs.style">
    <label
      v-if="props.label"
      :id="labelId"
      :for="props.id"
      :class="labelClasses"
    >
      {{ props.label }}

      <span
        v-if="props.required"
        class="base-select__required"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div class="base-select__field">
      <button
        :id="props.id"
        ref="triggerRef"
        type="button"
        :class="controlClasses"
        :disabled="isDisabled"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        :aria-labelledby="props.label ? labelId : undefined"
        :aria-label="
          props.label ? undefined : props.placeholder || 'Select option'
        "
        :aria-activedescendant="
          isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined
        "
        :aria-invalid="Boolean(props.error)"
        :aria-describedby="props.error ? errorId : undefined"
        aria-haspopup="listbox"
        role="combobox"
        @click="toggle"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >
        <span
          class="base-select__value"
          :class="{
            'base-select__value_placeholder': !selectedOption,
          }"
        >
          <template v-if="selectedOption">
            <slot
              name="selected"
              :option="selectedOption.original"
              :label="selectedOption.label"
              :value="selectedOption.value"
            >
              <span class="base-select__value-text">
                {{ selectedOption.label }}
              </span>
            </slot>
          </template>

          <span v-else class="base-select__placeholder">
            {{ props.placeholder }}
          </span>
        </span>

        <span
          v-if="props.loading"
          class="base-select__loader"
          aria-hidden="true"
        />

        <span
          v-else
          class="base-select__caret"
          :class="{
            'base-select__caret_open': isOpen,
          }"
          aria-hidden="true"
        >
          <SvgIcon :icon="ChevronDownIcon" class="base-select__caret-icon" />
        </span>
      </button>

      <Transition name="base-select-list">
        <div
          v-if="isOpen"
          :id="listId"
          ref="listRef"
          class="base-select__list"
          role="listbox"
          :aria-labelledby="props.label ? labelId : undefined"
        >
          <button
            v-for="(option, index) in normalizedOptions"
            :id="getOptionId(index)"
            :key="option.key"
            type="button"
            class="base-select__option"
            :class="{
              'base-select__option_active': index === activeIndex,

              'base-select__option_selected': isSelected(option),

              'base-select__option_disabled': option.disabled,
            }"
            :disabled="option.disabled"
            :aria-selected="isSelected(option)"
            :data-index="index"
            role="option"
            @mouseenter="setActiveIndex(index)"
            @mousedown.prevent
            @click.stop="selectOption(option)"
          >
            <slot
              name="option"
              :option="option.original"
              :label="option.label"
              :value="option.value"
              :selected="isSelected(option)"
            >
              <span class="base-select__option-label">
                {{ option.label }}
              </span>
            </slot>
          </button>

          <div v-if="!normalizedOptions.length" class="base-select__empty">
            <slot name="empty">
              {{ props.emptyText }}
            </slot>
          </div>
        </div>
      </Transition>

      <input
        v-if="props.name"
        :name="props.name"
        :value="hiddenInputValue"
        type="hidden"
      />
    </div>

    <div
      v-if="props.error"
      :id="errorId"
      class="base-select__error"
      role="alert"
      aria-live="polite"
    >
      {{ props.error }}
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue'

import { ChevronDownIcon } from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],

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

  optionDisabled: {
    type: String,
    default: 'disabled',
  },

  id: {
    type: String,

    default: () => {
      return `select-${Math.random().toString(36).slice(2, 9)}`
    },
  },

  name: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: 'Select',
  },

  emptyText: {
    type: String,
    default: 'No options available',
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

  required: {
    type: Boolean,
    default: false,
  },

  fullWidth: {
    type: Boolean,
    default: true,
  },

  dark: {
    type: Boolean,
    default: false,
  },

  amount: {
    type: Boolean,
    default: false,
  },

  selectClass: {
    type: [String, Array, Object],

    default: '',
  },

  labelClass: {
    type: [String, Array, Object],

    default: '',
  },
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'focus',
  'blur',
  'open',
  'close',
])

const attrs = useAttrs()

const rootRef = ref(null)
const triggerRef = ref(null)
const listRef = ref(null)

const isOpen = ref(false)
const isFocused = ref(false)
const activeIndex = ref(-1)

const labelId = computed(() => {
  return `${props.id}-label`
})

const listId = computed(() => {
  return `${props.id}-list`
})

const errorId = computed(() => {
  return `${props.id}-error`
})

const isDisabled = computed(() => {
  return props.disabled || props.loading
})

const normalizeOption = (option, index) => {
  if (option !== null && typeof option === 'object') {
    const value = option[props.optionValue]

    const rawLabel = option[props.optionLabel] ?? value ?? ''

    /*
     * Prevent [object Object].
     *
     * If label itself is an object,
     * try to extract a readable value.
     */
    let label = ''

    if (rawLabel !== null && typeof rawLabel === 'object') {
      label =
        rawLabel.en ||
        rawLabel.name ||
        rawLabel.label ||
        Object.values(rawLabel).find(item => typeof item === 'string') ||
        ''
    } else {
      label = String(rawLabel ?? '')
    }

    return {
      key: `${String(value)}-${index}`,

      value,

      label,

      disabled: Boolean(option[props.optionDisabled]),

      original: option,
    }
  }

  return {
    key: `${String(option)}-${index}`,

    value: option,

    label: String(option ?? ''),

    disabled: false,

    original: option,
  }
}

const normalizedOptions = computed(() => {
  return props.options.map(normalizeOption)
})

const valuesEqual = (firstValue, secondValue) => {
  if (
    firstValue === null ||
    firstValue === undefined ||
    secondValue === null ||
    secondValue === undefined
  ) {
    return firstValue === secondValue
  }

  /*
   * If an object accidentally reaches
   * modelValue, compare its primitive
   * value when possible.
   */
  if (typeof firstValue === 'object') {
    firstValue =
      firstValue[props.optionValue] ?? firstValue.id ?? firstValue.value
  }

  if (typeof secondValue === 'object') {
    secondValue =
      secondValue[props.optionValue] ?? secondValue.id ?? secondValue.value
  }

  return String(firstValue) === String(secondValue)
}

const isSelected = option => {
  if (!option) {
    return false
  }

  return valuesEqual(option.value, props.modelValue)
}

const selectedOption = computed(() => {
  return normalizedOptions.value.find(option => isSelected(option)) ?? null
})

const selectedIndex = computed(() => {
  return normalizedOptions.value.findIndex(option => isSelected(option))
})

const rootClasses = computed(() => [
  'base-select',

  {
    'base-select_full-width': props.fullWidth,

    'base-select_disabled': isDisabled.value,

    'base-select_error': Boolean(props.error),

    'base-select_focused': isFocused.value,

    'base-select_open': isOpen.value,

    'base-select_has-label': Boolean(props.label),
  },

  attrs.class,
])

const controlClasses = computed(() => [
  'base-select__control',

  {
    'base-select__control_error': Boolean(props.error),

    'base-select__control_dark': props.dark,
  },

  props.selectClass,
])

const labelClasses = computed(() => [
  'base-select__label',

  {
    'base-select__label_amount': props.amount,

    'base-select__label_default': !props.amount,
  },

  props.labelClass,
])

const hiddenInputValue = computed(() => {
  const value = props.modelValue

  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'object') {
    const primitiveValue = value[props.optionValue] ?? value.id ?? value.value

    if (primitiveValue !== undefined && primitiveValue !== null) {
      return String(primitiveValue)
    }

    return ''
  }

  return String(value)
})

const getOptionId = index => {
  return `${props.id}-option-${index}`
}

const getFirstEnabledIndex = () => {
  return normalizedOptions.value.findIndex(option => !option.disabled)
}

const getLastEnabledIndex = () => {
  for (let index = normalizedOptions.value.length - 1; index >= 0; index -= 1) {
    if (!normalizedOptions.value[index].disabled) {
      return index
    }
  }

  return -1
}

const getNextEnabledIndex = direction => {
  const options = normalizedOptions.value

  if (!options.length) {
    return -1
  }

  let nextIndex = activeIndex.value

  if (nextIndex < 0) {
    return direction > 0 ? getFirstEnabledIndex() : getLastEnabledIndex()
  }

  for (let attempt = 0; attempt < options.length; attempt += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length

    if (!options[nextIndex].disabled) {
      return nextIndex
    }
  }

  return -1
}

const scrollActiveIntoView = async () => {
  await nextTick()

  if (activeIndex.value < 0 || !listRef.value) {
    return
  }

  const activeElement = listRef.value.querySelector(
    `[data-index="${activeIndex.value}"]`,
  )

  activeElement?.scrollIntoView({
    block: 'nearest',
  })
}

const setActiveIndex = index => {
  const option = normalizedOptions.value[index]

  if (!option || option.disabled) {
    return
  }

  activeIndex.value = index
}

const open = async () => {
  if (isDisabled.value || isOpen.value) {
    return
  }

  isOpen.value = true

  activeIndex.value =
    selectedIndex.value >= 0 ? selectedIndex.value : getFirstEnabledIndex()

  emit('open')

  await scrollActiveIntoView()
}

const close = ({ restoreFocus = false } = {}) => {
  if (!isOpen.value) {
    return
  }

  isOpen.value = false
  activeIndex.value = -1

  emit('close')

  if (restoreFocus) {
    nextTick(() => {
      triggerRef.value?.focus()
    })
  }
}

const toggle = () => {
  if (isDisabled.value) {
    return
  }

  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const selectOption = option => {
  if (!option || option.disabled || isDisabled.value) {
    return
  }

  emit('update:modelValue', option.value)

  emit('change', {
    value: option.value,
    option: option.original,
  })

  close({
    restoreFocus: true,
  })
}

const handleFocus = event => {
  isFocused.value = true

  emit('focus', event)
}

const handleBlur = event => {
  window.setTimeout(() => {
    if (!rootRef.value?.contains(document.activeElement)) {
      isFocused.value = false

      emit('blur', event)
    }
  }, 0)
}

const handleKeydown = event => {
  if (isDisabled.value) {
    return
  }

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()

      if (!isOpen.value) {
        open()
        return
      }

      activeIndex.value = getNextEnabledIndex(1)

      scrollActiveIntoView()

      break
    }

    case 'ArrowUp': {
      event.preventDefault()

      if (!isOpen.value) {
        open()
        return
      }

      activeIndex.value = getNextEnabledIndex(-1)

      scrollActiveIntoView()

      break
    }

    case 'Enter':
    case ' ': {
      event.preventDefault()

      if (!isOpen.value) {
        open()
        return
      }

      const option = normalizedOptions.value[activeIndex.value]

      if (option) {
        selectOption(option)
      }

      break
    }

    case 'Home': {
      if (!isOpen.value) {
        return
      }

      event.preventDefault()

      activeIndex.value = getFirstEnabledIndex()

      scrollActiveIntoView()

      break
    }

    case 'End': {
      if (!isOpen.value) {
        return
      }

      event.preventDefault()

      activeIndex.value = getLastEnabledIndex()

      scrollActiveIntoView()

      break
    }

    case 'Escape': {
      if (!isOpen.value) {
        return
      }

      event.preventDefault()

      close({
        restoreFocus: true,
      })

      break
    }

    case 'Tab': {
      close()

      break
    }
  }
}

const handleOutsideClick = event => {
  if (!rootRef.value?.contains(event.target)) {
    close()
  }
}

watch(
  () => props.disabled,

  disabled => {
    if (disabled) {
      close()
    }
  },
)

watch(
  () => props.loading,

  loading => {
    if (loading) {
      close()
    }
  },
)

watch(
  normalizedOptions,

  options => {
    if (activeIndex.value >= options.length) {
      activeIndex.value = getFirstEnabledIndex()
    }
  },
)

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})

defineExpose({
  open,
  close,
  toggle,
  isOpen,
})
</script>

<style lang="scss" scoped>
.base-select {
  position: relative;

  display: inline-block;

  min-width: 0;

  &_full-width {
    width: 100%;
  }

  &_disabled {
    cursor: not-allowed;
  }

  &_open,
  &_focused {
    .base-select__control {
      border-color: var(--hint-primary-color);
    }
  }

  &__label {
    display: block;

    color: var(--hint-primary-color);
    font-size: 12px;
    font-weight: 500;
    line-height: 15px;
    text-align: left;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__required {
    color: var(--error-color);
  }

  &__field {
    position: relative;

    min-width: 0;
  }

  &__control {
    @include adaptiveValue('min-height', 36, 40);

    @include adaptiveValue('padding-left', 11, 10);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    width: 100%;
    min-width: 0;

    margin: 0;
    padding-top: 5px;
    padding-right: 38px;
    padding-bottom: 5px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 17px;
    text-align: left;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_dark {
      border-color: #120b0b;
      background-color: #120b0b;
    }

    &_error {
      border-color: var(--error-color);
    }

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-primary-color);
      }
    }
  }

  &__value {
    display: flex;
    overflow: hidden;
    flex: 1 1 auto;
    align-items: center;

    min-width: 0;

    color: var(--primary-color);

    &_placeholder {
      color: var(--secondary-color);
    }
  }

  &__value-text,
  &__placeholder,
  &__option-label {
    overflow: hidden;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__caret {
    position: absolute;
    top: 50%;
    right: 13px;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 12px;
    height: 8px;

    color: var(--hint-primary-color);

    pointer-events: none;

    transform: translateY(-50%) rotate(0deg);
    transition:
      color 0.3s ease,
      transform 0.3s ease;

    &_open {
      color: var(--primary-color);

      transform: translateY(-50%) rotate(180deg);
    }
  }

  &__caret-icon {
    width: 12px;
    height: 7px;

    color: inherit;
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 12px;
    z-index: 2;

    width: 17px;
    height: 17px;

    margin-top: -8px;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    animation: base-select-loader 0.7s linear infinite;

    border-top-color: var(--hint-primary-color);
  }

  &__list {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    left: 0;
    z-index: var(--header-z-index);

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    min-width: 100%;
    max-height: min(220px, calc(100dvh - 100px));

    padding: 8px 4px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background-color: var(--bg-third-color);
    box-shadow: 0 12px 30px rgb(0 0 0 / 35%);

    overscroll-behavior: contain;

    scrollbar-color: var(--hint-primary-color) var(--bg-third-color);

    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      margin: 5px 0;

      background-color: var(--bg-third-color);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: var(--hint-gradient);
    }
  }

  &__option {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 32px;

    padding: 7px 10px;

    border: 0;
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    text-align: left;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &_active {
      background-color: var(--border-fourth-color);

      color: var(--hint-secondary-color);
    }

    &_selected {
      background-color: var(--hint-third-color);

      color: var(--primary-color);
    }

    &_disabled {
      opacity: 0.4;

      cursor: not-allowed;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:not(&_selected, &_disabled):hover {
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__empty {
    padding: 12px;

    color: var(--hint-primary-color);
    font-size: 13px;
    text-align: center;
  }

  &__error {
    width: 100%;

    margin-top: 6px;

    color: var(--error-color);
    font-size: 12px;
    line-height: 16px;
    text-align: left;
  }

  @media (max-width: $md4) {
    &__control {
      min-height: 44px;
    }

    &__option {
      min-height: 40px;
    }
  }
}

.base-select-list-enter-active,
.base-select-list-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.base-select-list-enter-from,
.base-select-list-leave-to {
  opacity: 0;

  transform: translateY(-4px);
}

@keyframes base-select-loader {
  to {
    transform: rotate(360deg);
  }
}
</style>
