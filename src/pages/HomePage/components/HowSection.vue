<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCS2 = () => {
  router.push({
    name: 'ProductListPage',
    query: { category: 'cs2' },
  })
}
</script>

<template>
  <section class="how">
    <div class="how__inner _cnt">
      <div class="how__info">
        <div class="how__label">
          {{ $t('HOW IT WORKS') }}
        </div>
        <div class="how__title _h2">
          {{ $t('YOUR NEXT ITEM') }}
          <span>{{ $t('IS JUST A FEW ') }}</span>
          {{ $t('STEPS AWAY') }}
        </div>
        <BaseButton @click="goToCS2" class="how__button">
          {{ $t('Start Exploring') }}
        </BaseButton>
      </div>
      <div class="how__items">
        <div class="how__item">
          <div class="how__number">01</div>
          <div class="how__content">
            <div class="how__subtitle">{{ $t('Create Your Account') }}</div>
            <div class="how__text">
              {{
                $t(
                  'Sign up with your email address and password to create your personal Relic Forge account.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">02</div>
          <div class="how__content">
            <div class="how__subtitle">
              {{ $t('Explore the Collection') }}
            </div>
            <div class="how__text">
              {{
                $t(
                  'Browse CS2 and Dota 2 skins, explore different categories, and find the items that suit your preferences.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">03</div>
          <div class="how__content">
            <div class="how__subtitle">{{ $t('Choose Your Items') }}</div>
            <div class="how__text">
              {{
                $t(
                  'Open a product page to review the available item details and price before making your purchase.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">04</div>
          <div class="how__content">
            <div class="how__subtitle">
              {{ $t('Complete Your Purchase') }}
            </div>
            <div class="how__text">
              {{
                $t(
                  'Follow the checkout instructions to complete your order using one of the available payment methods.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">05</div>
          <div class="how__content">
            <div class="how__subtitle">{{ $t('Receive Your Items') }}</div>
            <div class="how__text">
              {{
                $t(
                  'Follow the instructions provided after purchase to receive your items. Delivery methods and estimated delivery times should be displayed clearly during checkout or in the relevant order information.',
                )
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.how {
  @include adaptiveValue('padding-top', 165, 30);
  &__inner {
    @media (min-width: $md3) {
      display: flex;
      justify-content: space-between;
      gap: 20px;
    }
  }

  &__info {
    width: fit-content;
    align-self: center;
    text-shadow: 2px 2px 2px var(--third-color);
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 22px;
      }
    }
  }

  &__label {
    text-transform: uppercase;
    color: var(--sixth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__title {
    color: var(--secondary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
    @media (min-width: $md3) {
      span {
        display: block;
      }
    }
  }

  &__button {
    max-width: 284px;
  }

  &__items {
    @media (min-width: $md3) {
      @include adaptiveValue('max-width', 588, 350, 1470, 992, 1);
    }
  }

  &__item {
    display: flex;
    @include adaptiveValue('gap', 30, 18);
    text-shadow: 2px 2px 2px var(--third-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    @include adaptiveValue('min-width', 65, 45);
    @include adaptiveValue('height', 65, 45);
    text-shadow: none;
    color: var(--third-color);
    font-weight: 900;
    font-family: var(--font-orbitron);
    background-image: url('@/assets/img/how-number-bg.svg');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }

  &__content {
    flex: 1 1 auto;
  }

  &__subtitle {
    color: var(--secondary-color);
    font-weight: 700;
    &:not(:last-child) {
      margin-bottom: 7px;
    }
  }

  &__text {
    color: var(--fourth-color);
  }
}
</style>
