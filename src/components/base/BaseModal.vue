<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div
        v-if="props.show"
        class="base-modal"
        :class="[props.modalClass, `base-modal_${props.variant}`]"
        role="presentation"
        @mousedown="handleBackdropClick"
      >
        <div
          ref="innerRef"
          class="base-modal__inner"
          :class="innerClasses"
          :style="modalStyle"
          role="dialog"
          aria-modal="true"
          :aria-describedby="props.describedby || undefined"
          :aria-labelledby="props.labelledby || undefined"
          tabindex="-1"
          @mousedown.stop
        >
          <div
            v-if="props.variant === 'dialog'"
            class="base-modal__decor base-modal__decor_left _ibg-contain"
            aria-hidden="true"
          >
            <img src="@/assets/img/blue-left-decor.png" alt="" />
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

  hideCloseButton: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    default: 'fullscreen',
    validator: value => ['fullscreen', 'dialog'].includes(value),
  },
  labelledby: { type: String, default: undefined },
  describedby: { type: String, default: undefined },
  persistent: { type: Boolean, default: false },
  closeLabel: { type: String, default: 'Close modal' },
  closeButtonClass: { type: [String, Array, Object], default: '' },
  headerClass: { type: [String, Array, Object], default: '' },
  contentClass: { type: [String, Array, Object], default: '' },
  modalContainerClass: { type: [String, Array, Object], default: '' },
  maxWidth: { type: [String, Number], default: null },
  modalClass: {
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
})

const emit = defineEmits(['close', 'open', 'update:show'])

const innerRef = ref(null)

const modalStyle = computed(() => {
  if (props.variant !== 'dialog' || props.maxWidth == null) return attrs.style
  const width =
    typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  return [attrs.style, { '--modal-max-width': width }]
})

const GLOBAL_SCROLL_LOCK_KEY = '__base_modal_scroll_lock__'

let didLockScroll = false
let previouslyFocusedElement = null

const innerClasses = computed(() => {
  return [
    attrs.class,
    props.modalContainerClass,
    `base-modal__inner_${props.size}`,
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

  overscroll-behavior: contain;

  // Legacy fullscreen presentation for hero/product modals.
  &_fullscreen {
    background: var(--bg-primary-color);
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-height: 100dvh;

    margin: auto;

    outline: none;
    background: var(--bg-primary-color);

    pointer-events: auto;
  }

  &__decor {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;

    width: clamp(90px, 12vw, 150px);
    aspect-ratio: 1 / 0.82;

    pointer-events: none;

    transform: translate(-10%, -20%);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__frame {
    position: relative;

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    max-height: 100dvh;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: var(--fourth-color);

    cursor: pointer;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__close-icon {
    width: 24px;
    height: 24px;

    color: inherit;
  }

  &__header,
  &__content {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
  }
  &__header:not(:last-child) {
    margin-bottom: clamp(20px, 3vw, 36px);
  }

  // New optional compact modal. Never stretches to full viewport.
  &_dialog {
    padding: 24px;

    background: rgb(9, 13, 23, 0.6);

    .base-modal__inner {
      @include adaptiveValue('border-radius', 22, 10);
      flex: 0 1 auto;

      width: min(100%, var(--modal-max-width, 1100px));
      max-width: 100%;
      max-height: calc(100dvh - 48px);

      background: #111624;
    }

    .base-modal__frame {
      overflow-x: hidden;
      overflow-y: auto;

      max-height: calc(100dvh - 48px);

      border-radius: inherit;

      scrollbar-width: thin;
    }

    .base-modal__close {
      top: 10px;
      right: 10px;

      border-radius: 6px;
      background: rgb(10 14 24 / 85%);
    }
  }

  @media (max-width: $md3) {
    &_fullscreen {
      .base-modal__inner,
      .base-modal__frame {
        max-height: calc(100dvh - 80px);
      }
    }
  }

  @media (max-width: $md4) {
    &_fullscreen {
      padding: 0px;
      .base-modal__inner,
      .base-modal__frame {
        max-height: calc(100dvh - 70px);

        padding: 0px;
      }
    }
    &_dialog {
      padding: 12px;
      .base-modal__inner,
      .base-modal__frame {
        max-height: calc(100dvh - 24px);
      }
    }
  }

  @media (max-width: $md5) {
    &_fullscreen {
      align-items: flex-end;

      padding: 0;
      .base-modal__inner {
        max-width: none;
        max-height: 92dvh;

        border-right: 0;
        border-bottom: 0;
        border-left: 0;
        border-radius: 12px 12px 0 0;
      }
      .base-modal__frame {
        max-height: 92dvh;

        border-radius: 12px 12px 0 0;
      }
      .base-modal__inner_product .base-modal__frame {
        padding: 35px 15px 25px;
      }
      .base-modal__decor {
        width: 120px;
      }
    }
    &_dialog {
      align-items: center;

      padding: 10px;
      .base-modal__inner {
        width: 100%;
        max-height: calc(100dvh - 20px);

        border-radius: 12px;
      }
      .base-modal__frame {
        max-height: calc(100dvh - 20px);
      }
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

    transform: none;
  }
}
:global(body.base-modal-open) {
  overflow: hidden;

  padding-right: var(--scrollbar-compensation, 0);
}
</style>
