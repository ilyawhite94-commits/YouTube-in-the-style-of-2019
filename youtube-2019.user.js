// ==UserScript==
// @name         YouTube в стиле 2019
// @namespace    https://github.com/ilyawhite94-commits
// @version      1.4
// @description  Компактная главная YouTube: узкая колонка, мелкие заголовки, всегда открытая левая панель
// @match        https://www.youtube.com/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/ilyawhite94-commits/YouTube-in-the-style-of-2019/main/youtube-2019.user.js
// @downloadURL  https://raw.githubusercontent.com/ilyawhite94-commits/YouTube-in-the-style-of-2019/main/youtube-2019.user.js
// ==/UserScript==

(function () {
  'use strict';

  const ITEMS_PER_ROW = 5;       // сколько видео в ряду
  const COLUMN_WIDTH = '1250px'; // ширина колонки ('none' = на весь экран)
  const RELATED_MIN_WIDTH = 220; // минимальная ширина карточки «похожих» под роликом, px (меньше число = больше карточек в ряду)

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
      --ytd-rich-grid-items-per-row: ${ITEMS_PER_ROW} !important;
      --ytd-rich-grid-item-margin: 6px !important;
      max-width: ${COLUMN_WIDTH} !important;
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
  `;

  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // Открываем левую панель, если она свёрнута (проверяем ~20 секунд после загрузки)
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
