<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ArrowIcon, BackIcon, ChevronDownIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | play | arrow | bordered | hint-bordered
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
      class="btn__icon btn__icon_arrow"
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
  position: relative;
  z-index: 1;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 10px;

  width: 100%;
  height: fit-content;
  min-height: 40px;

  padding: 5px 10px;

  border: 1px solid transparent;
  border-radius: 6px;

  font-family: var(--font-inter);
  font-size: 14px;
  font-weight: 600;
  line-height: 120%;
  letter-spacing: 0px;
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
    background-color: var(--third-color);

    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-sixth-color);
      }
    }
  }
  &.play {
    max-width: 311px;
    min-height: 111px;

    border-radius: 0px;

    color: var(--secondary-color);
    font-family: var(--font-texturina);
    font-size: 32px;
    font-weight: 800;
    line-height: 100%;
    text-transform: capitalize;
    span {
      margin-top: -15px;
    }
    &::before {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      background-image: url('@/assets/img/play-button-bg.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;

      content: '';
    }
    @media (any-hover: hover) {
      &:hover {
        font-size: 34px;

        transform: scale(0.97);
      }
    }
  }
  &.arrow {
    @include adaptiveValue('min-width', 56, 40);
    @include adaptiveValue('min-height', 56, 40);
    display: flex;
    align-items: center;
    justify-content: center;

    height: fit-content;

    background-color: var(--bg-fourth-color);

    color: var(--secondary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--third-color);

        color: var(--primary-color);
      }
    }
  }
  &.bordered {
    border-color: var(--third-color);
    background-color: transparent;

    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--third-color);
      }
    }
  }
  &.hint-bordered {
    border-color: inherit;
    background-color: var(--bg-third-color);

    color: var(--secondary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-eight-color);

        color: var(--third-color);
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
    &_arrow {
      min-width: 24px;
      height: 21px;
    }
    &_chevron {
    }
    &_back {
    }
  }
}
</style>
