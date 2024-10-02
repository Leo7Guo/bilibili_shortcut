// ==UserScript==
// @name         bilibili快捷键
// @name:en      bilibili shortcut
// @version      1.0.3
// @description  bilibili快捷键，按R刷新推荐视频，按T切换宽屏模式，按G切换网页全屏模式，按B重新开始播放视频，按A聚焦弹幕输入框
// @description:en  press key 'R' to refresh recommended videos, 'T' to toggle wide screen mode, 'G' to toggle web full screen mode, 'B' to replay video from the start, 'A' to focus on the bullet chat input box
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
    let keyPressed = false; // 标记键是否已被按下

    // 监听 keydown 事件，记录按下的按键，但不执行操作
    document.addEventListener('keydown', (event) => {
        // 确保只处理单个按键按下，并且不处理修饰键
        if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
            return;
        }

        try {
            // 获取当前页面的主机名和播放器
            const hostname = window.location.hostname;
            const player = document.querySelector('.bpx-player-control-wrap'); // Bilibili 播放器

            // 按下 'R' 刷新页面，仅在主页有效
            if ((event.key.toLowerCase() === 'r') && hostname === 'www.bilibili.com') {
                const refreshButton = document.querySelector('.primary-btn.roll-btn');
                if (refreshButton) {
                    refreshButton.click(); // 刷新页面
                }
                return; // 添加此行以避免执行后续逻辑
            }

            // 如果不在播放器页面，返回
            if (!player) return;

            // 按下 'T' 切换宽屏模式
            if (event.key.toLowerCase() === 't') {
                const widescreenButton = document.querySelector('.bpx-player-ctrl-wide');
                widescreenButton?.click(); // 使用可选链操作符
            }

            // 按下 'G' 切换网页全屏模式
            if (event.key.toLowerCase() === 'g') {
                const webFullscreenButton = document.querySelector('.bpx-player-ctrl-web');
                webFullscreenButton?.click(); // 使用可选链操作符
            }

            // 按下 'B' 重新开始播放视频
            if (event.key.toLowerCase() === 'b') {
                const video = document.querySelector('video');
                if (video) {
                    video.currentTime = 0; // 将播放进度设置为 0
                    video.play(); // 开始播放
                }
            }

            // 按下 'A' 聚焦文本框
            if (event.key.toLowerCase() === 'a') {
                event.preventDefault();
                const textfield = document.querySelector('.bpx-player-dm-input');
                if (textfield) {
                    textfield.focus();
                }
            }
        } catch (error) {
            console.error('bilibili快捷键: 处理按键事件时发生错误:', error); // 输出错误信息到控制台
        }
    });
})();