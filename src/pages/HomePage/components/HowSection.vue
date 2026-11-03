<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
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
    <div class="how__inner _cnt-home">
      <div class="how__top">
        <div class="how__info">
          <div class="how__subtitle _h4">
            <span>{{ $t('HOW TO GET STARTED') }}</span>
          </div>
          <div class="how__title _h2">
            {{ $t('YOUR SURVIVAL JOURNEY STARTS HERE') }}
          </div>
          <div class="how__text">
            {{
              $t(
                'Getting onto WastelandCore takes only a few steps. Prepare your game, connect to the server, and begin building your place in the wasteland.',
              )
            }}
          </div>
        </div>
        <BaseButton
          class="how__copy"
          variant="shadow"
          :disabled="!connectCommand"
          @click="copyServerIP"
        >
          {{ $t('START PLAYING') }}
        </BaseButton>
      </div>
      <div class="how__items">
        <div class="how__item">
          <div class="how__number _h2">
            <div>01</div>
            <span></span>
          </div>
          <div class="how__label _h4">{{ $t('GET RUST ON STEAM') }}</div>
          <div class="how__value">
            {{
              $t(
                'Find the gear you need to prepare for dangerous encounters and defend what you’ve built.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__number _h2">
            <div>02</div>
            <span></span>
          </div>
          <div class="how__label _h4">{{ $t('CONNECT TO WASTELANDCORE') }}</div>
          <div class="how__value">
            <span>{{
              $t('Launch Rust and press F1 to open the in-game console.')
            }}</span>
            <span>{{ $t('Enter the following command:') }}</span>
            <span>{{ $t('client.connect') }}{{ serverIP }}</span>
            <span>{{ $t('Press Enter to connect.') }}</span>
          </div>
        </div>
        <div class="how__item">
          <div class="how__number _h2">
            <div>03</div>
            <span></span>
          </div>
          <div class="how__label _h4">{{ $t('ENTER THE WASTELAND') }}</div>
          <div class="how__value">
            {{
              $t(
                'Gather resources, craft equipment, establish your base, and explore everything the server has to offer.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__number _h2">
            <div>04</div>
            <span></span>
          </div>
          <div class="how__label _h4">{{ $t('VISIT THE SHOP') }}</div>
          <div class="how__value">
            {{
              $t(
                'Log in with Steam to access the website’s item features. Purchase what you need or sell eligible items from your collection.',
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
  z-index: 1;
  @include adaptiveValue('padding-top', 102, 60);
  @include adaptiveValue('padding-bottom', 50, 30);
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 10);
    }
    @media (min-width: $md5) {
      display: flex;
      @include adaptiveValue('gap', 20, 18);
    }
  }

  &__info {
    flex: 1 1 auto;
    @media (max-width: $md5) {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 4);
    }
  }

  &__title {
    color: var(--hint-primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 10);
    }
  }

  &__text {
    max-width: 712px;
  }

  &__copy {
    @include adaptiveValue('max-width', 212, 200);
    @include adaptiveValue('min-width', 212, 200);
    align-self: flex-end;
  }

  &__items {
    display: grid;
    @include adaptiveValue('gap', 24, 4);
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md5) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    background-color: var(--bg-fourth-color);
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);
    @include adaptiveValue('padding-left', 26, 10);
    @include adaptiveValue('padding-right', 26, 10);
    border: 1px solid var(--border-primary-color);
    border-radius: 6px;
  }

  &__number {
    position: relative;
    color: var(--hint-primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
    display: flex;
    @include adaptiveValue('gap', 13, 10);
    span {
      align-self: center;
      flex: 1 1 auto;
      height: 1px;
      background-color: var(--border-primary-color);
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 10);
    }
  }

  &__value {
  }
}
</style>
