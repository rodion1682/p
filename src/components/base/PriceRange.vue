<template>
  <div class="price-range">
    <div class="price-range__label">{{ $t('Price:') }}</div>
    <div class="price-range__inputs">
      <BaseInput
        class="price-range__input"
        :model-value="min"
        type="text"
        :placeholder="placeholderMin"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        empty
        @update:modelValue="onMinInput"
        @blur="emitChange"
        @enter="emitChange"
      >
        <template #suffix>
          <!--<span>{{ currencySymbol }}</span>-->
          <div class="price-range__suffix _ibg-contain">
            <img src="@/assets/img/icons/coin.svg" alt="coin" />
          </div>
        </template>
      </BaseInput>

      <div v-if="false" class="price-range__separator">-</div>

      <BaseInput
        class="price-range__input"
        :model-value="max"
        type="text"
        :placeholder="placeholderMax"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        empty
        @update:modelValue="onMaxInput"
        @blur="emitChange"
        @enter="emitChange"
      >
        <template #suffix>
          <div class="price-range__suffix _ibg-contain">
            <img src="@/assets/img/icons/coin.svg" alt="coin" />
          </div>
          <!--<span>{{ currencySymbol }}</span>-->
        </template>
      </BaseInput>
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  min: { type: [String, Number], default: '' },
  max: { type: [String, Number], default: '' },

  placeholderMin: { type: String, default: '0' },
  placeholderMax: { type: String, default: '15000' },

  currencySymbol: { type: String, default: '€' },

  minLimit: { type: Number, default: null },
  maxLimit: { type: Number, default: null },

  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:min', 'update:max', 'change'])

const sanitize = value => String(value ?? '').replace(/[^\d]/g, '')

const clamp = value => {
  if (value === '') return ''

  let numeric = Number(value)

  if (props.minLimit !== null && numeric < props.minLimit) {
    numeric = props.minLimit
  }

  if (props.maxLimit !== null && numeric > props.maxLimit) {
    numeric = props.maxLimit
  }

  return String(numeric)
}

const normalize = value => clamp(sanitize(value))

const onMinInput = value => {
  const normalized = normalize(value)
  emit('update:min', normalized)
  emit('change', {
    min: normalized,
    max: String(props.max ?? ''),
  })
}

const onMaxInput = value => {
  const normalized = normalize(value)
  emit('update:max', normalized)
  emit('change', {
    min: String(props.min ?? ''),
    max: normalized,
  })
}

const emitChange = () => {
  emit('change', {
    min: String(props.min ?? ''),
    max: String(props.max ?? ''),
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.price-range {
  @media (min-width: $md4) {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  &__label {
    line-height: 100%;
    font-weight: 400;
    transition: color 0.3s ease 0s;
    color: var(--seconday-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
  }

  &__inputs {
    display: flex;
    gap: 12px;
    align-items: center;
    @media (max-width: $md3) {
      gap: 10px;
    }
  }

  &__input {
    min-width: 126px;
    @media (min-width: $md3) {
      max-width: 126px;
    }
    @media (max-width: $md3) {
      min-width: 100px;
    }
  }

  &__suffix {
    min-width: 18px;
    height: 18px;
  }

  &__separator {
  }
}
</style>
