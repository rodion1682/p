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
  variant: { type: String, default: 'primary' }, // primary | dark | shadow
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  hasArrow: { type: Boolean, default: false },
  activeMd3: { type: Boolean, default: false },
  class: { type: [String, Array, Object], default: '' },
  icon: { type: String, default: '' }, // steam | user | cart | trash | plus | logout | chevron
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  `${props.variant}`,
  { 'with-addons': !!(slots.prefix || slots.postfix) },
  props.class,
  { active: props.active },
  { 'active-md3': props.activeMd3 },
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

      <slot />
      <SvgIcon
        v-if="props.icon === 'steam'"
        class="btn__icon"
        :icon="SteamIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'user'"
        class="btn__icon"
        :icon="UserIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'cart'"
        class="btn__icon"
        :icon="CartIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'trash'"
        class="btn__icon"
        :icon="TrashIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'plus'"
        class="btn__icon"
        :icon="PlusIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'logout'"
        class="btn__icon"
        :icon="LogoutIcon"
      />
      <SvgIcon
        v-else-if="props.icon === 'chevron'"
        class="btn__icon"
        :icon="ChevronDownIcon"
      />
      <svg-icon v-if="props.hasArrow" :icon="ArrowIcon" class="btn__arrow" />

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
  white-space: nowrap;
  pointer-events: auto;
  transition: all 0.3s ease 0s;
  width: 100%;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  text-align: center;
  font-weight: 700;
  font-family: var(--font-open-sans);
  text-transform: uppercase;
  font-size: 14px;
  line-height: 120%;
  gap: 10px;
  padding: 6px 10px;
  overflow: hidden;
  @include adaptiveValue('min-height', 36, 40);
  border-radius: 6px;
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  &.primary {
    background-color: var(--hint-primary-color);
    color: var(--bg-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--primary-color);
      }
    }
  }
  &.bordered {
    background-color: var(--bg-fifth-color);
    border-color: var(--border-primary-color);
    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-sixth-color);
      }
    }
  }
  &.hint-bordered {
    background-color: var(--bg-seventh-color);
    border-color: var(--border-primary-color);
    color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-sixth-color);
      }
    }
  }
  &.trash {
    background-color: transparent;
    color: var(--error-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--error-bg-color);
      }
    }
  }
  &.white {
    background-color: var(--primary-color);
    color: var(--bg-primary-color);
    border-color: inherit;
    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
        background-color: var(--hint-primary-color);
      }
    }
  }

  &__icon {
    min-width: 18px;
    height: 18px;
  }
  &.with-addons {
    gap: 10px;
  }
  &__addon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  &__arrow {
    min-width: 24px;
    min-height: 24px;
  }
}
</style>
