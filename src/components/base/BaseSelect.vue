<template>
  <div
    ref="rootRef"
    class="base-select-wrap"
    :class="{ 'is-disabled': disabled || loading }"
  >
    <div
      v-if="label"
      class="base-select__field-label"
      :class="{ 'has-error': !!error }"
    >
      {{ label }}:
    </div>

    <div
      :id="id"
      class="base-select"
      :class="containerClasses"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled || loading"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="base-select__value">
        <template v-if="hasValue">
          <span v-if="selectedOption?.icon" class="base-select__icon-wrapper">
            <SvgIcon :icon="selectedOption.icon" class="base-select__icon" />
          </span>

          <span class="base-select__value-text">
            {{ displayValue }}
          </span>
        </template>

        <span v-else-if="placeholder" class="base-select__placeholder">
          {{ placeholder }}
        </span>
      </div>

      <span class="base-select__caret">
        <span v-if="loading" class="base-select__spinner" />

        <SvgIcon
          v-else
          :icon="ChevronDownIcon"
          class="base-select__caret-icon"
          :class="{ 'is-open': isOpen }"
        />
      </span>
    </div>

    <Transition name="select-fade">
      <div
        v-show="isOpen"
        ref="dropdownRef"
        class="base-select__dropdown"
        :class="{ overflow: hasOverflow }"
        role="listbox"
      >
        <div ref="listRef" class="base-select__options">
          <button
            v-for="(option, index) in options"
            :key="String(option[optionValue])"
            type="button"
            class="base-select__option"
            :class="{
              'is-active': index === selectedIndex,
              'is-selected': isSelected(option),
            }"
            :data-index="index"
            role="option"
            :aria-selected="isSelected(option)"
            @mouseenter="selectedIndex = index"
            @click.stop="selectOption(option)"
          >
            <SvgIcon
              v-if="option.icon"
              :icon="option.icon"
              class="base-select__option-icon"
            />

            <span class="base-select__option-label">
              {{ option[optionLabel] }}
            </span>
          </button>

          <div v-if="!options.length" class="base-select__empty">
            {{ $t('No options available') }}
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="error" class="base-select__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

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
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  regular: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const emit = defineEmits(['update:modelValue'])

const rootRef = ref(null)
const dropdownRef = ref(null)
const listRef = ref(null)

const isOpen = ref(false)
const selectedIndex = ref(-1)
const hasOverflow = ref(false)

let resizeObserver = null
let mutationObserver = null

const selectedOption = computed(() => {
  if (
    props.modelValue === '' ||
    props.modelValue === null ||
    props.modelValue === undefined
  ) {
    return null
  }

  return (
    props.options.find(option => {
      return String(option?.[props.optionValue]) === String(props.modelValue)
    }) || null
  )
})

const hasValue = computed(() => {
  return !!selectedOption.value
})

const displayValue = computed(() => {
  if (!selectedOption.value) {
    return ''
  }

  return String(selectedOption.value?.[props.optionLabel] ?? '')
})

const containerClasses = computed(() => ({
  'is-open': isOpen.value,
  'is-filled': hasValue.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled || props.loading,
  regular: props.regular,
}))

const isSelected = option => {
  return String(option?.[props.optionValue]) === String(props.modelValue)
}

const updateOverflowState = async () => {
  await nextTick()

  const dropdown = dropdownRef.value

  if (!dropdown || !isOpen.value) {
    hasOverflow.value = false
    return
  }

  hasOverflow.value = dropdown.scrollHeight > dropdown.clientHeight + 1
}

const scrollActiveIntoView = async () => {
  await nextTick()

  if (!listRef.value || selectedIndex.value < 0) {
    return
  }

  const element = listRef.value.querySelector(
    `[data-index="${selectedIndex.value}"]`,
  )

  element?.scrollIntoView({
    block: 'nearest',
  })
}

const open = async () => {
  if (props.disabled || props.loading || !props.options.length) {
    return
  }

  isOpen.value = true

  const index = props.options.findIndex(option => isSelected(option))

  selectedIndex.value = index >= 0 ? index : props.options.length ? 0 : -1

  await nextTick()
  await updateOverflowState()
  await scrollActiveIntoView()
}

const close = () => {
  isOpen.value = false
  selectedIndex.value = -1
  hasOverflow.value = false
}

const toggle = async () => {
  if (props.disabled || props.loading) {
    return
  }

  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const selectOption = option => {
  if (!option) {
    return
  }

  emit('update:modelValue', option[props.optionValue])

  close()
}

const onClickOutside = event => {
  if (!rootRef.value) {
    return
  }

  if (!rootRef.value.contains(event.target)) {
    close()
  }
}

const onKeydownGlobal = event => {
  if (!isOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    close()
  }
}

const onKeydown = async event => {
  if (props.disabled || props.loading) {
    return
  }

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      if (selectedIndex.value >= 0 && props.options[selectedIndex.value]) {
        selectOption(props.options[selectedIndex.value])
      }

      break

    case 'ArrowDown':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        props.options.length - 1,
      )

      await scrollActiveIntoView()

      break

    case 'ArrowUp':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)

      await scrollActiveIntoView()

      break

    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

const onResize = () => {
  updateOverflowState()
}

