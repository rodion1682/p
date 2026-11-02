<template>
  <div v-if="showInitialBanner && !showDetailedModal" class="cookie-banner">
    <div class="cookie-banner__inner">
      <div class="cookie-banner__content">
        <div class="cookie-banner__title _h5">
          {{ $t('Cookies Inside') }}
        </div>

        <div class="cookie-banner__text">
          {{
            $t(
              'We use cookies to make the website work properly, remember your preferences, and improve your experience.',
            )
          }}

          <RouterLink
            v-if="cookiePage && cookiePageLink"
            :to="cookiePageLink"
            class="cookie-banner__link"
          >
            {{ cookiePage.title }}
          </RouterLink>
        </div>
      </div>

      <div class="cookie-banner__actions">
        <BaseButton
          variant="bordered"
          class="cookie-banner__button"
          @click="openDetailedModal"
        >
          {{ $t('Customize') }}
        </BaseButton>

        <BaseButton
          variant="bordered"
          class="cookie-banner__button"
          @click="declineAllCookies"
        >
          {{ $t('Reject All') }}
        </BaseButton>

        <BaseButton
          variant="primary"
          class="cookie-banner__button"
          @click="acceptAllCookies"
        >
          {{ $t('Accept All') }}
        </BaseButton>
      </div>
    </div>
  </div>

  <BaseModal
    :show="showDetailedModal"
    :wrapper-classes="['cookie-modal__wrap']"
    @close="handleDetailedModalClose"
  >
    <div class="cookie-modal">
      <div class="cookie-modal__header">
        <div class="cookie-modal__title _h3">
          {{ $t('Cookie settings') }}
        </div>

        <div class="cookie-modal__desc">
          {{
            $t(
              'Manage which cookies we can use. Essential cookies are always active because the website cannot work without them.',
            )
          }}
        </div>
      </div>

      <div class="cookie-modal__list">
        <div class="cookie-modal__item cookie-modal__item_disabled is-active">
          <div class="cookie-modal__info">
            <div class="cookie-modal__subtitle">
              {{ $t('Essential Cookies') }}
            </div>

            <div class="cookie-modal__text">
              {{
                $t(
                  'Required for core website functionality. These cannot be disabled.',
                )
              }}
            </div>
          </div>

          <BaseCheckbox
            :model-value="true"
            disabled
            class="cookie-modal__checkbox"
          />
        </div>

        <button
          type="button"
          class="cookie-modal__item"
          :class="{
            'is-active': cookieCategories.functional,
          }"
          @click="toggleCategory('functional')"
        >
          <div class="cookie-modal__info">
            <div class="cookie-modal__subtitle">
              {{ $t('Functional Cookies') }}
            </div>

            <div class="cookie-modal__text">
              {{
                $t(
                  'Remember your choices, such as language, region, and interface preferences.',
                )
              }}
            </div>
          </div>

          <BaseCheckbox
            v-model="cookieCategories.functional"
            class="cookie-modal__checkbox"
            @click.stop
          />
        </button>

        <button
          type="button"
          class="cookie-modal__item"
          :class="{
            'is-active': cookieCategories.analytics,
          }"
          @click="toggleCategory('analytics')"
        >
          <div class="cookie-modal__info">
            <div class="cookie-modal__subtitle">
              {{ $t('Analytics Cookies') }}
            </div>

            <div class="cookie-modal__text">
              {{
                $t(
                  'Help us understand how visitors use the website so we can improve it.',
                )
              }}
            </div>
          </div>

          <BaseCheckbox
            v-model="cookieCategories.analytics"
            class="cookie-modal__checkbox"
            @click.stop
          />
        </button>

        <button
          type="button"
          class="cookie-modal__item"
          :class="{
            'is-active': cookieCategories.advertising,
          }"
          @click="toggleCategory('advertising')"
        >
          <div class="cookie-modal__info">
            <div class="cookie-modal__subtitle">
              {{ $t('Marketing Cookies') }}
            </div>

            <div class="cookie-modal__text">
              {{
                $t(
                  'Used to show more relevant content and measure campaign performance.',
                )
              }}
            </div>
          </div>

          <BaseCheckbox
            v-model="cookieCategories.advertising"
            class="cookie-modal__checkbox"
            @click.stop
          />
        </button>
      </div>

      <div class="cookie-modal__actions">
        <BaseButton
          variant="bordered"
          class="cookie-modal__button"
          @click="declineAllCookies"
        >
          {{ $t('Reject All') }}
        </BaseButton>

        <BaseButton
          variant="primary"
          class="cookie-modal__button"
          @click="acceptSelectedCookies"
        >
          {{ $t('Save & Exit') }}
        </BaseButton>
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
const showSettings = ref(false)
const hasInitialConsent = ref(false)

