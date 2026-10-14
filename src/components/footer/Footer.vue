<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <RouterLink :to="{ name: 'HomePage' }" class="footer__logo _ibg-contain">
        <img src="@/assets/img/icons/logo-deck.svg" />
      </RouterLink>
      <div class="footer__bottom">
        <div class="footer__info">
          <div
            v-html="settingsStore.settings?.copyright"
            class="footer__copy"
          />
          <div
            v-html="settingsStore.settings?.requisites"
            class="footer__requisites"
          />
        </div>
        <div class="footer__links">
          <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
            {{ $t('Сard Store') }}
          </RouterLink>
          <RouterLink to="/about" class="footer__link">
            {{ $t('About Game') }}
          </RouterLink>
          <RouterLink :to="{ name: 'FaqPage' }" class="footer__link">
            {{ $t('FAQ') }}
          </RouterLink>
        </div>
        <div class="footer__links">
          <RouterLink
            v-for="page in staticStore.pages"
            :key="page.id"
            :to="page.slug ? `/${page.slug}` : `/static-page/${page.id}`"
            class="footer__link"
          >
            {{ page.title }}
          </RouterLink>
        </div>
        <div class="footer__about">
          <div v-if="staticStore.socialLinks.length" class="footer__socials">
            <a
              v-for="link in staticStore.socialLinks"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__social _ibg-contain"
            >
              <img :src="link.image" />
            </a>
          </div>
          <div v-if="settingsStore.supportEmail" class="footer__box">
            <div class="footer__box-label">
              {{ $t('Contacts:') }}
            </div>
            <a
              :href="`mailto:${settingsStore.supportEmail || 'support@domain.com'}`"
              class="footer__email"
            >
              <SvgIcon :icon="FooterEmailIcon" class="footer__email-icon" />
              <span>{{ settingsStore.supportEmail }}</span>
            </a>
          </div>

          <div class="footer__methods">
            <div
              class="footer__method _ibg-contain"
              v-for="(item, i) in settingsStore.settings?.footer_images"
              :key="i"
              :style="{ height: `${item.height}px` }"
            >
              <img :src="item.url" :alt="item.url" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { FooterEmailIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

defineOptions({
  name: 'SiteFooter',
})

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  if (staticStore.pages.length === 0) {
    await staticStore.fetchPages()
  }
  if (!settingsStore.settings) {
    await settingsStore.fetchSettings()
  }
  if (!staticStore.socialLinks || staticStore.socialLinks.length === 0) {
    await staticStore.fetchSocialLinks()
  }
})
</script>

<style lang="scss" scoped>
.footer {
  @include adaptiveValue('padding-top', 32, 25);
  @include adaptiveValue('padding-bottom', 32, 25);
  border-top: 1px solid var(--border-sixth-color);
  &__inner {
  }
  &__logo {
    display: block;

    width: fit-content;
    min-width: 150px;
    height: 40px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }
  &__bottom {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    @media (max-width: $md3) {
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }
  &__info {
    @media (min-width: $md3) {
      max-width: 440px;
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
    }
  }

  &__copy,
  &__requisites {
    font-size: 14px;
  }
  &__copy {
    color: var(--secondary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }
  &__requisites {
    color: var(--hint-third-color);
  }

  &__links {
    display: flex;
    flex-direction: column;
    align-self: center;
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: 374.98px) {
      flex: 1 1 100%;
    }
  }

  &__link {
    @include adaptiveValue('padding-right', 50, 10, 1370, 992, 1);

    @include adaptiveValue('padding-top', 5, 8);
    @include adaptiveValue('padding-bottom', 5, 8);
    position: relative;

    width: fit-content;

    padding-left: 14px;

    color: var(--primary-color);
    font-size: 16px;
    font-weight: 500;
    line-height: 17px;
    white-space: nowrap;

    transition: color 0.3s ease 0s;
    &::before {
      position: absolute;
      top: 50%;
      left: 0;

      width: 6px;
      height: 6px;

      border-radius: 50%;
      background-color: var(--hint-third-color);

      content: '';

      transform: translate(0px, -50%);
    }
    &.router-link-active {
      color: var(--hint-secondary-color);

      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__about {
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }

  &__socials {
    @include adaptiveValue('gap', 24, 10);
    display: flex;
    justify-content: flex-end;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__social {
    @include adaptiveValue('min-width', 32, 40);
    @include adaptiveValue('min-height', 32, 40);
    width: fit-content;
    height: fit-content;

    transform: scale(1);
    transition: transform 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        transform: scale(1.3);
      }
    }
  }
  &__box {
    @include adaptiveValue('gap', 16, 10);
    display: flex;
    align-items: center;

    width: fit-content;

    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 33, 15);
    }
    &-label {
      color: var(--secondary-color);
    }
  }
  &__email {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    width: fit-content;
    width: fit-content;

    margin-left: auto;

    color: var(--primary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 150%;
    span {
      border-bottom: 1px solid transparent;

      transition: border 0.3s ease 0s;
    }
    &-icon {
      min-width: 24px;
      height: 24px;

      color: var(--hint-secondary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        span {
          border-bottom-color: inherit;
        }
      }
    }
  }

  &__methods {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  &__method {
    min-width: 47px;
  }
}
</style>
