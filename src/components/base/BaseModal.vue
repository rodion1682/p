<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="modal"
        :class="backdropClass"
        @click.self="handleBackdropClick"
      >
        <div
          ref="innerRef"
          class="modal__inner"
          :class="[wrapperClasses, modalContainerClass]"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel || undefined"
          tabindex="-1"
          @click.stop
          @keydown.tab="handleTabKey"
        >
          <button
            type="button"
            class="modal__close"
            :class="closeButtonClass"
            :aria-label="closeLabel"
            @click="handleClose"
          >
            <slot name="close-icon">
              <SvgIcon :icon="CloseIcon" class="modal__close-icon" />
            </slot>
          </button>

          <div class="modal__content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  persistent: {
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

  ariaLabel: {
    type: String,
    default: '',
  },

  closeLabel: {
    type: String,
    default: 'Close modal',
  },

  compensateLayout: {
    type: Boolean,
    default: true,
  },

  compensateSelectors: {
    type: Array,
    default: () => ['header'],
  },
})

const emit = defineEmits(['close', 'update:show'])

const innerRef = ref(null)

const GLOBAL_KEY = '__base_modal_scroll_lock__'

let didLock = false
let previousFocus = null

// Global scroll lock shared by all BaseModal instances
const getGlobalState = () => {
  const doc = document

  if (!doc[GLOBAL_KEY]) {
    doc[GLOBAL_KEY] = {
      count: 0,
      applied: false,
      saved: {
        htmlOverflow: '',
        bodyOverflow: '',
        bodyPaddingRight: '',
        paddingRightMap: new Map(),
      },
    }
  }

  return doc[GLOBAL_KEY]
}

