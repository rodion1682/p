<template>
  <main class="static">
    <div class="static__background _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="static__inner _cnt">
      <LoadingSpinner v-if="loading" class="static__loader" />

      <div v-else-if="error" class="static__state" role="alert">
        <h1 class="static__state-title _h4">
          {{ $t('Unable to load page') }}
        </h1>

        <p class="static__state-description">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="static__retry"
          @click="fetchPage"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>

      <div v-else-if="currentPage" class="static__page">
        <div class="static__heading">
          <h1 class="static__title _h4">
            {{ currentPage.title }}
          </h1>
        </div>

        <article class="static__panel" :aria-label="currentPage.title">
          <div
            ref="staticPageContent"
            class="static__content"
            v-html="filteredContent"
          />
        </article>
      </div>

      <div v-else class="static__state">
        <h1 class="static__state-title _h4">
          {{ $t('Page not found') }}
        </h1>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'

const isDebugContentActive = false

defineProps<{
  id?: string
  slug?: string
}>()

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()

const staticPageContent = ref<HTMLElement | null>(null)

const debugTitle = 'Static Page - Design System Preview'

const debugContent = `
  <h1>Heading H1 - Main Page Heading</h1>

  <p>
    This page demonstrates the website typography, spacing,
    content layout and responsive table styling.
  </p>

  <h2>Heading H2 - Section Title</h2>

  <p>
    This paragraph contains <strong>strong text</strong>,
    <b>bold text</b>, <em>italic text</em>
    and an <a href="#debug-table">internal link</a>.
  </p>

  <h3>Heading H3 - Subsection</h3>

  <p>
    Text can include
    <span style="color: red; background: yellow; font-size: 28px;">
      inline CMS styling
    </span>
    and still inherit the website design.
  </p>

  <h4>Heading H4 - Small Heading</h4>

  <p>
    Static content remains readable on desktop,
    tablet and mobile devices.
  </p>

  <h2>Unordered List</h2>

  <ul>
    <li>Collect unique fantasy cards</li>
    <li>Explore different rarities</li>
    <li>Build your collection</li>
    <li>Trade and rent cards</li>
  </ul>

  <h2>Ordered List</h2>

  <ol>
    <li>Create your account</li>
    <li>Browse available cards</li>
    <li>Choose your favorite cards</li>
    <li>Complete your purchase</li>
  </ol>

  <h2>Blockquotes</h2>

  <blockquote>
    Every legendary collection begins with a single card.
  </blockquote>

  <h2>Inline Code</h2>

  <p>
    Use <code>const card = ref(null)</code>
    to create a reactive Vue reference.
  </p>

  <h2>Code Block</h2>

  <pre><code>import { computed, ref } from 'vue'

const quantity = ref(1)
const price = ref(25)

const total = computed(() => {
  return quantity.value * price.value
})</code></pre>

  <h2 id="debug-table">Standard Table</h2>

  <div class="table-scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Card Name</th>
          <th>Rarity</th>
          <th>Type</th>
          <th>Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Celestial Guardian</td>
          <td>Legendary</td>
          <td>Hero</td>
          <td>120.00</td>
          <td>Available</td>
        </tr>
        <tr>
          <td>Moonlight Sorcerer</td>
          <td>Epic</td>
          <td>Mage</td>
          <td>75.00</td>
          <td>Sold</td>
        </tr>
        <tr>
          <td>Forest Protector</td>
          <td>Rare</td>
          <td>Warrior</td>
          <td>35.00</td>
          <td>Available</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Wide Table - Mobile Test</h2>

  <div class="table-scroll-wrapper">
    <table>
      <thead>
        <tr>
          <th>Card ID</th>
          <th>Card Name</th>
          <th>Collection</th>
          <th>Rarity</th>
          <th>Element</th>
          <th>Attack</th>
          <th>Health</th>
          <th>Mana</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>#10001</td>
          <td>Celestial Guardian</td>
          <td>Genesis Collection</td>
          <td>Legendary</td>
          <td>Light</td>
          <td>8</td>
          <td>10</td>
          <td>7</td>
          <td>120.00</td>
        </tr>
        <tr>
          <td>#10002</td>
          <td>Shadow Hunter</td>
          <td>Eclipse Collection</td>
          <td>Epic</td>
          <td>Dark</td>
          <td>7</td>
          <td>6</td>
          <td>5</td>
          <td>85.00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Mixed Content</h2>

  <p>
    This section combines <strong>bold text</strong>,
    <em>italic text</em>,
    <a href="#debug-table">links</a>
    and <code>inline code</code>.
  </p>
`

