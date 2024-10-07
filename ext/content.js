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

const handleThumbBtn = (config, thumbBtn) => {
    if (!thumbBtn?.classList.contains('on') && config.thumb?.enabled) {
        setTimeout(() => {
            thumbBtn.click();
        }, 2000);
    }
};

let searchInput;
let isTyping = false;
let config = {};

let foundCount = 0; // 将foundCount放在外面，确保每次调用时都从0开始
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            // 查找搜索输入框
            const searchInput = mutation.target.querySelector('.nav-search-input');
            if (searchInput) {
                addSearchInputListeners(searchInput);
                observer.disconnect();
            }
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });

let thumbBtn;
const observer2 = new MutationObserver((mutations) => {
    if (window.location.href === 'https://www.bilibili.com/') {
        observer2.disconnect();
    }
    mutations.forEach(mutation => {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            // 查找搜索输入框
            const thumbBtn = mutation.target.querySelector('.video-like.video-toolbar-left-item');
            if (thumbBtn) {
                handleThumbBtn(config, thumbBtn);
                observer2.disconnect();
            }
        }
    });
});

observer2.observe(document.body, { childList: true, subtree: true });


let data = {};

// 从本地存储加载配置
const storageApi = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
storageApi.local.get('bilibili-shortcuts-config', (result) => {
    config = result['bilibili-shortcuts-config'] || {};

    // if (config.thumb?.enabled && window.location.href !== 'https://www.bilibili.com/') {
    //     const intervalId = setInterval(() => {
    //         thumbBtn1 = document.querySelector('.video-like video-toolbar-left-item');
    //         if (thumbBtn1 && !thumbBtn1.classList.contains('on')) {
    //             thumbBtn1.click();
    //             clearInterval(intervalId);
    //         }
    //     }, 500);
    // }


    // 创建 data 对象，使用用户设置的键和对应的选择器，并检查是否启用
    data = {
        ...(config.focus?.enabled && { [config.focus?.key || 'a']: '.bpx-player-dm-input' }),          // 聚焦弹幕输入框
        ...(config.replay?.enabled && { [config.replay?.key || 'b']: 'video' }),                        // 重新开始播放当前视频
        ...(config.fullscreen?.enabled && { [config.fullscreen?.key || 'g']: '.bpx-player-ctrl-web' }), // 切换网页全屏模式
        ...(config.refresh?.enabled && { [config.refresh?.key || 'r']: '.primary-btn.roll-btn' }),      // 主页刷新推荐视频
        ...(config.search?.enabled && { [config.search?.key || 's']: '.nav-search-input' }),      // 主页刷新推荐视频
        ...(config.wide?.enabled && { [config.wide?.key || 't']: '.bpx-player-ctrl-wide' }),            // 切换宽屏模式
        ...(config.toggleWindow?.enabled && { [config.toggleWindow?.key || 'v']: '.mini-player-window.fixed-sidenav-storage-item' }), // 隐藏/显示小窗口
    };

    // 添加按键事件监听器
    document.addEventListener('keydown', (event) => {
        // 按下 Esc 键，退出输入
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
        if (config.number?.enabled && event.key >= '1' && event.key <= '6') {
            document.querySelectorAll('.bili-video-card__info--tit')[event.key - 1]?.firstElementChild.click();
            return;
        }

        try {
            let key = event.key.toLowerCase();
            let element = data[key];

            if (element) {
                switch (key) {
                    case config.refresh?.key:
                    case config.wide?.key:
                    case config.fullscreen?.key:
                    case config.toggleWindow?.key:
                        console.log(config.refresh?.key, config.wide?.key, config.fullscreen?.key, config.toggleWindow?.key);
                        console.log(config);
                        document.querySelector(element)?.click();
                        break;
                    case config.focus?.key:
                    case config.search?.key:
                        event.preventDefault(); // 阻止默认行为，防止输入
                        document.querySelector(element)?.focus();
                        break;
                    case config.replay?.key:
                        let videoElement = document.querySelector(element);
                        if (videoElement) {
                            videoElement.currentTime = 0;
                            videoElement.play();
                        }
                        break;
                }
            }
        } catch (error) {
            console.error('bilibili快捷键: 处理按键事件时发生错误:', error); // 输出错误信息到控制台
        }
    });
});