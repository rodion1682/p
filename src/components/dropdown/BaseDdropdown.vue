<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="{
      'is-open': isOpen,
      'is-bordered': bordered,
    }"
  >
    <button
      type="button"
      class="base-dropdown__button"
      :aria-expanded="isOpen"
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

    <div
      v-show="isOpen"
      ref="contentRef"
      class="base-dropdown__content"
      :class="{
        'is-absolute': absolute,
      }"
      :style="contentStyle"
    >
      <div class="base-dropdown__content-inner">
        <slot :close="close" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
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
})

const dropdownRef = ref(null)
const contentRef = ref(null)

const isOpen = ref(props.defaultOpen)
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
  isOpen.value = true

  await updatePosition()
}

const close = () => {
  isOpen.value = false
  alignRight.value = false
}

const toggle = async () => {
  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const handleClickOutside = event => {
  if (!props.closeOnOutside) return
  if (!dropdownRef.value) return

  if (!dropdownRef.value.contains(event.target)) {
    close()
  }
}

const handleKeydown = event => {
  if (!props.closeOnEscape) return

  if (event.key === 'Escape' && isOpen.value) {
    close()

    dropdownRef.value?.querySelector('.base-dropdown__button')?.focus()
  }
}

const handleResize = () => {
  if (!isOpen.value) return

  updatePosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)

  if (isOpen.value) {
    updatePosition()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
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

  &__button {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    @include adaptiveValue('min-height', 36, 40);
    @include adaptiveValue('padding-left', 18, 15);
    @include adaptiveValue('padding-right', 18, 15);

    gap: 10px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    outline: none;

    background-color: var(--bg-ninth-color);

    color: var(--seconday-color);

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
      border-color: var(--hint-primary-color);
    }
  }

  &__label {
    min-width: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 19px;

    color: inherit;
  }

  &__caret {
    flex: 0 0 11px;

    width: 11px;
    min-width: 11px;
    height: 7px;

    color: var(--primary-color);

    pointer-events: none;

    svg {
      transform: rotate(0deg);

      transition: transform 0.3s ease;
    }

    &.is-open {
      svg {
        transform: rotate(180deg);
      }
    }
  }

  &__content {
    width: 100%;

    margin-top: 4px;

    z-index: var(--header-z-index);

    &.is-absolute {
      position: absolute;
      z-index: 5;
      top: 100%;
      left: 0;

      min-width: 100%;
      width: max-content;

      margin-top: 4px;
    }
  }

  &__content-inner {
    min-width: 100%;

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
}
</style>
