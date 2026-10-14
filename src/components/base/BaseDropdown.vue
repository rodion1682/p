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

  outline: transparent;

  color: var(--primary-color);

  &_open {
    .base-dropdown__wrapper {
      border-color: var(--border-secondary-color);
    }

    .base-dropdown__caret {
      color: var(--hint-secondary-color);
    }

    .base-dropdown__caret-icon {
      transform: rotate(180deg);
    }
  }

  &_bordered {
    .base-dropdown__wrapper {
      border-color: var(--border-third-color);
    }
  }

  &_disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &__wrapper {
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    width: 100%;
    min-height: 36px;

    padding-top: 5px;
    padding-bottom: 5px;

    border: 1px solid var(--border-third-color);
    border-radius: 0;
    outline: none;
    background-color: var(--bg-fourth-color);

    color: var(--primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        .base-dropdown__caret {
          color: var(--hint-secondary-color);
        }
      }
    }

    @media (max-width: $md4) {
      min-height: 44px;
    }
  }

  &__label {
    display: block;
    overflow: hidden;
    flex: 1 1 auto;

    min-width: 0;

    color: inherit;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    text-align: left;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;

    &_placeholder {
      opacity: 0.6;

      color: var(--third-color);
    }
  }

  &__caret {
    display: flex;
    flex: 0 0 9px;
    align-items: center;
    justify-content: center;

    width: 9px;
    min-width: 9px;
    height: 8px;

    padding: 0;

    border: 0;
    background-color: transparent;

    color: var(--hint-secondary-color);

    pointer-events: none;

    transition: color 0.3s ease;
  }

  &__caret-icon {
    display: block;

    width: 100%;
    height: 100%;

    color: inherit;

    transform: rotate(0deg);
    transition:
      color 0.3s ease,
      transform 0.3s ease;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__list {
    z-index: var(--header-z-index);

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    min-width: 100%;
    max-height: min(220px, calc(100dvh - 100px));

    padding: 8px 4px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 0;
    background-color: var(--bg-primary-color);
    box-shadow: none;

    touch-action: pan-y;

    transform-origin: top;

    -webkit-overflow-scrolling: touch;

    overscroll-behavior: contain;
    scrollbar-color: var(--hint-primary-color) var(--bg-third-color);
    scrollbar-gutter: stable;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      margin-top: 5px;
      margin-bottom: 5px;

      border-radius: 4px;
      background-color: var(--bg-third-color);
    }

    &::-webkit-scrollbar-thumb {
      border: 1px solid var(--bg-third-color);
      border-radius: 4px;
      background: var(--hint-gradient);
    }

    @media (any-hover: hover) {
      &::-webkit-scrollbar-thumb:hover {
        background: var(--hint-primary-color);
      }
    }

    &:not(.absolute) {
      margin-top: -4px;
    }

    &.absolute {
      position: absolute;
      top: calc(100% - 4px);
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
    min-width: max-content;

    margin: 0;
    padding: 0;

    list-style: none;
  }

  :deep(.dropdown-option) {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-start;

    width: 100%;
    min-height: 35px;

    padding: 7px 10px;

    border: 0;
    border-radius: 0;
    outline: none;
    background-color: transparent;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    text-align: left;
    text-transform: capitalize;
    white-space: nowrap;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:not(.dropdown-option_selected):hover {
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  :deep(.dropdown-option_selected) {
    background-color: var(--hint-gradient-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  &.aside {
    .base-dropdown__wrapper {
      min-height: 36px;

      background-color: var(--bg-fourth-color);
    }

    .base-dropdown__label {
      font-size: 14px;
      font-weight: 500;
      line-height: 17px;
      text-transform: capitalize;
    }

    .base-dropdown__list {
      width: 100%;
      min-width: 100%;
    }

    @media (max-width: $md4) {
      .base-dropdown__wrapper {
        min-height: 44px;
      }

      :deep(.dropdown-option) {
        min-height: 40px;
      }
    }
  }

  &.sort {
    width: fit-content;
    min-width: 180px;

    .base-dropdown__wrapper {
      min-height: 36px;

      background-color: transparent;
    }

    .base-dropdown__label {
      font-size: 14px;
      font-weight: 500;
      text-transform: none;
    }

    .base-dropdown__list {
      right: 0;
      left: auto;

      width: max-content;
      min-width: 180px;
    }

    @media (max-width: $md4) {
      width: 100%;

      .base-dropdown__wrapper {
        min-height: 44px;

        background-color: var(--bg-fourth-color);
      }

      .base-dropdown__list {
        width: 100%;
        min-width: 100%;
      }
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  visibility: hidden;

  opacity: 0;

  pointer-events: none;

  transform: translateY(-4px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  visibility: visible;

  opacity: 1;

  transform: translateY(0);
}
</style>
