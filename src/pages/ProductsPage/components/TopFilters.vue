<template>
  <div class="market-toolbar">
    <div class="market-toolbar__games" role="group" :aria-label="$t('Game')">
      <button
        type="button"
        class="market-toolbar__game"
        :class="{ 'is-active': activeGame === 'all' }"
        :aria-pressed="activeGame === 'all'"
        @click="changeGame('all')"
      >
        <SvgIcon class="market-toolbar__grid-icon" :icon="AllItems" />
        {{ $t('All items') }}
      </button>

      <button
        type="button"
        class="market-toolbar__game"
        :class="{ 'is-active': activeGame === 'cs2' }"
        :aria-pressed="activeGame === 'cs2'"
        @click="changeGame('cs2')"
      >
        <SvgIcon :icon="CS2" class="market-toolbar__game-icon" />
        {{ $t('CS2') }}
      </button>

      <button
        type="button"
        class="market-toolbar__game"
        :class="{ 'is-active': activeGame === 'dota2' }"
        :aria-pressed="activeGame === 'dota2'"
        @click="changeGame('dota2')"
      >
        <SvgIcon :icon="DOTA2" class="market-toolbar__game-icon" />
        {{ $t('Dota 2') }}
      </button>
    </div>

    <BaseInput
      v-model="searchValue"
      class="market-toolbar__search"
      :placeholder="$t('Search')"
      autocomplete="off"
      aria-label="Search products"
    >
      <template #suffix>
        <SvgIcon :icon="SearchIcon" class="market-toolbar__search-icon" />
      </template>
    </BaseInput>

    <BaseDdropdown
      ref="sortDropdown"
      class="market-toolbar__sort"
      variant="sort"
      :label="sortLabel"
      absolute
    >
      <BaseCheckbox
        v-for="option in visibleSortOptions"
        :key="option.value"
        variant="radio"
        :model-value="filters.sort === option.value"
        @update:model-value="selectSort(option.value)"
      >
        {{ option.label }}
      </BaseCheckbox>
    </BaseDdropdown>

    <button
      type="button"
      class="market-toolbar__filter-toggle"
      :class="{ 'is-active': filtersOpen }"
      :aria-pressed="filtersOpen"
      @click="emit('update:filtersOpen', !filtersOpen)"
    >
      <SvgIcon :icon="FilterIcon" class="market-toolbar__filter-icon" />
      {{ $t('Filters') }}
    </button>
  </div>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'
import {
  AllItems,
  CS2,
  DOTA2,
  FilterIcon,
  SearchIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  filtersOpen: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    required: true,
  },
  currentGame: {
    type: String,
    default: 'cs2',
  },
  sortOptions: {
    type: Array,
    default: () => [],
  },
  updateFilters: {
    type: Function,
    required: true,
  },
  setCategory: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:filtersOpen'])

const sortDropdown = ref(null)
const searchValue = ref(String(props.filters.search || ''))

const activeGame = computed(() =>
  String(props.currentGame || 'cs2').toLowerCase(),
)

const visibleSortOptions = computed(() => [
  {
    value: 'desc',
    label: 'Price: High to Low',
  },
  {
    value: 'asc',
    label: 'Price: Low to High',
  },
])

const sortLabel = computed(() => {
  const option = visibleSortOptions.value.find(
    item => item.value === props.filters.sort,
  )

  return option ? option.label : 'Sort by price'
})

const debouncedSearch = debounce(value => {
  props.updateFilters({
    search: value.trim(),
    page: 1,
  })
}, 400)

watch(searchValue, value => {
  if (value !== String(props.filters.search || '')) {
    debouncedSearch(value)
  }
})

watch(
  () => props.filters.search,
  value => {
    const next = String(value || '')

    if (searchValue.value !== next) {
      debouncedSearch.cancel()
      searchValue.value = next
    }
  },
)

const changeGame = game => {
  if (game === activeGame.value) return

  debouncedSearch.cancel()
  props.setCategory(game)
}

const selectSort = value => {
  sortDropdown.value?.close()

  if (value === props.filters.sort) return

  props.updateFilters({
    sort: value,
    page: 1,
  })
}

onBeforeUnmount(() => {
  debouncedSearch.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.market-toolbar {
  display: grid;
  grid-template-columns:
    auto
    minmax(180px, 1fr)
    minmax(170px, 220px);
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  margin-bottom: 14px;

  &__games {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__game {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 15px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--fifth-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &.is-active {
      background: var(--bg-fourth-color);
      color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover:not(.is-active) {
        color: var(--third-color);
        background: rgba(153, 161, 176, 0.06);
      }
    }
  }

  &__grid-icon {
    width: 15px;
    height: 15px;
  }

  &__game-icon {
    display: flex;
    width: 16px;
    height: 16px;
    flex: 0 0 16px;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  &__search {
    min-width: 0;

    :deep(.base-input) {
      min-height: 44px;
      background: var(--bg-fourth-color);
      border-radius: 8px;
    }
  }

  &__search-icon {
    display: flex;
    width: 18px;
    height: 18px;
    color: var(--hint-primary-color);
  }

  &__sort {
    min-width: 0;
  }

  &__filter-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 15px;
    border: 1px solid rgba(153, 161, 176, 0.14);
    border-radius: 8px;
    background: var(--bg-fourth-color);
    color: var(--third-color);
    cursor: pointer;

    &.is-active {
      border-color: var(--hint-primary-color);
    }
  }

  &__filter-icon {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1350px) {
    grid-template-columns:
      1fr
      minmax(170px, 210px);

    &__games {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(160px, 200px)
      auto;
    gap: 8px;

    &__games {
      grid-column: 1 / -1;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    &__filter-toggle {
      display: flex;
    }
  }

  @media (max-width: 620px) {
    grid-template-columns:
      minmax(0, 1fr)
      auto;

    &__sort {
      grid-column: 1;
      grid-row: 3;
    }

    &__search {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    &__filter-toggle {
      grid-column: 2;
      grid-row: 3;
    }

    &__game {
      padding: 0 12px;
      font-size: 12px;
    }
  }
}
</style>
