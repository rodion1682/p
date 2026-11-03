<script setup>
import { PasswordIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, onMounted, ref, useAttrs, useSlots } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  steam: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  regular: {
    type: Boolean,
    default: false,
  },
  empty: {
    type: Boolean,
    default: false,
  },
  regularPrefix: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'on',
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
  actionable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'left',
    validator: value => ['left', 'center', 'checkout'].includes(value),
  },
})

const emit = defineEmits([
  'update:modelValue',
  'action',
  'enter',
  'blur',
  'focus',
])

const attrs = useAttrs()
const slots = useSlots()

const isFocused = ref(false)
const passwordVisible = ref(false)
const isInitiallyFilled = ref(false)

const computedType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }

  return props.type
})

const hasAction = computed(() => props.actionable && !!slots['action-icon'])

const hasValue = computed(() => {
  const value = props.modelValue

  return value !== null && value !== undefined && String(value).length > 0
})

const isFilled = computed(() => {
  return isFocused.value || hasValue.value || isInitiallyFilled.value
})

const hasSuffix = computed(() => {
  return props.loading || props.type === 'password' || !!slots.suffix
})

const hasPrefix = computed(() => !!slots.prefix)

const inputClasses = computed(() => ({
  'is-center': props.variant === 'center',
  'is-checkout': props.variant === 'checkout',
  'has-prefix': hasPrefix.value,
  'has-suffix': hasSuffix.value,
  'is-steam': props.steam,
}))

const containerClasses = computed(() => ({
  'is-focused': isFocused.value,
  'is-filled': isFilled.value,
  'is-steam': props.steam,
  'has-error': Boolean(props.error),
  'is-disabled': props.disabled || props.loading,
  'is-checkout': props.variant === 'checkout',
  regular: props.regular,
  empty: props.empty,
  regularPrefix: props.regularPrefix,
  'has-action': hasAction.value,
  'has-prefix': hasPrefix.value,
}))

const attrsExceptClass = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

const onInput = event => {
  emit('update:modelValue', event.target.value)
}

const onFocus = event => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = event => {
  isFocused.value = false
  emit('blur', event)
}

const onAction = () => emit('action')
const onEnter = () => emit('enter')

onMounted(() => {
  isInitiallyFilled.value = hasValue.value
})
</script>

<template>
  <div
    class="base-input-wrap"
    :class="[attrs.class, { 'variant-checkout': variant === 'checkout' }]"
  >
    <label
      v-if="label"
      :for="id"
      class="base-input__label"
      :class="{ error: error }"
    >
      {{ label }}
    </label>

    <div class="base-input" :class="containerClasses">
      <div v-if="steam" class="base-input__steam _ibg-contain">
        <img src="@/assets/img/icons/steam.svg" alt="" />
      </div>

      <div v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix" />
      </div>

      <button
        v-else-if="hasAction"
        type="button"
        class="base-input__icon-btn"
        :disabled="disabled || loading"
        aria-label="Search"
        title="Search"
        @click="onAction"
      >
        <slot name="action-icon" />
      </button>

      <input
        :id="id"
        class="base-input__control"
        :class="inputClasses"
        :value="modelValue"
        :type="computedType"
        :readonly="readonly"
        :disabled="disabled || loading"
        :autocomplete="autocomplete"
        :required="required"
        :placeholder="variant === 'checkout' ? placeholder : ''"
        v-bind="attrsExceptClass"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="onEnter"
      />

      <div
        v-if="variant !== 'checkout'"
        class="base-input__placeholder"
        :class="{
          'is-raised': isFilled,
          'has-prefix': hasPrefix,
        }"
      >
        {{ placeholder }}
      </div>

      <div v-if="hasSuffix" class="base-input__suffix">
        <div v-if="loading" class="base-input__spinner" aria-hidden="true" />

        <button
          v-else-if="type === 'password'"
          type="button"
          class="base-input__toggle"
          :disabled="disabled || loading"
          @click="togglePasswordVisibility"
        >
          <slot name="password-icon">
            <SvgIcon class="base-input__toggle-icon" :icon="PasswordIcon" />
          </slot>
        </button>

        <div v-else>
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <div v-if="error" class="base-input__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-input-wrap {
  width: 100%;
  min-width: 0;
}

