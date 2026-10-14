<template>
  <div class="auth">
    <div class="auth__bg _ibg">
      <img src="@/assets/img/faq-bg.jpg" />
    </div>
    <div class="auth__inner _cnt">
      <div class="auth__form">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.auth {
  @include adaptiveValue('padding-top', 140, 75);
  @include adaptiveValue('padding-bottom', 100, 25);
  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 100%;
  flex-direction: column;
  align-items: center;

  background-color: var(--bg-primary-color);
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }
  &__inner {
    position: relative;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
    align-self: center;
    justify-content: center;

    width: 100%;

    margin-top: auto;
    margin-bottom: auto;
    @media (max-width: $md7) {
      padding: 0px;
    }
  }

  &__form {
    width: 100%;
    max-width: 476px;

    margin: 0 auto;
  }
}
</style>
