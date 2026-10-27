<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ChevronDownIcon, OfferIcon, UserIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | bordered | transparent-link | delete | white-bordered | white | transparent | gray
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  hasArrow: { type: Boolean, default: false },
  activeMd3: { type: Boolean, default: false },
  icon: { type: String, default: '' }, // user | chevron | offer
  class: { type: [String, Array, Object], default: '' },
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  props.variant,
  {
    'with-addons': !!(slots.prefix || slots.postfix),
    'has-icon': props.icon,
    active: props.active,
    'active-md3': props.activeMd3,
  },
  props.class,
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <template v-if="variant === 'toggle'">
      <span class="btn__toggle-line"></span>
      <span class="btn__toggle-line"></span>
      <span class="btn__toggle-line"></span>
    </template>

    <template v-else>
      <span v-if="slots.prefix" class="btn__addon">
        <slot name="prefix" />
      </span>

      <SvgIcon
        v-if="props.icon === 'user'"
        :icon="UserIcon"
        class="btn__icon"
      />
      <SvgIcon
        v-else-if="props.icon === 'offer'"
        :icon="OfferIcon"
        class="btn__icon"
      />

      <span v-if="$slots.default" class="btn__text">
        <slot />
      </span>

      <SvgIcon
        v-if="props.icon === 'chevron'"
        :icon="ChevronDownIcon"
        class="btn__icon btn__icon_chevron"
      />

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
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  width: 100%;
  pointer-events: auto;
  transition: all 0.3s ease 0s;
  position: relative;
  z-index: 1;
  overflow: hidden;
  text-align: center;
  font-weight: 400;
  font-family: var(--font-inter);
  border: 1px solid transparent;
  font-size: 16px;
  line-height: 120%;
  gap: 10px;
  text-transform: capitalize;
  padding: 5px 10px;
  @include adaptiveValue('border-radius', 20, 10);
  @include adaptiveValue('min-height', 50, 40, 1440, 992, 1);
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.has-icon {
    gap: 10px;
  }
  &.primary {
    color: var(--primary-color);
    background-color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: transparent;
        border-color: var(--hint-primary-color);
      }
    }
  }
  &.bordered {
    background-color: transparent;
    color: var(--primary-color);
    border-color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
        background-color: var(--hint-primary-color);
      }
    }
  }
  &.transparent-link {
    background-color: transparent;
    color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
        background-color: var(--hint-primary-color);
      }
    }
  }
  &.delete {
    background-color: transparent;
    color: var(--error-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--bg-primary-color);
        background-color: var(--error-color);
      }
    }
  }
  &.white-bordered {
    background-color: transparent;
    color: var(--primary-color);
    border-color: inherit;
    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
        background-color: var(--hint-primary-color);
      }
    }
  }
  &.white {
    background-color: var(--primary-color);
    color: var(--bg-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        color: var(--primary-color);
        border-color: inherit;
      }
    }
  }
  &.transparent {
    padding: 8px 0px;
    width: fit-content;
    color: var(--secondary-color);
    background-color: transparent;
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }
  &.gray {
    color: var(--bg-primary-color);
    background-color: var(--secondary-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
        background-color: var(--bg-primary-color);
        border-color: inherit;
      }
    }
  }
  &.with-addons {
    gap: 10px;
  }

  &__text {
    position: relative;
    z-index: 1;
  }

  &__addon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    width: 16px;
    height: 16px;
    min-width: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    &_chevron {
    }
  }
}
</style>
