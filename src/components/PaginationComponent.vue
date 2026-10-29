<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
    <button
      type="button"
      class="pagination__control pagination__control_prev"
      :disabled="safeCurrentPage <= 1"
      aria-label="Previous page"
      @click="changePage(safeCurrentPage - 1)"
    >
      <SvgIcon
        :icon="ArrowDownIcon"
        class="pagination__control-icon pagination__control-icon_prev"
      />
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
            'is-active': safeCurrentPage === item.value,
          }"
          :aria-current="safeCurrentPage === item.value ? 'page' : undefined"
          :aria-label="`Page ${item.value}`"
          :disabled="safeCurrentPage === item.value"
          @click="changePage(item.value)"
        >
          {{ item.value }}
        </button>
      </template>
    </div>

    <button
      type="button"
      class="pagination__control pagination__control_next"
      :disabled="safeCurrentPage >= totalPages"
      aria-label="Next page"
      @click="changePage(safeCurrentPage + 1)"
    >
      <SvgIcon :icon="ArrowDownIcon" class="pagination__control-icon" />
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

import { ArrowDownIcon } from '@/components/icons'
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
    default: 3,
  },
})

const emit = defineEmits(['update:current-page'])

const safeCurrentPage = computed(() => {
  const total = Math.max(1, Math.floor(props.totalPages || 1))
  const current = Math.floor(props.currentPage || 1)

  return Math.min(Math.max(current, 1), total)
})

const displayedPages = computed(() => {
  const total = Math.max(0, Math.floor(props.totalPages || 0))
  const current = safeCurrentPage.value
  const visibleCount = Math.max(1, Math.floor(props.maxDisplayedPages || 3))

  if (total === 0) return []

  if (total <= visibleCount + 2) {
    return Array.from({ length: total }, (_, index) => ({
      value: index + 1,
      isEllipsis: false,
    }))
  }

  let start = Math.max(1, current - Math.floor((visibleCount - 1) / 2))

  let end = Math.min(total, start + visibleCount - 1)

  start = Math.max(1, end - visibleCount + 1)

  const pageNumbers = new Set([1, total])

  for (let page = start; page <= end; page += 1) {
    pageNumbers.add(page)
  }

  const sortedPages = [...pageNumbers].sort((a, b) => a - b)
  const result = []

  sortedPages.forEach((page, index) => {
    if (index > 0) {
      const previousPage = sortedPages[index - 1]
      const gap = page - previousPage

      if (gap === 2) {
        result.push({
          value: previousPage + 1,
          isEllipsis: false,
        })
      } else if (gap > 2) {
        result.push({
          value: null,
          isEllipsis: true,
        })
      }
    }

    result.push({
      value: page,
      isEllipsis: false,
    })
  })

  return result
})

const changePage = page => {
  if (page < 1 || page > props.totalPages || page === safeCurrentPage.value) {
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
  justify-content: center;
  width: 100%;
  gap: clamp(3px, 0.7vw, 10px);

  &__pages {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(3px, 0.7vw, 10px);
    min-width: 0;
  }

  &__control,
  &__page,
  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    width: clamp(27px, 8.7vw, 50px);
    height: clamp(27px, 8.7vw, 50px);
    padding: 0;

    border: 1px solid var(--border-third-color);
    border-radius: 6px;

    background-color: var(--bg-third-color);

    font-family: var(--font-inter);
    font-size: clamp(12px, 1.2vw, 16px);
    font-weight: 400;
    line-height: 1;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.3s ease;

    user-select: none;
  }

  &__page {
    color: rgba(153, 161, 176, 0.5);
    cursor: pointer;

    &.is-active {
      color: var(--third-color);
      border-color: var(--border-primary-color);
      background-color: var(--bg-third-color);
      font-weight: 500;
      cursor: default;
      opacity: 1;
    }

    @media (any-hover: hover) {
      &:not(.is-active):hover {
        color: var(--third-color);
        border-color: var(--hint-primary-color);
        background-color: var(--bg-fourth-color);
      }
    }
  }

  &__ellipsis {
    color: rgba(153, 161, 176, 0.5);
    pointer-events: none;
  }

  &__control {
    color: var(--hint-primary-color);
    border-color: var(--hint-primary-color);
    cursor: pointer;

    &-icon {
      display: block;
      width: 6px;
      height: 10px;
      flex: 0 0 6px;
      color: inherit;

      &_prev {
        transform: rotate(180deg);
      }
    }

    &:disabled {
      color: rgba(153, 161, 176, 0.45);
      border-color: var(--border-third-color);
      background-color: var(--bg-third-color);
      cursor: not-allowed;
      opacity: 1;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--third-color);
        border-color: var(--hint-primary-color);
        background-color: var(--hint-primary-color);
        box-shadow: 0 0 12px rgba(26, 115, 255, 0.15);
      }
    }
  }

  &__control:focus-visible,
  &__page:focus-visible {
    outline: 2px solid var(--hint-primary-color);
    outline-offset: 3px;
  }

  @media (max-width: $md6) {
    &__control,
    &__page,
    &__ellipsis {
      border-radius: 5px;
    }
  }
}
</style>
