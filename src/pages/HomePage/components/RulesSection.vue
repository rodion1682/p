<template>
  <section id="rules" class="rules">
    <div class="rules__inner _cnt-home">
      <div class="rules__info">
        <div class="rules__subtitle _h4">
          {{ $t('SERVER RULES') }}
        </div>
        <div class="rules__title _h2">
          <div>{{ $t('SURVIVE') }}</div>
          <div>{{ $t(' ') }}</div>
          <div>{{ $t('TOGETHER.') }}</div>
          <div>{{ $t(' ') }}</div>
          <div>{{ $t('PLAY FAIR.') }}</div>
        </div>
        <div class="rules__text">
          {{
            $t(
              'WastelandCore is built around competitive survival and mutual respect. Follow the rules to help maintain a fair and enjoyable environment for everyone.',
            )
          }}
        </div>
      </div>
      <div class="rules__content">
        <div class="rules__items">
          <div class="rules__item">
            <div class="rules__item-number _h2">01</div>
            <div class="rules__item-meta">
              <div class="rules__item-title _h4">
                {{ $t('Respect other players. ') }}
              </div>
              <div class="rules__item-text">
                {{
                  $t(
                    'Harassment, racism, hate speech, and disruptive spam are prohibited.',
                  )
                }}
              </div>
            </div>
          </div>
          <div class="rules__item">
            <div class="rules__item-number _h2">02</div>
            <div class="rules__item-meta">
              <div class="rules__item-title _h4">
                {{ $t('Play fair.') }}
              </div>
              <div class="rules__item-text">
                {{
                  $t(
                    'Cheats, hacks, unauthorized scripts, and other tools that provide unfair advantages are strictly forbidden.',
                  )
                }}
              </div>
            </div>
          </div>
          <div class="rules__item">
            <div class="rules__item-number _h2">03</div>
            <div class="rules__item-meta">
              <div class="rules__item-title _h4">
                {{ $t('Don’t exploit bugs.') }}
              </div>
              <div class="rules__item-text">
                {{
                  $t(
                    'Abusing unintended mechanics may result in penalties. Report issues to the server staff.',
                  )
                }}
              </div>
            </div>
          </div>
          <div class="rules__item">
            <div class="rules__item-number _h2">04</div>
            <div class="rules__item-meta">
              <div class="rules__item-title _h4">
                {{ $t('Protect everyone’s privacy.') }}
              </div>
              <div class="rules__item-text">
                {{
                  $t(
                    'Never publish personal or sensitive information in chat or community channels.',
                  )
                }}
              </div>
            </div>
          </div>
          <div class="rules__item">
            <div class="rules__item-number _h2">05</div>
            <div class="rules__item-meta">
              <div class="rules__item-title _h4">
                {{ $t('Follow staff instructions.') }}
              </div>
              <div class="rules__item-text">
                {{
                  $t(
                    'Cooperate with moderators and respect server-wide announcements and guidelines.',
                  )
                }}
              </div>
            </div>
          </div>
        </div>

        <a v-if="supportEmail" :href="supportEmailHref" class="rules__contact">
          <SvgIcon :icon="SupportIcon" class="rules__contact-icon" />

          <div class="rules__contact-about">
            <div class="rules__contact-title _h4">
              {{ $t('Need assistance or want to report a violation?') }}
            </div>

            <div class="rules__contact-text">
              {{
                $t(
                  'Contact the WastelandCore support team through the website or official community channels.',
                )
              }}
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { SupportIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
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
  position: relative;
  z-index: 1;
  @include adaptiveValue('padding-top', 50, 30);
  @include adaptiveValue('padding-bottom', 50, 30);
  &__inner {
    @media (min-width: $md3) {
      display: flex;
      @include adaptiveValue('gap', 55, 20, 1430, 992, 1);
    }
  }

  &__info {
    flex: 0 1 25%;
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 4);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 4);
    }
    @media (max-width: $md3) {
      div {
        display: inline;
      }
    }
  }

  &__text {
  }

  &__content {
    flex: 0 1 75%;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));

    @include adaptiveValue('gap', 24, 4);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 4);
    }

    .rules__item:nth-child(-n + 3) {
      grid-column: span 2;
    }
    .rules__item:nth-child(n + 4) {
      grid-column: span 3;
    }
    @media (max-width: $md3) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      .rules__item:nth-child(n) {
        grid-column: span 1;
      }
    }

    @media (max-width: $md5) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__item {
    min-width: 0;

    &-meta {
      min-width: 0;
    }
  }

  &__item {
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);
    @include adaptiveValue('padding-left', 26, 10);
    @include adaptiveValue('padding-right', 26, 10);
    display: flex;
    border-radius: 6px;
    background-color: var(--bg-fourth-color);
    border: 1px solid var(--border-primary-color);
    &-number {
      color: var(--hint-primary-color);
      @include adaptiveValue('padding-right', 20, 10);
    }

    &-meta {
      @include adaptiveValue('padding-left', 20, 10);
      padding-top: 10px;
      padding-bottom: 10px;
      border-left: 1px solid var(--border-primary-color);
    }

    &-title {
      text-transform: none;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 24, 10);
      }
    }

    &-text {
    }
  }

  &__contact {
    @include adaptiveValue('padding', 26, 10);
    border-radius: 6px;
    background-color: var(--bg-sixth-color);
    border: 1px solid var(--border-primary-color);
    color: var(--secondary-color);
    display: flex;
    align-items: center;

    &-icon {
      width: fit-content;
      @include adaptiveValue('min-width', 45, 40);
      @include adaptiveValue('height', 45, 40);
      @include adaptiveValue('margin-right', 17, 10);
      color: inherit;
    }

    &-about {
      @include adaptiveValue('padding-left', 20, 10);
      color: inherit;
      border-left: 1px solid var(--border-primary-color);
    }

    &-title {
      text-transform: none;
      color: inherit;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 12, 6);
      }
    }

    &-text {
      color: inherit;
    }
  }
}
</style>
