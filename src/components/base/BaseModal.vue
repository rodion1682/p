<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div
        v-if="props.show"
        class="base-modal"
        :class="props.backdropClass"
        role="presentation"
        @mousedown="handleBackdropClick"
      >
        <div
          ref="innerRef"
          class="base-modal__inner"
          :class="innerClasses"
          :style="attrs.style"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="props.labelledby || undefined"
          :aria-describedby="props.describedby || undefined"
          tabindex="-1"
          @mousedown.stop
        >
          <div
            class="base-modal__decor base-modal__decor_top-left _ibg-contain"
          >
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div
            class="base-modal__decor base-modal__decor_top-right _ibg-contain"
          >
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div
            class="base-modal__decor base-modal__decor_bottom-left _ibg-contain"
          >
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div
            class="base-modal__decor base-modal__decor_bottom-right _ibg-contain"
          >
            <img src="@/assets/img/modal-decor.png" />
          </div>
          <div class="base-modal__frame">
            <button
              v-if="!props.hideCloseButton"
              type="button"
              class="base-modal__close"
              :class="props.closeButtonClass"
              :aria-label="props.closeLabel"
              @click="handleClose"
            >
              <slot name="close-icon">
                <SvgIcon :icon="CloseIcon" class="base-modal__close-icon" />
              </slot>
            </button>

            <div
              v-if="$slots.header"
              class="base-modal__header"
              :class="props.headerClass"
            >
              <slot name="header" />
            </div>

            <div class="base-modal__content" :class="props.contentClass">
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="base-modal__footer"
              :class="props.footerClass"
            >
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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

import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  persistent: {
    type: Boolean,
    default: false,
  },

  hideCloseButton: {
    type: Boolean,
    default: false,
  },

  noRelative: {
    type: Boolean,
    default: false,
  },

  noOverflowHidden: {
    type: Boolean,
    default: false,
  },

  backdropClass: {
    type: [String, Array, Object],
    default: '',
  },

  modalContainerClass: {
    type: [String, Array, Object],
    default: '',
  },

  wrapperClasses: {
    type: [String, Array, Object],
    default: '',
  },

  closeButtonClass: {
    type: [String, Array, Object],
    default: '',
  },

  headerClass: {
    type: [String, Array, Object],
    default: '',
  },

  contentClass: {
    type: [String, Array, Object],
    default: '',
  },

  footerClass: {
    type: [String, Array, Object],
    default: '',
  },

  size: {
    type: String,
    default: 'medium',
    validator: value => {
      return ['small', 'medium', 'large', 'product', 'full'].includes(value)
    },
  },

  closeLabel: {
    type: String,
    default: 'Close modal',
  },

  labelledby: {
    type: String,
    default: '',
  },

  describedby: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'open', 'update:show'])

const innerRef = ref(null)

const GLOBAL_SCROLL_LOCK_KEY = '__base_modal_scroll_lock__'

let didLockScroll = false
let previouslyFocusedElement = null

const innerClasses = computed(() => {
  return [
    attrs.class,
    props.modalContainerClass,
    props.wrapperClasses,
    `base-modal__inner_${props.size}`,
    {
      'base-modal__inner_static': props.noRelative,
      'base-modal__inner_overflow-visible': props.noOverflowHidden,
    },
  ]
})

const getScrollbarWidth = () => {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

const getScrollLockState = () => {
  if (!window[GLOBAL_SCROLL_LOCK_KEY]) {
    window[GLOBAL_SCROLL_LOCK_KEY] = {
      count: 0,
    }
  }

  return window[GLOBAL_SCROLL_LOCK_KEY]
}

const lockScroll = () => {
  if (didLockScroll) {
    return
  }

  const scrollLockState = getScrollLockState()

  scrollLockState.count += 1
  didLockScroll = true

  /*
   * Another modal has already locked the page.
   */
  if (scrollLockState.count > 1) {
    return
  }

  const scrollbarWidth = getScrollbarWidth()

  document.documentElement.style.setProperty(
    '--scrollbar-compensation',
    `${scrollbarWidth}px`,
  )

  document.body.classList.add('base-modal-open')
}

const unlockScroll = () => {
  if (!didLockScroll) {
    return
  }

  didLockScroll = false

  const scrollLockState = getScrollLockState()

  scrollLockState.count = Math.max(0, scrollLockState.count - 1)
  if (scrollLockState.count > 0) {
    return
  }

  document.body.classList.remove('base-modal-open')

  document.documentElement.style.removeProperty('--scrollbar-compensation')
}

const focusModal = async () => {
  await nextTick()

  innerRef.value?.focus({
    preventScroll: true,
  })
}

const restoreFocus = () => {
  if (
    previouslyFocusedElement &&
    typeof previouslyFocusedElement.focus === 'function'
  ) {
    previouslyFocusedElement.focus({
      preventScroll: true,
    })
  }

  previouslyFocusedElement = null
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleBackdropClick = event => {
  if (props.persistent) {
    return
  }

  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const handleKeydown = event => {
  if (event.key === 'Escape' && props.show && !props.persistent) {
    handleClose()
  }
}

const openModal = async () => {
  previouslyFocusedElement = document.activeElement

  lockScroll()

  await focusModal()

  emit('open')
}

const closeModal = async () => {
  unlockScroll()

  await nextTick()

  restoreFocus()
}

watch(
  () => props.show,
  async isOpen => {
    if (isOpen) {
      await openModal()
      return
    }

    await closeModal()
  },
)

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)

  if (props.show) {
    await openModal()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)

  unlockScroll()
  restoreFocus()
})

