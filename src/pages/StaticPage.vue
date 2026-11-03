<template>
  <main class="static">
    <div class="static__inner _cnt-home">
      <LoadingSpinner
        v-if="!IS_DEBUG_CONTENT_ACTIVE && loading"
        class="static__loading"
      />

      <div
        v-else-if="!IS_DEBUG_CONTENT_ACTIVE && error"
        class="static__error _text-error"
        role="alert"
      >
        {{ error }}
      </div>

      <article v-else-if="pageToRender" class="static__body">
        <div class="static__header">
          <div v-if="IS_DEBUG_CONTENT_ACTIVE" class="static__debug-label">
            ADMIN CONTENT DEBUG MODE
          </div>

          <h1 class="static__title _h2">
            {{ pageToRender.title }}
          </h1>
        </div>

        <div class="static__surface">
          <div class="static__content _text-primary" v-html="renderedContent" />
        </div>
      </article>

      <div v-else class="static__empty">
        {{ $t('Page not found') }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useStaticStore } from '@/stores/static'

import debugImage from '@/assets/img/faq.png'

const route = useRoute()
const router = useRouter()
const staticStore = useStaticStore()
const IS_DEBUG_CONTENT_ACTIVE = false

const loading = computed(() => staticStore.loading)
const error = computed(() => staticStore.error)
const currentPage = computed(() => staticStore.currentPage)

