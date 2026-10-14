<template>
  <div
    class="cookie-modal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div class="cookie-modal__container _cnt">
      <div class="cookie-modal__outer">
        <div
          class="cookie-modal__decor cookie-modal__decor_top-left _ibg-contain"
          aria-hidden="true"
        >
          <img src="@/assets/img/modal-decor.png" alt="" />
        </div>

        <div
          class="cookie-modal__decor cookie-modal__decor_top-right _ibg-contain"
          aria-hidden="true"
        >
          <img src="@/assets/img/modal-decor.png" alt="" />
        </div>

        <div
          class="cookie-modal__decor cookie-modal__decor_bottom-left _ibg-contain"
          aria-hidden="true"
        >
          <img src="@/assets/img/modal-decor.png" alt="" />
        </div>

        <div
          class="cookie-modal__decor cookie-modal__decor_bottom-right _ibg-contain"
          aria-hidden="true"
        >
          <img src="@/assets/img/modal-decor.png" alt="" />
        </div>

        <div class="cookie-modal__frame">
          <div class="cookie-modal__information">

            <h2 :id="titleId" class="cookie-modal__title _h3">
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
              class="cookie-modal__button"
              @click="acceptCookies"
            >
              {{ $t('Accept All') }}
            </BaseButton>

            <BaseButton
              type="button"
              class="cookie-modal__button"
              variant="hint-bordered"
              @click="declineCookies"
            >
              {{ $t('Decline Non-Essential Cookies') }}
            </BaseButton>
          </div>
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

  width: 100%;

  padding: 15px;

  background-color: rgb(10 11 16 / 72%);

  backdrop-filter: blur(18px);

  &__container {
    width: 100%;
    max-width: 1500px;

    margin: 0 auto;
  }

  &__outer {
    position: relative;

    width: 100%;

    padding: 5px;

    border: 1px solid var(--border-sixth-color);
    background-color: var(--bg-primary-color);
    box-shadow: 0 4px 4px rgb(0 0 0 / 25%);
  }

  &__decor {
    @include adaptiveValue('min-width', 58, 38);
    @include adaptiveValue('height', 48, 38);

    position: absolute;
    z-index: 5;

    pointer-events: none;

    &_top-left {
      @include adaptiveValue('left', -6, -8);

      top: -6px;

      transform: rotate(-90deg);
    }

    &_top-right {
      @include adaptiveValue('right', -6, -8);

      top: -6px;
    }

    &_bottom-left {
      @include adaptiveValue('left', -6, -8);

      bottom: -6px;

      transform: rotate(-180deg);
    }

    &_bottom-right {
      @include adaptiveValue('right', -6, -8);

      bottom: -6px;

      transform: rotate(90deg);
    }
  }

  &__frame {
    @include adaptiveValue('padding-top', 30, 20);
    @include adaptiveValue('padding-bottom', 30, 20);
    @include adaptiveValue('padding-left', 32, 15);
    @include adaptiveValue('padding-right', 32, 15);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(30px, 5vw, 80px);

    width: 100%;

    border: 1px solid var(--border-fourth-color);
    background-color: var(--bg-third-color);
  }

  &__information {
    flex: 1 1 auto;

    min-width: 0;
    max-width: 960px;
  }

  &__subtitle {
    max-width: 360px;

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__title {
    color: var(--primary-color);
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__description {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 155%;
  }

  &__link {
    display: inline;

    color: var(--hint-secondary-color);
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
    flex: 0 0 250px;
    flex-direction: column;
    gap: 10px;
  }

  &__button {
    @include adaptiveValue('min-height', 40, 40);

    width: 100%;

    font-family: var(--font-spectral);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
  }

  @media (max-width: $md4) {
    padding: 8px;

    &__frame {
      flex-direction: column;
      align-items: stretch;
      gap: 24px;
    }

    &__information {
      max-width: none;
    }

    &__actions {
      flex: none;
      flex-direction: row;
      flex-wrap: wrap;

      width: 100%;
    }

    &__button {
      flex: 1 1 220px;
    }
  }

  @media (max-width: $md7) {
    padding: 5px;

    &__outer {
      padding: 4px;
    }

    &__description {
      font-size: 12px;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
