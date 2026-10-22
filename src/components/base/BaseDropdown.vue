<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="[
      {
        'base-dropdown_open': isOpen,
        'base-dropdown_overflow': hasOverflow,
        'base-dropdown_bordered': props.bordered,
        'base-dropdown_disabled': props.disabled,
      },
      variantClass,
    ]"
  >
    <button
      type="button"
      class="base-dropdown__wrapper"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      :aria-disabled="props.disabled"
      :disabled="props.disabled"
      @click="toggle"
    >
      <span
        class="base-dropdown__label"
        :class="{
          'base-dropdown__label_placeholder': props.placeholder,
        }"
      >
        {{ props.label }}
      </span>

      <span class="base-dropdown__caret">
        <SvgIcon
          :icon="ChevronDownIcon"
          class="base-dropdown__caret-icon"
          :class="{ 'is-open': isOpen }"
        />
      </span>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-show="isOpen"
        ref="contentRef"
        class="base-dropdown__list"
        :class="{
          absolute: props.absolute,
          overflow: hasOverflow,
        }"
        :style="contentStyle"
        role="listbox"
      >
        <div ref="optionsRef" class="base-dropdown__options">
          <slot :is-open="isOpen" :close="close" :toggle="toggle" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ChevronDownIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },

  placeholder: {
    type: Boolean,
    default: false,
  },

  defaultOpen: {
    type: Boolean,
    default: false,
  },

  closeOnOutside: {
    type: Boolean,
    default: true,
  },

  closeOnEscape: {
    type: Boolean,
    default: true,
  },

  absolute: {
    type: Boolean,
    default: false,
  },

  bordered: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    default: '',
  },
})

const variantClass = computed(() => {
  if (!props.variant) {
    return ''
  }

  return `base-dropdown_${props.variant}`
})

const emit = defineEmits(['open', 'close', 'update:open'])

const dropdownRef = ref(null)
const contentRef = ref(null)
const optionsRef = ref(null)

const isOpen = ref(props.defaultOpen)
const alignRight = ref(false)
const hasOverflow = ref(false)

let resizeObserver = null
let mutationObserver = null

const contentStyle = computed(() => {
  if (!props.absolute) {
    return {}
  }

  return alignRight.value
    ? {
        right: '0',
        left: 'auto',
      }
    : {
        right: 'auto',
        left: '0',
      }
})

const updateOverflowState = async () => {
  await nextTick()

  const contentElement = contentRef.value

  if (!contentElement || !isOpen.value) {
    hasOverflow.value = false
    return
  }

  hasOverflow.value =
    contentElement.scrollHeight > contentElement.clientHeight + 1
}

const updateDropdownPosition = async () => {
  if (!props.absolute || !isOpen.value) {
    alignRight.value = false
    await updateOverflowState()
    return
  }

  await nextTick()

  const contentElement = contentRef.value

  if (!contentElement) {
    return
  }

  alignRight.value = false

  await nextTick()

  const rect = contentElement.getBoundingClientRect()

  alignRight.value = rect.right > window.innerWidth

  await updateOverflowState()
}

const updateDropdownState = async () => {
  await updateDropdownPosition()
  await updateOverflowState()
}

const open = async () => {
  if (props.disabled || isOpen.value) {
    return
  }

  isOpen.value = true

  emit('open')
  emit('update:open', true)

  await updateDropdownState()
}

const close = () => {
  if (!isOpen.value) {
    return
  }

  isOpen.value = false
  alignRight.value = false
  hasOverflow.value = false

  emit('close')
  emit('update:open', false)
}

const toggle = async () => {
  if (props.disabled) {
    return
  }

  if (isOpen.value) {
    close()
  } else {
    await open()
  }
}

const handleClickOutside = event => {
  if (!props.closeOnOutside || !dropdownRef.value) {
    return
  }

  if (!dropdownRef.value.contains(event.target)) {
    close()
  }
}

const handleKeydown = event => {
  if (!props.closeOnEscape) {
    return
  }

  if (event.key === 'Escape') {
    close()
  }
}

const handleResize = () => {
  updateDropdownState()
}

watch(
  () => props.defaultOpen,
  async value => {
    if (value) {
      await open()
    } else {
      close()
    }
  },
)

watch(
  () => props.disabled,
  value => {
    if (value) {
      close()
    }
  },
)

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)

  if (window.ResizeObserver && contentRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateDropdownState()
    })

    resizeObserver.observe(contentRef.value)

    if (optionsRef.value) {
      resizeObserver.observe(optionsRef.value)
    }
  }

  if (window.MutationObserver && optionsRef.value) {
    mutationObserver = new MutationObserver(() => {
      updateDropdownState()
    })

    mutationObserver.observe(optionsRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  if (isOpen.value) {
    await updateDropdownState()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)

  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})

