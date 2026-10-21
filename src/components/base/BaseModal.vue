<template>
  <Teleport to="body">
    <Transition name="base-modal-fade">
      <div
        v-if="props.show"
        class="base-modal"
        :class="props.modalClass"
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
          :aria-describedby="props.describedby || undefined"
          tabindex="-1"
          @mousedown.stop
        >
          <div class="base-modal__decor base-modal__decor_left _ibg-contain">
            <img src="@/assets/img/blue-left-decor.png" alt="" />
          </div>
          <div class="base-modal__decor base-modal__decor_right _ibg-contain">
            <img src="@/assets/img/blue-right-decor.png" alt="" />
          </div>

          <div class="base-modal__frame">
            <button
              v-if="!props.hideCloseButton"
              type="button"
              class="base-modal__close"
              :class="props.closeButtonClass"
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

            <div class="base-modal__content">
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

const GLOBAL_SCROLL_LOCK_KEY = '__base_modal_scroll_lock__'

let didLockScroll = false
let previouslyFocusedElement = null

const innerClasses = computed(() => {
  return [attrs.class, `base-modal__inner_${props.size}`]
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
.heros-modal {
  .base-modal__inner {
    max-width: 1370px;
  }
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

  background: var(--bg-primary-color);

  // -webkit-backdrop-filter: blur(64px);
  // backdrop-filter: blur(64px);

  overscroll-behavior: contain;

  &__layout {
    // position: relative;

    // width: 100%;

    // margin: auto;

    // pointer-events: none;

    // isolation: isolate;
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-height: calc(100dvh);

    margin: auto;

    outline: none;
    background-color: var(--bg-primary-color);

    pointer-events: auto;
  }

  &__decor {
    @include hide-item;
  }

  &__frame {
    position: relative;

    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    max-height: calc(100dvh);
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

    transition: color 0.3s ease 0s;

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

    &__decor {
      width: 120px;
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