const getScrollbarWidth = () => {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

const applyLayoutCompensation = (state, width) => {
  if (!props.compensateLayout || width <= 0) {
    return
  }

  const elements = props.compensateSelectors.flatMap(selector => [
    ...document.querySelectorAll(selector),
  ])

  elements.forEach(element => {
    if (!element) return

    if (!state.saved.paddingRightMap.has(element)) {
      state.saved.paddingRightMap.set(element, element.style.paddingRight)
    }

    const originalPadding =
      parseFloat(window.getComputedStyle(element).paddingRight) || 0

    element.style.paddingRight = `${originalPadding + width}px`
  })
}

const restoreLayoutCompensation = state => {
  state.saved.paddingRightMap.forEach((value, element) => {
    element.style.paddingRight = value
  })

  state.saved.paddingRightMap.clear()
}

const lockScroll = () => {
  if (didLock) return

  const state = getGlobalState()

  didLock = true
  state.count += 1

  if (state.applied) return

  const scrollbarWidth = getScrollbarWidth()

  state.saved.htmlOverflow = document.documentElement.style.overflow

  state.saved.bodyOverflow = document.body.style.overflow

  state.saved.bodyPaddingRight = document.body.style.paddingRight

  const bodyPadding =
    parseFloat(getComputedStyle(document.body).paddingRight) || 0

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${bodyPadding + scrollbarWidth}px`
  }

  applyLayoutCompensation(state, scrollbarWidth)

  state.applied = true
}

const unlockScroll = () => {
  if (!didLock) return

  didLock = false

  const state = getGlobalState()

  state.count = Math.max(0, state.count - 1)

  if (state.count > 0) return

  document.documentElement.style.overflow = state.saved.htmlOverflow

  document.body.style.overflow = state.saved.bodyOverflow

  document.body.style.paddingRight = state.saved.bodyPaddingRight

  restoreLayoutCompensation(state)

  state.applied = false
}

// Modal actions
const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleBackdropClick = () => {
  if (props.persistent) return

  handleClose()
}

const handleEscKey = event => {
  if (event.key !== 'Escape' || !props.show || props.persistent) {
    return
  }

  // Only the topmost modal handles Escape
  const modals = document.querySelectorAll(
    '.modal[role="presentation"], .modal',
  )

  const lastModal = modals[modals.length - 1]

  if (innerRef.value && lastModal?.contains(innerRef.value)) {
    event.preventDefault()
    handleClose()
  }
}

// Keep keyboard focus inside the modal
const handleTabKey = event => {
  if (!props.show || event.key !== 'Tab') return

  const modal = innerRef.value

  if (!modal) return

  const focusable = [
    ...modal.querySelectorAll(
      'a[href], button:not([disabled]), ' +
        'input:not([disabled]), ' +
        'select:not([disabled]), ' +
        'textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])',
    ),
  ].filter(element => element.getClientRects().length > 0)

  if (!focusable.length) {
    event.preventDefault()
    modal.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey) {
    if (active === first || active === modal) {
      event.preventDefault()
      last.focus()
    }
  } else if (active === last || active === modal) {
    event.preventDefault()
    first.focus()
  }
}

const focusModal = async () => {
  await nextTick()

  innerRef.value?.focus({
    preventScroll: true,
  })
}

const restoreFocus = () => {
  if (previousFocus?.isConnected) {
    previousFocus.focus({
      preventScroll: true,
    })
  }

  previousFocus = null
}

watch(
  () => props.show,
  async isOpen => {
    if (isOpen) {
      previousFocus = document.activeElement
      lockScroll()
      await focusModal()
    } else {
      unlockScroll()
      await nextTick()
      restoreFocus()
    }
  },
)

onMounted(async () => {
  document.addEventListener('keydown', handleEscKey)

  if (props.show) {
    previousFocus = document.activeElement
    lockScroll()
    await focusModal()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)

  unlockScroll()
  restoreFocus()
})

defineExpose({
  close: handleClose,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

// Modal widths
.coming-soon__inner {
  max-width: 450px;
}

.steam-login-modal__inner {
  max-width: 748px;
}

.product-modal__inner {
  max-width: 627px;
}

.sell-skins__inner {
  max-width: 842px;
}

.checkout__inner,
.top-up__inner,
.withdraw-modal__inner,
.cart-modal__inner {
  max-width: 1073px;
}

.contact-modal__inner {
  max-width: 1140px;
}

// Base modal
.modal {
  position: fixed;
  inset: 0;

  z-index: var(--modal-z-index);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  // New softer overlay matching Figma
  background-color: rgba(24, 30, 26, 0.4);

  overflow-y: auto;
  overscroll-behavior: contain;

  &__inner {
    position: relative;

    width: 100%;
    max-width: 1073px;
    max-height: calc(100dvh - 40px);

    margin: auto;

    overflow-y: auto;
    overflow-x: hidden;

    border-radius: 6px;

    background-color: var(--bg-eight-color);
    color: var(--primary-color);

    outline: none;

    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  &__content {
    position: relative;
    z-index: 1;

    @include adaptiveValue('padding-top', 34, 20);
    @include adaptiveValue('padding-bottom', 34, 20);
    @include adaptiveValue('padding-left', 34, 15);
    @include adaptiveValue('padding-right', 34, 15);

    background-color: var(--bg-eight-color);
    color: var(--primary-color);

    border-radius: inherit;
  }

  &__close {
    position: absolute;

    top: 10px;
    right: 10px;
    z-index: 5;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    min-width: 28px;
    height: 28px;

    padding: 5px;

    border: none;
    border-radius: 4px;

    background-color: transparent;
    color: var(--primary-color);

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
        color: var(--hint-primary-color);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__close-icon {
    display: block;
    width: 14px;
    min-width: 14px;
    height: 14px;
  }

  @media (max-width: $md5) {
    align-items: center;
    padding: 12px;

    &__inner {
      max-height: calc(100dvh - 24px);
    }

    &__content {
      padding: 24px 15px 20px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px;

    &__inner {
      max-height: calc(100dvh - 16px);
      border-radius: 6px;
    }

    &__content {
      padding: 25px 12px 18px;
    }

    &__close {
      top: 6px;
      right: 6px;
    }
  }
}

// Open / close animations
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;

  .modal__inner {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  visibility: hidden;

  .modal__inner {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  visibility: visible;

  .modal__inner {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal__inner,
  .modal__close {
    transition: none !important;
  }
}
</style>
