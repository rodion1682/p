<template>
  <div
    v-if="showInitialBanner"
    class="cookie banner"
    role="region"
    aria-label="Cookie consent"
  >
    <div class="banner__inner">
      <div class="banner__body">
        <div class="banner__heading">
          <div class="banner__icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2.5L20 6V11.5C20 16.6 16.6 20 12 22C7.4 20 4 16.6 4 11.5V6L12 2.5Z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="M9 12L11 14L15.5 9.5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="banner__heading-content">
            <div class="banner__label">
              {{ $t('PRIVACY PREFERENCES') }}
            </div>

            <h2 class="banner__title">
              {{ $t('Cookies in Use') }}
            </h2>
          </div>
        </div>

        <div class="banner__text">
          {{
            $t(
              'Relic Forge uses cookies to keep the website secure, remember your preferences, and improve your browsing experience. Essential cookies are always active. Optional cookies are disabled by default and will only be used with your consent.',
            )
          }}

          <span>
            {{ $t('Learn more in our') }}
          </span>

          <RouterLink
            v-if="cookiePageLink"
            :to="cookiePageLink"
            class="cookie__desc-link"
            @click="closeModal"
          >
            {{ cookiePage?.title || $t('Cookie Notice') }} </RouterLink
          >.
        </div>

        <div class="banner__actions">
          <BaseButton
            type="button"
            variant="bordered"
            class="banner__button banner__button_reject"
            @click="rejectNonEssentialCookies"
          >
            {{ $t('Reject Optional') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="bordered"
            class="banner__button banner__button_settings"
            @click="openCookieSettings"
          >
            {{ $t('Cookie Settings') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="primary"
            class="banner__button banner__button_accept"
            @click="acceptAllCookies"
          >
            {{ $t('Accept All Cookies') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>

  <BaseModal
    :show="showDetailedModal"
    wrapper-classes="cookie__modal-wrap"
    @close="handleDetailedModalClose"
  >
    <div class="cookie__modal">
      <div class="cookie__top">
        <div class="cookie__label">
          {{ $t('MANAGE YOUR PRIVACY') }}
        </div>

        <h2 class="cookie__title _h3">
          {{ $t('Cookie Preferences') }}
        </h2>

        <p class="cookie__desc">
          {{
            $t(
              'Choose which cookies Relic Forge can use. Essential cookies are always enabled to keep the marketplace secure and functioning correctly.',
            )
          }}
        </p>

        <RouterLink
          v-if="cookiePageLink"
          :to="cookiePageLink"
          class="cookie__desc-link"
          target="_blank"
        >
          {{ $t('Read our Cookie Notice') }}
        </RouterLink>
      </div>

      <div class="cookie__list">
        <div class="cookie__item cookie__item_required">
          <div class="cookie__info">
            <div class="cookie__item-heading">
              <h3 class="cookie__subtitle">
                {{ $t('Essential Cookies') }}
              </h3>

              <span class="cookie__required">
                {{ $t('Always Active') }}
              </span>
            </div>

            <p class="cookie__text">
              {{
                $t(
                  'These cookies are technically required for our Website to operate securely and correctly. They enable core features like user login, page security, and privacy preferences, and cannot be turned off.',
                )
              }}
            </p>
          </div>

          <div class="cookie__control">
            <BaseCheckbox
              :model-value="true"
              :disabled="true"
              class="cookie__checkbox cookie__checkbox_disabled"
            />
          </div>
        </div>

        <div
          class="cookie__item"
          :class="{ 'is-enabled': cookieCategories.functional }"
        >
          <button
            type="button"
            class="cookie__info-button"
            :aria-pressed="cookieCategories.functional"
            @click="toggleCategory('functional')"
          >
            <span class="cookie__subtitle">
              {{ $t('Functional (Preference) Cookies') }}
            </span>

            <span class="cookie__text">
              {{
                $t(
                  'These cookies personalize your browsing experience by remembering your custom preferences, such as your preferred language and regional settings, so you do not have to re-enter them on future visits.',
                )
              }}
            </span>
          </button>

          <div class="cookie__control">
            <BaseCheckbox
              v-model="cookieCategories.functional"
              class="cookie__checkbox"
            />
          </div>
        </div>

        <div
          class="cookie__item"
          :class="{ 'is-enabled': cookieCategories.analytics }"
        >
          <button
            type="button"
            class="cookie__info-button"
            :aria-pressed="cookieCategories.analytics"
            @click="toggleCategory('analytics')"
          >
            <span class="cookie__subtitle">
              {{ $t('Performance (Analytics) Cookies') }}
            </span>

            <span class="cookie__text">
              {{
                $t(
                  'These cookies collect information about how visitors use our Website. We use this information to measure page performance, diagnose technical errors, and improve our services.',
                )
              }}
            </span>
          </button>

          <div class="cookie__control">
            <BaseCheckbox
              v-model="cookieCategories.analytics"
              class="cookie__checkbox"
            />
          </div>
        </div>

        <div
          class="cookie__item"
          :class="{ 'is-enabled': cookieCategories.advertising }"
        >
          <button
            type="button"
            class="cookie__info-button"
            :aria-pressed="cookieCategories.advertising"
            @click="toggleCategory('advertising')"
          >
            <span class="cookie__subtitle">
              {{ $t('Advertising / Targeting Cookies') }}
            </span>

            <span class="cookie__text">
              {{
                $t(
                  'These cookies are used to deliver more relevant content or advertising and to measure the effectiveness of campaigns.',
                )
              }}
            </span>
          </button>

          <div class="cookie__control">
            <BaseCheckbox
              v-model="cookieCategories.advertising"
              class="cookie__checkbox"
            />
          </div>
        </div>
      </div>

      <div class="cookie__bottom">
        <p class="cookie__bottom-text">
          {{ $t('You can update your cookie preferences at any time.') }}
        </p>

        <div class="cookie__actions">
          <BaseButton
            type="button"
            variant="bordered"
            class="cookie__button cookie__button_reject"
            @click="rejectNonEssentialCookies"
          >
            {{ $t('Reject Optional') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="bordered"
            class="cookie__button cookie__button_save"
            @click="acceptSelectedCookies"
          >
            {{ $t('Save Preferences') }}
          </BaseButton>

          <BaseButton
            type="button"
            variant="primary"
            class="cookie__button cookie__button_accept"
            @click="acceptAllCookies"
          >
            {{ $t('Accept All') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseModal from '@/components/base/BaseModal.vue'

import { useStaticPages } from '@/composables/useStaticPages'

const $cookies = inject('$cookies', null)

const { cookiePage, ensurePages } = useStaticPages()

const CONSENT_KEY = 'cookie_consent'
const CATEGORIES_KEY = 'cookie_categories'
const CONSENT_LOG_KEY = 'cookie_consent_log'

const showInitialBanner = ref(false)
const showDetailedModal = ref(false)
const hasInitialConsent = ref(false)

const getDefaultCategories = () => ({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const cookieCategories = ref(getDefaultCategories())
const currentConsent = ref(getDefaultCategories())
const consentLog = ref([])

const cookiePageLink = computed(() => {
  if (!cookiePage.value?.slug) return null

  return {
    name: 'StaticPageBySlug',
    params: {
      slug: cookiePage.value.slug,
    },
  }
})

const setCookieValue = (key, value, expires = null) => {
  if (!$cookies) return

  $cookies.set(key, JSON.stringify(value), expires || '1y')
}

const getCookieValue = key => {
  if (!$cookies || !$cookies.isKey(key)) return null

  try {
    return JSON.parse($cookies.get(key))
  } catch {
    return $cookies.get(key)
  }
}

const hasCookie = key => {
  if (!$cookies) return false

  return $cookies.isKey(key)
}

const normalizeCategories = categories => ({
  essential: true,
  functional: Boolean(categories?.functional),
  analytics: Boolean(categories?.analytics),
  advertising: Boolean(categories?.advertising),
})

const loadConsent = () => {
  const consent = getCookieValue(CONSENT_KEY)
  const categories = getCookieValue(CATEGORIES_KEY)
  const log = getCookieValue(CONSENT_LOG_KEY) || []

  hasInitialConsent.value = Boolean(consent)

  if (consent) {
    const savedCategories = normalizeCategories(categories)

    currentConsent.value = {
      ...savedCategories,
    }

    cookieCategories.value = {
      ...savedCategories,
    }
  } else {
    currentConsent.value = getDefaultCategories()
    cookieCategories.value = getDefaultCategories()
  }

  consentLog.value = Array.isArray(log) ? log : []
}

const logConsent = action => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    categories: normalizeCategories(cookieCategories.value),
  }

  consentLog.value.unshift(logEntry)

  setCookieValue(CONSENT_LOG_KEY, consentLog.value)
}

const saveConsent = action => {
  const categories = normalizeCategories(cookieCategories.value)

  cookieCategories.value = {
    ...categories,
  }

  currentConsent.value = {
    ...categories,
  }

  setCookieValue(CONSENT_KEY, true)
  setCookieValue(CATEGORIES_KEY, categories)

  logConsent(action)

  hasInitialConsent.value = true
  showInitialBanner.value = false
  showDetailedModal.value = false
}

const acceptAllCookies = () => {
  cookieCategories.value = {
    essential: true,
    functional: true,
    analytics: true,
    advertising: true,
  }

  saveConsent('All cookies accepted')
}

const rejectNonEssentialCookies = () => {
  cookieCategories.value = {
    essential: true,
    functional: false,
    analytics: false,
    advertising: false,
  }

  saveConsent('All non-essential cookies rejected')
}

const acceptSelectedCookies = () => {
  cookieCategories.value.essential = true

  saveConsent('Cookie preferences saved')
}

const openCookieSettings = () => {
  loadConsent()

  cookieCategories.value = {
    ...currentConsent.value,
    essential: true,
  }

  showInitialBanner.value = false
  showDetailedModal.value = true
}

const openCookieBanner = () => {
  loadConsent()

  showDetailedModal.value = false
  showInitialBanner.value = true
}

const handleDetailedModalClose = () => {
  cookieCategories.value = {
    ...currentConsent.value,
    essential: true,
  }

  showDetailedModal.value = false

  if (!hasInitialConsent.value) {
    showInitialBanner.value = true
  }
}

const closeModal = () => {
  showDetailedModal.value = false
}

const toggleCategory = category => {
  if (category === 'essential') return
  if (!(category in cookieCategories.value)) return

  cookieCategories.value[category] = !cookieCategories.value[category]
}

onMounted(async () => {
  loadConsent()

  if (!hasCookie(CONSENT_KEY)) {
    showInitialBanner.value = true
  }

  try {
    await ensurePages()
  } catch (error) {
    console.error('Failed to load cookie notice:', error)
  }
})

defineExpose({
  showBanner: openCookieBanner,
  showSettings: openCookieSettings,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cookie {
  &__modal {
    width: 100%;
    min-width: 0;
    color: #f4f6fb;
  }

  &__top {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__label {
    margin-bottom: 12px;
    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(23px, 2.6vw, 30px);
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    text-transform: none;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__desc {
    max-width: 580px;
    margin: 0;
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.65;
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__desc-link {
    display: inline;
    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: inherit;
    font-weight: 600;
    line-height: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        color: #a9ceff;
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    min-width: 0;
    padding: 19px 20px;

    border: 1px solid #303948;
    border-radius: 10px;
    background-color: #19212c;

    transition:
      border-color 0.25s ease,
      background-color 0.25s ease;

    &.is-enabled {
      border-color: rgba(26, 115, 255, 0.45);
    }

    &_required {
      background-color: #151f2b;
    }

    @media (any-hover: hover) {
      &:hover:not(.cookie__item_required) {
        border-color: rgba(26, 115, 255, 0.65);
      }
    }
  }

  &__info,
  &__info-button {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    gap: 8px;
    margin: 0;
    text-align: left;
  }

  &__info-button {
    padding: 0;
    border: 0;
    outline-offset: 5px;
    background: transparent;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid #1a73ff;
      border-radius: 3px;
    }
  }

  &__item-heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }

  &__subtitle {
    display: block;
    margin: 0;
    color: #f4f6fb;
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;
  }

  &__required {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: rgba(26, 115, 255, 0.12);
    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
  }

  &__text {
    display: block;
    margin: 0;
    color: #99a1b0;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;
    text-align: left;
    overflow-wrap: anywhere;
  }

  &__control {
    display: flex;
    flex: 0 0 20px;
    align-items: center;
    justify-content: center;
    width: 20px;
    min-width: 20px;
    align-self: center;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.base-checkbox__row) {
      display: flex;
      align-items: center;
      gap: 0;
      cursor: pointer;
    }

    :deep(.base-checkbox__box) {
      width: 20px;
      min-width: 20px;
      height: 20px;
      border: 1px solid #4c5a6c;
      border-radius: 5px;
      background-color: #222934;
    }

    :deep(.base-checkbox__box.is-checked) {
      border-color: #1a73ff;
      background-color: #1a73ff;
    }

    :deep(.base-checkbox__check) {
      color: #ffffff;
    }

    &_disabled {
      opacity: 1;

      :deep(.base-checkbox__box) {
        border-color: #1a73ff;
        background-color: #1a73ff;
      }
    }
  }

  &__bottom {
    margin-top: 25px;
    padding-top: 23px;
    border-top: 1px solid rgba(153, 161, 176, 0.12);
  }

  &__bottom-text {
    margin: 0 0 18px;
    color: #8995a7;
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  &__button {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    height: 46px;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &_reject,
    &_save {
      border: 1px solid #8794a6 !important;
      background-color: transparent !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #1a73ff !important;
          background-color: rgba(26, 115, 255, 0.12) !important;
        }
      }
    }

    &_accept {
      border: 1px solid #1a73ff !important;
      background-color: #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #005fe8 !important;
          background-color: #005fe8 !important;
        }
      }
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }
  }

  @media (max-width: $md5) {
    &__top {
      padding-top: 5px;
    }

    &__desc {
      font-size: 13px;
    }

    &__item {
      gap: 12px;
      padding: 15px 13px;
    }

    &__subtitle {
      font-size: 13px;
    }

    &__text {
      font-size: 12px;
    }

    &__actions {
      grid-template-columns: minmax(0, 1fr);
      gap: 9px;
    }

    &__button {
      min-height: 43px;
      height: 43px;
      font-size: 12px;
    }
  }
}

.banner {
  position: fixed;
  left: 50%;
  bottom: 20px;
  z-index: var(--modal-z-index);

  width: min(940px, calc(100% - 32px));
  max-height: calc(100dvh - 40px);
  padding: 26px 30px;

  transform: translateX(-50%);

  border: 1px solid #344050;
  border-radius: 16px;
  background:
    radial-gradient(
      ellipse at 0% 0%,
      rgba(26, 115, 255, 0.07),
      transparent 60%
    ),
    #111821;

  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.45);

  overflow-x: hidden;
  overflow-y: auto;

  &__inner,
  &__body {
    width: 100%;
    min-width: 0;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
  }

  &__icon {
    display: flex;
    flex: 0 0 50px;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;

    border: 1px solid rgba(26, 115, 255, 0.45);
    border-radius: 10px;

    background-color: rgba(26, 115, 255, 0.1);
    color: #65a7ff;

    svg {
      display: block;
      width: 26px;
      height: 26px;
    }
  }

  &__heading-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  &__label {
    color: #65a7ff;
    font-family: var(--font-inter);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    line-height: 1.4;
  }

  &__title {
    margin: 0;
    color: #f4f6fb;
    font-family: var(--font-orbitron);
    font-size: clamp(18px, 2vw, 23px);
    font-weight: 700;
    line-height: 1.3;
    text-transform: none;
  }

  &__text {
    color: #aeb8c8;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.7;
    text-align: left;

    span {
      margin-left: 4px;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  &__button {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    height: 46px;
    padding: 8px 12px;

    border-radius: 8px;
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;

    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &_reject,
    &_settings {
      border: 1px solid #8794a6 !important;
      background-color: transparent !important;
      color: #f4f6fb !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #1a73ff !important;
          background-color: rgba(26, 115, 255, 0.12) !important;
        }
      }
    }

    &_accept {
      border: 1px solid #1a73ff !important;
      background-color: #1a73ff !important;
      color: #ffffff !important;

      @media (any-hover: hover) {
        &:hover {
          border-color: #005fe8 !important;
          background-color: #005fe8 !important;
        }
      }
    }

    &:focus-visible {
      outline: 2px solid #65a7ff;
      outline-offset: 3px;
    }
  }

  @media (max-width: $md5) {
    bottom: 10px;
    width: calc(100% - 20px);
    max-height: calc(100dvh - 20px);
    padding: 20px 18px;
    border-radius: 12px;

    &__heading {
      gap: 12px;
    }

    &__icon {
      flex-basis: 42px;
      width: 42px;
      height: 42px;

      svg {
        width: 23px;
        height: 23px;
      }
    }

    &__title {
      font-size: 18px;
    }

    &__text {
      font-size: 12px;
    }

    &__actions {
      grid-template-columns: minmax(0, 1fr);
      gap: 9px;
    }

    &__button {
      min-height: 42px;
      height: 42px;
      font-size: 12px;
    }
  }
}

:global(.modal .modal__inner.cookie__modal-wrap) {
  width: min(730px, calc(100% - 32px));
  max-width: 730px;
  max-height: calc(100dvh - 32px);

  padding: 50px 35px 34px;

  border: 1px solid #344050;
  border-radius: 18px;

  background-color: #111821;
  background-image: none;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);

  overflow-x: hidden;
  overflow-y: auto;
}

:global(.modal .modal__inner.cookie__modal-wrap .modal__close) {
  top: 12px;
  right: 12px;

  width: 34px;
  min-width: 34px;
  height: 34px;
  padding: 0;

  border-radius: 6px;
  background-color: transparent;
  color: #f4f6fb;
}

:global(.modal .modal__inner.cookie__modal-wrap .modal__close:hover) {
  color: #1a73ff;
}

@media (max-width: $md5) {
  :global(.modal .modal__inner.cookie__modal-wrap) {
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;

    padding: 48px 17px 25px;

    border-radius: 16px 16px 0 0;
  }
}
</style>
