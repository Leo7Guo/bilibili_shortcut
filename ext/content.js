const addSearchInputListeners = (inputElement) => {
    if (inputElement && !inputElement._listenersAdded) {
        inputElement.addEventListener('focus', () => {
            isTyping = true;
        });
        inputElement.addEventListener('blur', () => {
            isTyping = false;
        });
        inputElement._listenersAdded = true; // 标记已添加监听器
    }
};

const thumbUp = () => {
    const intervalId = setInterval(() => {
        const thumbBtn = document.querySelector('.video-like.video-toolbar-left-item');
        if (!thumbBtn?.classList.contains('on')) {
            thumbBtn.click();
            clearInterval(intervalId);
        }
    }, 30000);
};

let isTyping = false;
let config = {};
let data = {};

// 观察DOM变化以查找输入框
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            const searchInput = mutation.target.querySelector('.nav-search-input');
            if (searchInput) {
                addSearchInputListeners(searchInput);
                observer.disconnect();
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// 从本地存储加载配置
const storageApi = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
storageApi.local.get('bilibili-shortcuts-config', (result) => {
    config = result['bilibili-shortcuts-config'] || {};
    if (config.thumb?.enabled) {
        thumbUp();
    }
    // 创建 data 对象，使用用户设置的键和对应的选择器，并检查是否启用
    data = {
        ...(config.focus?.enabled && { [config.focus?.key || 'a']: '.bpx-player-dm-input' }),
        ...(config.replay?.enabled && { [config.replay?.key || 'b']: 'video' }),
        ...(config.fullscreen?.enabled && { [config.fullscreen?.key || 'g']: '.bpx-player-ctrl-web' }),
        ...(config.refresh?.enabled && { [config.refresh?.key || 'r']: '.primary-btn.roll-btn' }),
        ...(config.search?.enabled && { [config.search?.key || 's']: '.nav-search-input' }),
        ...(config.wide?.enabled && { [config.wide?.key || 't']: '.bpx-player-ctrl-wide' }),
        ...(config.toggleWindow?.enabled && { [config.toggleWindow?.key || 'v']: '.mini-player-window.fixed-sidenav-storage-item' }),
    };

    // 添加按键事件监听器
    document.addEventListener('keydown', (event) => {
        // 按下 Esc 键，退出输入
        if (event.key === 'Escape') {
            document.querySelector('a').focus();
            document.querySelector('button').focus();

            document.querySelector('.search-panel').style.display = 'none';
            return;
        }
        if (isTyping) return; // 如果正在输入，则不处理按键事件
        if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return; // 处理单个按键

        try {

            // 处理数字键1-6，点击对应推荐视频
            if (config.number?.enabled && event.key >= '1' && event.key <= '6') {
                document.querySelectorAll('.bili-video-card__info--tit')[event.key - 1]?.firstElementChild.click();
                return;
            }

            const key = event.key.toLowerCase();
            const element = data[key];

            if (element) {
                switch (key) {
                    case config.refresh?.key:
                    case config.wide?.key:
                    case config.fullscreen?.key:
                    case config.toggleWindow?.key:
                        document.querySelector(element)?.click();
                        break;
                    case config.focus?.key:
                    case config.search?.key:
                        event.preventDefault(); // 阻止默认行为
                        document.querySelector(element)?.focus();
                        break;
                    case config.replay?.key:
                        const videoElement = document.querySelector(element);
                        if (videoElement) {
                            videoElement.currentTime = 0;
                            videoElement.play();
                        }
                        break;
                }
            }
        } catch (error) {
            console.error('bilibili快捷键: 处理按键事件时发生错误:', error);
        }
    });
});
