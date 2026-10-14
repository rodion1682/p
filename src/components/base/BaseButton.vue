<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ArrowIcon, BackIcon, ChevronDownIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | hint-bordered | arrow
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  icon: { type: String, default: '' }, // chevron | arrow | back
  class: { type: [String, Array, Object], default: '' },
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  props.variant,
  {
    'has-icon': props.icon,
    active: props.active,
  },
  props.class,
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <span v-if="slots.prefix" class="btn__addon">
      <slot name="prefix" />
    </span>

    <SvgIcon
      v-if="props.icon === 'chevron'"
      :icon="ChevronDownIcon"
      class="btn__icon btn__icon_chevron"
    />
    <SvgIcon
      v-else-if="props.icon === 'arrow'"
      :icon="ArrowIcon"
      class="btn__icon btn__icon_chevron"
    />
    <SvgIcon
      v-else-if="props.icon === 'back'"
      :icon="BackIcon"
      class="btn__icon btn__icon_back"
    />

    <span v-if="$slots.default">
      <slot />
    </span>

    <span v-if="slots.postfix" class="btn__addon">
      <slot name="postfix" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @include adaptiveValue('min-height', 36, 40);
  position: relative;
  z-index: 1;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 10px;

  width: 100%;
  height: fit-content;

  padding: 5px 10px;

  border: 1px solid transparent;

  font-family: var(--font-spectral);
  font-size: 14px;
  font-weight: 600;
  line-height: 120%;
  text-align: center;
  text-transform: uppercase;

  pointer-events: auto;

  transition: all 0.3s ease 0s;
  span {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    gap: 10px;
  }
  &:disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &.has-icon {
    gap: 10px;
  }
  &.primary {
    border: 0px;
    background: transparent;

    color: var(--primary-color);
    &::before {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      background: var(--primary-gradient);
      opacity: 1;

      content: '';

      transition: opacity 0.3s ease 0s;
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-gradient-color);
        &::before {
          opacity: 0;
        }
      }
    }
  }
  &.hint-bordered {
    border-color: var(--hint-fifth-color);
    background-color: transparent;

    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-fifth-color);
      }
    }
  }
  &.arrow {
    @include adaptiveValue('min-width', 26, 40);
    @include adaptiveValue('min-height', 26, 40);
    display: flex;
    align-items: center;
    justify-content: center;

    width: fit-content;

    padding: 0px;

    border-width: 2px;
    border-color: var(--hint-secondary-color);
    border-radius: 8px;
    background-color: transparent;
    opacity: 0.6;

    color: var(--hint-secondary-color);

    @media (any-hover: hover) {
      &:hover {
        opacity: 1;
      }
    }
  }

  &__addon {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    position: relative;
    z-index: 1;

    flex-shrink: 0;

    width: 16px;
    min-width: 16px;
    height: 16px;
    &_chevron {
    }
    &_back {
      color: var(--hint-secondary-color);
    }
  }
}
</style>
