<template>
  <section class="products">
    <div class="products__inner _cnt">
      <h1 class="products__title _h2">
        {{ $t('Market') }}
      </h1>

      <div class="products__layout">
        <AsideFilters
          class="products__aside"
          :class="{ 'is-open': isAsideFiltersOpen }"
          :filters="filters"
          :available-filters="availableFilters"
          :current-game="currentGame"
          :update-filters="updateFilters"
          :reset-filters="resetFilters"
        />

        <div class="products__main">
          <TopFilters
            v-model:filters-open="isAsideFiltersOpen"
            class="products__top"
            :filters="filters"
            :current-game="currentGame"
            :sort-options="SORT_OPTIONS"
            :update-filters="updateFilters"
            :set-category="setCategory"
          />

          <div v-if="error" class="products__status">
            <p class="_text-error">{{ error }}</p>

            <BaseButton @click="fetchProductsImmediate">
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <LoadingSpinner
            v-else-if="!ready || loading"
            class="products__loading"
          />

          <div v-else-if="products.length" class="products__items">
            <div
              v-for="product in products"
              :key="product.id"
              class="products__item"
            >
              <ProductCard :product="product" />
            </div>
          </div>

          <div v-else class="products__status">
            <p>{{ $t('No products found') }}</p>

            <BaseButton variant="bordered" @click="resetFilters">
              {{ $t('Reset filters') }}
            </BaseButton>
          </div>

          <div
            v-if="!loading && !error && totalPages > 1"
            class="products__bottom"
          >
            <PaginationComponent
              :total-pages="totalPages"
              :current-page="Number(filters.page)"
              @update:current-page="onPageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductList } from '@/composables/useProductList'
import AsideFilters from '@/pages/ProductsPage/components/AsideFilters.vue'
import TopFilters from '@/pages/ProductsPage/components/TopFilters.vue'

const {
  SORT_OPTIONS,
  products,
  loading,
  error,
  ready,
  filters,
  availableFilters,
  currentGame,
  pagination,
  updateFilters,
  resetFilters,
  setCategory,
  fetchProductsImmediate,
} = useProductList()

const isAsideFiltersOpen = ref(false)

const totalPages = computed(() => {
  const perPage = Number(filters.perPage) || 25

  return Math.ceil(Number(pagination.total || 0) / perPage)
})

const onPageChange = async page => {
  await updateFilters({ page })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.products {
  @include adaptiveValue('padding-top', 150, 80);
  @include adaptiveValue('padding-bottom', 100, 30);

  background-color: var(--bg-primary-color);
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  &__inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  &__title {
    margin-bottom: clamp(35px, 4vw, 55px);
    color: var(--third-color);
    text-align: center;
    text-transform: uppercase;
  }

  &__layout {
    display: grid;
    grid-template-columns:
      minmax(195px, 238px)
      minmax(0, 1fr);
    gap: 16px;
    height: inherit;
    min-height: inherit;
  }

  &__aside {
    min-width: 0;
  }

  &__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
  }

  &__item {
    min-width: 0;
    height: 100%;

    :deep(.card) {
      height: 100%;
    }
  }

  &__status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    min-height: 280px;
    text-align: center;
    color: var(--fifth-color);
  }

  &__loading {
    margin: auto;
  }

  &__bottom {
    display: flex;
    justify-content: center;
    margin-top: clamp(30px, 4vw, 50px);
  }

  @media (max-width: 1150px) {
    &__items {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 1050px) {
    &__items {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: $md3) {
    &__layout {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    &__top {
      order: 0;
    }

    &__aside {
      order: 1;
      display: none;
      width: 100%;
      margin-bottom: 18px;

      &.is-open {
        display: block;
      }
    }

    &__main {
      display: contents;
    }

    &__items,
    &__bottom,
    &__status,
    &__loading {
      order: 2;
      width: 100%;
    }

    &__bottom {
      order: 3;
    }

    &__items {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    &__items {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 540px) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
