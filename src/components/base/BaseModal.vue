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
        <div class="base-modal__layout">
          <div v-if="$slots.hero" class="base-modal__hero" aria-hidden="true">
            <slot name="hero" />
          </div>

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
            <div class="base-modal__decor _ibg-contain">
              <img src="@/assets/img/modal-decor.png" alt="" />
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

  padding: 60px 20px;

  background-color: rgb(0 0 0 / 50%);

  -webkit-backdrop-filter: blur(64px);
  backdrop-filter: blur(64px);

  overscroll-behavior: contain;

  &__layout {
    position: relative;

    width: 100%;
    max-width: 1140px;

    margin: auto;

    isolation: isolate;
  }

  &__hero {
    position: absolute;
    bottom: -10%;
    left: -33%;
    z-index: 2;

    width: 49%;
    aspect-ratio: 1 / 0.95;

    pointer-events: none;

    :deep(img) {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
      object-position: center bottom;

      filter: drop-shadow(0 15px 24px rgb(0 0 0 / 30%));
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-height: calc(100dvh - 120px);

    margin: auto;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    outline: none;
    background-color: var(--bg-fourth-color);

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

      background-color: #191538;
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
    @include adaptiveValue('width', 216, 100);

    position: absolute;
    top: 0;
    left: 50%;
    z-index: 5;

    aspect-ratio: 1 / 0.22;

    pointer-events: none;

    transform: translate(-50%, -100%);
  }

  &__frame {
    @include adaptiveValue('padding-top', 24, 20);
    @include adaptiveValue('padding-bottom', 24, 20);

    position: relative;

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    max-height: calc(100dvh - 120px);

    padding-right: 10px;
    padding-left: 10px;

    border-radius: 12px;
    background-color: var(--bg-primary-colorr);

    scrollbar-color: var(--border-secondary-color) transparent;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: var(--border-secondary-color);
    }
  }

  &__inner_product {
    .base-modal__frame {
      @include adaptiveValue('padding-top', 42, 24);
      @include adaptiveValue('padding-bottom', 42, 24);
      @include adaptiveValue('padding-left', 48, 16);
      @include adaptiveValue('padding-right', 48, 16);

      background-color: #191538;
    }
  }

  &__close {
    @include adaptiveValue('top', 17, 12);
    @include adaptiveValue('right', 17, 12);

    position: absolute;
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--secondary-color);

    cursor: pointer;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }

  &__close-icon {
    width: 24px;
    height: 24px;

    color: inherit;
  }

  &__header,
  &__content,
  &__footer {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
  }

  &__header:not(:last-child) {
    margin-bottom: clamp(20px, 3vw, 36px);
  }

  &__footer:not(:first-child) {
    margin-top: clamp(20px, 3vw, 36px);
  }

  @media (max-width: $md2) {
    &__hero {
      left: -16%;

      width: 35%;
    }
  }

  @media (max-width: $md3) {
    padding: 40px 15px;

    &__inner,
    &__frame {
      max-height: calc(100dvh - 80px);
    }
  }

  @media (max-width: $md4) {
    padding: 35px 12px;

    &__inner,
    &__frame {
      max-height: calc(100dvh - 70px);
    }
    &__hero {
      @include hide-item;
    }
  }

  @media (max-width: $md5) {
    align-items: flex-end;

    padding: 0;

    &__layout {
      margin: auto 0 0;
    }

    &__inner {
      max-width: none;
      max-height: 92dvh;

      border-right: 0;
      border-bottom: 0;
      border-left: 0;
      border-radius: 12px 12px 0 0;
    }

    &__frame {
      max-height: 92dvh;

      border-radius: 12px 12px 0 0;
    }

    &__inner_product {
      .base-modal__frame {
        padding: 35px 15px 25px;
      }
    }

    &__hero {
      display: none;
    }

    &__decor {
      width: 120px;
    }
  }
}

.base-modal-fade-enter-active,
.base-modal-fade-leave-active {
  transition: opacity 0.3s ease;

  .base-modal__inner,
  .base-modal__hero {
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

  .base-modal__hero {
    opacity: 0;

    transform: translateX(-15px);
  }
}

.base-modal-fade-enter-to,
.base-modal-fade-leave-from {
  opacity: 1;

  .base-modal__inner,
  .base-modal__hero {
    opacity: 1;

    transform: none;
  }
}

:global(body.base-modal-open) {
  overflow: hidden;

  padding-right: var(--scrollbar-compensation, 0);
}
</style>
