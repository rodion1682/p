<template>
  <div
    v-if="currencyStore.currencyOptions?.length > 1"
    ref="dropdownRef"
    class="currency-select"
    :class="{ 'currency-select_footer': isFooter }"
  >
    <Multiselect
      v-model="selectedCurrency"
      mode="single"
      :options="currencyStore.currencyOptions"
      track-by="value"
      label="label"
      :close-on-select="true"
      :hide-selected="false"
      :can-deselect="false"
      :can-clear="false"
      :searchable="false"
      placeholder=""
      :classes="dropdownClasses"
      @select="handleCurrencyChange"
    >
      <template #singlelabel="{ value }">
        <div class="currency-select__label">
          <div v-if="value?.symbol" class="currency-select__symbol">
            {{ value.symbol }}
          </div>

          <div class="currency-select__text">
            {{
              value?.code ?? value?.value ?? value?.label ?? selectedCurrency
            }}
          </div>
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="currency-select__caret"
          :class="{ 'is-open': isOpen }"
          :aria-expanded="isOpen"
          aria-label="Toggle currency menu"
          @click.stop="handleCaretClick"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="currency-select__caret-icon"
          />
        </button>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'
import { computed, ref } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useCurrencyStore } from '@/stores/currency'

defineProps({
  isFooter: {
    type: Boolean,
    default: false,
  },
})

const currencyStore = useCurrencyStore()
const dropdownRef = ref(null)

const selectedCurrency = computed({
  get: () => currencyStore.currentCurrencyCode,
  set: value => {
    if (value !== currencyStore.currentCurrencyCode) {
      currencyStore.changeCurrency(value)
    }
  },
})

const handleCurrencyChange = async value => {
  if (value !== currencyStore.currentCurrencyCode) {
    await currencyStore.changeCurrency(value)
  }
}

const dropdownClasses = {
  container: 'dropdown',
  containerDisabled: 'dropdown_disabled',
  containerOpen: 'dropdown_open',
  containerOpenTop: 'dropdown_open-top',

  wrapper: 'dropdown__wrapper',

  singleLabel: 'dropdown__single',
  singleLabelText: 'dropdown__single-text',

  placeholder: 'dropdown__placeholder',

  dropdown: 'dropdown__list',
  dropdownTop: 'dropdown__list_top',
  dropdownHidden: 'dropdown__list_hidden',

  options: 'dropdown__options',
  optionsTop: 'dropdown__options_top',

  option: 'dropdown__option',
  optionPointed: 'dropdown__option_pointed',
  optionSelected: 'dropdown__option_selected',
  optionDisabled: 'dropdown__option_disabled',
  optionSelectedPointed: 'dropdown__option_selected dropdown__option_pointed',
  optionSelectedDisabled: 'dropdown__option_selected dropdown__option_disabled',

  noOptions: 'dropdown__empty',
  noResults: 'dropdown__empty',

  fakeInput: 'dropdown__fake-input',
  assist: 'dropdown__assist',
  spacer: 'dropdown__spacer',
}
</script>

<style lang="scss">
.currency-select {
  position: relative;

  width: fit-content;

  color: var(--fourth-color);
  &_footer {
    width: 100%;
  }

  @media (any-hover: hover) {
    &:hover {
      .currency-select__caret {
        color: var(--hint-primary-color);
      }
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 10px;

    color: inherit;
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 600;
    line-height: 100%;
    letter-spacing: 0px;
    text-transform: uppercase;

    pointer-events: none;
  }

  &__symbol {
  }

  &__text {
  }

  &__caret {
    align-self: center;

    min-width: 12px;
    height: 7px;

    color: var(--fourth-color);

    transition: all 0.3s ease 0s;
    &.is-open {
      .currency-select__caret-icon {
        transform: rotate(180deg);
      }
    }
  }

  &__caret-icon {
    width: 100%;
    height: 100%;
  }
}

.dropdown {
  position: relative;

  width: 100%;

  outline: transparent;

  &_open {
    .dropdown__wrapper {
      border-color: var(--hint-primary-color);
    }
  }

  &_open-top {
    .dropdown__list {
      top: auto;
      bottom: calc(100% + 4px);
    }
  }

  &_disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &__wrapper {
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    min-height: 40px;

    padding-top: 5px;
    padding-bottom: 5px;

    border: 1px solid transparent;
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-third-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
      }
    }

    @media (max-width: $md4) {
      justify-content: center;

      min-height: 40px;
    }
  }

  &__single {
    display: flex;
    flex-grow: 1;
    align-items: center;

    min-width: 0;
    height: 100%;
  }

  &__single-text {
    overflow: hidden;

    width: 100%;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__placeholder {
    overflow: hidden;

    width: 100%;

    color: var(--third-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__list {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: var(--header-z-index);

    overflow-x: hidden;
    overflow-y: auto;

    width: max-content;
    min-width: 100%;
    max-height: min(220px, calc(100vh - 100px));

    padding: 11px 0;

    border: 1px solid var(--hint-primary-color);
    border-radius: 8px;
    background-color: var(--bg-fifth-color);
    box-shadow: 0 4px 16px 0px var(--shadow-primary-color);

    transition: all 0.3s ease 0s;

    &_top {
      top: auto;
      bottom: calc(100% + 8px);
    }

    &_hidden {
      visibility: hidden;

      opacity: 0;

      pointer-events: none;

      transform: translateY(-4px);
    }

    .currency-select_footer & {
      width: 100%;
      max-height: min(200px, calc(100vh - 80px));
    }
  }

  &__options {
    display: flex;
    flex-direction: column;

    width: 100%;
    min-width: max-content;

    margin: 0;
    padding: 0;

    list-style: none;
  }

  &__options_top {
    flex-direction: column-reverse;
  }

  &__option {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 38px;

    padding: 8px 7px;

    background-color: transparent;

    color: var(--fourth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;
    letter-spacing: 0px;
    text-align: center;
    white-space: nowrap;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }

    &_pointed {
    }

    &_selected {
      background-color: var(--bg-fourth-color);

      color: var(--hint-primary-color);

      pointer-events: none;
    }

    &_selected.dropdown__option_pointed {
      background-color: var(--bg-fourth-color);

      color: var(--hint-primary-color);
    }

    &_disabled {
      opacity: 0.5;

      cursor: default;
      pointer-events: none;
    }
  }

  &__empty {
    padding: 12px;

    color: var(--hint-primary-color);
    font-size: 13px;
    text-align: center;
  }

  &__fake-input {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 1px;

    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: transparent;

    appearance: none;
  }

  &__assist {
    position: absolute;

    overflow: hidden;

    width: 1px;
    height: 1px;

    margin: -1px;

    white-space: nowrap;

    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  &__spacer {
    height: 1px;
  }
}
</style>