const debugContent = `
  <h1>H1 Heading Example</h1>
  <h2>H2 Heading Example</h2>
  <h3>H3 Heading Example</h3>
  <h4>H4 Heading Example</h4>
  <h5>H5 Heading Example</h5>
  <h6>H6 Heading Example</h6>

  <p>
    This is a regular paragraph displaying content
    entered by an administrator through TinyEditor.
  </p>

  <p>
    This paragraph contains
    <strong>bold text</strong>,
    <b>another bold text</b>,
    <em>italic text</em>,
    <i>italic formatting</i>,
    <u>underlined text</u>,
    <s>strikethrough text</s>,
    <del>deleted text</del>,
    <mark>highlighted text</mark>,
    <small>small text</small>,
    H<sub>2</sub>O and X<sup>2</sup>.
  </p>

  <h2>Font Sizes</h2>

  <p>
    <span style="font-size: 12px;">12px text</span>
  </p>

  <p>
    <span style="font-size: 16px;">16px text</span>
  </p>

  <p>
    <span style="font-size: 20px;">20px text</span>
  </p>

  <p>
    <span style="font-size: 28px;">28px text</span>
  </p>

  <h2>Text Colors and Highlights</h2>

  <p>
    <span style="color: #334537;">
      Green text
    </span>
  </p>

  <p>
    <span style="color: #d5412c;">
      Red text
    </span>
  </p>

  <p>
    <span style="background-color: #fce4bb;">
      Highlighted background
    </span>
  </p>

  <h2>Text Alignment</h2>

  <p style="text-align: left;">
    Left-aligned text
  </p>

  <p style="text-align: center;">
    Center-aligned text
  </p>

  <p style="text-align: right;">
    Right-aligned text
  </p>

  <p style="text-align: justify;">
    Justified text with enough content to show
    how the browser distributes text across
    the available width while preserving
    responsive layout behavior.
  </p>

  <h2>Right-to-Left Text</h2>

  <p dir="rtl">
    مرحبا بكم في موقع WastelandCore
  </p>

  <h2>Line Breaks and Empty Paragraphs</h2>

  <p>
    First line<br>
    Second line<br>
    Third line
  </p>

  <p>&nbsp;</p>

  <p>
    Paragraph after an empty paragraph.
  </p>

  <hr>

  <h2>Unordered Lists</h2>

  <ul>
    <li>First list item</li>
    <li>Second list item</li>
    <li>Third list item</li>
  </ul>

  <h2>Nested Unordered Lists</h2>

  <ul>
    <li>
      Parent item
      <ul>
        <li>Nested item</li>
        <li>
          Another nested item
          <ul>
            <li>Third-level item</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Another parent item</li>
  </ul>

  <h2>Ordered Lists</h2>

  <ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
  </ol>

  <h2>Nested Ordered Lists</h2>

  <ol>
    <li>
      First step
      <ol>
        <li>Substep one</li>
        <li>Substep two</li>
      </ol>
    </li>
    <li>Second step</li>
  </ol>

  <h2>Links</h2>

  <p>
    <a href="https://example.com">
      External website
    </a>
  </p>

  <p>
    <a href="mailto:support@example.com">
      Email link
    </a>
  </p>

  <p>
    <a href="tel:+123456789">
      Telephone link
    </a>
  </p>

  <p>
    <a href="#debug-anchor">
      Jump to anchor
    </a>
  </p>

  <h2 id="debug-anchor">
    Anchor Destination
  </h2>

  <p>
    Clicking the anchor link scrolls here.
  </p>

  <h2>Table of Contents</h2>

  <div class="mce-toc">
    <h2>Contents</h2>
    <ul>
      <li>
        <a href="#debug-anchor">
          Anchor destination
        </a>
      </li>
      <li>
        <a href="#debug-tables">
          Responsive tables
        </a>
      </li>
    </ul>
  </div>

  <h2>Blockquotes</h2>

  <blockquote>
    <p>
      Survival is not only about fighting.
      It is about planning, adapting, and
      making the right decisions.
    </p>
    <p>— WastelandCore</p>
  </blockquote>

  <h2>Inline Code</h2>

  <p>
    Example command:
    <code>client.connect 127.0.0.1:28015</code>
  </p>

  <h2>Code Block</h2>

  <pre><code>const items = [
  { name: 'Weapon', price: 12.99 },
  { name: 'Armor', price: 8.50 }
];

const total = items.reduce(
  (sum, item) => sum + item.price,
  0
);</code></pre>

  <h2>Long Words and URLs</h2>

  <p>
    SuperLongProductNameWithoutAnySpacesABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789
  </p>

  <p>
    https://example.com/very/long/path/with/very/long/segments/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
  </p>

  <h2>Special Characters</h2>

  <p>
    &amp; &lt; &gt; &quot; &copy;
    &euro; &mdash; &ndash; &hellip;
    ✓ © € — …
  </p>

  <h2>Unicode and Emoji</h2>

  <p>
    English, Français, Deutsch, Español,
    日本語, 中文, العربية, Українська.
  </p>

  <p>🔥 🛒 ⚔️ 🛡️ 🎮</p>

  <h2>Responsive Image</h2>

  <figure>
    <img
      src="${debugImage}"
      alt="WastelandCore FAQ illustration"
      width="1200"
      height="800"
    >
    <figcaption>
      Example image with a caption.
    </figcaption>
  </figure>

  <h2>Embedded Video</h2>

  <iframe
    src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
    title="Example video embed"
    width="640"
    height="360"
  ></iframe>

  <h2 id="debug-tables">
    Responsive Tables
  </h2>

  <h3>Simple Table</h3>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Weapon</td>
        <td>2</td>
        <td>12.99</td>
      </tr>
      <tr>
        <td>Armor</td>
        <td>1</td>
        <td>8.50</td>
      </tr>
    </tbody>
  </table>

  <h3>Table With Footer</h3>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Rifle</td>
        <td>12.99</td>
        <td>2</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td>25.98</td>
        <td>2</td>
      </tr>
    </tfoot>
  </table>

  <h3>Wide Table — Eight Columns</h3>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Reference</th>
        <th>Product</th>
        <th>Category</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Status</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>03.11.2026</td>
        <td>ORDER-000001</td>
        <td>Long Product Name Example</td>
        <td>Weapon</td>
        <td>3</td>
        <td>12.99</td>
        <td>Completed</td>
        <td>
          This is a long description
          containing multiple words.
        </td>
      </tr>
      <tr>
        <td>03.11.2026</td>
        <td>ORDER-000002</td>
        <td>Armor</td>
        <td>Clothing</td>
        <td>1</td>
        <td>8.50</td>
        <td>Pending</td>
        <td>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
        </td>
      </tr>
    </tbody>
  </table>

  <h3>Stress Test — Twelve Columns</h3>

  <table>
    <thead>
      <tr>
        <th>Column 01</th>
        <th>Column 02</th>
        <th>Column 03</th>
        <th>Column 04</th>
        <th>Column 05</th>
        <th>Column 06</th>
        <th>Column 07</th>
        <th>Column 08</th>
        <th>Column 09</th>
        <th>Column 10</th>
        <th>Column 11</th>
        <th>Column 12</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Very long content</td>
        <td>Data 2</td>
        <td>Data 3</td>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
        <td>Data 7</td>
        <td>Data 8</td>
        <td>Data 9</td>
        <td>Data 10</td>
        <td>Data 11</td>
        <td>Data 12</td>
      </tr>
    </tbody>
  </table>

  <h3>Merged Table Cells</h3>

  <table>
    <tbody>
      <tr>
        <th rowspan="2">Group A</th>
        <td>First row</td>
        <td>Value</td>
      </tr>
      <tr>
        <td colspan="2">
          Merged column content
        </td>
      </tr>
      <tr>
        <th>Group B</th>
        <td></td>
        <td>Empty cell example</td>
      </tr>
    </tbody>
  </table>

  <h3>Table Without Header</h3>

  <table>
    <tbody>
      <tr>
        <td>Left content</td>
        <td>Right content</td>
      </tr>
      <tr>
        <td>Another value</td>
        <td>Another result</td>
      </tr>
    </tbody>
  </table>

  <h2>Final Content Test</h2>

  <p>
    This paragraph verifies that the content
    after every table remains correctly positioned
    and the page does not overflow horizontally.
  </p>
`

