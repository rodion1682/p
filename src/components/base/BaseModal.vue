<template>
  <Teleport to="body">
    <div v-if="show" class="modal" @click="handleBackdropClick">
      <div
        class="modal__inner background-gradient"
        :class="[wrapperClasses, modalContainerClass]"
        @click.stop
      >
        <button
          type="button"
          class="modal__close"
          :class="closeButtonClass"
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
  </Teleport>
</template>

<script setup>
import { CloseIcon } from '@/components/icons';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  persistent: { type: Boolean, default: false },
  backdropClass: { type: String, default: '' },
  modalContainerClass: { type: String, default: '' },
  wrapperClasses: { type: String, default: '' },
  closeButtonClass: { type: String, default: '' },
  compensateLayout: { type: Boolean, default: true },
  compensateSelectors: {
    type: Array,
    default: () => ['header'],
  },
})

const emit = defineEmits(['close', 'update:show'])
const innerRef = ref(null)

const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth

const GLOBAL_KEY = '__base_modal_scroll_lock__'

const getGlobal = () => {
  const d = document
  if (!d[GLOBAL_KEY]) {
    d[GLOBAL_KEY] = {
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
  return d[GLOBAL_KEY]
}

const applyPaddingRight = (state, els, px) => {
  els.forEach(el => {
    if (!el) return
    if (!state.saved.paddingRightMap.has(el)) {
      state.saved.paddingRightMap.set(el, el.style.paddingRight || '')
    }
    el.style.paddingRight =
      px > 0 ? `${px}px` : state.saved.paddingRightMap.get(el) || ''
  })
}

const restorePaddingRight = state => {
  state.saved.paddingRightMap.forEach((val, el) => {
    if (!el) return
    el.style.paddingRight = val || ''
  })
  state.saved.paddingRightMap = new Map()
}

// Track if THIS instance contributed a lock
let didLock = false

const lockScrollGlobal = () => {
  const state = getGlobal()
  state.count += 1
  didLock = true

  // already locked by another modal -> do nothing
  if (state.applied) return

  const scrollbarWidth = getScrollbarWidth()

  // save only once (first lock)
  state.saved.htmlOverflow = document.documentElement.style.overflow
  state.saved.bodyOverflow = document.body.style.overflow
  state.saved.bodyPaddingRight = document.body.style.paddingRight

  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  if (props.compensateLayout && scrollbarWidth > 0) {
    const els = props.compensateSelectors.flatMap(sel =>
      Array.from(document.querySelectorAll(sel)),
    )
    applyPaddingRight(state, els, scrollbarWidth)
  }

  state.applied = true
}

const unlockScrollGlobal = () => {
  // Only unlock if this instance actually locked
  if (!didLock) return
  didLock = false

  const state = getGlobal()
  state.count = Math.max(0, state.count - 1)

  // other modals still open
  if (state.count > 0) return

  // last modal closed -> restore
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''

  restorePaddingRight(state)
  state.applied = false
}

// ---- UI handlers ----
const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleBackdropClick = e => {
  if (!props.persistent && e.target === e.currentTarget) {
    handleClose()
  }
}

const handleEscKey = e => {
  if (e.key === 'Escape' && props.show && !props.persistent) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  if (props.show) lockScrollGlobal()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  // In case component unmounts while open
  unlockScrollGlobal()
})

watch(
  () => props.show,
  async v => {
    if (v) {
      lockScrollGlobal()
      await nextTick()
      innerRef.value?.focus?.()
    } else {
      unlockScrollGlobal()
    }
  },
)

defineExpose({ close: handleClose })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.coming-soon__inner {
  max-width: 450px;
}

.steam-login-modal__inner {
  max-width: 748px;
}

.product-modal__inner {
  max-width: 796px;
}

.sell-skins__inner {
  max-width: 842px;
}

.checkout__inner,
.top-up__inner,
.withdraw-modal__inner {
  max-width: 920px;
}

.cart-modal__inner {
  max-width: 1100px;
}

.contact-modal__inner {
  max-width: 1140px;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: var(--modal-z-index);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(7, 14, 18, 0.8);
  // backdrop-filter: blur(24px);
  // -webkit-backdrop-filter: blur(24px);
  @media (max-width: $md5) {
    align-items: flex-end;
  }
  &__inner {
    position: relative;
    width: 100%;
    max-height: 80vh;
    overflow: auto;
  }
  &__close {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease 0s;
    background-color: transparent;
    color: var(--primary-color);
    min-width: 34px;
    height: 34px;
    right: 0;
    top: 0;
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-color);
      }
    }
  }
  &__close-icon {
    min-width: 13px;
    min-height: 13px;
  }
  &__content {
    padding-top: 32px;
    @include adaptiveValue('padding-right', 32, 10);
    @include adaptiveValue('padding-left', 32, 10);
    @include adaptiveValue('padding-bottom', 32, 20);
    @media (max-width: $md5) {
      padding: 15px 10px 20px;
    }
    @include adaptiveValue('border-radius', 10, 6);
    position: relative;
    z-index: 1;
    background-color: #12181c;
  }
}
</style>