const loading = computed(() => !isDebugContentActive && staticStore.loading)

const error = computed(() => (isDebugContentActive ? null : staticStore.error))

const currentPage = computed(() => {
  if (isDebugContentActive) {
    return {
      title: debugTitle,
      content: debugContent,
    }
  }

  return staticStore.currentPage
})

const filteredContent = computed(() => {
  const content = currentPage.value?.content

  if (!content) return ''

  return content.replace(
    /(?:(?:&amp;)?&nbsp;|&nbsp;|&#160;|&#x0*a0;|\u00a0)+/gi,
    ' ',
  )
})

/**
 * Add labels to table cells automatically.
 *
 * The label comes from the corresponding <th> element.
 * This works with CMS HTML rendered through v-html.
 */
function prepareResponsiveTables() {
  const container = staticPageContent.value

  if (!container) return

  const tables = container.querySelectorAll<HTMLTableElement>('table')

  tables.forEach(table => {
    // Read column names from the table header.
    const headerRow =
      table.querySelector('thead tr') || table.querySelector('tr:has(th)')

    if (!headerRow) return

    const headers = Array.from(headerRow.querySelectorAll('th')).map(
      header => header.textContent?.trim() || '',
    )

    if (!headers.length) return

    // Use tbody rows, or all non-header rows if tbody is absent.
    const rows = table.querySelectorAll<HTMLTableRowElement>('tbody tr')

    rows.forEach(row => {
      const cells = Array.from(row.children).filter(
        (element): element is HTMLTableCellElement =>
          element.tagName.toLowerCase() === 'td',
      )

      cells.forEach((cell, index) => {
        const header = headers[index]

        if (header) {
          cell.setAttribute('data-label', header)
        }
      })
    })

    table.classList.add('static-responsive-table')
  })
}

async function updateResponsiveTables() {
  await nextTick()
  prepareResponsiveTables()
}

async function fetchPage() {
  if (isDebugContentActive) {
    await updateResponsiveTables()
    return
  }

  const identifier = route.params.slug || route.params.id

  if (!identifier) {
    await router.push({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPageById(identifier)

    if (!staticStore.currentPage && !staticStore.error) {
      await router.push({ name: 'NotFound' })
      return
    }

    await updateResponsiveTables()
  } catch (fetchError) {
    console.error('Error fetching page:', fetchError)
  }
}

onMounted(fetchPage)

// Reload CMS content when the static-page route changes.
watch(
  () => route.params.slug || route.params.id,
  () => {
    fetchPage()
  },
)

// Rebuild table labels whenever CMS HTML changes.
watch(
  filteredContent,
  async () => {
    await updateResponsiveTables()
  },
  { flush: 'post', immediate: true },
)

// The page content may be temporarily hidden during loading.
watch(
  loading,
  async isLoading => {
    if (!isLoading) {
      await updateResponsiveTables()
    }
  },
  { flush: 'post' },
)
</script>

<style lang="scss" scoped>
.static {
  @include adaptiveValue('padding-top', 130, 80);
  @include adaptiveValue('padding-bottom', 80, 30);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100%;

  &__background {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    width: 100%;
    min-width: 0;
  }

  &__loader {
    margin: auto;
  }

  &__page {
    width: 100%;
    min-width: 0;
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__title {
    margin: 0;

    color: var(--fourth-color);
    text-align: left;
    text-transform: none;
  }

  &__panel {
    @include adaptiveValue('padding', 40, 16);
    @include adaptiveValue('border-radius', 12, 10);

    width: 100%;
    min-width: 0;

    border: 1px solid var(--border-priamry-color);
    background: #111624;
  }

  &__state {
    @include adaptiveValue('padding', 40, 20);
    @include adaptiveValue('border-radius', 12, 10);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;

    min-height: 300px;

    margin: auto;

    border: 1px solid var(--border-priamry-color);
    background: #111624;

    text-align: center;
  }

  &__state-title {
    margin: 0;

    color: var(--fourth-color);
    text-transform: none;
  }

  &__state-description {
    margin: 0;

    color: var(--fifth-color);
    font-size: 14px;
    line-height: 150%;
  }

  &__retry {
    width: fit-content;
    min-width: 160px;
    max-width: 250px;
  }

  &__content {
    width: 100%;
    min-width: 0;

    color: var(--fifth-color);
    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 170%;
    text-align: left;

    overflow-wrap: anywhere;

    // Headings

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      color: var(--fourth-color) !important;
      font-family: var(--font-open-sans) !important;
      font-weight: 600 !important;
      line-height: 135% !important;
      text-align: left !important;
      text-transform: none !important;

      &:first-child {
        margin-top: 0;
      }
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 30, 24);
      @include adaptiveValue('margin-top', 36, 24);
      @include adaptiveValue('margin-bottom', 22, 16);
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 24, 20);
      @include adaptiveValue('margin-top', 32, 22);
      @include adaptiveValue('margin-bottom', 18, 14);
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 20, 17);
      @include adaptiveValue('margin-top', 28, 18);
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(h4),
    :deep(h5),
    :deep(h6) {
      @include adaptiveValue('font-size', 17, 15);
      @include adaptiveValue('margin-top', 22, 16);
      @include adaptiveValue('margin-bottom', 14, 10);
    }

    // Paragraphs

    :deep(p) {
      display: block;

      margin-top: 0;

      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-align: left !important;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 18, 12);
      }
    }

    // Inline CMS formatting

    :deep(span) {
      background: transparent !important;

      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
      text-transform: none !important;
    }

    :deep(strong),
    :deep(b) {
      color: var(--fourth-color) !important;
      font-weight: 600 !important;
    }

    :deep(em),
    :deep(i) {
      font-style: italic;
    }

    :deep(a) {
      color: var(--hint-primary-color) !important;
      text-decoration: underline;

      transition: color 0.3s ease;

      text-underline-offset: 3px;

      @media (any-hover: hover) {
        &:hover {
          color: var(--fourth-color) !important;
        }
      }
    }

    // Lists

    :deep(ul),
    :deep(ol) {
      @include adaptiveValue('margin-top', 16, 10);
      @include adaptiveValue('margin-bottom', 22, 14);

      padding-left: 22px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: 165% !important;

      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }

    :deep(ul li) {
      list-style: disc;
    }

    :deep(ol li) {
      list-style: decimal;
    }

    :deep(li::marker) {
      color: var(--hint-primary-color);
    }

    // Blockquotes

    :deep(blockquote) {
      @include adaptiveValue('padding', 22, 16);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);

      border: 1px solid var(--border-priamry-color);
      border-left: 3px solid var(--hint-primary-color);
      border-radius: 0 8px 8px 0;
      background: var(--bg-primary-color);

      color: var(--fourth-color);
      font-size: 14px;
      font-style: italic;
      line-height: 170%;

      :deep(p) {
        margin-bottom: 0;
      }
    }

    // Inline code

    :deep(code) {
      padding: 3px 6px;

      border: 1px solid var(--border-priamry-color);
      border-radius: 4px;
      background: var(--bg-primary-color);

      color: var(--fourth-color);
      font-family: monospace;
      font-size: 0.9em;
    }

    // Code blocks

    :deep(pre) {
      @include adaptiveValue('padding', 20, 12);
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);

      overflow-x: auto;

      max-width: 100%;

      border: 1px solid var(--border-priamry-color);
      border-radius: 8px;
      background: var(--bg-primary-color);

      color: var(--fourth-color);
      font-size: 13px;
      line-height: 165%;

      code {
        padding: 0;

        border: 0;
        background: transparent;

        color: inherit;
        font-size: inherit;
        line-height: inherit;
      }
    }

    // Separators

    :deep(hr) {
      height: 1px;

      margin: 28px 0;

      border: 0;
      background: var(--border-priamry-color);
    }

    // Images

    :deep(img) {
      display: block;

      width: auto;
      max-width: 100%;
      height: auto;

      border-radius: 8px;
    }

    // Desktop tables

    :deep(.table-scroll-wrapper) {
      @include adaptiveValue('margin-top', 24, 16);
      @include adaptiveValue('margin-bottom', 24, 16);

      overflow: visible;

      width: 100%;
      min-width: 0;
      max-width: 100%;

      border: 0;
      border-radius: 0;
    }

    :deep(table) {
      width: 100%;
      max-width: 100%;

      color: var(--fourth-color);
      font-family: var(--font-open-sans);
      font-size: 14px;
      line-height: 150%;

      border-collapse: collapse;
      table-layout: fixed;
    }

    :deep(thead) {
      background: var(--bg-primary-color);
    }

    :deep(th),
    :deep(td) {
      @include adaptiveValue('padding', 16, 10);

      min-width: 0;

      border: 1px solid var(--border-priamry-color);

      text-align: left;
      white-space: normal;
      word-break: break-word;

      overflow-wrap: anywhere;
      vertical-align: top;
    }

    :deep(th) {
      color: var(--fourth-color) !important;
      font-weight: 600;
    }

    :deep(td) {
      color: var(--fifth-color) !important;
      font-weight: 400;
    }

    :deep(tbody tr) {
      transition: background-color 0.3s ease;

      &:nth-child(even) {
        background: rgb(255 255 255 / 2%);
      }

      @media (any-hover: hover) {
        &:hover {
          background: var(--bg-primary-color);
        }
      }
    }

    // Mobile tables - transform rows into cards

    @media (max-width: $md4) {
      :deep(.table-scroll-wrapper) {
        overflow: visible;

        width: 100%;
        max-width: 100%;
      }

      :deep(table),
      :deep(tbody),
      :deep(tr),
      :deep(td) {
        display: block;

        width: 100%;
        max-width: 100%;
      }

      :deep(table) {
        border: 0;

        table-layout: auto;
      }

      :deep(thead) {
        display: none;
      }

      :deep(tbody) {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      :deep(tbody tr) {
        overflow: hidden;

        border: 1px solid var(--border-priamry-color);
        border-radius: 10px;
        background: var(--bg-primary-color) !important;
      }

      :deep(tbody td) {
        display: grid;
        align-items: start;
        gap: 12px;
        grid-template-columns:
          minmax(0, 40%)
          minmax(0, 1fr);

        width: 100%;
        min-width: 0;

        padding: 12px 14px;

        border: 0;
        border-bottom: 1px solid var(--border-priamry-color);
        background: transparent !important;

        color: var(--fifth-color) !important;
        font-size: 13px;
        line-height: 150%;
        text-align: right;
        white-space: normal;
        word-break: break-word;

        overflow-wrap: anywhere;

        &:last-child {
          border-bottom: 0;
        }
      }

      :deep(tbody td::before) {
        display: block;

        min-width: 0;

        color: var(--fourth-color);
        font-family: var(--font-open-sans);
        font-size: 13px;
        font-weight: 600;
        line-height: 150%;
        text-align: left;

        content: attr(data-label);

        overflow-wrap: anywhere;
      }
    }

    // CMS spacer

    :deep(.br-space) {
      display: block;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    // General mobile typography

    @media (max-width: $md4) {
      font-size: 13px;

      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4) {
        overflow-wrap: anywhere;
      }

      :deep(pre) {
        font-size: 12px;
      }
    }
  }
}
</style>
