<template>
  <section class="start">
    <div class="start__iamge _ibg">
      <img src="@/assets/img/start-bg.jpg" alt="" />
    </div>
    <div class="start__inner _cnt-home">
      <div class="start__title _h1">
        {{ $t('About') }}
        <div>{{ $t('the Project') }}</div>
      </div>
      <div class="start__text">
        <span>WipeVault.com</span>
        {{
          $t(
            ' is a hybrid digital hub for Rust enthusiasts. We combine a heavily modified survival environment with a streamlined skin marketplace. Our mission is to provide a deeper, more rewarding Rust experience where every action contributes to your long-term legacy',
          )
        }}
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.start {
  @include adaptiveValue('margin-top', 20, 0);
  position: relative;
  &__iamge {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 67%;
    @media (max-width: $md5) {
      width: 100%;
    }
  }
  &__inner {
    @include adaptiveValue('padding-top', 100, 25);
    @include adaptiveValue('padding-bottom', 120, 25);
    position: relative;
    z-index: 1;
    @media (min-width: $md3) {
      @include adaptiveValue('padding-left', 54, 20, 1400, 992, 1);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }

  &__text {
    line-height: 24px;
    max-width: 575px;
    span {
      margin-right: 3px;
      color: var(--hint-primary-color);
      font-weight: 700;
    }
  }
}
</style>