.base-input {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;

  background-color: var(--bg-ninth-color);
  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;

  @include adaptiveValue('min-height', 44, 40);

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &.is-focused {
    border-color: var(--hint-primary-color);

    .base-input__placeholder {
      font-size: 10px;
      line-height: 14px;
      top: 10px;
      opacity: 1;
      color: var(--hint-primary-color);
    }
  }

  &.has-error {
    border-color: var(--error-color);

    .base-input__placeholder {
      font-size: 10px;
      line-height: 10px;
      top: 10px;
      color: var(--error-color);
    }
  }

  &.has-action,
  &.has-prefix,
  &.is-steam {
    .base-input__placeholder {
      left: 45px;
    }
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.empty {
    .base-input__control {
      padding-top: 0;
    }
  }

  &__label {
    display: block;
    line-height: 150%;
    font-weight: 500;
    color: var(--primary-color);
    font-family: var(--font-open-sans);
    font-size: 14px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 4);
    }

    &.error {
      color: var(--error-color);
    }
  }

  &__control {
    width: 100%;
    height: 100%;
    min-width: 0;

    border: 0;
    outline: none;
    background: transparent;

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-color);

    padding-top: 9px;

    @include adaptiveValue('padding-left', 18, 15);
    @include adaptiveValue('padding-right', 18, 15);

    &.has-prefix {
      padding-left: 45px;
    }

    &.has-suffix {
      padding-right: 55px;
    }

    &.is-center {
      text-align: center;
    }

    &::placeholder {
      color: transparent;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__control[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  &__control[type='number']::-webkit-outer-spin-button,
  &__control[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &__placeholder {
    position: absolute;
    pointer-events: none;

    top: 50%;
    transform: translateY(-50%);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    color: var(--secondary-color);

    @include adaptiveValue('left', 18, 15);

    max-width: calc(100% - 45px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    transition: all 0.3s ease;

    &.is-raised {
      top: 10px;
      font-size: 10px;
      line-height: 10px;
    }
  }

  &__prefix,
  &__suffix {
    position: absolute;
    z-index: 1;
    top: 50%;

    display: flex;
    align-items: center;

    transform: translateY(-50%);
    @include adaptiveValue('gap', 14, 10);
  }

  &__prefix {
    @include adaptiveValue('left', 18, 15);
  }

  &__suffix {
    @include adaptiveValue('right', 25, 15);
  }

  &__steam {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    min-width: 18px;
    height: 18px;

    @include adaptiveValue('left', 18, 15);
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border-radius: 6px;

    @include adaptiveValue('min-height', 36, 40);
    @include adaptiveValue('min-width', 36, 40);

    :deep(path) {
      stroke: var(--primary-color);
      transition: stroke 0.3s ease;
    }

    @media (any-hover: hover) {
      &:hover {
        :deep(path) {
          stroke: var(--hint-primary-color);
        }
      }
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;

    background: transparent;
    border-radius: 6px;
    cursor: pointer;

    @include adaptiveValue('height', 36, 40);
    @include adaptiveValue('min-width', 36, 40);

    &-icon {
      min-width: 16px;
      height: 16px;
      color: var(--primary-color);
    }
  }

  &__error {
    margin-top: 6px;
    @include adaptiveValue('padding-left', 18, 15);
  }
}

// Checkout variant
.base-input-wrap.variant-checkout {
  .base-input__label {
    margin-bottom: 3px;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.3;
    color: var(--hint-third-color);
  }

  .base-input {
    min-height: 44px;
    border-color: var(--border-primary-color);
    background-color: var(--bg-third-color);

    &.is-focused {
      border-color: var(--hint-primary-color);
    }

    &.has-error {
      border-color: var(--error-color);
    }
  }

  .base-input__control {
    padding-top: 0;
    font-family: var(--font-inter);

    &::placeholder {
      color: var(--hint-third-color);
    }
  }

  .base-input__placeholder {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-input,
  .base-input__placeholder {
    transition: none;
  }
}
</style>
