// ==UserScript==
// @name         YouTube в стиле 2019
// @namespace    https://github.com/ilyawhite94-commits
// @version      1.7
// @description  Компактная главная YouTube: узкая колонка, мелкие заголовки, всегда открытая левая панель, ползунки числа видео и ширины ленты
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/ilyawhite94-commits/YouTube-in-the-style-of-2019/main/youtube-2019.user.js
// @downloadURL  https://raw.githubusercontent.com/ilyawhite94-commits/YouTube-in-the-style-of-2019/main/youtube-2019.user.js
// ==/UserScript==

(function () {
  'use strict';

  const DEFAULTS = { items: 5, width: 1250 }; // значения по умолчанию
  const RELATED_MIN_WIDTH = 220;              // минимальная ширина карточки «похожих» под роликом, px
  const STORAGE_KEY = 'yt2019-settings';
  const GEAR_BOTTOM = 450;                    // высота кнопки ⚙ от нижнего края окна, px (больше число = выше)

  // ---------- настройки (запоминаются в браузере) ----------
  function num(v, min, max, def) {
    v = Number(v);
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        items: num(saved.items, 2, 10, DEFAULTS.items),
        width: num(saved.width, 600, 2400, DEFAULTS.width),
      };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function saveSettings(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) { /* ничего страшного */ }
  }

  const settings = loadSettings();

  function applySettings() {
    const root = document.documentElement;
    root.style.setProperty('--my-items-per-row', settings.items);
    root.style.setProperty('--my-column-width', settings.width + 'px');
  }
  applySettings();

  // ---------- стили ----------
  const css = `
    html[dark] {
      --my-page-bg: #121212;
      --my-column-bg: #212121;
      --my-title: #5aaeff;
      --my-meta: #9a9a9a;
    }
    html:not([dark]) {
      --my-page-bg: #e8e8e8;
      --my-column-bg: #ffffff;
      --my-title: #167ac6;
      --my-meta: #606060;
    }

    html, ytd-app {
      background: var(--my-page-bg) !important;
    }

    ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
      --ytd-rich-grid-items-per-row: var(--my-items-per-row, ${DEFAULTS.items}) !important;
      --ytd-rich-grid-item-margin: 6px !important;
      max-width: var(--my-column-width, ${DEFAULTS.width}px) !important;
      margin: 0 auto !important;
      padding: 16px !important;
      background: var(--my-column-bg) !important;
    }

    ytd-browse[page-subtype="home"] #video-title {
      font-size: 14px !important;
      line-height: 1.3 !important;
      font-weight: 500 !important;
      color: var(--my-title) !important;
    }
    ytd-browse[page-subtype="home"] ytd-video-meta-block,
    ytd-browse[page-subtype="home"] #metadata-line,
    ytd-browse[page-subtype="home"] ytd-channel-name {
      color: var(--my-meta) !important;
      font-size: 12px !important;
    }

    ytd-app {
      --ytd-persistent-guide-width: 200px !important;
    }
    tp-yt-app-drawer#guide {
      --app-drawer-width: 200px !important;
    }
    ytd-guide-renderer #guide-inner-content,
    ytd-guide-renderer {
      background: var(--my-column-bg) !important;
    }
    ytd-guide-entry-renderer tp-yt-paper-item {
      min-height: 30px !important;
      padding: 0 12px !important;
    }
    ytd-guide-entry-renderer yt-formatted-string {
      font-size: 13px !important;
    }
    ytd-guide-section-renderer {
      padding: 4px 0 !important;
    }

    /* похожие видео под роликом: сетка из мелких карточек */
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer ytd-item-section-renderer > #contents,
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer #items:has(> yt-lockup-view-model) {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(${RELATED_MIN_WIDTH}px, 1fr)) !important;
      gap: 12px 10px !important;
    }
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer yt-lockup-view-model,
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer {
      width: auto !important;
      max-width: none !important;
      margin: 0 !important;
    }
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer yt-lockup-view-model h3,
    ytd-watch-flexy ytd-watch-next-secondary-results-renderer #video-title {
      font-size: 13px !important;
      line-height: 1.3 !important;
    }

    /* панель с ползунками */
    #yt2019-gear {
      position: fixed;
      right: 16px;
      bottom: ${GEAR_BOTTOM}px;
      z-index: 99999;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--my-meta);
      background: var(--my-column-bg);
      color: var(--yt-spec-text-primary, #888);
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
    }
    #yt2019-gear:hover { opacity: 1; }
    #yt2019-panel {
      position: fixed;
      right: 16px;
      bottom: ${GEAR_BOTTOM + 48}px;
      z-index: 99999;
      width: 260px;
      padding: 14px 16px;
      border: 1px solid var(--my-meta);
      border-radius: 10px;
      background: var(--my-column-bg);
      color: var(--yt-spec-text-primary, #888);
      font: 13px/1.4 Roboto, Arial, sans-serif;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      display: none;
    }
    #yt2019-panel.open { display: block; }
    #yt2019-panel label { display: block; margin-bottom: 4px; }
    #yt2019-panel input[type="range"] { width: 100%; margin: 0 0 14px; }
    #yt2019-panel button {
      padding: 4px 10px;
      border: 1px solid var(--my-meta);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // ---------- панель с ползунками ----------
  function buildPanel() {
    if (document.getElementById('yt2019-gear')) return;

    const gear = document.createElement('button');
    gear.id = 'yt2019-gear';
    gear.type = 'button';
    gear.title = 'Настройки ленты';
    gear.textContent = '⚙';

    const panel = document.createElement('div');
    panel.id = 'yt2019-panel';
    // YouTube запрещает innerHTML (Trusted Types), поэтому собираем элементы вручную
    function el(tag, props, children) {
      const node = document.createElement(tag);
      Object.assign(node, props || {});
      (children || []).forEach((c) => node.append(c));
      return node;
    }
    const itemsVal = el('b', { id: 'yt2019-items-val' });
    const widthVal = el('b', { id: 'yt2019-width-val' });
    const items = el('input', { id: 'yt2019-items', type: 'range', min: '2', max: '10', step: '1' });
    const width = el('input', { id: 'yt2019-width', type: 'range', min: '600', max: '2400', step: '50' });
    const resetBtn = el('button', { id: 'yt2019-reset', type: 'button', textContent: 'Сбросить' });
    panel.append(
      el('label', {}, ['Видео в ряду: ', itemsVal]),
      items,
      el('label', {}, ['Ширина ленты: ', widthVal]),
      width,
      resetBtn
    );

    document.body.appendChild(panel);
    document.body.appendChild(gear);

    function refresh() {
      items.value = settings.items;
      width.value = settings.width;
      itemsVal.textContent = settings.items;
      widthVal.textContent = settings.width + ' px';
    }

    function update() {
      settings.items = num(items.value, 2, 10, DEFAULTS.items);
      settings.width = num(width.value, 600, 2400, DEFAULTS.width);
      itemsVal.textContent = settings.items;
      widthVal.textContent = settings.width + ' px';
      applySettings();
      saveSettings(settings);
    }

    items.addEventListener('input', update);
    width.addEventListener('input', update);
    resetBtn.addEventListener('click', () => {
      settings.items = DEFAULTS.items;
      settings.width = DEFAULTS.width;
      refresh();
      applySettings();
      saveSettings(settings);
    });
    gear.addEventListener('click', () => panel.classList.toggle('open'));

    // ползунки нужны только на главной странице
    function updateVisibility() {
      const onHome = location.pathname === '/';
      gear.style.display = onHome ? '' : 'none';
      if (!onHome) panel.classList.remove('open');
    }
    window.addEventListener('yt-navigate-finish', updateVisibility);
    updateVisibility();

    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else {
    buildPanel();
  }

  // ---------- левая панель всегда открыта ----------
  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    const drawer = document.querySelector('tp-yt-app-drawer#guide');
    const button = document.querySelector('#guide-button button');
    if (drawer && button) {
      if (!drawer.hasAttribute('opened')) button.click();
      clearInterval(timer);
    } else if (tries > 40) {
      clearInterval(timer);
    }
  }, 500);
})();
