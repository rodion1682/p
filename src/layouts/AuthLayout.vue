<template>
  <main class="auth">
    <div class="auth__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.png" alt="" />
    </div>

    <div class="auth__inner _cnt">
      <div class="auth__form">
        <slot />
      </div>
    </div>
  </main>
</template>

<script setup></script>

<style lang="scss" scoped>
.auth {
  @include adaptiveValue('padding-top', 140, 75);
  @include adaptiveValue('padding-bottom', 100, 40);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-width: 0;
  min-height: 550px;

  background-color: var(--bg-primary-color);

  &__bg {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;

    margin-top: auto;
    margin-bottom: auto;
  }

  &__form {
    position: relative;

    width: 100%;
    min-width: 0;
    max-width: 476px;

    margin: 0 auto;
  }

  @media (max-width: $md4) {
    min-height: 500px;

    &__bg {
      img {
        object-position: center top;
      }
    }
  }
}
</style>
