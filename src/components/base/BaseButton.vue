<script setup>
import {
  ArrowIcon,
  CartIcon,
  ChevronDownIcon,
  LogoutIcon,
  PlusIcon,
  SteamIcon,
  TrashIcon,
  UserIcon,
} from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  hasArrow: {
    type: Boolean,
    default: false,
  },
  activeMd3: {
    type: Boolean,
    default: false,
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  props.variant,
  {
    'with-addons': Boolean(slots.prefix || slots.postfix),
    active: props.active,
    'active-md3': props.activeMd3,
  },
  props.class,
])

const icons = {
  steam: SteamIcon,
  user: UserIcon,
  cart: CartIcon,
  trash: TrashIcon,
  plus: PlusIcon,
  logout: LogoutIcon,
  chevron: ChevronDownIcon,
}

const currentIcon = computed(() => {
  return icons[props.icon] || null
})
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <template v-if="variant === 'toggle'">
      <span class="btn__toggle-line" />
      <span class="btn__toggle-line" />
      <span class="btn__toggle-line" />
    </template>

    <template v-else>
      <span v-if="slots.prefix" class="btn__addon">
        <slot name="prefix" />
      </span>

      <slot />

      <SvgIcon v-if="currentIcon" :icon="currentIcon" class="btn__icon" />

      <SvgIcon v-if="hasArrow" :icon="ArrowIcon" class="btn__arrow" />

      <span v-if="slots.postfix" class="btn__addon">
        <slot name="postfix" />
      </span>
    </template>
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.btn {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  width: 100%;
  height: fit-content;

  @include adaptiveValue('min-height', 36, 40);

  padding: 6px 10px;

  border: 1px solid transparent;
  border-radius: 6px;

  font-family: var(--font-open-sans);
  font-size: 14px;
  font-weight: 700;
  line-height: 120%;
  text-transform: uppercase;

  text-align: center;
  white-space: nowrap;
  cursor: pointer;

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--hint-primary-color);
    outline-offset: 3px;
  }

  // Primary button
  &.primary {
    background-color: var(--hint-primary-color);
    border-color: var(--border-secondary-color);
    color: var(--secondary-color);

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-secodnary-color);
      }
    }
  }

  // Reusable outlined button
  &.bordered {
    background-color: var(--bg-third-color);
    border-color: var(--border-primary-color);
    color: var(--primary-color);

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);
        border-color: var(--hint-primary-color);
      }
    }
  }

  // Dark button
  &.dark {
    background-color: var(--primary-color);
    color: var(--secondary-color);

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-third-color);
      }
    }
  }

  // Hero shadow button
  &.shadow {
    font-size: 16px;
    font-weight: 700;

    @include adaptiveValue('min-height', 46, 40);

    background-color: var(--hint-primary-color);
    color: var(--secondary-color);

    box-shadow:
      0 4px 12px rgba(24, 30, 26, 0.2),
      inset 0 4px 10px #516956;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-secodnary-color);

        box-shadow:
          0 4px 12px rgba(24, 30, 26, 0.2),
          inset 0 4px 10px #2a3f2f;
      }
    }
  }

  // Remove / trash button
  &.trash {
    background-color: var(--bg-primary-color);
    color: var(--primary-color);
    border-color: var(--border-primary-color);

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
        color: var(--secondary-color);
      }
    }
  }

  &__icon {
    width: 18px;
    min-width: 18px;
    height: 18px;
  }

  &__arrow {
    width: 24px;
    min-width: 24px;
    height: 24px;
  }

  &__addon {
    position: relative;
    z-index: 1;

    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  &.with-addons {
    gap: 10px;
  }

  &__toggle-line {
    display: block;
    width: 20px;
    height: 2px;
    background-color: currentColor;
  }

  &.toggle {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
</style>
