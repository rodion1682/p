<template>
  <!-- currencyStore.currencyOptions?.length > 1 -->
  <div
    v-if="currencyStore.currencyOptions?.length > 1"
    ref="dropdownRef"
    class="currency-select"
  >
    <Multiselect
      v-model="selectedCurrency"
      mode="single"
      :options="currencyStore.currencyOptions"
      trackBy="value"
      label="label"
      :closeOnSelect="true"
      :hideSelected="false"
      :canDeselect="false"
      placeholder=""
      :canClear="false"
      @select="handleCurrencyChange"
      :classes="dropdownClasses"
    >
      <template #singlelabel="{ value }">
        <div class="currency-select__label">
          <!--<div class="currency-select__icon">
            {{ value?.symbol }}
          </div>-->

          <div class="currency-select__text">
            <div class="currency-select__code">
              {{ value?.code }}
            </div>
          </div>
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="currency-select__caret"
          @click="handleCaretClick"
          :aria-expanded="isOpen"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="currency-select__caret-icon"
            :class="{ 'is-open': isOpen }"
          />
        </button>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import { useCurrencyStore } from '@/stores/currency'
import Multiselect from '@vueform/multiselect'
import { computed, ref, watch } from 'vue'
import { ChevronDownIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const props = defineProps({
  isFooter: { type: Boolean, default: false },
})

const currencyStore = useCurrencyStore()
const dropdownRef = ref(null)

const selectedCurrency = computed({
  get: () => currencyStore.currentCurrencyCode,
  set: value => currencyStore.changeCurrency(value),
})

const handleCurrencyChange = async value => {
  if (value !== selectedCurrency.value) {
    await currencyStore.changeCurrency(value)
  }
}

watch(selectedCurrency, (newValue, oldValue) => {
  console.log('[Currency changed]', { from: oldValue, to: newValue })
})

const dropdownClasses = computed(() => ({
  container: 'dropdown',
  containerOpen: 'dropdown_open',
  wrapper: 'dropdown__wrapper',

  singleLabel: 'dropdown__single',
  singleLabelText: 'dropdown__singleText',

  dropdown: `dropdown__list ${props.isFooter ? 'dropdown__list_footer' : ''}`,
  options: 'dropdown__options',
  option: 'dropdown__option',
  optionPointed: 'dropdown__option_pointed',
  optionSelected: 'dropdown__option_selected',
}))
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.currency-select {
  @media (max-width: $md4) {
    width: 100%;
  }
  &__label {
    pointer-events: none;
    display: flex;
    align-items: center;

    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    font-family: var(--font-inter);
    @media (min-width: $md3) {
      margin-right: auto;
    }
  }
  &__icon {
  }

  &__text {
  }
  &__code {
    font-weight: 500;
    text-transform: uppercase;
  }
  &__caret {
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    color: var(--primary-color);
    margin-bottom: -4px;
    &-icon {
      min-width: 9px;
      height: 6px;

      svg {
        transform: rotate(0deg);
        transition: transform 0.3s ease 0s;
      }

      &.is-open {
        svg {
          transform: rotate(180deg);
        }
      }
    }
  }
}

.dropdown {
  position: relative;
  &_open {
    .dropdown__wrapper {
      color: var(--secondary-color);
      background-color: var(--hint-primary-color);
      border-color: var(--border-primary-color);
    }
  }
  &__wrapper {
    transition: all 0.3s ease 0s;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    @include adaptiveValue('height', 36, 40, 1400, 992, 1);
    gap: 10px;
    padding: 5px 10px;
    position: relative;
    border: 1px solid var(--border-primary-color);

    color: var(--primary-color);

    background-color: var(--bg-primary-color);
    border-radius: 4px;
    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
        background-color: var(--hint-primary-color);
        border-color: var(--border-primary-color);
      }
    }
    @media (max-width: $md7) {
      min-height: 45px;
      justify-content: center;
    }
  }
  &__list {
    position: absolute;
    right: 0;
    top: calc(100% + 2px);
    min-width: 100%;
    max-height: 250px;
    border-radius: 4px;
    border: 1px solid var(--border-primary-color);

    background-color: var(--bg-primary-color);
    border-radius: 4px;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    transition: all 0.3s ease 0s;
    z-index: var(--header-z-index);
    @media (max-width: $md6) {
      top: 48px;
    }
    &.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: -1;
      top: 40px;
      @media (max-width: $md6) {
        top: 45px;
      }
      .dropdown__option {
        pointer-events: none;
      }
    }
    &_footer {
      max-height: 200px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  &__single,
  &__singleText {
    width: 100%;
  }
  &__option {
    cursor: pointer;
    font-weight: 400;
    transition: color 0.3s ease 0s;
    pointer-events: auto;
    padding: 10px;
    font-size: 14px;
    line-height: 150%;
    font-family: var(--font-open-sans);
    color: var(--primary-color);
    background-color: transparent;

    &_selected {
      background-color: rgb(42, 63, 47, 0.1);
      pointer-events: none;
      font-weight: 700;
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: rgb(42, 63, 47, 0.1);
      }
    }
    @media (max-width: $md3) {
      text-align: center;
      padding: 8px 10px;
      min-height: 45px;
      display: flex;
      align-content: center;
      justify-content: center;
      span {
        display: flex;
        align-items: center;
        line-height: 1;
      }
    }
  }
}
</style>
