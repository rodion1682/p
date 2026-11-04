<template>
  <div
    v-if="showInitialBanner && !showDetailedModal"
    class="cookie-banner"
    role="region"
    :aria-label="$t('Cookie settings')"
  >
    <div class="cookie-banner__inner">
      <div class="cookie-banner__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M37.7 24.8a8.5 8.5 0 0 1-10.5-10.5 8.5 8.5 0 0 1-9.5-9.3A19.5 19.5 0 1 0 43 30.4a8.3 8.3 0 0 1-5.3-5.6Z"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="17" cy="22" r="2" fill="currentColor" />
          <circle cx="28" cy="32" r="2" fill="currentColor" />
          <circle cx="17" cy="34" r="1.5" fill="currentColor" />
          <circle cx="29" cy="22" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div class="cookie-banner__content">
        <h2 class="cookie-banner__title">
          {{ $t('Cookies Inside') }}
        </h2>

        <p class="cookie-banner__text">
          {{
            $t(
              'We use cookies to make the website work properly, remember your preferences, and improve your experience.',
            )
          }}

          <RouterLink
            v-if="cookiePageLink"
            :to="cookiePageLink"
            class="cookie-banner__link"
          >
            {{ cookiePage.title }}
          </RouterLink>
        </p>
      </div>

      <div class="cookie-banner__actions">
        <BaseButton
          type="button"
          variant="bordered"
          class="cookie-banner__button"
          @click="openDetailedModal"
        >
          {{ $t('Customize') }}
        </BaseButton>

        <BaseButton
          type="button"
          variant="bordered"
          class="cookie-banner__button"
          @click="declineAllCookies"
        >
          {{ $t('Reject All') }}
        </BaseButton>

        <BaseButton
          type="button"
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
    wrapper-classes="cookie-modal__wrap"
    :aria-label="$t('Cookie settings')"
    @close="handleDetailedModalClose"
  >
    <div class="cookie-modal">
      <header class="cookie-modal__header">
        <div class="cookie-modal__heading">
          <div class="cookie-modal__symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="8" cy="12" r="1.2" fill="currentColor" />
              <circle cx="14" cy="16" r="1.2" fill="currentColor" />
              <circle cx="9" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>

          <h2 class="cookie-modal__title _h3">
            {{ $t('Cookie settings') }}
          </h2>
        </div>

        <p class="cookie-modal__desc">
          {{
            $t(
              'Manage which cookies we can use. Essential cookies are always active because the website cannot work without them.',
            )
          }}
        </p>

        <RouterLink
          v-if="cookiePageLink"
          :to="cookiePageLink"
          class="cookie-modal__policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ cookiePage.title }}
        </RouterLink>
      </header>

      <div class="cookie-modal__list">
        <div class="cookie-modal__item is-active is-essential">
          <div class="cookie-modal__info">
            <div class="cookie-modal__subtitle">
              {{ $t('Essential Cookies') }}
            </div>

            <p class="cookie-modal__text">
              {{
                $t(
                  'Required for core website functionality. These cannot be disabled.',
                )
              }}
            </p>
          </div>

          <BaseCheckbox
            :model-value="true"
            disabled
            class="cookie-modal__checkbox"
          >
            <span class="cookie-modal__checkbox-text">
              {{ $t('Essential Cookies') }}
            </span>
          </BaseCheckbox>
        </div>

        <div
          class="cookie-modal__item"
          :class="{ 'is-active': cookieCategories.functional }"
        >
          <button
            type="button"
            class="cookie-modal__info cookie-modal__toggle"
            :aria-pressed="cookieCategories.functional"
            @click="toggleCategory('functional')"
          >
            <span class="cookie-modal__subtitle">
              {{ $t('Functional Cookies') }}
            </span>

            <span class="cookie-modal__text">
              {{
                $t(
                  'Remember your choices, such as language, region, and interface preferences.',
                )
              }}
            </span>
          </button>

          <BaseCheckbox
            v-model="cookieCategories.functional"
            class="cookie-modal__checkbox"
          >
            <span class="cookie-modal__checkbox-text">
              {{ $t('Functional Cookies') }}
            </span>
          </BaseCheckbox>
        </div>

        <div
          class="cookie-modal__item"
          :class="{ 'is-active': cookieCategories.analytics }"
        >
          <button
            type="button"
            class="cookie-modal__info cookie-modal__toggle"
            :aria-pressed="cookieCategories.analytics"
            @click="toggleCategory('analytics')"
          >
            <span class="cookie-modal__subtitle">
              {{ $t('Analytics Cookies') }}
            </span>

            <span class="cookie-modal__text">
              {{
                $t(
                  'Help us understand how visitors use the website so we can improve it.',
                )
              }}
            </span>
          </button>

          <BaseCheckbox
            v-model="cookieCategories.analytics"
            class="cookie-modal__checkbox"
          >
            <span class="cookie-modal__checkbox-text">
              {{ $t('Analytics Cookies') }}
            </span>
          </BaseCheckbox>
        </div>

        <div
          class="cookie-modal__item"
          :class="{ 'is-active': cookieCategories.advertising }"
        >
          <button
            type="button"
            class="cookie-modal__info cookie-modal__toggle"
            :aria-pressed="cookieCategories.advertising"
            @click="toggleCategory('advertising')"
          >
            <span class="cookie-modal__subtitle">
              {{ $t('Marketing Cookies') }}
            </span>

            <span class="cookie-modal__text">
              {{
                $t(
                  'Used to show more relevant content and measure campaign performance.',
                )
              }}
            </span>
          </button>

          <BaseCheckbox
            v-model="cookieCategories.advertising"
            class="cookie-modal__checkbox"
          >
            <span class="cookie-modal__checkbox-text">
              {{ $t('Marketing Cookies') }}
            </span>
          </BaseCheckbox>
        </div>
      </div>

      <div class="cookie-modal__actions">
        <BaseButton
          type="button"
          variant="bordered"
          class="cookie-modal__button"
          @click="declineAllCookies"
        >
          {{ $t('Reject All') }}
        </BaseButton>

        <BaseButton
          type="button"
          variant="bordered"
          class="cookie-modal__button"
          @click="acceptAllCookies"
        >
          {{ $t('Accept All') }}
        </BaseButton>

        <BaseButton
          type="button"
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

