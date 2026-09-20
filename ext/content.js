// ==================== 常量与全局状态 ====================
const BilibiliShortcuts = (() => {
    // -------------------- 配置常量 --------------------
    const SELECTORS = {
        SEARCH_INPUT: window.location.href.includes('keyword') ? '.search-input-el' : '.nav-search-input',
        VIDEO_CONTAINER: '.video-toolbar-left',
        THUMB_BUTTON: '.video-like.video-toolbar-left-item',
        RECOMMEND_VIDEOS: '.bili-video-card__info--tit'
    };

    const DEFAULT_KEYS = {
        FOCUS: 'a',
        REPLAY: 'b',
        FULLSCREEN: 'g',
        REFRESH: 'r',
        SEARCH: 's',
        WIDE: 't',
        WINDOW: 'v'
    };

    // -------------------- 全局状态 --------------------
    let config = {};
    let isTyping = false;
    let observers = [];

    // ==================== 核心功能模块 ====================
    const InputHandler = {
        init(inputElement) {
            if (!inputElement?._listenersAdded) {
                inputElement.addEventListener('focus', () => (isTyping = true));
                inputElement.addEventListener('blur', () => (isTyping = false));
                inputElement._listenersAdded = true;
            }
        }
    };

    const ThumbManager = {
        intervalId: null,

        start() {
            this.clear();
            this.intervalId = setInterval(() => {
                const thumbBtn = document.querySelector(SELECTORS.THUMB_BUTTON);
                if (thumbBtn && !thumbBtn.classList.contains('on')) {
                    thumbBtn.click();
                    this.clear();
                }
            }, 30000);
        },

        clear() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    };

    // ==================== 工具方法 ====================
    // 刷新按钮查找：优先内层真实 <button class="roll-btn">，外层 div 兜底
    const findRefreshButton = () => {
        // 1. 精确匹配内层 button（当前 B 站结构）
        const innerBtn = document.querySelector('button.roll-btn');
        if (innerBtn) return innerBtn;

        // 2. 兼容旧的 .primary-btn.roll-btn（可能是 a 或 div）
        const oldBtn = document.querySelector('.primary-btn.roll-btn, .roll-btn');
        if (oldBtn) return oldBtn;

        // 3. 从外层 feed-roll-btn 向内找 button
        const outerDiv = document.querySelector('.feed-roll-btn, [class*="roll-btn"]');
        if (outerDiv) {
            return outerDiv.querySelector('button, a, [role="button"]') || outerDiv;
        }

        // 4. 文本兜底
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while ((node = walker.nextNode())) {
            const text = node.textContent.trim();
            if (text === '换一换' && (node.tagName === 'BUTTON' || node.tagName === 'A')) {
                return node;
            }
        }
        return null;
    };

    // 触发完整的点击事件序列（兼容 Vue/React 等不同事件实现）
    const triggerFullClick = (el) => {
        if (!el) return;
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        el.focus?.();
        const opts = { bubbles: true, cancelable: true };
        el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerId: 1, pointerType: 'mouse' }));
        el.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerId: 1, pointerType: 'mouse' }));
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
    };

    const createKeyMap = () => ({
        ...(config.focus?.enabled && { [config.focus.key || DEFAULT_KEYS.FOCUS]: '.bpx-player-dm-input' }),
        ...(config.replay?.enabled && { [config.replay.key || DEFAULT_KEYS.REPLAY]: 'video' }),
        ...(config.fullscreen?.enabled && { [config.fullscreen.key || DEFAULT_KEYS.FULLSCREEN]: '.bpx-player-ctrl-web' }),
        ...(config.refresh?.enabled && { [config.refresh.key || DEFAULT_KEYS.REFRESH]: findRefreshButton }), // 使用函数动态查找
        ...(config.search?.enabled && { [config.search.key || DEFAULT_KEYS.SEARCH]: SELECTORS.SEARCH_INPUT }),
        ...(config.wide?.enabled && { [config.wide.key || DEFAULT_KEYS.WIDE]: '.bpx-player-ctrl-wide' }),
        ...(config.toggleWindow?.enabled && { [config.toggleWindow.key || DEFAULT_KEYS.WINDOW]: '.mini-player-window.fixed-sidenav-storage-item' }),
    });

    const handleVideoChange = () => {
        if (!document.querySelector(`${SELECTORS.THUMB_BUTTON}.on`)) {
            ThumbManager.start();
        }
    };

    // ==================== 观察器管理 ====================
    const ObserverManager = {
        init() {
            this.setupSearchObserver();
            if (config.thumb?.enabled) this.setupVideoObserver();
        },

        setupSearchObserver() {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    const input = mutation.target.querySelector(SELECTORS.SEARCH_INPUT);
                    if (input) {
                        InputHandler.init(input);
                        observer.disconnect();
                        break;
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            observers.push(observer);
        },

        setupVideoObserver() {
            const observer = new MutationObserver(() => handleVideoChange());
            const container = document.querySelector(SELECTORS.VIDEO_CONTAINER);
            if (container) {
                observer.observe(container, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class']
                });
                observers.push(observer);
            }
        },

        cleanup() {
            observers.forEach(obs => obs.disconnect());
            observers = [];
        }
    };

    // ==================== 事件处理器 ====================
    const KeyHandler = {
        keyMap: {},

        init(keyMap) {
            this.keyMap = keyMap;
            document.addEventListener('keydown', this.handleKeyPress.bind(this));
        },

        handleKeyPress(event) {
            if (event.key === 'Escape') this.handleEscape();
            if (this.shouldIgnoreInput(event)) return;

            try {
                if (this.handleNumberKeys(event)) return;
                this.processFunctionKey(event);
            } catch (error) {
                console.error('快捷键处理错误:', error);
            }
        },

        handleEscape() {
            document.querySelector('.search-panel').style.display = 'none';
            document.querySelector('a')?.focus();
        },

        shouldIgnoreInput(event) {
            return isTyping || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
        },

        handleNumberKeys(event) {
            if (config.number?.enabled && event.key >= '1' && event.key <= '6') {
                const videos = document.querySelectorAll(SELECTORS.RECOMMEND_VIDEOS);
                videos[event.key - 1]?.firstElementChild?.click();
                return true;
            }
            return false;
        },

        processFunctionKey(event) {
            const key = event.key.toLowerCase();
            const selector = this.keyMap[key];

            if (!selector) return;

            event.preventDefault();
            // 支持 selector 为函数（动态查找）或字符串（CSS 选择器）
            const element = typeof selector === 'function'
                ? selector()
                : document.querySelector(selector);

            switch (key) {
                case config.replay?.key:
                    if (element) {
                        element.currentTime = 0;
                        element.play();
                    }
                    break;
                case config.focus?.key:
                case config.search?.key:
                    element?.focus();
                    break;
                case config.refresh?.key:
                    triggerFullClick(element);
                    break;
                default:
                    element?.click();
            }
        }
    };

    // ==================== 初始化入口 ====================
    const init = () => {
        const storageApi = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
        storageApi.local.get('bilibili-shortcuts-config', (result) => {
            config = result['bilibili-shortcuts-config'] || {};

            if (config.thumb?.enabled && window.location.href.includes('video')) {
                ThumbManager.start();
            }

            ObserverManager.init();
            KeyHandler.init(createKeyMap());
        });
    };

    return { init };
})();

// ==================== 执行初始化 ====================
BilibiliShortcuts.init();