const pageToRender = computed(() => {
  if (IS_DEBUG_CONTENT_ACTIVE) {
    return {
      title: 'Static Page — Admin Content Debug',
      content: debugContent,
    }
  }

  return currentPage.value
})

// ==========================================
// NATIVE HTML FILTER
// NO DOMPURIFY REQUIRED
// ==========================================

const allowedTags = new Set([
  'DIV',
  'SECTION',
  'ARTICLE',
  'P',
  'SPAN',
  'BR',
  'HR',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'STRIKE',
  'DEL',
  'INS',
  'SMALL',
  'MARK',
  'SUB',
  'SUP',
  'UL',
  'OL',
  'LI',
  'A',
  'BLOCKQUOTE',
  'PRE',
  'CODE',
  'IMG',
  'FIGURE',
  'FIGCAPTION',
  'TABLE',
  'THEAD',
  'TBODY',
  'TFOOT',
  'TR',
  'TH',
  'TD',
  'CAPTION',
  'COLGROUP',
  'COL',
  'IFRAME',
])

const blockedTags = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'OBJECT',
  'EMBED',
  'FORM',
  'INPUT',
  'BUTTON',
  'TEXTAREA',
  'SELECT',
  'SVG',
  'MATH',
  'META',
  'LINK',
  'BASE',
  'TEMPLATE',
])

