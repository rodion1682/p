<template>
  <div class="cart-quantity" :class="{ 'is-loading': loading }">
    <button
      type="button"
      class="cart-quantity__button"
      :disabled="loading || localQuantity <= min"
      :aria-label="$t('Decrease quantity')"
      @click="decrease"
    >
      <SvgIcon :icon="MinusIcon" class="cart-quantity__icon" />
    </button>

    <input
      v-model="localQuantity"
      class="cart-quantity__input"
      type="number"
      inputmode="numeric"
      :min="min"
      :max="max || undefined"
      :disabled="loading"
      @input="handleInput"
      @blur="submit"
      @keydown.enter.prevent="handleEnter"
    />

    <button
      type="button"
      class="cart-quantity__button"
      :disabled="loading || isMaxReached"
      :aria-label="$t('Increase quantity')"
      @click="increase"
    >
      <SvgIcon :icon="PlusIcon" class="cart-quantity__icon" />
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { MinusIcon, PlusIcon } from '@/components/icons'

import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },

  min: {
    type: Number,
    default: 1,
  },

  max: {
    type: Number,
    default: null,
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const localQuantity = ref(
  Math.max(props.min, Number(props.modelValue) || props.min),
)

const isMaxReached = computed(() => {
  if (props.max == null) {
    return false
  }

  return Number(localQuantity.value) >= props.max
})

const normalizeQuantity = value => {
  let quantity = Number.parseInt(value, 10)

  if (!Number.isFinite(quantity)) {
    quantity = props.min
  }

  quantity = Math.max(props.min, quantity)

  if (props.max != null) {
    quantity = Math.min(props.max, quantity)
  }

  return quantity
}

const commit = quantity => {
  const normalizedQuantity = normalizeQuantity(quantity)

  localQuantity.value = normalizedQuantity

  if (normalizedQuantity === props.modelValue) {
    return
  }

  emit('update:modelValue', normalizedQuantity)
  emit('change', normalizedQuantity)
}

const decrease = () => {
  if (props.loading) return

  commit(Number(localQuantity.value) - 1)
}

const increase = () => {
  if (props.loading) return

  commit(Number(localQuantity.value) + 1)
}

const handleInput = event => {
  localQuantity.value = event.target.value
}

const submit = () => {
  if (props.loading) return

  commit(localQuantity.value)
}

const handleEnter = event => {
  event.currentTarget?.blur()
}
watch(
  () => props.modelValue,
  value => {
    const quantity = normalizeQuantity(value)

    if (Number(localQuantity.value) !== quantity) {
      localQuantity.value = quantity
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart-quantity {
  display: flex;
  align-items: center;

  min-width: 132px;

  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;

  background-color: var(--bg-primary-color);

  overflow: hidden;

  transition:
    border-color 0.3s ease,
    opacity 0.3s ease;

  &:focus-within {
    border-color: var(--hint-primary-color);
  }

  &.is-loading {
    opacity: 0.5;
    pointer-events: none;
  }

  &__button {
    width: fit-content;
    @include adaptiveValue('min-width', 44, 40);
    @include adaptiveValue('height', 44, 40);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: 0;

    background-color: #12181c;

    color: var(--primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      cursor: default;
      opacity: 0.35;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--hint-primary-color);
        background-color: var(--bg-fifth-color);
      }
    }
  }

  &__icon {
    width: 14px;
    min-width: 14px;
    height: 14px;
  }

  &__input {
    min-width: 0;
    width: 50px;
    @include adaptiveValue('height', 44, 40);

    padding: 0 5px;

    border: 0;
    outline: none;

    background-color: transparent;

    color: var(--primary-color);

    text-align: center;

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1;

    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      margin: 0;

      -webkit-appearance: none;
    }

    &:disabled {
      cursor: default;
      pointer-events: none;
    }
    @media (max-width: $md6) {
      width: 100%;
    }
  }
}
</style>