defineExpose({
  open,
  close,
  toggle,
  isOpen,
})
</script>

<style lang="scss" scoped>
.base-dropdown {
  position: relative;

  width: 100%;
  min-width: 0;

  color: var(--fourth-color);

  &_open {
    .base-dropdown__wrapper {
    }

    .base-dropdown__caret {
      color: var(--hint-primary-color);
    }

    .base-dropdown__caret-icon {
      transform: rotate(180deg);
    }
  }

  &_bordered {
  }

  &_disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &__wrapper {
    @include adaptiveValue('min-height', 44, 40);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    width: 100%;

    margin: 0;
    padding: 5px 14px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-primary-color);

    color: var(--fourth-color);
    font-family: var(--font-open-sans);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &:focus-visible {
      border-color: var(--hint-primary-color);
    }

    &:disabled {
      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-primary-color);

        .base-dropdown__caret {
          color: var(--hint-primary-color);
        }
      }
    }
  }

  &__label {
    display: block;
    overflow: hidden;
    flex: 1 1 auto;

    min-width: 0;

    color: inherit;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 16px;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    &_placeholder {
      opacity: 0.6;

      color: var(--secondary-color);
    }
  }

  &__caret {
    display: flex;
    flex: 0 0 12px;
    align-items: center;
    justify-content: center;

    width: 12px;
    min-width: 12px;
    height: 8px;

    padding: 0;

    border: 0;
    background: transparent;

    color: var(--fourth-color);

    pointer-events: none;

    transition: color 0.3s ease 0s;
  }

  &__caret-icon {
    display: block;

    width: 100%;
    height: 100%;

    color: inherit;

    transform: rotate(0deg);
    transition: transform 0.3s ease;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__list {
    z-index: var(--header-z-index, 20);

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    min-width: 100%;
    max-height: min(220px, calc(100dvh - 100px));

    padding: 8px 0;

    border: 1px solid var(--border-sixth-color);
    border-radius: 8px;
    background-color: var(--bg-fourth-color);
    box-shadow: 0 4px 16px rgb(0 0 0 / 32%);

    touch-action: pan-y;

    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    scrollbar-color: var(--hint-primary-color) var(--bg-third-color);
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      margin: 5px 0;

      border-radius: 4px;
      background-color: var(--bg-third-color);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: var(--hint-primary-color);
    }

    &:not(.absolute) {
      margin-top: 8px;
    }

    &.absolute {
      position: absolute;
      top: calc(100% + 8px);
      right: auto;
      left: 0;
    }

    &.overflow {
      padding-right: 2px;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;

    margin: 0;
    padding: 0;

    list-style: none;
  }

  :deep(.dropdown-option) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;

    width: 100%;
    min-height: 38px;

    padding: 8px 12px;

    border: 0;
    border-radius: 0;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 100%;
    text-align: left;

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      color 0.3s ease;

    &:focus-visible {
      background-color: var(--sixth-color);
    }

    @media (any-hover: hover) {
      &:not(.dropdown-option_selected):not(:disabled):hover {
        background-color: var(--sixth-color);
      }
    }
  }

  :deep(.dropdown-option_selected) {
    background-color: var(--third-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  :deep(.dropdown-option_disabled) {
    opacity: 0.5;

    cursor: not-allowed;
    pointer-events: none;
  }

  &.aside {
    .base-dropdown__wrapper {
      min-height: 40px;
    }

    .base-dropdown__label {
      font-size: 16px;
      font-weight: 500;
      line-height: 16px;
    }

    .base-dropdown__list {
      width: 100%;
      min-width: 100%;
    }
  }

  &.sort {
    width: fit-content;
    min-width: 180px;

    .base-dropdown__wrapper {
      min-height: 40px;
    }

    .base-dropdown__label {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
    }

    .base-dropdown__list {
      right: 0;
      left: auto;

      width: max-content;
      min-width: 180px;
      max-width: min(320px, 90vw);
    }

    @media (max-width: $md4) {
      width: 100%;

      .base-dropdown__list {
        width: 100%;
        min-width: 100%;
      }
    }
  }

  @media (max-width: $md4) {
    &__wrapper {
      min-height: 40px;
    }

    :deep(.dropdown-option) {
      min-height: 40px;
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    visibility 0.3s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  visibility: hidden;

  opacity: 0;

  pointer-events: none;

  transform: translateY(-6px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  visibility: visible;

  opacity: 1;

  transform: translateY(0);
}
</style>
