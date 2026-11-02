<template>
  <section class="rules">
    <div class="rules__inner _cnt-home">
      <div class="rules__bg _ibg">
        <img src="@/assets/img/rules-bg.jpg" />
      </div>
      <div class="rules__top">
        <div class="rules__title _h1">
          {{ $t('Survival') }}
          <span>{{ $t('Guidelines') }}</span>
        </div>
        <div class="rules__text">
          {{
            $t(
              'To ensure a fair and brutal experience for everyone, we enforce a strict code of conduct:',
            )
          }}
        </div>
      </div>
      <div class="rules__items">
        <div class="rules__item">
          <div class="rules__number _h3"><span>01</span></div>
          <div class="rules__label _h3">
            {{ $t('Zero Tolerance Policy') }}
          </div>
          <div class="rules__value">
            {{
              $t(
                'Any use of scripts, macros, or third-party software results in an immediate and permanent hardware ban. Play fair or don`t play at all.',
              )
            }}
          </div>
        </div>
        <div class="rules__item">
          <div class="rules__number _h3"><span>02</span></div>
          <div class="rules__label _h3">{{ $t('Respect the Grind') }}</div>
          <div class="rules__value">
            {{
              $t(
                'PvP and raiding are encouraged, but toxic behavior, racism, and harassment are not. We value a competitive but professional community.',
              )
            }}
          </div>
        </div>
        <div class="rules__item">
          <div class="rules__number _h3"><span>03</span></div>
          <div class="rules__label _h3">{{ $t('Exploit Prevention') }}</div>
          <div class="rules__value">
            {{
              $t(
                'Abusing map glitches, item duplication, or broken mechanics is strictly prohibited and monitored by our team.',
              )
            }}
          </div>
        </div>
        <div class="rules__item">
          <div class="rules__number _h3"><span>04</span></div>
          <div class="rules__label _h3">{{ $t('Admin Authority') }}</div>
          <div class="rules__value">
            {{
              $t(
                'Our staff reserves the right to remove any player who undermines the server`s stability or fairness.',
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'

const settingsStore = useSettingsStore()

const supportEmail = computed(() => settingsStore?.supportEmail || '')
const supportEmailHref = computed(() =>
  supportEmail.value ? `mailto:${supportEmail.value}` : '#',
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.rules {
  @media (min-width: $md5) {
    @include adaptiveValue('padding-left', 0, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 0, 10, 1400, 992, 1);
  }
  @media (max-width: $md5) {
    margin-left: -1px;
    margin-right: -1px;
  }
  &__inner {
    @include adaptiveValue('border-radius', 30, 6);
    background-color: var(--bg-eight-color);
    border: 1px solid var(--border-primary-color);
    @include adaptiveValue('padding-left', 54, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 54, 10, 1400, 992, 1);
    @include adaptiveValue('padding-bottom', 104, 25);
    @include adaptiveValue('padding-top', 104, 25);
    position: relative;
    z-index: 1;
    @media (max-width: $md5) {
      padding: 10px 11px;
    }
  }

  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    @include adaptiveValue('border-radius', 30, 6);
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-image: url('../../../assets/img/rules-bg-mask.svg');
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 1;
    }
  }

  &__top {
    position: relative;
    z-index: 1;
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }

  &__text {
  }

  &__items {
    position: relative;
    z-index: 1;
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
      max-width: 300px;
    }
    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__number {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-primary-color);
    }
  }

  &__value {
    line-height: 24px;
  }
}
</style>
