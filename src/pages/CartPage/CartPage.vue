<template>
  <div class="cart">
    <div class="cart__inner _cnt-home">
      <div class="cart__top">
        <div class="cart__info">
          <div class="cart__title _h5">{{ $t('Cart') }}</div>
          <div class="cart__text">
            {{ cartItemsCount }}
            {{ cartItemsCount > 1 ? 'items' : 'item' }}
            {{ $t('in the cart') }}
          </div>
        </div>
        <div class="cart__subtitle _h5">
          {{ $t('Payment') }}
        </div>
      </div>
      <template v-if="cartStore.isLoading">
        <LoadingSpinner class="cart__loading" />
      </template>
      <!-- !cartStore.isEmpty -->
      <template v-else-if="!cartStore.isEmpty">
        <div class="cart__content">
          <CartItemsList class="cart__items" />
          <div class="cart__summary">
            <CartSummary />
          </div>
          <CartBalance v-if="false" class="cart__balance" />
        </div>
      </template>
      <template v-else>
        <div class="cart__empty">
          <div class="cart__empty-title _h3">
            {{ $t('Your Cart is Empty') }}
          </div>
          <div class="cart__empty-subtitle">
            {{ $t(`Looks like you haven't added any items yet.`) }}
          </div>
          <BaseButton
            class="cart__empty-link"
            @click="router.push({ name: 'ProductListPage' })"
          >
            {{ $t('Go back to Shop') }}
          </BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import CartSummary from '@/pages/CartPage//components/CartSummary.vue'
import CartBalance from '@/pages/CartPage/components/CartBalance.vue'
import CartItemsList from '@/pages/CartPage/components/CartItemsList.vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const router = useRouter()

const cartStore = useCartStore()
const { cartItemsCount } = storeToRefs(cartStore)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/components/classes' as *;

.cart {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  @include adaptiveValue('padding-top', 32, 25);
  @include adaptiveValue('padding-bottom', 100, 25);
  &__inner {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  &__top {
    display: flex;
    @include adaptiveValue('gap', 16, 10);
    align-items: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__info {
    display: flex;
    @include adaptiveValue('gap', 17, 10);
    @media (min-width: $md3) {
      flex: 0 1 67%;
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
    }
  }

  &__title {
    text-transform: uppercase;
  }

  &__text {
    align-self: flex-end;
    color: var(--secondary-color);
  }

  &__subtitle {
    @media (min-width: $md3) {
      text-transform: uppercase;
      flex: 0 1 33%;
    }
    @media (max-width: $md3) {
      @include hide-item;
    }
  }

  &__loading {
    margin: auto;
  }

  &__content {
    @media (min-width: $md3) {
      display: flex;
      @include adaptiveValue('gap', 16, 10);
    }
    @media (max-width: $md6) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }

  &__items {
    flex: 0 1 67%;
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__summary {
    flex: 0 1 33%;
  }

  &__empty {
    text-align: center;
    &-title {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 45, 15);
      }
    }

    &-subtitle {
      color: var(--secondary-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
    }

    &-link {
      max-width: 300px;
      margin: 0 auto;
    }
  }
}
</style>
