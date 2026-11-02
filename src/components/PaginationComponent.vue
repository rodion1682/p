<template>
  <div class="pagination">
    <button
      class="pagination__control pagination__control_left"
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <SvgIcon :icon="ChevronDownIcon" class="pagination__control-icon" />
    </button>

    <div class="pagination__pages">
      <template v-for="(item, index) in displayedPages" :key="index">
        <button
          v-if="!item.isEllipsis"
          class="pagination__page"
          :class="{ 'is-active': currentPage === item.value }"
          @click="changePage(item.value)"
        >
          {{ item.value }}
        </button>

        <span v-else class="pagination__ellipsis">...</span>
      </template>
    </div>

    <button
      class="pagination__control pagination__control_right"
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      <SvgIcon
        :icon="ChevronDownIcon"
        class="pagination__control-icon pagination__control-icon_second"
      />
    </button>
  </div>
</template>

<script setup>
import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed } from 'vue'

const props = defineProps({
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, required: true, default: 1 },
  maxDisplayedPages: { type: Number, default: 7 },
})

const emit = defineEmits(['update:current-page'])

const displayedPages = computed(() => {
  const pages = []

  if (props.totalPages <= props.maxDisplayedPages) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push({ value: i, isEllipsis: false })
    }
  } else {
    pages.push({ value: 1, isEllipsis: false })

    let startPage = Math.max(2, props.currentPage - 2)
    let endPage = Math.min(props.totalPages - 1, props.currentPage + 2)

    if (props.currentPage - 1 <= 3) endPage = 5
    if (props.totalPages - props.currentPage <= 3)
      startPage = props.totalPages - 4

    if (startPage > 2) pages.push({ value: null, isEllipsis: true })

    for (let i = startPage; i <= endPage; i++) {
      pages.push({ value: i, isEllipsis: false })
    }

    if (endPage < props.totalPages - 1)
      pages.push({ value: null, isEllipsis: true })

    pages.push({ value: props.totalPages, isEllipsis: false })
  }

  return pages
})

function changePage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:current-page', page)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  @include adaptiveValue('gap', 8, 4);
  &__pages {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 8, 4);
  }
  &__control,
  &__page {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease 0s;
    font-weight: 400;
    background-color: transparent;
    padding: 0px;
    font-size: 14px;
    line-height: 100%;
    @include adaptiveValue('min-height', 32, 40);
    @include adaptiveValue('min-width', 32, 40);
    border-radius: 6px;
    font-family: var(--font-open-sans);
    color: var(--primary-color);
    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }
    @media (max-width: $md6) {
      flex: 1 1 auto;
      max-width: none;
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-primary-color);
      }
    }
    &-icon {
      color: var(--primary-color);
      min-width: 12px;
      height: 12px;

      &_second {
      }
    }
  }
  &__control {
    display: flex;
    align-items: center;
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
    @media (any-hover: hover) {
      &:hover {
        color: var(--bg-primary-color);
        background-color: var(--hint-primary-color);
        .pagination__control-icon {
          color: var(--bg-primary-color);
        }
      }
    }
    @media (max-width: $md6) {
      @include hide-item;
    }
  }
  &__page {
    @media (any-hover: hover) {
      &:hover {
        color: var(--bg-primary-color);
        background-color: var(--hint-primary-color);
      }
    }
    &.is-active {
      pointer-events: none;
      color: var(--bg-primary-color);
      background-color: var(--hint-primary-color);
      font-weight: 700;
    }
  }

  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
