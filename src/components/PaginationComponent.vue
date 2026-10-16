<template>
  <nav class="pagination" :class="props.className" aria-label="Pagination">
    <button
      type="button"
      class="pagination__control pagination__control_previous"
      :disabled="isFirstPage"
      aria-label="Previous page"
      @click="changePage(props.currentPage - 1)"
    >
      <SvgIcon
        class="pagination__control-icon pagination__control-icon_previous"
        :icon="PaginationArrowIcon"
      />
    </button>

    <div class="pagination__pages">
      <template v-for="item in displayedPages" :key="item.key">
        <span
          v-if="item.isEllipsis"
          class="pagination__ellipsis"
          aria-hidden="true"
        >
          <span class="pagination__dot"></span>
          <span class="pagination__dot"></span>
          <span class="pagination__dot"></span>
        </span>

        <button
          v-else
          type="button"
          class="pagination__page"
          :class="{
            pagination__page_active: props.currentPage === item.value,
          }"
          :aria-label="`Go to page ${item.value}`"
          :aria-current="props.currentPage === item.value ? 'page' : undefined"
          @click="changePage(item.value)"
        >
          {{ item.value }}
        </button>
      </template>
    </div>
    <button
      type="button"
      class="pagination__control pagination__control_next"
      :disabled="isLastPage"
      aria-label="Next page"
      @click="changePage(props.currentPage + 1)"
    >
      <SvgIcon
        class="pagination__control-icon pagination__control-icon_next"
        :icon="PaginationArrowIcon"
      />
    </button>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { PaginationArrowIcon } from '@/components/icons'
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

  className: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:current-page'])

const isMobile = ref(false)

let mobileMediaQuery = null

const isFirstPage = computed(() => {
  return props.currentPage <= 1
})

const isLastPage = computed(() => {
  return props.currentPage >= props.totalPages
})

const createPage = value => ({
  key: `page-${value}`,
  value,
  isEllipsis: false,
})

const createEllipsis = position => ({
  key: `ellipsis-${position}`,
  value: null,
  isEllipsis: true,
})

const displayedPages = computed(() => {
  const total = Math.max(Number(props.totalPages) || 1, 1)

  const current = Math.min(Math.max(Number(props.currentPage) || 1, 1), total)

  const configuredMaximum = Math.max(Number(props.maxDisplayedPages) || 7, 5)

  const maximum = isMobile.value ? 5 : configuredMaximum

  if (total <= maximum) {
    return Array.from({ length: total }, (_, index) => createPage(index + 1))
  }

  const pages = []

  if (current <= 4) {
    const endingPage = Math.min(maximum - 2, total - 1)

    for (let page = 1; page <= endingPage; page += 1) {
      pages.push(createPage(page))
    }

    pages.push(createEllipsis('end'))
    pages.push(createPage(total))

    return pages
  }

  if (current >= total - 3) {
    pages.push(createPage(1))
    pages.push(createEllipsis('start'))

    const startingPage = Math.max(total - (maximum - 3), 2)

    for (let page = startingPage; page <= total; page += 1) {
      pages.push(createPage(page))
    }

    return pages
  }

  pages.push(createPage(1))
  pages.push(createEllipsis('start'))
  pages.push(createPage(current - 1))
  pages.push(createPage(current))
  pages.push(createPage(current + 1))
  pages.push(createEllipsis('end'))
  pages.push(createPage(total))

  return pages
})

const changePage = page => {
  const nextPage = Number(page)

  if (
    !Number.isInteger(nextPage) ||
    nextPage < 1 ||
    nextPage > props.totalPages ||
    nextPage === props.currentPage
  ) {
    return
  }

  emit('update:current-page', nextPage)
}

const updateMobileState = event => {
  isMobile.value = event.matches
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 640px)')

  isMobile.value = mobileMediaQuery.matches

  mobileMediaQuery.addEventListener('change', updateMobileState)
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', updateMobileState)
})
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 6px;

  width: fit-content;

  &__pages {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  &__control {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    min-width: 40px;
    height: 40px;

    padding: 0;

    outline: none;
    background-color: transparent;
    opacity: 0.7;

    color: var(--secondary-color);

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
      pointer-events: none;
    }

    &:focus-visible {
      opacity: 1;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        opacity: 1;
      }
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__control-icon {
    width: 18px;
    height: 18px;

    color: inherit;

    transition: transform 0.3s ease;

    &_previous {
      transform: rotate(0deg);
    }

    &_next {
      transform: rotate(-180deg);
    }
  }

  &__page {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 40px;
    height: 40px;

    padding: 0px;

    border: 1.5px solid transparent;
    border-radius: 6px;
    outline: none;
    background-color: transparent;
    opacity: 0.7;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-family: 16px;
    font-weight: 500;
    line-height: 1;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &_active {
      border-color: var(--border-priamry-color);
      opacity: 1;

      color: var(--primary-color);

      cursor: default;
      pointer-events: none;
    }

    &:focus-visible {
      border-color: var(--border-priamry-color);
      opacity: 1;

      color: var(--primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        opacity: 1;

        color: var(--primary-color);
      }
    }
  }

  &__ellipsis {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;

    width: 20px;
    height: 15px;
  }

  &__dot {
    width: 3px;
    height: 3px;

    border-radius: 50%;
    background-color: var(--secondary-color);
    opacity: 0.7;
  }
}
</style>