const safeUrl = (value, types) => {
  try {
    const url = new URL(value, window.location.href)

    return types.includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

const applySafeStyles = (source, target) => {
  const styles = source.style

  if (!styles?.length) return

  const alignment = styles.textAlign

  if (['left', 'center', 'right', 'justify'].includes(alignment)) {
    target.style.textAlign = alignment
  }

  for (const name of ['color', 'backgroundColor']) {
    const value = styles[name]

    if (value && /^(#[\da-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(value)) {
      target.style[name] = value
    }
  }

  const size = styles.fontSize

  if (size) {
    const match = /^([\d.]+)(px|pt)$/i.exec(size)

    if (match) {
      const pixels =
        Number(match[1]) * (match[2].toLowerCase() === 'pt' ? 4 / 3 : 1)

      if (Number.isFinite(pixels)) {
        target.style.fontSize = `${Math.min(28, Math.max(12, pixels))}px`
      }
    }
  }
}

const sanitizeNode = (node, parent, doc) => {
  if (node.nodeType === Node.TEXT_NODE) {
    parent.appendChild(doc.createTextNode(node.textContent || ''))
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return

  const tag = node.tagName.toUpperCase()

  if (blockedTags.has(tag)) return

  if (!allowedTags.has(tag)) {
    Array.from(node.childNodes).forEach(child => {
      sanitizeNode(child, parent, doc)
    })
    return
  }

  const element = doc.createElement(tag.toLowerCase())

  const id = node.getAttribute('id')

  if (id && /^[\w-]{1,100}$/.test(id)) {
    element.id = id
  }

  const direction = node.getAttribute('dir')

  if (['ltr', 'rtl', 'auto'].includes(direction)) {
    element.setAttribute('dir', direction)
  }

  if (tag === 'DIV' && node.classList.contains('mce-toc')) {
    element.className = 'mce-toc'
  }

  if (tag === 'CODE' || tag === 'PRE') {
    const language = Array.from(node.classList).find(item =>
      /^language-[\w-]+$/.test(item),
    )

    if (language) element.className = language
  }

  applySafeStyles(node, element)

  // Links
  if (tag === 'A') {
    const href = node.getAttribute('href') || ''

    if (href.startsWith('#') && /^#[\w-]+$/.test(href)) {
      element.setAttribute('href', href)
    } else {
      const url = safeUrl(href, ['http:', 'https:', 'mailto:', 'tel:'])

      if (url) {
        element.setAttribute('href', url.href)

        if (
          ['http:', 'https:'].includes(url.protocol) &&
          url.origin !== window.location.origin
        ) {
          element.setAttribute('target', '_blank')
          element.setAttribute('rel', 'noopener noreferrer')
        }
      }
    }
  }

  // Images
  if (tag === 'IMG') {
    const url = safeUrl(node.getAttribute('src') || '', ['http:', 'https:'])

    if (!url) return

    element.src = url.href
    element.alt = node.getAttribute('alt') || ''
    element.loading = 'lazy'
    element.decoding = 'async'
  }

  // Approved video providers
  if (tag === 'IFRAME') {
    const url = safeUrl(node.getAttribute('src') || '', ['https:'])

    if (!url) return

    const allowedHosts = [
      'www.youtube.com',
      'www.youtube-nocookie.com',
      'player.vimeo.com',
    ]

    if (!allowedHosts.includes(url.hostname)) {
      return
    }

    const allowedPath =
      url.hostname === 'player.vimeo.com'
        ? /^\/video\/[\w-]+\/?$/.test(url.pathname)
        : /^\/embed\/[\w-]+\/?$/.test(url.pathname)

    if (!allowedPath) return

    element.src = url.href
    element.title = node.getAttribute('title') || 'Video'

    element.loading = 'lazy'

    element.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-presentation',
    )

    element.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')

    element.setAttribute('allowfullscreen', '')
  }

  // Table structure
  if (['TH', 'TD'].includes(tag)) {
    for (const attr of ['colspan', 'rowspan']) {
      const value = Number(node.getAttribute(attr))

      if (Number.isInteger(value) && value >= 1 && value <= 50) {
        element.setAttribute(attr, String(value))
      }
    }

    if (tag === 'TH') {
      const scope = node.getAttribute('scope')

      if (['col', 'row'].includes(scope)) {
        element.setAttribute('scope', scope)
      }
    }
  }

  parent.appendChild(element)

  Array.from(node.childNodes).forEach(child => {
    sanitizeNode(child, element, doc)
  })
}

const prepareTables = root => {
  root.querySelectorAll('table').forEach(table => {
    const headings = Array.from(
      table.querySelectorAll('thead tr:first-child th'),
    ).map(cell => cell.textContent.trim())

    const rows = Array.from(table.querySelectorAll('tbody tr'))

    const hasMergedCells = Boolean(table.querySelector('[colspan], [rowspan]'))

    const hasFooter = Boolean(table.querySelector('tfoot'))

    const simpleRows = rows.every(row => {
      const cells = Array.from(row.children)

      return (
        cells.length === headings.length &&
        cells.every(cell => cell.tagName === 'TD')
      )
    })

    if (
      headings.length &&
      rows.length &&
      !hasMergedCells &&
      !hasFooter &&
      simpleRows
    ) {
      table.classList.add('is-stacked')

      rows.forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
          cell.setAttribute('data-label', headings[index] || '')
        })
      })
    }
  })
}

const renderedContent = computed(() => {
  const html = String(pageToRender.value?.content || '')

  if (!html) return ''

  const parsed = new DOMParser().parseFromString(html, 'text/html')

  const cleanDoc = document.implementation.createHTMLDocument('Static Content')

  const container = cleanDoc.createElement('div')

  Array.from(parsed.body.childNodes).forEach(node => {
    sanitizeNode(node, container, cleanDoc)
  })

  prepareTables(container)

  return container.innerHTML
})

