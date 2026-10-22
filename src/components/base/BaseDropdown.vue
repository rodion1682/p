<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="[
      `base-dropdown_${variant || 'default'}`,
      {
        'base-dropdown_open': isOpen,
        'base-dropdown_bordered': bordered,
        'base-dropdown_disabled': disabled,
      },
    ]"
  >
    <button
      type="button"
      class="base-dropdown__wrapper"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-haspopup="isRelative ? undefined : 'listbox'"
      @click="toggle"
    >
      <span
        class="base-dropdown__label"
        :class="{
          'base-dropdown__label_placeholder': placeholder && !isRelative,
        }"
      >
        {{ label }}
      </span>

      <span class="base-dropdown__caret" aria-hidden="true">
        <SvgIcon :icon="ChevronDownIcon" class="base-dropdown__caret-icon" />
      </span>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-show="isOpen"
        :id="panelId"
        ref="contentRef"
        class="base-dropdown__list"
        :class="{
          'base-dropdown__list_absolute': absolute && !isRelative,
        }"
        :style="listStyle"
        :role="isRelative ? undefined : 'listbox'"
      >
        <div class="base-dropdown__options">
          <slot :is-open="isOpen" :close="close" :toggle="toggle" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
} from 'vue'

import { ChevronDownIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: Boolean, default: false },
  defaultOpen: { type: Boolean, default: false },
  closeOnOutside: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
  absolute: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: '' },
})

const emit = defineEmits(['open', 'close', 'update:open'])

const dropdownRef = ref(null)
const contentRef = ref(null)

const isOpen = ref(props.defaultOpen)
const alignRight = ref(false)

const panelId = `base-dropdown-${useId()}`

const isRelative = computed(() => props.variant === 'relative')

const listStyle = computed(() =>
  props.absolute && !isRelative.value
    ? {
        left: alignRight.value ? 'auto' : '0',
        right: alignRight.value ? '0' : 'auto',
      }
    : undefined,
)

async function updatePosition() {
  if (!isOpen.value || !props.absolute || isRelative.value) {
    return
  }

  alignRight.value = false
  await nextTick()

  const list = contentRef.value

  if (list) {
    alignRight.value = list.getBoundingClientRect().right > window.innerWidth
  }
}

async function open() {
  if (props.disabled || isOpen.value) return

  isOpen.value = true

  emit('open')
  emit('update:open', true)

  await nextTick()
  await updatePosition()
}

function close() {
  if (!isOpen.value) return

  isOpen.value = false
  alignRight.value = false

  emit('close')
  emit('update:open', false)
}

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function handleOutside(event) {
  if (props.closeOnOutside && !dropdownRef.value?.contains(event.target)) {
    close()
  }
}

function handleKeydown(event) {
  if (props.closeOnEscape && event.key === 'Escape') {
    close()
  }
}

watch(
  () => props.defaultOpen,
  value => (value ? open() : close()),
)

watch(
  () => props.disabled,
  value => {
    if (value) close()
  },
)

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updatePosition)

  if (isOpen.value) {
    updatePosition()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updatePosition)
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

  &_disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &__wrapper {
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);
    @include adaptiveValue('min-height', 44, 40);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    width: 100%;

    padding-top: 5px;
    padding-bottom: 5px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 6px;
    background-color: var(--bg-primary-color);

    color: var(--fourth-color);

    cursor: pointer;

    transition: border-color 0.3s ease;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &_bordered {
    .base-dropdown__wrapper {
      border-color: var(--border-priamry-color);
    }
  }

  &_open:not(.base-dropdown_relative) {
    .base-dropdown__wrapper {
      border-color: var(--hint-primary-color);
    }
  }

  &__label {
    overflow: hidden;
    flex: 1 1 auto;

    min-width: 0;

    color: inherit;
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;

    &_placeholder {
      opacity: 0.6;
    }
  }

  &__caret {
    display: flex;
    flex: 0 0 12px;
    align-items: center;
    justify-content: center;

    width: 12px;
    height: 8px;

    color: var(--fourth-color);

    transition: color 0.3s ease;
  }

  &__caret-icon {
    width: 100%;
    height: 100%;

    transition: transform 0.3s ease;
  }

  &_open &__caret-icon {
    transform: rotate(180deg);
  }

  &__list {
    z-index: var(--header-z-index, 20);

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    min-width: 100%;
    max-height: min(220px, calc(100dvh - 100px));

    margin-top: 4px;
    padding: 11px 0;

    border: 1px solid var(--hint-primary-color);
    border-radius: 8px;
    background-color: var(--bg-fifth-color);
    box-shadow: 0 4px 16px var(--shadow-primary-color);

    overscroll-behavior: contain;
    scrollbar-color: var(--hint-primary-color) var(--bg-fourth-color);
    scrollbar-width: thin;

    &_absolute {
      position: absolute;
      top: calc(100% + 4px);

      width: max-content;
      min-width: 100%;
      max-width: min(320px, 90vw);

      margin-top: 0;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  :deep(.dropdown-option) {
    display: flex;
    align-items: center;
    gap: 8px;

    width: 100%;
    min-height: 38px;

    padding: 8px 12px;

    border: 0;
    background: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    text-align: left;

    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: -2px;
    }
  }

  :deep(.dropdown-option_selected) {
    background-color: var(--bg-fourth-color);

    color: var(--hint-primary-color);

    pointer-events: none;
  }

  :deep(.dropdown-option_disabled) {
    opacity: 0.5;

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(.base-dropdown_disabled):not(.base-dropdown_relative) {
      .base-dropdown__wrapper:hover {
        border-color: var(--hint-primary-color);
      }
    }

    .base-dropdown__wrapper:hover .base-dropdown__caret {
      color: var(--hint-primary-color);
    }

    :deep(
      .dropdown-option:not(.dropdown-option_selected):not(:disabled):hover
    ) {
      color: var(--hint-primary-color);
    }
  }

  &_sort {
    width: fit-content;
    min-width: 180px;

    .base-dropdown__list {
      min-width: 180px;
    }
  }

  &_relative {
    @include adaptiveValue('border-radius', 12, 10);
    overflow: hidden;

    background-color: var(--bg-fourth-color);

    .base-dropdown__wrapper {
      justify-content: flex-start;
      gap: 18px;

      min-height: 65px;

      padding: 18px 30px;

      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .base-dropdown__label {
      flex: 0 1 auto;

      opacity: 1;

      font-size: 16px;
      font-weight: 700;
      line-height: 1.3;
    }

    .base-dropdown__caret {
      flex: 0 0 16px;
      order: -1;

      width: 16px;
      height: 12px;

      color: var(--hint-primary-color);
    }

    &.base-dropdown_open .base-dropdown__caret {
      color: var(--fourth-color);
    }

    .base-dropdown__list {
      position: static;

      overflow: visible;

      width: 100%;
      max-width: none;
      max-height: none;

      margin: 0;
      padding: 0 30px 26px;

      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    @media (max-width: $md4) {
      .base-dropdown__wrapper {
        padding: 16px 20px;
      }

      .base-dropdown__list {
        padding: 0 20px 20px;
      }
    }
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;

  transform: translateY(-4px);
}
</style>
