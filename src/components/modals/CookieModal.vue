<template>
  <div
    class="cookie-modal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div class="cookie-modal__container _cnt">
      <div class="cookie-modal__frame">
        <div class="cookie-modal__information">
          <h2 :id="titleId" class="cookie-modal__title">
            {{ $t('We value your privacy') }}
          </h2>

          <p class="cookie-modal__description">
            {{
              $t(
                'We use cookies to make sure our Website runs smoothly and to enhance your experience while browsing. Please read our',
              )
            }}

            <RouterLink
              v-if="cookiePage"
              :to="cookiePageLink"
              class="cookie-modal__link"
              @click="closeModal"
            >
              {{ cookiePage.title }}
            </RouterLink>

            {{
              $t(
                'for more details. Essential cookies are automatically enabled for the Website’s core functions, but you can choose to enable additional cookies to further personalize your experience.',
              )
            }}
          </p>
        </div>

        <div class="cookie-modal__actions">
          <BaseButton
            type="button"
            variant="primary"
            class="cookie-modal__button"
            @click="acceptCookies"
          >
            {{ $t('Accept All') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="back"
            class="cookie-modal__button"
            @click="declineCookies"
          >
            {{ $t('Decline Non-Essential Cookies') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'

import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useStaticStore } from '@/stores/static'

const COOKIE_SETTINGS_KEY = 'cookie_settings'
const titleId = 'cookie-modal-title'

const staticStore = useStaticStore()
const cookiesModalStore = useCookiesModalStore()

const cookiePage = computed(() => {
  return staticStore.pages?.find(page => Number(page.is_cookie) === 1) || null
})

const cookiePageLink = computed(() => {
  if (!cookiePage.value) {
    return null
  }

  if (cookiePage.value.slug) {
    return {
      name: 'StaticPageBySlug',
      params: {
        slug: cookiePage.value.slug,
      },
    }
  }

  return {
    name: 'StaticPage',
    params: {
      id: cookiePage.value.id,
    },
  }
})

const saveCookieSettings = settings => {
  localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings))

  window.dispatchEvent(
    new CustomEvent('cookie-settings-changed', {
      detail: settings,
    }),
  )
}

const closeModal = () => {
  cookiesModalStore.closeModal()
}

const acceptCookies = () => {
  saveCookieSettings({
    necessary: true,
    functional: true,
    performance: true,
    advertisement: true,
  })

  closeModal()
}

const declineCookies = () => {
  saveCookieSettings({
    necessary: true,
    functional: false,
    performance: false,
    advertisement: false,
  })

  closeModal()
}
</script>

<style lang="scss" scoped>
.cookie-modal {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--modal-z-index);

  overflow-x: hidden;
  overflow-y: auto;

  width: 100%;
  max-height: 100dvh;

  padding: 16px;

  background: rgb(5 9 18 / 72%);

  -webkit-backdrop-filter: blur(12px);

  backdrop-filter: blur(12px);

  &__container {
    width: 100%;
    min-width: 0;
    max-width: 1440px;

    margin: 0 auto;
  }

  &__frame {
    @include adaptiveValue('padding-top', 28, 18);
    @include adaptiveValue('padding-bottom', 28, 18);
    @include adaptiveValue('padding-left', 32, 16);
    @include adaptiveValue('padding-right', 32, 16);
    @include adaptiveValue('gap', 36, 20);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-priamry-color);
    border-radius: 12px;
    background: linear-gradient(180deg, #111624 0%, #111624 100%);
    box-shadow: 0 12px 36px rgb(0 0 0 / 20%);
  }

  &__information {
    flex: 1 1 auto;

    min-width: 0;
    max-width: 900px;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 10);
    }
  }

  &__icon {
    display: flex;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    border: 1px solid var(--border-priamry-color);
    border-radius: 8px;
    background: var(--bg-primary-color);

    color: var(--hint-primary-color);

    svg {
      display: block;

      width: 24px;
      height: 24px;
    }
  }

  &__title {
    @include adaptiveValue('font-size', 22, 18);

    color: var(--fourth-color);
    font-family: var(--font-audiowide);
    font-weight: 400;
    line-height: 135%;
    text-align: left;
    text-transform: none;

    overflow-wrap: anywhere;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__description {
    margin: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 400;
    line-height: 170%;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__link {
    display: inline;

    color: var(--hint-primary-color);
    font-family: inherit;
    font-size: inherit;
    font-weight: 600;
    line-height: inherit;
    text-decoration: underline;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--fourth-color);
      }
    }

    &:focus-visible {
      border-radius: 2px;
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
    }
  }

  &__actions {
    display: flex;
    flex: 0 0 270px;
    flex-direction: column;
    gap: 10px;

    min-width: 0;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    min-height: 44px;

    padding: 10px 14px;

    border-radius: 6px;

    font-family: var(--font-audiowide);
    font-size: 11px;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
    text-transform: uppercase;
    white-space: normal;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    overflow-wrap: anywhere;
  }

  @media (max-width: $md3) {
    &__frame {
      align-items: flex-start;
      gap: 24px;
    }

    &__actions {
      flex-basis: 240px;
    }
  }

  @media (max-width: $md4) {
    padding: 10px;

    &__frame {
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
    }

    &__information {
      max-width: 100%;
    }

    &__actions {
      flex: 0 0 auto;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;

      width: 100%;
    }

    &__button {
      flex: 1 1 220px;
    }
  }

  @media (max-width: $md7) {
    padding: 8px;

    &__frame {
      gap: 18px;

      border-radius: 10px;
    }

    &__heading {
      gap: 10px;
    }

    &__icon {
      flex-basis: 36px;

      width: 36px;
      height: 36px;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    &__title {
      font-size: 17px;
    }

    &__description {
      font-size: 12px;
      line-height: 160%;
    }

    &__actions {
      flex-direction: column;
      gap: 8px;
    }

    &__button {
      flex: 0 0 auto;

      width: 100%;
      min-height: 42px;

      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__link,
    &__button {
      transition: none;
    }
  }
}
</style>
