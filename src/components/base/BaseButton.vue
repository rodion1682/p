<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ArrowIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | bordered | play | discover | back | clear
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  icon: { type: String, default: '' }, // arrow
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
      v-if="props.icon === 'arrow'"
      :icon="ArrowIcon"
      class="btn__icon btn__icon_arrow"
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
  @include adaptiveValue('min-height', 46, 40);
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
  border-radius: 6px;

  font-family: var(--font-audiowide);
  font-size: 14px;
  font-weight: 400;
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
    border-color: inherit;
    background-color: transparent;

    color: var(--fourth-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }
  &.bordered {
    border-color: inherit;
    background-color: transparent;

    color: var(--fourth-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &.play,
  &.discover {
    max-width: 272px;
    min-height: 67px;

    border-radius: 0px;

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-size: 14px;
    font-weight: 400;
    line-height: 100%;
    text-transform: uppercase;
    span {
      margin-top: 2px;
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
        color: var(--hint-secondary-color);
      }
    }
  }
  &.discover {
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    &::before {
      background-image: url('@/assets/img/discover-button-bg.png');
    }
  }
  &.back {
    padding: 0px;

    background-color: transparent;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-weight: 400;
    text-transform: none;
    .btn__icon_arrow {
      color: var(--fourth-color);
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
        .btn__icon_arrow {
          color: var(--hint-primary-color);
        }
      }
    }
  }
  &.clear {
    background-color: rgb(234, 67, 53, 0.1);
    background-color: var(--bg-primary-color);

    color: var(--error-color);
    @media (any-hover: hover) {
      &:hover {
        border-color: inherit;
        background-color: var(--bg-primary-color);
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

    transition: color 0.3s ease 0s;
    &_arrow {
      min-width: 18px;
      height: 18px;
    }
    &_chevron {
    }
    &_back {
    }
  }
}
</style>
