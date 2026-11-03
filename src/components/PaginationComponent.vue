<template>
  <nav
    v-if="totalPages > 1"
    class="pagination"
    :class="{
      'variant-products': variant === 'products',
    }"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="pagination__control pagination__control_left"
      :disabled="currentPage <= 1"
      :aria-label="$t('Previous page')"
      @click="changePage(currentPage - 1)"
    >
      <SvgIcon :icon="ChevronDownIcon" class="pagination__control-icon" />
    </button>

    <div class="pagination__pages">
      <template
        v-for="(item, index) in displayedPages"
        :key="item.isEllipsis ? `ellipsis-${index}` : item.value"
      >
        <span
          v-if="item.isEllipsis"
          class="pagination__ellipsis"
          aria-hidden="true"
        >
          ...
        </span>

        <button
          v-else
          type="button"
          class="pagination__page"
          :class="{
            'is-active': currentPage === item.value,
          }"
          :aria-label="`${$t('Page')} ${item.value}`"
          :aria-current="currentPage === item.value ? 'page' : undefined"
          :disabled="currentPage === item.value"
          @click="changePage(item.value)"
        >
          {{ item.value }}
        </button>
      </template>
    </div>

    <button
      type="button"
      class="pagination__control pagination__control_right"
      :disabled="currentPage >= totalPages"
      :aria-label="$t('Next page')"
      @click="changePage(currentPage + 1)"
    >
      <SvgIcon :icon="ChevronDownIcon" class="pagination__control-icon" />
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },

  currentPage: {
    type: Number,
    default: 1,
  },

  maxDisplayedPages: {
    type: Number,
    default: 7,
  },

  variant: {
    type: String,
    default: 'default',
  },
})

const emit = defineEmits(['update:current-page'])

const displayedPages = computed(() => {
  const total = Math.max(0, Math.floor(props.totalPages))
  const current = Math.min(
    Math.max(1, Math.floor(props.currentPage)),
    Math.max(1, total),
  )

  // Keep the maximum number of page buttons configurable.
  // Minimum of 3 allows first, current and last pages.
  const maxVisible = Math.max(3, Math.floor(props.maxDisplayedPages))

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, index) => ({
      value: index + 1,
      isEllipsis: false,
    }))
  }

  const middleCount = maxVisible - 2

  let start = current - Math.floor(middleCount / 2)
  let end = start + middleCount - 1

  if (start < 2) {
    start = 2
    end = start + middleCount - 1
  }

  if (end > total - 1) {
    end = total - 1
    start = end - middleCount + 1
  }

  // Replace gaps of one page with that page,
  // instead of displaying an unnecessary ellipsis.
  if (start === 3) {
    start = 2
  }

  if (end === total - 2) {
    end = total - 1
  }

  const pages = [{ value: 1, isEllipsis: false }]

  if (start > 2) {
    pages.push({ value: null, isEllipsis: true })
  }

  for (let page = start; page <= end; page++) {
    pages.push({
      value: page,
      isEllipsis: false,
    })
  }

  if (end < total - 1) {
    pages.push({ value: null, isEllipsis: true })
  }

  pages.push({
    value: total,
    isEllipsis: false,
  })

  return pages
})

const changePage = page => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) {
    return
  }

  emit('update:current-page', page)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  width: 100%;
  min-width: 0;

  @include adaptiveValue('gap', 8, 4);

  &__pages {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;

    @include adaptiveValue('gap', 8, 4);
  }

  &__control,
  &__page {
    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    @include adaptiveValue('width', 36, 30);
    @include adaptiveValue('height', 36, 30);

    padding: 0;

    border: 1px solid transparent;
    border-radius: 6px;

    background-color: transparent;
    color: var(--primary-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 100%;

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease;

    &:disabled {
      cursor: default;
    }

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 2px;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        background-color: var(--hint-primary-color);
        color: var(--secondary-color);
      }
    }
  }

  &__control {
    &-icon {
      width: 12px;
      min-width: 12px;
      height: 12px;

      color: inherit;
    }

    &_left {
      .pagination__control-icon {
        transform: rotate(90deg);
      }
    }

    &_right {
      .pagination__control-icon {
        transform: rotate(-90deg);
      }
    }

    &:disabled {
      opacity: 0.4;
    }
  }

  &__page {
    &.is-active {
      background-color: var(--hint-primary-color);
      color: var(--secondary-color);
      border-color: var(--hint-primary-color);

      font-weight: 700;
      opacity: 1;
    }
  }

  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-width', 24, 12);
    height: 36px;

    color: var(--hint-third-color);
    font-family: var(--font-inter);
    font-size: 14px;

    user-select: none;
  }

  // PRODUCTS VARIANT
  &.variant-products {
    .pagination__control,
    .pagination__page {
      background-color: var(--bg-third-color);
      border-color: var(--border-primary-color);
      color: var(--primary-color);

      border-radius: 5px;

      font-family: var(--font-inter);
      font-size: 13px;
      font-weight: 500;

      @media (any-hover: hover) {
        &:not(:disabled):hover {
          background-color: var(--bg-fourth-color);
          border-color: var(--hint-primary-color);
          color: var(--hint-primary-color);
        }
      }
    }

    .pagination__control {
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .pagination__page {
      &.is-active {
        background-color: var(--hint-primary-color);
        border-color: var(--hint-primary-color);
        color: var(--secondary-color);

        font-weight: 700;
        opacity: 1;
      }
    }

    .pagination__ellipsis {
      color: var(--hint-third-color);
    }
  }

  @media (max-width: $md6) {
    justify-content: center;

    &__control,
    &__page {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    &__pages {
      gap: 4px;
    }
  }

  @media (max-width: $md8) {
    &__control,
    &__page {
      width: 28px;
      height: 30px;
    }

    &__ellipsis {
      min-width: 10px;
      font-size: 12px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .pagination {
    &__control,
    &__page {
      transition: none;
    }
  }
}
</style>
