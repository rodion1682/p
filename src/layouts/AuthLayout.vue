<template>
  <main class="auth">
    <div class="auth__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="auth__inner _cnt">
      <div class="auth__decor auth__decor_left _ibg-contain">
        <img
          v-if="!props.isRedDecor"
          src="@/assets/img/blue-left-decor.png"
          alt=""
        />
        <img v-else src="@/assets/img/red-left-decor.png" alt="" />
      </div>
      <div class="auth__decor auth__decor_right _ibg-contain">
        <img
          v-if="!props.isRedDecor"
          src="@/assets/img/blue-right-decor.png"
          alt=""
        />
        <img v-else src="@/assets/img/red-right-decor.png" alt="" />
      </div>
      <div class="auth__form">
        <slot />
      </div>
    </div>
  </main>
</template>

<script setup>
const props = defineProps({
  isRedDecor: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
.auth {
  @include adaptiveValue('padding-top', 150, 80);
  @include adaptiveValue('padding-bottom', 100, 30);

  position: relative;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
    z-index: 1;

    width: 100%;
    max-width: 620px;

    margin: auto;
    @media (max-width: $md5) {
      padding: 0px;
    }
  }

  &__decor {
    @include adaptiveValue('width', 189, 105);
    position: absolute;
    top: 0;
    z-index: 5;

    aspect-ratio: 1 / 0.82;

    pointer-events: none;
    &_left {
      left: 0;

      transform: translate(-10%, -20%);
    }

    &_right {
      right: 0;

      transform: translate(10%, -20%);
    }
  }

  &__form {
    position: relative;
    z-index: 1;
  }
}
</style>
