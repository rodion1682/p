<template>
  <div class="strategies">
    <div class="strategies__inner _cnt-home">
      <div class="strategies__decor _ibg-contain">
        <img src="@/assets/img/strategies-decor.png" />
      </div>
      <div class="strategies__top">
        <div class="strategies__subtitle _h5">{{ $t('Game play') }}</div>
        <div class="strategies__title _h2">
          {{ $t('Master Unique') }}
          <span>{{ $t('Strategies') }}</span>
        </div>
        <div class="strategies__heros-decor _ibg-contain">
          <img src="@/assets/img/heros-decor-top.png" />
        </div>
      </div>
      <div class="strategies__items">
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-01.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">
              {{ $t('Hundreds of Cards') }}
            </div>
            <div class="strategies__desc">
              {{ $t('Create endless combinations.') }}
            </div>
          </div>
        </div>
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-02.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">
              {{ $t('Legendary Artifacts') }}
            </div>
            <div class="strategies__desc">
              {{ $t('Equip ancient relics that redefine every match.') }}
            </div>
          </div>
        </div>
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-03.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">{{ $t('Tactical Combat') }}</div>
            <div class="strategies__desc">
              {{ $t('Victory belongs to those who think ahead.') }}
            </div>
          </div>
        </div>
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-04.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">{{ $t('Powerful Heroes') }}</div>
            <div class="strategies__desc">
              {{ $t('Each master offers a completely different playstyle.') }}
            </div>
          </div>
        </div>
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-05.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">{{ $t('Stunning Visuals') }}</div>
            <div class="strategies__desc">
              {{
                $t(
                  'Hand-painted fantasy artwork  inspired by timeless architecture.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="strategies__item">
          <div class="strategies__image _ibg-contain">
            <img src="@/assets/img/strategies-06.png" />
          </div>
          <div class="strategies__meta">
            <div class="strategies__name _h4">
              {{ $t('Constant Evolution') }}
            </div>
            <div class="strategies__desc">
              {{ $t('New expansions, heroes, artifacts, and stories await.') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.strategies {
  @include adaptiveValue('margin-top', 88, -25);
  @include adaptiveValue('padding-bottom', 200, 25);
  &__inner {
    position: relative;
  }

  &__decor {
    position: absolute;
    top: 0;
    left: 0;

    width: 10vw;
    height: 10vw;

    transform: translate(-40%, 0px);
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 53, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 15);
    }
  }

  &__heros-decor {
    width: 15vw;
    height: 1.4vw;

    margin: 0 auto;
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    @media (max-width: $md3) {
      gap: 0px;
    }
    @media (max-width: $md5) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__item {
    @include adaptiveValue('padding-top', 27, 10);
    @include adaptiveValue('padding-bottom', 27, 10);
    @include adaptiveValue('padding-left', 22, 10);
    @include adaptiveValue('padding-right', 22, 10);
    @include adaptiveValue('gap', 22, 10);
    display: flex;
    flex: 0 1 calc(33.333% - 14px);

    border-radius: 8px;
    background-color: var(--bg-fourth-color);
    @media (max-width: $md3) {
      flex: 0 1 50%;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__image {
    @include adaptiveValue('min-width', 105, 75);
    @include adaptiveValue('height', 112, 82);
  }

  &__meta {
    padding-top: 9px;
  }

  &__name {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 21, 8);
    }
  }

  &__desc {
    color: var(--secondary-color);
  }
}
</style>
