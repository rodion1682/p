<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue'

import {
  EmailIcon,
  EyeIcon,
  EyeOpenIcon,
  PasswrodIcon,
  UserNameIcon,
} from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'
defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },

  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).slice(2, 9)}`,
  },

  type: {
    type: String,
    default: 'text',
  },

  name: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },

  autocomplete: {
    type: String,
    default: 'on',
  },

  error: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  readonly: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  fullWidth: {
    type: Boolean,
    default: true,
  },

  dark: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  amount: {
    type: Boolean,
    default: false,
  },

  inputClass: {
    type: [String, Array, Object],
    default: '',
  },

  labelClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const icons = {
  email: EmailIcon,
  username: UserNameIcon,
  password: PasswrodIcon,
}

const prefixIcon = computed(() => icons[props.icon] || null)

const attrs = useAttrs()
const slots = useSlots()

const isFocused = ref(false)
const passwordVisible = ref(false)

const inputType = computed(() => {
  if (props.type !== 'password') {
    return props.type
  }

  return passwordVisible.value ? 'text' : 'password'
})

const isDisabled = computed(() => {
  return props.disabled || props.loading
})

const hasPrefix = computed(() => {
  return Boolean(slots.prefix || prefixIcon.value)
})

const hasSuffix = computed(() => {
  return Boolean(slots.suffix || props.type === 'password' || props.loading)
})

const inputClasses = computed(() => [
  'base-input__control',
  {
    'base-input__control_error': Boolean(props.error),
    'base-input__control_dark': props.dark,
    'base-input__control_with-prefix': hasPrefix.value,
    'base-input__control_with-suffix': hasSuffix.value,
  },
  props.inputClass,
])

const rootClasses = computed(() => [
  'base-input',
  {
    'base-input_full-width': props.fullWidth,
    'base-input_disabled': isDisabled.value,
    'base-input_readonly': props.readonly,
    'base-input_error': Boolean(props.error),
    'base-input_focused': isFocused.value,
    'base-input_has-label': Boolean(props.label),
    'base-input_has-prefix': hasPrefix.value,
    'base-input_has-suffix': hasSuffix.value,
  },
  attrs.class,
])

const labelClasses = computed(() => [
  'base-input__label',
  {
    'base-input__label_amount': props.amount,
    'base-input__label_default': !props.amount,
  },
  props.labelClass,
])

const forwardedAttrs = computed(() => {
  const { class: ignoredClass, style: ignoredStyle, ...rest } = attrs

  return rest
})

const updateValue = event => {
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

const togglePasswordVisibility = () => {
  if (isDisabled.value || props.readonly) {
    return
  }

  passwordVisible.value = !passwordVisible.value
}
</script>

<template>
  <div :class="rootClasses" :style="attrs.style">
    <div class="base-input__row">
      <label v-if="label" :for="id" :class="labelClasses">
        <span>{{ label }}</span>
      </label>

      <div class="base-input__field">
        <div v-if="hasPrefix" class="base-input__prefix">
          <slot name="prefix">
            <SvgIcon
              v-if="prefixIcon"
              :icon="prefixIcon"
              class="base-input__prefix-icon"
            />
          </slot>
        </div>

        <input
          :id="id"
          :value="modelValue"
          :name="name"
          :type="inputType"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :disabled="isDisabled"
          :readonly="readonly"
          :required="required"
          :class="inputClasses"
          v-bind="forwardedAttrs"
          @input="updateValue"
          @focus="onFocus"
          @blur="onBlur"
        />

        <div
          v-if="loading"
          class="base-input__suffix"
          role="status"
          aria-live="polite"
        >
          <span class="base-input__loader" aria-hidden="true" />
        </div>

        <button
          v-else-if="type === 'password'"
          type="button"
          class="base-input__password-toggle"
          :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
          :disabled="isDisabled"
          @click="togglePasswordVisibility"
        >
          <SvgIcon
            class="base-input__password-icon"
            :icon="passwordVisible ? EyeOpenIcon : EyeIcon"
          />
        </button>

        <div v-else-if="$slots.suffix" class="base-input__suffix">
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <div v-if="error" class="base-input__error" role="alert" aria-live="polite">
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-input {
  display: inline-block;

  min-width: 0;

  &_full-width {
    width: 100%;
  }

  &_disabled {
    cursor: not-allowed;
  }

  &__label {
    display: block;

    color: var(--seventh-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 0px;
    text-align: left;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__field {
    position: relative;

    width: 100%;
    &:focus-within {
      .base-input__prefix-icon {
        opacity: 1;
      }
    }
  }

  &__control {
    width: 100%;
    min-height: 40px;

    margin: 0;
    padding-top: 5px;
    padding-right: 12px;
    padding-bottom: 5px;
    padding-left: 12px;

    border: 1.5px solid var(--border-priamry-color);
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 16px;

    transition: all 0.3s ease;

    &::placeholder {
      opacity: 1;

      color: var(--secondary-color);

      transition: opacity 0.3s ease 0s;
    }

    &:focus {
      border-color: var(--border-secondary-color);
      &::placeholder {
        opacity: 0;
      }
    }

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
      pointer-events: none;
    }

    &:read-only:not(:disabled) {
      cursor: not-allowed;
    }

    &_with-prefix {
      padding-left: 40px;
    }

    &_with-suffix {
      padding-right: 40px;
    }

    &_dark {
      border-color: #120b0b;
      background: #120b0b;
    }

    &_error {
      border-color: var(--error-color);
    }
  }

  &__prefix,
  &__suffix,
  &__password-toggle {
    position: absolute;
    top: 50%;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    transform: translateY(-50%);
  }

  &__prefix {
    left: 12px;

    pointer-events: none;
    &-icon {
      min-width: 24px;
      height: 24px;

      opacity: 0.4;

      color: var(--secondary-color);

      transition: color 0.3s ease 0s;
    }
  }

  &__suffix {
    right: 12px;
  }

  &__password-toggle {
    right: 12px;

    width: 40px;
    height: 40px;

    margin: 0;
    padding: 0;

    border: 0;
    background: transparent;

    color: var(--secondary-color);

    cursor: pointer;

    transition: opacity 0.3s ease 0s;

    &:disabled {
      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      opacity: 0.5;
      &:not(:disabled):hover {
        opacity: 1;
      }
    }
  }

  &__password-icon {
    width: 24px;
    height: 24px;
  }

  &__loader {
    width: 17px;
    height: 17px;

    border: 2px solid rgb(255 255 255 / 20%);
    border-radius: 50%;

    animation: base-input-loader 0.7s linear infinite;

    border-top-color: var(--accent-color, #eec98e);
  }

  &__error {
    width: 100%;

    margin-top: 8px;

    color: var(--error-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0px;
    text-align: left;
  }
}

@keyframes base-input-loader {
  to {
    transform: rotate(360deg);
  }
}
</style>
