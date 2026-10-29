<template>
  <div class="cart-list">
    <div class="cart-list__items">
      <article
        v-for="row in cartStore.items"
        :key="row.item_id"
        class="cart-list__item"
      >
        <div class="cart-list__media">
          <img
            v-if="getImageUrl(row.item?.img_url)"
            :src="getImageUrl(row.item?.img_url)"
            :alt="getItemName(row.item)"
            loading="lazy"
          />

          <span v-else class="cart-list__placeholder">
            {{ getGameName(row.item) || 'Skin' }}
          </span>
        </div>

        <div class="cart-list__information">
          <div class="cart-list__name" :title="getItemName(row.item)">
            {{ getItemName(row.item) }}
          </div>

          <div v-if="getGameName(row.item)" class="cart-list__game">
            {{ getGameName(row.item) }}
          </div>

          <PriceFormatter
            skip-conversion
            size="size-13"
            class="cart-list__price"
            :price="getRowPrice(row)"
          />

          <div
            v-if="cartStore.getItemError(row.item_id)"
            class="cart-list__error"
          >
            {{ cartStore.getItemError(row.item_id) }}
          </div>
        </div>

        <button
          type="button"
          class="cart-list__remove"
          :disabled="cartStore.isItemLoading(row.item_id)"
          :aria-label="`Remove ${getItemName(row.item)} from cart`"
          @click="removeItem(row.item_id)"
        >
          <SvgIcon :icon="TrashIcon" class="cart-list__remove-icon" />
        </button>
      </article>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import PriceFormatter from '@/components/PriceFormatter.vue'
import { TrashIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const getImageUrl = image => {
  const url = String(image || '').trim()

  if (!url) return ''

  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) {
    return url
  }

  const domain = STATIC_DOMAIN.replace(/\/+$/, '')
  const path = url.replace(/^\/+/, '')

  return domain ? `${domain}/${path}` : `/${path}`
}

const getItemName = item => {
  const title = String(item?.title || item?.name || '')
    .replace(/StatTrak™\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/★\s*/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()

  const parts = title.split('|').map(value => value.trim())

  return parts.length > 1 ? parts.slice(1).join(' | ') : title
}

const getGameName = item => {
  const category = String(
    item?.category?.url_code || item?.category || item?.game_code || '',
  )
    .toLowerCase()
    .replace(/[\s_-]/g, '')

  if (category === 'cs2' || category === 'csgo') return 'CS2'
  if (category === 'dota2') return 'Dota 2'

  return ''
}

const getRowPrice = row => {
  const price = Number(row.item?.internal_price ?? row.item?.price ?? 0)
  const count = cartStore.getQty(row.item_id, row.count ?? 1)

  return Number.isFinite(price) ? Number((price * count).toFixed(2)) : 0
}

const removeItem = async itemId => {
  if (itemId == null || cartStore.isItemLoading(itemId)) return

  const result = await cartStore.removeFromCart(itemId)

  if (result?.success) {
    toast.success(t('Item removed from cart'))
  } else {
    toast.error(result?.error || t('Failed to remove item'))
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.cart-list {
  width: 100%;

  &__items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr) 34px;
    align-items: center;
    gap: 14px;

    width: 100%;
    min-width: 0;
    min-height: 86px;
    padding: 10px 15px;

    border-radius: 10px;
    background-color: #111821;
    border: 1px solid transparent;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: #151e2a;
        border-color: rgba(153, 161, 176, 0.12);
      }
    }
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 84px;
    height: 62px;
    overflow: hidden;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }

  &__placeholder {
    color: var(--fifth-color);
    font-size: 11px;
  }

  &__information {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
  }

  &__name {
    width: 100%;
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__game {
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 11px;
    line-height: 1.3;
  }

  &__price {
    margin-top: 2px;
    color: var(--third-color);
  }

  &__error {
    color: var(--error-color);
    font-size: 11px;
    line-height: 1.4;
  }

  &__remove {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 34px;
    height: 34px;
    padding: 7px;

    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #f04b58;
    cursor: pointer;

    transition:
      background-color 0.3s ease,
      color 0.3s ease;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        background-color: rgba(240, 75, 88, 0.12);
        color: #ff7580;
      }
    }

    &:focus-visible {
      outline: 2px solid #f04b58;
      outline-offset: 2px;
    }
  }

  &__remove-icon {
    display: flex;
    width: 18px;
    height: 18px;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }

  @media (max-width: $md5) {
    &__item {
      grid-template-columns: 64px minmax(0, 1fr) 30px;
      gap: 10px;
      padding: 10px;
      min-height: 76px;
    }

    &__media {
      width: 64px;
      height: 56px;
    }

    &__name {
      font-size: 11px;
    }

    &__remove {
      width: 30px;
      height: 30px;
    }
  }
}
</style>
