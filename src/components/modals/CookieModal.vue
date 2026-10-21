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
            variant="hint-bordered"
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

  overflow-y: auto;

  width: 100%;
  max-height: 100dvh;

  padding: 16px;

  background-color: rgb(10 8 24 / 72%);

  backdrop-filter: blur(14px);

  &__container {
    width: 100%;
    max-width: 1440px;

    margin: 0 auto;
  }

  &__frame {
    @include adaptiveValue('padding-top', 28, 20);
    @include adaptiveValue('padding-bottom', 28, 20);
    @include adaptiveValue('padding-left', 36, 18);
    @include adaptiveValue('padding-right', 36, 18);
    @include adaptiveValue('gap', 48, 24);

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    border: 1px solid var(--border-fourth-color);
    border-radius: 12px;
    background-color: #37335f;
    box-shadow: 0 12px 40px rgb(0 0 0 / 25%);
  }

  &__information {
    flex: 1 1 auto;

    min-width: 0;
    max-width: 920px;
  }

  &__title {
    @include adaptiveValue('font-size', 28, 22);
    @include adaptiveValue('margin-bottom', 14, 10);

    color: var(--secondary-color);
    font-family: var(--font-texturina);
    font-weight: 500;
    line-height: 1.2;
    text-transform: none;
  }

  &__description {
    margin: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
  }

  &__link {
    display: inline;

    color: var(--hint-primary-color);
    font-family: inherit;
    font-size: inherit;
    font-weight: 500;
    text-decoration: underline;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__actions {
    display: flex;
    flex: 0 0 260px;
    flex-direction: column;
    gap: 10px;

    min-width: 0;
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 40px;

    padding: 10px 14px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    text-align: center;
    text-transform: uppercase;
  }

  @media (max-width: $md3) {
    &__frame {
      align-items: stretch;
      gap: 24px;
    }

    &__actions {
      flex-basis: 220px;
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
      max-width: none;
    }

    &__actions {
      flex: none;
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

      border-radius: 8px;
    }

    &__title {
      font-size: 22px;
    }

    &__description {
      font-size: 12px;
      line-height: 1.55;
    }

    &__actions {
      flex-direction: column;
      gap: 8px;
    }

    &__button {
      flex: none;

      width: 100%;
      min-height: 40px;
    }
  }
}
</style>
