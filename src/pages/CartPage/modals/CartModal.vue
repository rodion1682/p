<template>
  <BaseModal
    :show="show"
    :wrapperClasses="['cart-modal__inner']"
    @close="handleClose"
  >
    <div class="cart-modal">
      <div class="cart-modal__title _h3">
        {{ $t('My Cart') }}
        <div v-if="false" class="cart-modal__text">
          {{ cartItemsCount }}
          {{ cartItemsCount === 1 ? $t('item') : $t('items') }}
          {{ $t('in the cart') }}
        </div>
      </div>

      <LoadingSpinner v-if="cartStore.isLoading" class="cart-modal__loading" />

      <template v-else-if="!cartStore.isEmpty">
        <div class="cart-modal__content">
          <CartItemsList class="cart-modal__items" />

          <div class="cart-modal__summary">
            <CartSummary />
          </div>
        </div>
      </template>

      <div v-else class="cart-modal__empty">
        <div class="cart-modal__empty-title _h3">
          {{ $t('Your Cart is Empty') }}
        </div>

        <div class="cart-modal__empty-subtitle">
          {{ $t(`Looks like you haven't added any items yet.`) }}
        </div>

        <BaseButton class="cart-modal__empty-button" @click="goToShop">
          {{ $t('Go back to Shop') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

import CartItemsList from '@/pages/CartPage/components/CartItemsList.vue'
import CartSummary from '@/pages/CartPage/components/CartSummary.vue'

import { useCartStore } from '@/stores/cart'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'update:show'])

const router = useRouter()
const cartStore = useCartStore()

const { cartItemsCount } = storeToRefs(cartStore)

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const goToShop = async () => {
  handleClose()

  await router.push({
    name: 'ProductListPage',
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cart-modal {
  width: 100%;

  &__top {
    display: flex;
    align-items: flex-end;

    @include adaptiveValue('gap', 16, 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__info {
    display: flex;
    align-items: flex-end;

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
    color: var(--secondary-color);
  }

  &__payment-title {
    text-transform: uppercase;

    @media (min-width: $md3) {
      flex: 0 1 33%;
    }

    @media (max-width: $md3) {
      @include hide-item;
    }
  }

  &__loading {
    margin: 40px auto;
  }

  &__content {
    @media (min-width: $md4) {
      display: flex;

      @include adaptiveValue('gap', 16, 10);
    }
  }

  &__items {
    flex: 0 1 55%;
    @media (max-width: $md2) {
      flex: 0 1 60%;
    }
    @media (max-width: $md3) {
      flex: 0 1 65%;
    }

    @media (max-width: $md4) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__summary {
    flex: 0 1 45%;

    @media (max-width: $md2) {
      flex: 0 1 40%;
    }
    @media (max-width: $md3) {
      flex: 0 1 35%;
    }
  }

  &__empty {
    text-align: center;

    @include adaptiveValue('padding-top', 40, 20);
    @include adaptiveValue('padding-bottom', 40, 20);

    &-title {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
    }

    &-subtitle {
      color: var(--secondary-color);

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 25, 15);
      }
    }

    &-button {
      max-width: 300px;
      margin: 0 auto;
    }
  }
}
</style>
