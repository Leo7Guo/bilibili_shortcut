// ==UserScript==
// @name         bilibili快捷键
// @name:en      bilibili shortcut
// @version      1.0.7
// @description  bilibili快捷键，按A聚焦弹幕输入框，按B重新开始播放视频，按G切换网页全屏模式，按R刷新推荐视频，按S聚焦搜索框，按T切换宽屏模式，按V隐藏/显示小窗口，首页按1-6点击推荐视频
// @description:en  press key 'A' to focus on the bullet chat input box, 'B' to replay video from the start, 'G' to toggle web full screen mode, 'R' to refresh recommended videos,'S' to focus on the search box, 'T' to toggle wide screen mode, 'V' to toggle mini window player display, home page 1-6 to click recommended videos
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
    let isTyping = false;
    let searchInput;
    const observer = new MutationObserver((mutations) => {
        if (mutations.length > 0) {
            searchInput = document.querySelector('.nav-search-input');
            if (searchInput) {
                searchInput.addEventListener('focus', () => {
                    isTyping = true;
                });
                searchInput.addEventListener('blur', () => {
                    isTyping = false;
                });
                observer.disconnect(); // 找到后停止观察
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const data = {
        'a': '.bpx-player-dm-input',
        'b': 'video',
        'g': '.bpx-player-ctrl-web',
        'r': '.primary-btn.roll-btn',
        's': '.nav-search-input',
        't': '.bpx-player-ctrl-wide',
        'v': '.mini-player-window.fixed-sidenav-storage-item'
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (!document.querySelector('a').focus()) {
                document.querySelector('button').focus();
            }
            document.querySelector('.search-panel').style.display = 'none';
        }
        // 如果正在输入，则不处理按键事件
        if (isTyping) {
            return;
        }
        // 确保只处理单个按键按下，并且不处理修饰键
        if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
            return;
        }

        // 数字键1-6，点击对应推荐视频
        if (event.key >= '1' && event.key <= '6') {
            document.querySelectorAll('.bili-video-card__info--tit')[event.key - 1].firstElementChild.click();
        }

        try {
            let key = event.key.toLowerCase();
            let element = data[key] ? document.querySelector(data[key]) : null;

            if (element) {
                switch (key) {
                    case 'r':
                    case 't':
                    case 'g':
                    case 'v':
                        element.click();
                        break;
                    case 'a':
                    case 's':
                        event.preventDefault(); // 阻止默认行为，防止输入
                        element.focus();
                        //setTimeout(() => {element.textContent = '';}, 0); // 清空输入框内容
                        break;
                    case 'b':
                        element.currentTime = 0;
                        element.play();
                        break;
                }
            }
        } catch (error) {
            console.error('bilibili快捷键: 处理按键事件时发生错误:', error); // 输出错误信息到控制台
        }
    });
})();
