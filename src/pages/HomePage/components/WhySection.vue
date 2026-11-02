<script setup></script>

<template>
  <section class="why">
    <div class="why__inner _cnt-home">
      <div class="why__title _h2">
        {{ $t('Why the Community Chooses') }}
        <span>{{ $t('WipeVault') }}</span>
      </div>
      <div class="why__items">
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-01.svg" />
          </div>
          <div class="why__label _h3">{{ $t('Modded Excellence') }}</div>
          <div class="why__text">
            {{
              $t(
                'Powered by a custom uMod (Oxide) framework, offering unique mechanics and events you won`t find on vanilla servers.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-02.svg" />
          </div>
          <div class="why__label _h3">{{ $t('Performance & Stability') }}</div>
          <div class="why__text">
            {{
              $t(
                'High-tickrate hardware ensures a smooth PvP experience, even during the most intense raids.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-03.svg" />
          </div>
          <div class="why__label _h3">{{ $t('Fair Play Focus') }}</div>
          <div class="why__text">
            {{
              $t(
                'Balanced loot tables and active admin moderation protect the integrity of your wipe.',
              )
            }}
          </div>
        </div>
        <div class="why__item">
          <div class="why__icon _ibg-contain">
            <img src="@/assets/img/why-04.svg" />
          </div>
          <div class="why__label _h3">{{ $t('Active Warfront') }}</div>
          <div class="why__text">
            {{
              $t(
                'A competitive environment designed for dedicated teams and ambitious solo players.',
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
  @include adaptiveValue('padding-top', 120, 35);
  @include adaptiveValue('padding-bottom', 120, 25);
  &__inner {
  }

  &__title {
    text-align: center;
    @include adaptiveValue('font-size', 32, 27);
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__items {
    display: flex;
    justify-content: center;
    @include adaptiveValue('gap', 48, 20, 1400, 992, 1);
    @media (max-width: $md3) {
      gap: 20px;
      flex-wrap: wrap;
    }
  }

  &__item {
    text-align: center;
    @media (min-width: $md3) {
      flex: 0 1 25%;
      max-width: 291px;
    }
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__icon {
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    @include adaptiveValue('min-width', 46, 40);
    @include adaptiveValue('height', 46, 40);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-primary-color);
    }
  }

  &__text {
    line-height: 24px;
  }
}
</style>
