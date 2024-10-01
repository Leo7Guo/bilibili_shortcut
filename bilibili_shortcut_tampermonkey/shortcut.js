// ==UserScript==
// @name         bilibili快捷键
// @name:en      bilibili shortcut
// @version      0.1
// @description  bilibili快捷键，按r刷新主页，按t切换宽屏模式，按g切换网页全屏模式
// @description:en  press key r to refresh main page feed videos, press key t to toggle wide screen mode, press key g to toggle web full screen mode
// @license    MIT
// @author       elgordo
// @match        https://www.bilibili.com/*
// @grant        none
// @namespace https://greasyfork.org/users/1375421
// @downloadURL https://update.greasyfork.org/scripts/511051/bilibili%E5%BF%AB%E6%8D%B7%E9%94%AE.user.js
// @updateURL https://update.greasyfork.org/scripts/511051/bilibili%E5%BF%AB%E6%8D%B7%E9%94%AE.meta.js
// ==/UserScript==

(function () {
    'use strict';
    document.addEventListener('keydown', (event) => {
        // 确保只处理单个按键按下
        if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
            return; // 如果有其他修饰键按下，则返回
        }

        // 按下 'R' 刷新页面，仅在主页www.bilibili.com生效
        if ((event.key === 'r' || event.key === 'R') && window.location.hostname === 'www.bilibili.com') {
            const refreshButton = document.querySelector('.feed-roll-btn'); // 刷新按钮
            if (refreshButton) {
                refreshButton.firstElementChild.dispatchEvent(new PointerEvent('click', { bubbles: true }));
            }
        }

        // 以下代码仅在播放页面有效
        const player = document.querySelector('.bpx-player-control-wrap'); // Bilibili 播放器

        if (!player) {
            return;
        }

        // 按下 'T' 切换宽屏模式
        if (event.key === 't' || event.key === 'T') {
            const widescreenButton = document.querySelector('.bpx-player-ctrl-wide'); // 宽屏按钮
            if (widescreenButton) {
                widescreenButton.click();
            }
        }

        // 按下 'G' 切换网页全屏模式
        if (event.key === 'g' || event.key === 'G') {
            const webFullscreenButton = document.querySelector('.bpx-player-ctrl-web'); // 网页全屏按钮
            if (webFullscreenButton) {
                webFullscreenButton.click();
            }
        }
    });
})();