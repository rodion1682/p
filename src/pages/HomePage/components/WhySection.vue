<script setup></script>

<template>
  <section class="why">
    <div class="why__bg why__bg_left _ibg-contain">
      <img src="@/assets/img/why-bg-left.png" />
    </div>
    <div class="why__bg why__bg_right _ibg-contain">
      <img src="@/assets/img/why-bg-right.png" />
    </div>
    <div class="why__inner _cnt">
      <div class="why__top">
        <div class="why__label">{{ $t('WHY CHOOSE RELIC FORGE?') }}</div>
        <div class="why__title _h2">
          {{ $t('BUILT FOR') }}
          <span>{{ $t('PLAYERS') }}</span>
          {{ $t('AND') }}
          <span>{{ $t('COLLECTORS') }}</span>
        </div>
        <div class="why__text">
          {{
            $t(
              'Everything you need to discover and purchase CS2 and Dota 2 skins in one convenient place.',
            )
          }}
        </div>
      </div>
      <div class="why__items">
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-01.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('A Wide Selection') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Explore an extensive range of CS2 and Dota 2 cosmetics, from popular designs to distinctive items worth adding to your collection.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-02.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('Simple Shopping') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Browse available items, compare options, and choose the skins you want through an intuitive and easy-to-use interface.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-03.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('Secure Account Access') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Create your personal account using your email address and password. Sign in whenever you want to manage your account and access your purchases.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-04.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('Convenient Experience') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Find items by game, category, rarity, and other available filters. Spend less time searching and more time finding the cosmetics you love.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-05.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('A Collection That Keeps Growing') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Discover new arrivals and explore different styles as our selection of CS2 and Dota 2 skins continues to expand.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__iamge _ibg-contain">
            <img src="@/assets/img/why-06.svg" />
          </div>
          <div class="why__subtitle">
            {{ $t('Support When You Need It') }}
          </div>
          <div class="why__info">
            {{
              $t(
                'Have a question about an item, your account, or an order? Our support team is here to help you with your Relic Forge experience.',
              )
            }}
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

.why {
  @include adaptiveValue('padding-top', 200, 60);
  @include adaptiveValue('padding-bottom', 200, 60);
  position: relative;

  &__bg {
    position: absolute;
    width: 50%;
    aspect-ratio: 1 / 0.75;
    &_left {
      left: 0;
      top: 0;
    }

    &_right {
      right: 0;
      bottom: 0;
      transform: translate(0px, 20%);
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 20);
    }
  }
  &__label {
    text-transform: uppercase;
    color: var(--fifth-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
    @media (max-width: $md6) {
      span {
        display: block;
      }
    }
  }

  &__text {
    max-width: 601px;
    margin: 0 auto;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    @include adaptiveValue('column-gap', 20, 10);
    @include adaptiveValue('row-gap', 30, 18);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md4) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    text-align: center;
  }

  &__iamge {
    margin-left: auto;
    margin-right: auto;
    @include adaptiveValue('width', 65, 45);
    @include adaptiveValue('height', 65, 45);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 18);
    }
  }

  &__subtitle {
    font-weight: 700;
    color: var(--third-color);
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__info {
  }
}
</style>
