<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  label: {
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
  error: {
    type: String,
    default: '',
  },
  regular: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default',
    validator: value => ['default', 'products', 'checkout'].includes(value),
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const emit = defineEmits(['update:modelValue'])

const rootRef = ref(null)
const triggerRef = ref(null)
const listRef = ref(null)

const isOpen = ref(false)
const selectedIndex = ref(-1)

const isDisabled = computed(() => props.disabled || props.loading)

const selectedOption = computed(() => {
  if (
    props.modelValue === '' ||
    props.modelValue === null ||
    props.modelValue === undefined
  ) {
    return null
  }

  return (
    props.options.find(
      option =>
        String(option?.[props.optionValue]) === String(props.modelValue),
    ) || null
  )
})

const hasValue = computed(() => Boolean(selectedOption.value))

const displayValue = computed(() => {
  return String(selectedOption.value?.[props.optionLabel] ?? '')
})

const containerClasses = computed(() => ({
  'is-open': isOpen.value,
  'is-filled': hasValue.value,
  'has-error': Boolean(props.error),
  'is-disabled': isDisabled.value,
  regular: props.regular,
  'variant-products': props.variant === 'products',
  'variant-checkout': props.variant === 'checkout',
}))

const scrollActiveIntoView = async () => {
  await nextTick()

  if (!listRef.value || selectedIndex.value < 0) {
    return
  }

  const activeOption = listRef.value.querySelector(
    `[data-index="${selectedIndex.value}"]`,
  )

  activeOption?.scrollIntoView({
    block: 'nearest',
  })
}

const open = async () => {
  if (isDisabled.value || isOpen.value) return

  isOpen.value = true

  const currentIndex = props.options.findIndex(
    option => String(option?.[props.optionValue]) === String(props.modelValue),
  )

  selectedIndex.value =
    currentIndex >= 0 ? currentIndex : props.options.length ? 0 : -1

  await scrollActiveIntoView()
}

const close = () => {
  isOpen.value = false
  selectedIndex.value = -1
}

const toggle = () => {
  if (isDisabled.value) return

  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const selectOption = option => {
  if (!option) return

  emit('update:modelValue', option[props.optionValue])

  close()
  triggerRef.value?.focus()
}

const onClickOutside = event => {
  if (!rootRef.value?.contains(event.target)) {
    close()
  }
}

const onKeydown = event => {
  if (isDisabled.value) return

  if (event.key === 'Escape') {
    if (isOpen.value) {
      event.preventDefault()
      close()
      triggerRef.value?.focus()
    }

    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (!isOpen.value) {
      open()
      return
    }

    selectOption(props.options[selectedIndex.value])
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (!isOpen.value) {
      open()
      return
    }

    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      props.options.length - 1,
    )

    scrollActiveIntoView()
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (!isOpen.value) {
      open()
      return
    }

    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)

    scrollActiveIntoView()
  }
}

watch(isDisabled, disabled => {
  if (disabled) close()
})

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <div
    ref="rootRef"
    class="base-select-wrap"
    :class="{
      'is-open': isOpen,
      'variant-products': variant === 'products',
      'variant-checkout': variant === 'checkout',
    }"
  >
    <label
      v-if="label"
      :for="id"
      class="base-select__label"
      :class="{ error: error }"
    >
      {{ label }}
    </label>

    <div
      ref="triggerRef"
      :id="id"
      class="base-select"
      :class="containerClasses"
      :tabindex="isDisabled ? -1 : 0"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-disabled="isDisabled"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="base-select__control">
        <div
          v-if="!hasValue"
          class="base-select__placeholder"
          :class="{
            'is-raised': isOpen,
          }"
        >
          {{ placeholder }}
        </div>

        <div v-if="hasValue" class="base-select__value">
          {{ displayValue }}
        </div>
      </div>

      <div class="base-select__suffix">
        <div v-if="loading" class="base-select__spinner" aria-hidden="true" />

        <SvgIcon
          v-else
          :icon="ChevronDownIcon"
          class="base-select__caret"
          :class="{ 'is-open': isOpen }"
        />
      </div>

      <Transition name="base-select-dropdown">
        <div v-if="isOpen" class="base-select__dropdown" role="listbox">
          <div ref="listRef" class="base-select__list">
            <button
              v-for="(option, index) in options"
              :key="String(option?.[optionValue])"
              type="button"
              class="base-select__option"
              :class="{
                'is-active': index === selectedIndex,
                'is-selected':
                  String(option?.[optionValue]) === String(modelValue),
              }"
              :data-index="index"
              role="option"
              :aria-selected="
                String(option?.[optionValue]) === String(modelValue)
              "
              @mouseenter="selectedIndex = index"
              @click.stop="selectOption(option)"
            >
              {{ option?.[optionLabel] }}
            </button>

            <div v-if="!options.length" class="base-select__empty">
              No options available
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="error" class="base-select__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-select-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  z-index: 1;

  &.is-open {
    z-index: 100;
  }
}