defineExpose({
  close: handleClose,
  focus: focusModal,
})
</script>

<style lang="scss" scoped>
.product-details-modal {
}

.base-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  background-color: rgb(10, 11, 16, 0.7);

  -webkit-backdrop-filter: blur(46px);
  backdrop-filter: blur(46px);

  overscroll-behavior: contain;

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-height: calc(100dvh - 40px);

    margin: auto;
    padding: 5px;

    border: 1px solid var(--border-sixth-color);
    outline: none;
    background-color: var(--bg-primary-color);
    box-shadow: 0 4px 4px 0 rgb(0 0 0 / 25%);

    &_small {
      max-width: 484px;
    }

    &_medium {
      max-width: 608px;
    }

    &_large {
      max-width: 820px;
    }

    &_product {
      max-width: 1140px;
    }

    &_full {
      max-width: calc(100vw - 30px);
    }

    &_static {
      position: static;
    }

    &_overflow-visible {
      overflow: visible;
    }
  }
  &__decor {
    @include adaptiveValue('min-width', 58, 38);
    @include adaptiveValue('height', 48, 38);
    position: absolute;
    z-index: 5;
    &_top-left {
      @include adaptiveValue('left', -6, -8);
      top: -6px;

      transform: rotate(-90deg);
    }

    &_top-right {
      @include adaptiveValue('right', -6, -8);
      top: -6px;
    }

    &_bottom-left {
      @include adaptiveValue('left', -6, -8);
      bottom: -6px;

      transform: rotate(-180deg);
    }

    &_bottom-right {
      @include adaptiveValue('right', -6, -8);
      bottom: -6px;

      transform: rotate(90deg);
    }
  }
  &__frame {
    @include adaptiveValue('padding-top', 46, 30);
    @include adaptiveValue('padding-bottom', 46, 30);
    position: relative;

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    max-height: calc(100dvh - 50px);

    padding-right: 10px;
    padding-left: 10px;

    background-color: var(--bg-primary-colorr);

    scrollbar-color: var(--border-secondary-color) transparent;

    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: var(--border-secondary-color);
    }
  }

  &__close {
    position: absolute;
    top: clamp(8px, 1.5vw, 20px);
    right: clamp(8px, 1.5vw, 20px);
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;

    width: clamp(36px, 3vw, 44px);
    height: clamp(36px, 3vw, 44px);

    padding: 0;

    outline: none;
    background-color: transparent;

    color: var(--hint-secondary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &:focus-visible {
      color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__close-icon {
    display: flex;

    width: 20px;
    height: 20px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__header {
    position: relative;
    z-index: 1;

    width: 100%;

    &:not(:last-child) {
      margin-bottom: clamp(20px, 3vw, 36px);
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
  }

  &__footer {
    position: relative;
    z-index: 1;

    width: 100%;

    &:not(:first-child) {
      margin-top: clamp(20px, 3vw, 36px);
    }
  }

  @media (max-width: $md5) {
    align-items: flex-end;

    padding: 0;

    &__inner {
      width: 100%;
      max-width: none;
      max-height: 92dvh;

      margin: auto 0 0;

      border-right: 0;
      border-bottom: 0;
      border-left: 0;
      border-radius: 10px 10px 0 0;
    }

    &__frame {
      max-height: calc(92dvh - 5px);

      padding: clamp(45px, 10vw, 55px) 14px 24px;

      border-right: 0;
      border-bottom: 0;
      border-left: 0;
      border-radius: 10px 10px 0 0;
    }

    &__close {
      top: 8px;
      right: 8px;
    }
  }
}

.base-modal-fade-enter-active,
.base-modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .base-modal__inner {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }
}

.base-modal-fade-enter-from,
.base-modal-fade-leave-to {
  opacity: 0;

  .base-modal__inner {
    opacity: 0;

    transform: translateY(15px) scale(0.98);
  }
}

.base-modal-fade-enter-to,
.base-modal-fade-leave-from {
  opacity: 1;

  .base-modal__inner {
    opacity: 1;

    transform: translateY(0) scale(1);
  }
}

:global(body.base-modal-open) {
  overflow: hidden;

  padding-right: var(--scrollbar-compensation, 0);
}
</style>