const defaultCategories = () => ({
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
})

const showInitialBanner = ref(false)
const showDetailedModal = ref(false)
const hasInitialConsent = ref(false)

const cookieCategories = ref(defaultCategories())
const currentConsent = ref(defaultCategories())
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

const normalizeCategories = source => ({
  essential: true,
  functional: source?.functional === true,
  analytics: source?.analytics === true,
  advertising: source?.advertising === true,
})

const parseStoredValue = raw => {
  if (raw === null || raw === undefined) return null

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const getStoredValue = key => {
  try {
    if ($cookies?.isKey?.(key)) {
      return parseStoredValue($cookies.get(key))
    }
  } catch {
    return null
  }

  try {
    return parseStoredValue(localStorage.getItem(key))
  } catch {
    return null
  }
}

const setStoredValue = (key, value) => {
  const serialized = JSON.stringify(value)

  try {
    $cookies?.set?.(key, serialized, '1y')
  } catch {}

  try {
    localStorage.setItem(key, serialized)
  } catch {}
}

const restoreCurrentConsent = () => {
  cookieCategories.value = normalizeCategories(currentConsent.value)
}

const loadConsent = () => {
  const savedConsent = getStoredValue(CONSENT_KEY)
  const savedCategories = getStoredValue(CATEGORIES_KEY)
  const savedLog = getStoredValue(CONSENT_LOG_KEY)

  hasInitialConsent.value = savedConsent !== null
  currentConsent.value = normalizeCategories(savedCategories)

  restoreCurrentConsent()

  consentLog.value = Array.isArray(savedLog) ? savedLog : []
  showInitialBanner.value = !hasInitialConsent.value
}

const saveConsent = action => {
  const categories = normalizeCategories(cookieCategories.value)

  cookieCategories.value = categories
  currentConsent.value = { ...categories }

  setStoredValue(CONSENT_KEY, true)
  setStoredValue(CATEGORIES_KEY, categories)

  consentLog.value = [
    {
      timestamp: new Date().toISOString(),
      action,
      categories: { ...categories },
    },
    ...consentLog.value,
  ].slice(0, 10)

  setStoredValue(CONSENT_LOG_KEY, consentLog.value)

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

const declineAllCookies = () => {
  cookieCategories.value = defaultCategories()

  saveConsent('Non-essential cookies rejected')
}

const acceptSelectedCookies = () => {
  saveConsent('Selected cookies accepted')
}

const updateConsent = () => {
  saveConsent('Consent updated')
}

const toggleCategory = category => {
  if (category === 'essential') return

  cookieCategories.value = {
    ...cookieCategories.value,
    [category]: !cookieCategories.value[category],
  }
}

const openDetailedModal = () => {
  restoreCurrentConsent()

  showInitialBanner.value = false
  showDetailedModal.value = true
}

const handleDetailedModalClose = () => {
  restoreCurrentConsent()

  showDetailedModal.value = false
  showInitialBanner.value = !hasInitialConsent.value
}

onMounted(() => {
  loadConsent()

  Promise.resolve(ensurePages()).catch(console.error)
})

defineExpose({
  showSettings: openDetailedModal,
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

  z-index: calc(var(--header-z-index) + 1);

  width: calc(100% - 32px);
  max-width: 1080px;

  transform: translateX(-50%);

  border: 1px solid var(--border-primary-color);
  border-radius: 6px;

  background-color: var(--bg-eight-color);
  box-shadow: 0 14px 45px rgba(24, 30, 26, 0.18);

  &__inner {
    display: flex;
    align-items: center;

    gap: 20px;
    padding: 20px 22px;
  }

  &__icon {
    display: flex;
    flex: 0 0 54px;

    align-items: center;
    justify-content: center;

    width: 54px;
    height: 54px;

    border-radius: 5px;

    background-color: var(--hint-primary-color);
    color: var(--bg-eight-color);

    svg {
      width: 32px;
      height: 32px;
    }
  }

  &__content {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title {
    margin: 0 0 6px;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.15;

    text-transform: uppercase;
  }

  &__text {
    margin: 0;
    max-width: 540px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 1.6;
  }

  &__link {
    display: inline;

    color: var(--link-color);

    font-family: inherit;
    font-weight: 500;

    text-decoration: underline !important;
    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--link-hover-color);
      }
    }
  }

  &__actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;

    gap: 8px;
  }

  &__button {
    width: auto;
    min-width: 113px;
    min-height: 42px;

    padding: 9px 12px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;

    white-space: nowrap;
    text-transform: uppercase;
  }

  @media (max-width: $md3) {
    &__inner {
      flex-wrap: wrap;
      gap: 15px;
    }

    &__actions {
      flex: 1 1 100%;

      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &__button {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: $md6) {
    bottom: 10px;
    width: calc(100% - 20px);

    &__inner {
      padding: 16px 14px;
      gap: 12px;
    }

    &__icon {
      flex-basis: 42px;

      width: 42px;
      height: 42px;

      svg {
        width: 26px;
        height: 26px;
      }
    }

    &__title {
      font-size: 19px;
    }

    &__text {
      font-size: 12px;
    }
  }

  @media (max-width: $md7) {
    &__actions {
      grid-template-columns: minmax(0, 1fr);
    }

    &__button {
      min-height: 38px;
    }
  }
}

.modal .modal__inner.cookie-modal__wrap {
  width: 100%;
  max-width: 700px;

  border: 1px solid var(--border-primary-color);
  border-radius: 6px;

  background-color: var(--bg-eight-color);
}

.cookie-modal__wrap .modal__content {
  background-color: var(--bg-eight-color);
}

.cookie-modal {
  width: 100%;
  min-width: 0;

  &__header {
    padding-right: 22px;
    margin-bottom: 23px;
  }

  &__heading {
    display: flex;
    align-items: center;

    gap: 12px;
    margin-bottom: 12px;
  }

  &__symbol {
    display: flex;
    flex: 0 0 38px;

    align-items: center;
    justify-content: center;

    width: 38px;
    height: 38px;

    border-radius: 5px;

    background-color: var(--hint-primary-color);
    color: var(--bg-eight-color);

    svg {
      width: 23px;
      height: 23px;
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-weight: 700;
    line-height: 1.15;

    text-transform: uppercase;
  }

  &__desc {
    margin: 0;
    max-width: 585px;

    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 1.65;
  }

  &__policy {
    display: inline-block;
    margin-top: 9px;

    color: var(--hint-primary-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 600;

    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &__list {
    display: grid;

    gap: 8px;
    margin-bottom: 22px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    min-width: 0;

    gap: 18px;
    padding: 15px 16px;

    border: 1px solid var(--border-primary-color);
    border-radius: 5px;

    background-color: var(--bg-third-color);

    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &.is-active {
      border-color: var(--hint-primary-color);
      background-color: rgba(107, 161, 27, 0.08);
    }

    &.is-essential {
      border-color: var(--border-primary-color);
      background-color: var(--bg-fourth-color);
    }
  }

  &__info {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;

    gap: 5px;
    min-width: 0;
  }

  &__toggle {
    width: 100%;
    padding: 0;

    border: 0;
    background: transparent;

    color: inherit;
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--hint-primary-color);
      outline-offset: 3px;
      border-radius: 2px;
    }
  }

  &__subtitle {
    color: var(--primary-color);

    font-family: var(--font-akshar);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.2;

    text-transform: uppercase;
  }

  &__text {
    color: var(--hint-third-color);

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.55;
  }

  &__checkbox {
    flex: 0 0 auto;

    .base-checkbox__row {
      gap: 0;
    }

    .base-checkbox__box {
      width: 22px;
      min-width: 22px;
      height: 22px;

      border-radius: 4px;

      background-color: var(--bg-eight-color);
      border-color: var(--border-primary-color);

      &.is-checked {
        background-color: var(--hint-primary-color);
        border-color: var(--hint-primary-color);
      }
    }

    .base-checkbox__check {
      color: var(--bg-eight-color);
    }

    .base-checkbox__label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    &.is-disabled {
      opacity: 1;
    }
  }

  &__checkbox-text {
    position: absolute;

    width: 1px;
    height: 1px;

    padding: 0;
    overflow: hidden;

    clip: rect(0, 0, 0, 0);

    white-space: nowrap;
    border: 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    gap: 10px;
    padding-top: 18px;

    border-top: 1px solid var(--border-primary-color);
  }

  &__button {
    width: auto;
    min-width: 145px;
    min-height: 42px;

    padding: 9px 14px;

    border-radius: 5px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;

    text-transform: uppercase;
  }

  @media (max-width: $md6) {
    &__header {
      padding-right: 18px;
      margin-bottom: 18px;
    }

    &__item {
      padding: 12px;
      gap: 12px;
    }

    &__subtitle {
      font-size: 15px;
    }

    &__actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }

    &__button {
      width: 100%;
      min-width: 0;
      min-height: 40px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .cookie-banner__button,
  .cookie-modal__item,
  .cookie-modal__button {
    transition: none;
  }
}
</style>
