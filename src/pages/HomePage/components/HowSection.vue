<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { CopyIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const settingsStore = useSettingsStore()

const toast = useToast()
const { t } = useI18n()

const { serverIP } = storeToRefs(settingsStore)

const copied = ref(false)

const connectCommand = computed(() => {
  if (!serverIP.value) return ''

  return `client.connect ${serverIP.value}`
})

const copyServerIP = async () => {
  if (!connectCommand.value) return

  try {
    await navigator.clipboard.writeText(connectCommand.value)

    copied.value = true

    toast.success(t('Server connect command copied'))

    setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch (error) {
    toast.error(t('Failed to copy server connect command'))
    console.error(error)
  }
}
</script>

<template>
  <section class="how">
    <div class="how__bg _ibg">

    </div>
    <div class="how__inner _cnt-home">
      <div class="how__image _ibg-contain">

      </div>
      <div class="how__top">
        <div class="how__subtitle _h6">
          <span>{{ $t('QUICK START') }}</span>
        </div>
        <div class="how__title _h3">{{ $t('HOW TO JOIN') }}</div>
      </div>
      <div class="how__items">
        <div class="how__item how__item_1">
          <div class="how__number">01</div>
          <div class="how__label _h5">{{ $t('SIGN IN WITH STEAM') }}</div>
          <div class="how__value">
            {{
              $t(
                'Log in using your Steam account to access your profile, inventory features, and the Scrap-Lands Shop.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">02</div>
          <div class="how__label _h5">{{ $t('CONNECT TO THE SERVER') }}</div>
          <div class="how__value">
            {{ $t('Launch Rust, press F1, and enter the connect command:') }}
          </div>
          <BaseButton
            class="how__copy"
            variant="bordered"
            :disabled="!connectCommand"
            @click="copyServerIP"
          >
            <span>{{ serverIP }}</span>

            <SvgIcon :icon="CopyIcon" class="how__copy-icon" />
          </BaseButton>
        </div>
        <div class="how__item">
          <div class="how__number">03</div>
          <div class="how__label _h5">{{ $t('START YOUR JOURNEY') }}</div>
          <div class="how__value">
            {{
              $t(
                'Collect resources, build your base, fight for territory, earn valuable loot, and use the Scrap-Lands Shop whenever you`re ready.',
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

.how {
  position: relative;
  @include adaptiveValue('padding-top', 96, 25);
  @include adaptiveValue('padding-bottom', 96, 25);
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__image {
    @include adaptiveValue('bottom', -96, -25);
    height: 144%;
    position: absolute;
    right: -10%;
    width: 30%;
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 95, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__title {
  }

  &__items {
    display: flex;
    @include adaptiveValue('gap', 16, 4);
    max-width: 1025px;
    @media (max-width: $md4) {
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  &__item {
    flex: 0 1 33.333%;
    background-color: var(--bg-third-color);
    @include adaptiveValue('padding', 32, 10);
    position: relative;
    @include adaptiveValue('padding-top', 135, 50);
    &_1 {
      background-color: var(--hint-primary-color);
      .how__number {
        color: rgb(0, 0, 0, 10%);
        &::before {
          background-color: var(--hint-primary-color);
        }
      }
      .how__value {
        color: var(--primary-color);
      }
    }
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 2px);
      &:last-child {
        flex: 1 1 100%;
      }
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
  }

  &__number {
    @include adaptiveValue('font-size', 128, 38);
    font-weight: 700;
    line-height: 120%;
    position: absolute;
    top: 0;
    @include adaptiveValue('left', 32, 10);
    color: var(--border-primary-color);
    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 35%;
      width: 100%;
      background-color: var(--bg-third-color);
    }
  }

  &__label {
    position: relative;
    z-index: 1;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 10);
    }
  }

  &__value {
    color: var(--secondary-color);
    position: relative;
    z-index: 1;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 10);
    }
  }

  &__copy {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-family: var(--font-barlow);
    font-weight: 500;
    line-height: 1;
    @include adaptiveValue('min-height', 36, 40);
    &-icon {
      min-width: 20px;
      height: 20px;
    }
  }
}
</style>