const fetchPage = async () => {
  if (IS_DEBUG_CONTENT_ACTIVE) return

  const slug = route.params.slug

  if (!slug) {
    await router.replace({ name: 'NotFound' })
    return
  }

  try {
    await staticStore.fetchPage({ slug })

    if (!staticStore.currentPage && !staticStore.error) {
      await router.replace({ name: 'NotFound' })
    }
  } catch (error) {
    console.error('Failed to fetch static page:', error)
  }
}

watch(() => route.params.slug, fetchPage, { immediate: true })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.static {
  width: 100%;
  min-width: 0;
  @include adaptiveValue('padding-top', 120, 80);
  @include adaptiveValue('padding-bottom', 80, 30);
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  &__inner {
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  &__loading,
  &__error,
  &__empty {
    margin: auto;
    text-align: center;
  }

  &__body {
    width: 100%;

    min-width: 0;
  }

  &__header {
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__debug-label {
    display: inline-block;
    margin-bottom: 12px;

    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;

    color: var(--hint-primary-color);
  }

  &__title {
    color: var(--primary-color);
    overflow-wrap: anywhere;
  }

  &__surface {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding', 36, 12);

    border: 1px solid var(--border-primary-color);
    border-radius: 6px;
    background-color: var(--bg-fourth-color);
  }

  &__content {
    width: 100%;
    max-width: 100%;
    min-width: 0;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 1.7;

    overflow-wrap: anywhere;

    :deep(*) {
      box-sizing: border-box;
    }

    :deep(> *) {
      max-width: 100%;
    }

    :deep(> :first-child) {
      margin-top: 0;
    }

    :deep(> :last-child) {
      margin-bottom: 0;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 1.4em 0 0.6em;

      color: var(--hint-primary-color);
      font-family: var(--font-akshar), var(--font-inter);
      font-weight: 700;
      line-height: 1.2;

      overflow-wrap: anywhere;
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 36, 26);
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 30, 23);
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 25, 20);
    }

    :deep(h4) {
      font-size: 19px;
    }

    :deep(h5) {
      font-size: 17px;
    }

    :deep(h6) {
      font-size: 15px;
    }

    :deep(p) {
      margin: 0 0 1.25em;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    :deep(p:empty) {
      min-height: 1em;
    }

    :deep(strong),
    :deep(b) {
      font-weight: 700;
    }

    :deep(em),
    :deep(i) {
      font-style: italic;
    }

    :deep(u),
    :deep(ins) {
      text-decoration: underline;
    }

    :deep(s),
    :deep(strike),
    :deep(del) {
      text-decoration: line-through;
    }

    :deep(mark) {
      background-color: var(--bg-seventh-color);
      color: inherit;
    }

    :deep(small) {
      font-size: 0.85em;
    }

    :deep(sub),
    :deep(sup) {
      font-size: 0.75em;
    }

    :deep(a) {
      color: var(--link-color);
      text-decoration: underline;
      text-underline-offset: 3px;

      overflow-wrap: anywhere;

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--link-hover-color);
        }
      }

      &:focus-visible {
        outline: 2px solid var(--hint-primary-color);
        outline-offset: 2px;
      }
    }

    :deep([id]) {
      scroll-margin-top: 100px;
    }

    :deep([dir='rtl']) {
      direction: rtl;
      unicode-bidi: isolate;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 1.25em;
      padding-left: clamp(20px, 4vw, 38px);
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      display: list-item;
      margin-bottom: 0.4em;

      overflow-wrap: anywhere;
    }

    :deep(li ul),
    :deep(li ol) {
      margin: 0.5em 0;
    }

    :deep(li::marker) {
      color: var(--hint-primary-color);
    }

    :deep(.mce-toc) {
      margin-bottom: 24px;
      padding: 16px;

      border: 1px solid var(--border-primary-color);
      border-radius: 6px;

      background-color: var(--bg-third-color);
    }

    :deep(.mce-toc h2) {
      margin-top: 0;
    }

    :deep(blockquote) {
      margin: 0 0 1.25em;

      @include adaptiveValue('padding', 20, 12);

      border-left: 3px solid var(--hint-primary-color);
      border-radius: 0 6px 6px 0;

      background-color: var(--bg-third-color);
    }

    :deep(blockquote p:last-child) {
      margin-bottom: 0;
    }

    :deep(hr) {
      margin: 24px 0;

      border: 0;
      border-top: 1px solid var(--border-primary-color);
    }

    :deep(code),
    :deep(pre) {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    :deep(code) {
      padding: 2px 5px;

      border-radius: 3px;
      background-color: var(--bg-seventh-color);

      overflow-wrap: anywhere;
    }

    :deep(pre) {
      width: 100%;
      min-width: 0;
      margin-bottom: 1.25em;

      padding: 14px;

      white-space: pre-wrap;
      overflow-wrap: anywhere;

      border: 1px solid var(--border-primary-color);
      border-radius: 6px;

      background-color: var(--bg-third-color);
    }

    :deep(pre code) {
      padding: 0;
      background: transparent;
    }

    :deep(img),
    :deep(video) {
      display: block;

      max-width: 100%;
      height: auto;

      object-fit: contain;
    }

    :deep(figure) {
      max-width: 100%;
      margin: 0 0 1.25em;
    }

    :deep(figcaption),
    :deep(caption) {
      color: var(--hint-third-color);
      font-size: 12px;
      line-height: 1.5;
    }

    :deep(figcaption) {
      margin-top: 8px;
      text-align: center;
    }

    :deep(iframe) {
      display: block;

      width: 100%;
      max-width: 100%;
      height: auto;
      min-height: 180px;

      aspect-ratio: 16 / 9;

      margin-bottom: 1.25em;

      border: 0;
      border-radius: 6px;

      background-color: var(--bg-third-color);
    }

    :deep(table) {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;

      margin-bottom: 24px;

      table-layout: fixed;
      border-collapse: collapse;

      font-size: 13px;
      line-height: 1.5;
    }

    :deep(th),
    :deep(td) {
      min-width: 0;

      padding: 10px 8px;

      border: 1px solid var(--border-primary-color);

      vertical-align: top;
      text-align: left;

      white-space: normal !important;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    :deep(th) {
      color: var(--hint-primary-color);
      background-color: var(--bg-third-color);
      font-weight: 700;
    }

    :deep(td) {
      background-color: transparent;
    }

    :deep(tbody tr:nth-child(even)) {
      background-color: var(--bg-third-color);
    }

    :deep(tfoot) {
      font-weight: 700;
    }

    :deep(caption) {
      caption-side: top;
      padding: 10px;
      text-align: left;
    }

    @media (max-width: 767px) {
      :deep(table.is-stacked) {
        display: block;
        width: 100%;
        table-layout: auto;
      }

      :deep(table.is-stacked thead) {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      :deep(table.is-stacked tbody) {
        display: grid;
        gap: 12px;
      }

      :deep(table.is-stacked tbody tr) {
        display: block;
        min-width: 0;

        padding: 10px;

        border: 1px solid var(--border-primary-color);
        border-radius: 6px;

        background-color: var(--bg-third-color);
      }

      :deep(table.is-stacked tbody td) {
        display: block;
        width: 100%;
        min-width: 0;

        padding: 8px 4px;

        border: 0;
        border-bottom: 1px solid var(--border-primary-color);

        font-size: 13px;

        white-space: normal;
        overflow-wrap: anywhere;
      }

      :deep(table.is-stacked tbody td:last-child) {
        border-bottom: 0;
      }

      :deep(table.is-stacked tbody td::before) {
        content: attr(data-label);

        display: block;
        margin-bottom: 4px;

        color: var(--hint-third-color);

        font-family: var(--font-inter);
        font-size: 11px;
        font-weight: 700;

        text-transform: uppercase;
      }

      :deep(table:not(.is-stacked)) {
        font-size: 11px;
      }

      :deep(table:not(.is-stacked) th),
      :deep(table:not(.is-stacked) td) {
        padding: 6px 3px;
        font-size: 11px;
      }
    }
  }

  @media (max-width: $md6) {
    &__content {
      font-size: 13px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .static__content :deep(a) {
    transition: none;
  }
}
</style>