watch(
  () => props.disabled,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.loading,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.options,
  async () => {
    if (isOpen.value) {
      await updateOverflowState()
    }
  },
  {
    deep: true,
  },
)

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)

  document.addEventListener('keydown', onKeydownGlobal)

  window.addEventListener('resize', onResize)

  if (window.ResizeObserver && dropdownRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateOverflowState()
    })

    resizeObserver.observe(dropdownRef.value)
  }

  if (window.MutationObserver && listRef.value) {
    mutationObserver = new MutationObserver(() => {
      updateOverflowState()
    })

    mutationObserver.observe(listRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)

  document.removeEventListener('keydown', onKeydownGlobal)

  window.removeEventListener('resize', onResize)

  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-select-wrap {
  position: relative;
  width: 100%;
  min-width: 0;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-within {
    z-index: 5;
  }
}

.base-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  gap: 10px;

  @include adaptiveValue('min-height', 50, 40);
  @include adaptiveValue('padding-left', 18, 15);
  @include adaptiveValue('padding-right', 18, 15);

  border: 1px solid rgba(153, 161, 176, 0.1);
  border-radius: 8px;
  background-color: var(--bg-fifth-color);
  color: var(--third-color);
  outline: none;
  cursor: pointer;

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;

  &.is-open {
    border-color: var(--hint-primary-color);

    .base-select__caret {
      color: var(--hint-primary-color);
    }
  }

  &.is-filled {
    .base-select__value-text {
      color: var(--third-color);
    }
  }

  &.has-error {
    border-color: var(--error-color);
  }

  &.is-disabled {
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus-visible {
    border-color: var(--hint-primary-color);
  }

  @media (any-hover: hover) {
    &:hover:not(.is-disabled) {
      border-color: var(--hint-primary-color);

      .base-select__caret {
        color: var(--hint-primary-color);
      }
    }
  }

  &.regular {
    border-color: var(--border-primary-color);
    background-color: var(--bg-third-color);
    border-radius: 6px;

    &.is-open {
      border-color: var(--hint-primary-color);
    }
  }

  &__field-label {
    margin-bottom: 5px;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    text-align: left;
    color: var(--border-primary-color);

    transition: color 0.3s ease;

    &.has-error {
      color: var(--error-color);
    }
  }

  &__value {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    min-width: 0;
    gap: 8px;
    overflow: hidden;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    color: var(--third-color);
  }

  &__value-text {
    display: block;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    color: var(--third-color);
  }

  &__placeholder {
    display: block;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    color: var(--border-primary-color);
  }

  &__icon-wrapper {
    display: flex;
    flex: 0 0 22px;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
  }

  &__icon {
    display: flex;
    width: 18px;
    height: 18px;
    color: var(--third-color);

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  &__caret {
    display: flex;
    flex: 0 0 12px;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    pointer-events: none;
    color: var(--border-primary-color);

    transition: color 0.3s ease;
  }

  &__caret-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 8px;
    color: inherit;

    transition: transform 0.3s ease;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;

    border: 2px solid rgba(153, 161, 176, 0.2);
    border-top-color: var(--hint-primary-color);
    border-radius: 50%;

    animation: select-spin 0.8s linear infinite;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 20;

    width: 100%;
    min-width: 100%;
    max-height: 250px;
    padding: 8px;

    border: 1px solid rgba(153, 161, 176, 0.18);
    border-radius: 8px;
    background-color: var(--bg-third-color);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);

    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;

    transform-origin: top;
    scrollbar-width: thin;
    scrollbar-color: var(--border-primary-color) transparent;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 8px;
      background-color: rgba(153, 161, 176, 0.5);
    }

    &.overflow {
      padding-right: 6px;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 4px;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
    min-height: 38px;
    gap: 10px;
    padding: 8px 12px;

    border: 1px solid transparent;
    border-radius: 6px;
    background-color: transparent;
    color: var(--third-color);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    text-align: left;
    cursor: pointer;

    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease;

    &.is-selected {
      background-color: var(--hint-primary-color);
      border-color: var(--hint-primary-color);
      color: var(--third-color);
    }

    &.is-active:not(.is-selected) {
      background-color: var(--bg-fifth-color);
      border-color: rgba(153, 161, 176, 0.15);
      color: var(--third-color);
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: -2px;
    }

    @media (any-hover: hover) {
      &:hover:not(.is-selected) {
        background-color: var(--bg-fifth-color);
        border-color: var(--hint-primary-color);
        color: var(--third-color);
      }
    }
  }

  &__option-icon {
    display: flex;
    flex: 0 0 18px;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: inherit;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  &__option-label {
    display: block;
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 10px;

    color: var(--border-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
  }

  &__error {
    margin-top: 8px;
    font-family: var(--font-inter);
    font-size: 12px;
    color: var(--error-color);
  }
}

.select-fade-enter-active,
.select-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.select-fade-enter-to,
.select-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@keyframes select-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: $md5) {
  .base-select {
    &__value,
    &__value-text,
    &__placeholder {
      font-size: 14px;
    }

    &__field-label {
      font-size: 14px;
    }

    &__dropdown {
      max-height: 220px;
    }

    &__option {
      min-height: 40px;
      font-size: 13px;
    }

    &__option-label {
      font-size: 13px;
    }
  }
}
</style>
