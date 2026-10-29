<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="[
      attrs.class,
      `base-dropdown_${variant}`,
      {
        'base-dropdown_open': isOpen,
        'base-dropdown_absolute': absolute,
        'is-disabled': disabled,
      },
    ]"
  >
    <button
      type="button"
      class="base-dropdown__wrapper"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      @click="toggle"
    >
      <span class="base-dropdown__label">
        {{ label }}
      </span>

      <span class="base-dropdown__caret" aria-hidden="true">
        <svg viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="m1 1.5 5 5 5-5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-show="isOpen"
        :id="panelId"
        ref="contentRef"
        class="base-dropdown__list"
        :class="{
          'base-dropdown__list_absolute': absolute,
        }"
        :style="
          absolute && alignRight ? { left: 'auto', right: '0' } : undefined
        "
      >
        <div class="base-dropdown__options">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

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
  variant: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const dropdownRef = ref(null)
const contentRef = ref(null)
const isOpen = ref(props.defaultOpen)
const alignRight = ref(false)

const panelId = `dropdown-${Math.random().toString(36).slice(2, 10)}`

const close = () => {
  isOpen.value = false
  alignRight.value = false
}

const open = async () => {
  if (props.disabled) return

  isOpen.value = true

  if (!props.absolute) return

  await nextTick()

  const rect = contentRef.value?.getBoundingClientRect()

  alignRight.value = !!rect && rect.right > window.innerWidth - 12
}

const toggle = () => {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const onOutside = event => {
  if (props.closeOnOutside && !dropdownRef.value?.contains(event.target)) {
    close()
  }
}

const onKeydown = event => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

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

watch(
  () => props.disabled,
  value => {
    if (value) close()
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', onOutside)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutside)
  document.removeEventListener('keydown', onKeydown)
})

defineExpose({
  close,
  open,
  toggle,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.base-dropdown {
  position: relative;
  width: 100%;
  min-width: 0;

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 46px;
    padding: 12px 16px;
    border: 1px solid rgba(153, 161, 176, 0.14);
    border-radius: 8px;
    background: var(--bg-fourth-color);
    color: var(--fifth-color);
    text-align: left;
    cursor: pointer;

    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 2px;
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
        color: var(--third-color);
      }
    }
  }

  &__label {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__caret {
    display: flex;
    width: 12px;
    height: 12px;
    flex: 0 0 12px;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;

    svg {
      width: 12px;
      height: 8px;
    }
  }

  &_open &__caret {
    transform: rotate(180deg);
  }

  &__list {
    position: relative;
    width: 100%;
    min-width: 0;
    margin-top: 6px;
    padding: 8px;
    border: 1px solid rgba(153, 161, 176, 0.14);
    border-radius: 8px;
    background: var(--bg-fourth-color);
    color: var(--third-color);
    z-index: 3;

    &_absolute {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 100%;
      margin-top: 0;
      z-index: 30;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 268px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #39465b transparent;
  }

  &_sidebar {
    .base-dropdown__wrapper {
      min-height: 42px;
      padding: 12px 0;
      border: 0;
      border-top: 1px solid rgba(153, 161, 176, 0.1);
      border-radius: 0;
      background: transparent;
      color: var(--fifth-color);
    }

    .base-dropdown__label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .base-dropdown__list {
      margin: 0;
      padding: 2px 0 12px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .base-dropdown__options {
      max-height: 250px;
      gap: 3px;
    }
  }

  &_sort {
    .base-dropdown__wrapper {
      min-height: 44px;
      color: var(--fifth-color);
      background: var(--bg-fourth-color);
    }

    .base-dropdown__label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .base-dropdown__list {
      min-width: 220px;
      padding: 6px;
    }
  }

  :deep(.base-checkbox) {
    width: 100%;
    padding: 5px 6px;
    border-radius: 5px;
    color: var(--third-color);
    transition: background-color 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        background: rgba(153, 161, 176, 0.08);
      }
    }
  }

  :deep(.base-checkbox__row) {
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  :deep(.base-checkbox__box) {
    width: 13px;
    height: 13px;
    min-width: 13px;
    border-radius: 3px;
  }

  :deep(.base-checkbox__label) {
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.45;
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
