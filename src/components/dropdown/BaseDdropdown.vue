<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="{
      'is-open': isOpen,
      'is-bordered': bordered,
      'variant-products': variant === 'products',
      'is-disabled': disabled,
    }"
  >
    <button
      type="button"
      class="base-dropdown__button"
      :aria-expanded="isOpen"
      :aria-controls="contentId"
      :disabled="disabled"
      aria-haspopup="true"
      @click="toggle"
    >
      <span class="base-dropdown__label">
        {{ label }}
      </span>

      <SvgIcon
        :icon="ChevronDownIcon"
        class="base-dropdown__caret"
        :class="{ 'is-open': isOpen }"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :id="contentId"
        ref="contentRef"
        class="base-dropdown__content"
        :class="{
          'is-absolute': absolute,
        }"
        :style="contentStyle"
      >
        <div class="base-dropdown__content-inner">
          <slot :close="close" :open="open" :toggle="toggle" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },

  variant: {
    type: String,
    default: 'default',
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
})

const emit = defineEmits(['open', 'close'])

const dropdownRef = ref(null)
const contentRef = ref(null)

const instance = getCurrentInstance()
const contentId = `dropdown-content-${instance.uid}`

const isOpen = ref(props.defaultOpen && !props.disabled)
const alignRight = ref(false)

const contentStyle = computed(() => {
  if (!props.absolute) {
    return {}
  }

  return alignRight.value
    ? {
        left: 'auto',
        right: '0',
      }
    : {
        left: '0',
        right: 'auto',
      }
})

const updatePosition = async () => {
  if (!props.absolute || !isOpen.value) {
    alignRight.value = false
    return
  }

  await nextTick()

  const content = contentRef.value

  if (!content) return

  alignRight.value = false

  await nextTick()

  const rect = content.getBoundingClientRect()

  if (rect.right > window.innerWidth) {
    alignRight.value = true
  }
}

const open = async () => {
  if (props.disabled || isOpen.value) return

  isOpen.value = true

  emit('open')

  await updatePosition()
}

const close = () => {
  if (!isOpen.value) return

  isOpen.value = false
  alignRight.value = false

  emit('close')
}

const toggle = async () => {
  if (props.disabled) return

  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const handleClickOutside = event => {
  if (!props.closeOnOutside || !isOpen.value) return

  if (!dropdownRef.value?.contains(event.target)) {
    close()
  }
}

const handleKeydown = event => {
  if (!props.closeOnEscape || !isOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()

    close()

    dropdownRef.value?.querySelector('.base-dropdown__button')?.focus()
  }
}

const handleResize = () => {
  if (isOpen.value) {
    updatePosition()
  }
}

watch(
  () => props.disabled,
  value => {
    if (value) close()
  },
)

watch(
  () => props.defaultOpen,
  value => {
    if (value) {
      open()
    } else {
      close()
    }
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)

  if (isOpen.value) {
    updatePosition()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-dropdown {
  position: relative;
  width: 100%;
  min-width: 0;

  &.is-open {
    z-index: 10;
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__button {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    gap: 10px;

    @include adaptiveValue('min-height', 40, 36);
    @include adaptiveValue('padding-left', 18, 12);
    @include adaptiveValue('padding-right', 18, 12);

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;

    background-color: var(--bg-ninth-color);
    color: var(--secondary-color);

    outline: none;
    cursor: pointer;

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

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__label {
    flex: 1 1 auto;
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    text-align: left;

    color: inherit;
  }

  &__caret {
    flex: 0 0 11px;

    width: 11px;
    min-width: 11px;
    height: 7px;

    color: var(--primary-color);

    pointer-events: none;

    transition: transform 0.3s ease;

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__content {
    position: relative;
    width: 100%;
    min-width: 0;

    margin-top: 4px;
    z-index: 5;

    &.is-absolute {
      position: absolute;
      top: 100%;
      left: 0;

      width: max-content;
      min-width: 100%;
      max-width: min(320px, 90vw);

      margin-top: 4px;
    }
  }

  &__content-inner {
    width: 100%;
    min-width: 0;
    max-height: 300px;

    overflow-y: auto;
    overflow-x: hidden;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;

    background-color: var(--bg-primary-color);

    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  &.is-open {
    .base-dropdown__button {
      border-color: var(--hint-primary-color);
    }
  }

  &.is-bordered {
    .base-dropdown__button {
      border-color: var(--hint-primary-color);
    }
  }

  // PRODUCTS VARIANT
  &.variant-products {
    .base-dropdown__button {
      @include adaptiveValue('min-height', 44, 40);
      @include adaptiveValue('padding-left', 16, 12);
      @include adaptiveValue('padding-right', 16, 12);

      background-color: var(--bg-third-color);
      border: 1px solid var(--border-primary-color);
      border-radius: 5px;

      color: var(--primary-color);

      @media (any-hover: hover) {
        &:hover {
          background-color: var(--bg-fourth-color);
          border-color: var(--hint-primary-color);
        }
      }
    }

    .base-dropdown__label {
      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 500;
      line-height: 150%;
    }

    .base-dropdown__caret {
      color: var(--hint-primary-color);
    }

    .base-dropdown__content {
      margin-top: 6px;
    }

    .base-dropdown__content-inner {
      padding: 6px;

      border: 1px solid var(--border-primary-color);
      border-radius: 5px;

      background-color: var(--bg-third-color);

      box-shadow: 0 4px 12px rgba(24, 30, 26, 0.12);

      max-height: 280px;
    }

    &.is-open {
      .base-dropdown__button {
        background-color: var(--bg-fourth-color);
        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: 600px) {
      .base-dropdown__content.is-absolute {
        width: 100%;
        max-width: 100%;
      }

      .base-dropdown__content-inner {
        max-height: 240px;
      }
    }
  }
}

// OPEN / CLOSE ANIMATION
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .dropdown-enter-active,
  .dropdown-leave-active,
  .base-dropdown__button,
  .base-dropdown__caret {
    transition: none;
  }
}
</style>