const closeWasConfirmed = ref(false)

const cookieCategories = ref({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const currentConsent = ref({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const consentLog = ref([])

const cookiePageLink = computed(() => {
  if (!cookiePage.value?.slug) {
    return null
  }

  return {
    name: 'StaticPageBySlug',
    params: {
      slug: cookiePage.value.slug,
    },
  }
})

const setCookieValue = (key, value, expires = null) => {
  if (!$cookies) {
    return
  }

  $cookies.set(key, JSON.stringify(value), expires || '1y')
}

const getCookieValue = key => {
  if (!$cookies?.isKey(key)) {
    return null
  }

  try {
    return JSON.parse($cookies.get(key))
  } catch {
    return $cookies.get(key)
  }
}

const hasCookie = key => {
  return Boolean($cookies?.isKey(key))
}

const loadConsent = () => {
  const consent = getCookieValue(CONSENT_KEY)
  const categories = getCookieValue(CATEGORIES_KEY)
  const log = getCookieValue(CONSENT_LOG_KEY) || []

  if (consent) {
    hasInitialConsent.value = true

    currentConsent.value = {
      ...currentConsent.value,
      ...categories,
      essential: true,
    }

    cookieCategories.value = {
      ...currentConsent.value,
      essential: true,
    }
  }

  consentLog.value = Array.isArray(log) ? log : []
}

const logConsent = action => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    categories: {
      ...cookieCategories.value,
      essential: true,
    },
  }

  consentLog.value.unshift(logEntry)

  setCookieValue(CONSENT_LOG_KEY, consentLog.value)
}

const saveConsent = action => {
  cookieCategories.value = {
    ...cookieCategories.value,
    essential: true,
  }

  setCookieValue(CONSENT_KEY, true)

  setCookieValue(CATEGORIES_KEY, cookieCategories.value)

  currentConsent.value = {
    ...cookieCategories.value,
    essential: true,
  }

  logConsent(action)

  hasInitialConsent.value = true

  closeWasConfirmed.value = true

  showInitialBanner.value = false
  showDetailedModal.value = false
  showSettings.value = false
}

const updateConsent = () => {
  saveConsent('Consent updated')
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

const declineAllCookies = () => {
  cookieCategories.value = {
    essential: true,
    functional: false,
    analytics: false,
    advertising: false,
  }

  saveConsent('Non-essential cookies rejected')
}

const acceptSelectedCookies = () => {
  saveConsent('Selected cookies accepted')
}

const restoreCurrentConsent = () => {
  cookieCategories.value = {
    ...currentConsent.value,
    essential: true,
  }
}

const openDetailedModal = () => {
  closeWasConfirmed.value = false

  showInitialBanner.value = false
  showSettings.value = true
  showDetailedModal.value = true
}

const handleDetailedModalClose = () => {
  showDetailedModal.value = false
  showSettings.value = false

  if (closeWasConfirmed.value) {
    closeWasConfirmed.value = false
    return
  }

  restoreCurrentConsent()

  showInitialBanner.value = true
}

const toggleCategory = category => {
  if (category === 'essential') {
    return
  }

  cookieCategories.value = {
    ...cookieCategories.value,
    [category]: !cookieCategories.value[category],
  }
}

onMounted(async () => {
  await ensurePages()

  loadConsent()

  if (!hasCookie(CONSENT_KEY)) {
    showInitialBanner.value = true
  }
})

defineExpose({
  showSettings: () => {
    restoreCurrentConsent()

    closeWasConfirmed.value = false

    showInitialBanner.value = false
    showSettings.value = true
    showDetailedModal.value = true
  },

  updateConsent,
})
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.cookie-banner {
  position: fixed;

  left: 50%;
  bottom: 20px;

  z-index: calc(var(--header-z-index) + 10);

  width: calc(100% - 32px);
  max-width: 1050px;

  transform: translateX(-50%);

  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;

  background-color: rgba(18, 24, 28, 0.98);

  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);

  @media (max-width: $md6) {
    bottom: 10px;

    width: calc(100% - 20px);
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 32, 18);
    @include adaptiveValue('padding', 22, 15);

    @media (max-width: $md3) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__title {
    color: var(--primary-color);

    font-family: var(--font-condensed);
    font-weight: 700;

    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__text {
    max-width: 600px;

    color: var(--secondary-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__link {
    margin-left: 4px;

    color: var(--hint-primary-color);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;

    flex: 0 0 auto;

    gap: 8px;

    @media (max-width: $md5) {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));

      width: 100%;
    }

    @media (max-width: $md7) {
      grid-template-columns: 1fr;
    }
  }

  &__button {
    min-width: 120px;

    @include adaptiveValue('min-height', 40, 38);

    font-family: var(--font-condensed);
    font-size: 14px;
    font-weight: 700;
    line-height: 1;

    text-transform: uppercase;

    @media (max-width: $md5) {
      width: 100%;
      min-width: 0;
    }
  }
}

.cookie-modal {
  width: 100%;

  &__wrap {
    width: 100%;

    max-width: 680px;
  }

  &__header {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__title {
    color: var(--primary-color);

    font-family: var(--font-condensed);
    font-weight: 700;

    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__desc {
    max-width: 580px;

    color: var(--secondary-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__list {
    display: flex;
    flex-direction: column;

    gap: 6px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    @include adaptiveValue('gap', 24, 15);

    @include adaptiveValue('padding-top', 16, 13);

    @include adaptiveValue('padding-bottom', 16, 13);

    @include adaptiveValue('padding-left', 18, 14);

    @include adaptiveValue('padding-right', 18, 14);

    border: 1px solid var(--border-secondary-color);

    border-radius: 6px;

    background-color: var(--bg-primary-color);

    color: var(--primary-color);

    text-align: left;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        background-color: var(--bg-fourth-color);
      }
    }

    &.is-active {
      border-color: var(--hint-primary-color);

      background-color: var(--bg-fourth-color);

      .cookie-modal__subtitle {
        color: var(--hint-primary-color);
      }
    }

    &_disabled {
      cursor: default;

      opacity: 0.65;

      @media (any-hover: hover) {
        &:hover {
          border-color: var(--border-secondary-color);

          background-color: var(--bg-primary-color);
        }
      }
    }
  }

  &__info {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__subtitle {
    color: var(--primary-color);

    font-family: var(--font-condensed);
    font-size: 16px;
    font-weight: 700;
    line-height: 120%;

    text-transform: uppercase;

    transition: color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__text {
    max-width: 500px;

    color: var(--secondary-color);

    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 400;
    line-height: 145%;
  }

  &__checkbox {
    flex: 0 0 auto;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    gap: 10px;

    @media (max-width: $md6) {
      flex-direction: column;
    }
  }

  &__button {
    min-width: 150px;

    @include adaptiveValue('min-height', 42, 40);

    font-family: var(--font-condensed);
    font-size: 14px;
    font-weight: 700;
    line-height: 1;

    text-transform: uppercase;

    @media (max-width: $md6) {
      width: 100%;
    }
  }
}
</style>