.base-select {
  position: relative;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;

  @include adaptiveValue('min-height', 44, 40);

  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;

  background-color: var(--bg-ninth-color);
  color: var(--primary-color);
  cursor: pointer;
  outline: none;

  transition:
    border-color 0.3s ease,
    background-color 0.3s ease,
    color 0.3s ease;

  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--hint-primary-color);
    outline-offset: 2px;
  }

  &.is-open {
    border-color: var(--hint-primary-color);
  }

  &.has-error {
    border-color: var(--error-color);
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &__label {
    display: block;

    color: var(--primary-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }

    &.error {
      color: var(--error-color);
    }
  }

  &__control {
    position: relative;
    display: flex;
    align-items: center;

    width: 100%;
    min-width: 0;
    min-height: inherit;

    @include adaptiveValue('padding-left', 18, 15);

    padding-right: 50px;
  }

  &__value {
    width: 100%;
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: var(--primary-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;
  }

  &__placeholder {
    max-width: 100%;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: var(--hint-third-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;
  }

  &__suffix {
    position: absolute;
    top: 50%;
    right: 15px;

    display: flex;
    align-items: center;
    justify-content: center;

    transform: translateY(-50%);
    pointer-events: none;
  }

  &__caret {
    width: 11px;
    min-width: 11px;
    height: 7px;

    color: var(--primary-color);
    transition: transform 0.3s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;

    border: 2px solid var(--border-secondary-color);
    border-top-color: var(--hint-primary-color);
    border-radius: 50%;

    animation: base-select-spin 0.7s linear infinite;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;

    width: 100%;
    min-width: 100%;
    z-index: 101;

    overflow: hidden;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: var(--bg-primary-color);
  }

  &__list {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;

    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  &__option {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 40px;
    padding: 8px 15px;

    border: 0;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;

    text-align: left;
    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
      }
    }

    &.is-active {
      background-color: var(--bg-fourth-color);
    }

    &.is-selected {
      color: var(--hint-primary-color);
      font-weight: 600;
    }
  }

  &__empty {
    padding: 12px 15px;
    color: var(--hint-third-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
  }

  &__error {
    margin-top: 6px;
    @include adaptiveValue('padding-left', 18, 15);
  }
}

// Shop variant
.base-select-wrap.variant-products {
  .base-select {
    background-color: var(--bg-third-color);
    border-color: var(--border-primary-color);

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
      }
    }
  }

  .base-select__dropdown {
    background-color: var(--bg-third-color);
    border-color: var(--border-primary-color);
  }
}

// Checkout variant
.base-select-wrap.variant-checkout {
  .base-select__label {
    margin-bottom: 3px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.3;
    color: var(--hint-third-color);
  }

  .base-select {
    min-height: 44px;

    background-color: var(--bg-third-color);
    border-color: var(--border-primary-color);

    &.is-open {
      border-color: var(--hint-primary-color);
    }
  }

  .base-select__value,
  .base-select__placeholder {
    font-family: var(--font-inter);
  }

  .base-select__dropdown {
    background-color: var(--bg-third-color);
    border-color: var(--border-primary-color);
  }
}

.base-select-dropdown-enter-active,
.base-select-dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.base-select-dropdown-enter-from,
.base-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes base-select-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-select,
  .base-select__caret,
  .base-select-dropdown-enter-active,
  .base-select-dropdown-leave-active {
    transition: none;
  }
}
</style>
