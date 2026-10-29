<template>
  <section class="cart">
    <div class="cart__inner _cnt">
      <div class="cart__top">
        <h1 class="cart__title _h2">
          {{ $t('CART') }}
        </h1>
      </div>

      <div
        v-if="cartStore.isLoading && !cartStore.items.length"
        class="cart__loading"
      >
        <LoadingSpinner />
      </div>

      <div v-else-if="cartStore.error && cartStore.isEmpty" class="cart__empty">
        <p class="cart__empty-text">{{ cartStore.error }}</p>
        <BaseButton class="cart__empty-button" @click="loadCart">
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="!cartStore.isEmpty" class="cart__content">
        <div class="cart__items-column">
          <CartItemsList class="cart__items" />
        </div>

        <CartForm class="cart__form" @top-up-click="emit('top-up-click')" />
      </div>

      <div v-else class="cart__empty">
        <div class="cart__empty-text">
          {{
            $t('Cart is empty now. Explore the Shop and add something here.')
          }}
        </div>

        <RouterLink :to="marketRoute" class="cart__empty-link">
          <BaseButton variant="white-bordered">
            {{ $t('Browse Skins') }}
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useGame } from '@/composables/useGame'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

import CartForm from './components/CartForm.vue'
import CartItemsList from './components/CartItemsList.vue'

const emit = defineEmits(['checkout-open', 'top-up-click'])

const authStore = useAuthStore()
const cartStore = useCartStore()
const { marketRoute } = useGame()

const loadCart = async () => {
  if (!authStore.isAuthenticated || cartStore.isLoading) return

  await cartStore.fetchCartContent()
}

onMounted(loadCart)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-height: 100vh;

  background-color: var(--bg-primary-color);

  @include adaptiveValue('padding-top', 110, 75);
  @include adaptiveValue('padding-bottom', 150, 60);

  &__inner {
    width: 100%;
    max-width: 1130px;
  }

  &__top {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 52, 25);
    }
  }

  &__title {
    margin: 0;
    color: var(--third-color);
    text-align: center;
    text-transform: uppercase;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 0.83fr) minmax(0, 1.17fr);
    align-items: start;

    @include adaptiveValue('gap', 16, 12);
  }

  &__items-column {
    min-width: 0;
  }

  &__items {
    width: 100%;
  }

  &__form {
    min-width: 0;
    width: 100%;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 25px;
    min-height: 300px;
    padding: 40px 20px;
    border: 1px solid rgba(153, 161, 176, 0.12);
    border-radius: 12px;
    background: #111821;
    text-align: center;
  }

  &__empty-text {
    max-width: 420px;
    color: var(--fifth-color);
    font-family: var(--font-inter);
    font-size: 15px;
    line-height: 1.6;
  }

  &__empty-link,
  &__empty-button {
    display: block;
    width: 100%;
    max-width: 230px;
  }

  @media (max-width: $md3) {
    &__content {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }

    &__inner {
      max-width: 680px;
    }
  }

  @media (max-width: $md5) {
    &__inner {
      padding-left: 10px;
      padding-right: 10px;
    }

    &__content {
      gap: 15px;
    }

    &__empty {
      min-height: 240px;
    }
  }
}
</style>
