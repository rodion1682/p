<script setup></script>

<template>
  <section class="why">
    <div class="why__inner _cnt-home">
      <div class="why__title _h2">
        {{ $t('WHY WASTELANDCORE?') }}
      </div>
      <div class="why__items">
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-01.svg" />
          </div>
          <div class="why__label _h4">{{ $t('SURVIVAL WITHOUT LIMITS') }}</div>
          <div class="why__text">
            {{
              $t(
                'Discover a world where exploration, resource management, and tactical decisions determine how far you can go.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-02.svg" />
          </div>
          <div class="why__label _h4">{{ $t('YOUR ITEMS, YOUR CHOICE') }}</div>
          <div class="why__text">
            {{
              $t(
                'Purchase useful equipment through the website or sell items fr om your collection. The WastelandCore Shop makes managing your inventory straightforward.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-03.svg" />
          </div>
          <div class="why__label _h4">{{ $t('COMPETITIVE GAMEPLAY') }}</div>
          <div class="why__text">
            {{
              $t(
                'Face hostile survivors, defend your territory, and fight for valuable resources in an environment wh ere preparation makes all the difference.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-04.svg" />
          </div>
          <div class="why__label _h4">{{ $t('BUILT FOR THE COMMUNITY') }}</div>
          <div class="why__text">
            {{
              $t(
                'Join fellow survivors, participate in server activities, and become part of a community that continues to evolve with every wipe.',
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
  position: relative;
  z-index: 1;
  @include adaptiveValue('padding-top', 91, 30);
  @include adaptiveValue('padding-bottom', 100, 30);
  text-shadow: 1px 1px 2px var(--primary-color);
  &__inner {
  }

  &__title {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__items {
    @include adaptiveValue('gap', 24, 18);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md6) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    @include adaptiveValue('padding-right', 0, 2);
  }

  &__icon {
    @include adaptiveValue('width', 42, 40);
    @include adaptiveValue('height', 42, 40);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }

  &__label {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__text {
    color: var(--third-color);
  }
}
</style>
