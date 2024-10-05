
let isTyping = false;
const observer = new MutationObserver((mutations) => {
    if (mutations.length > 0) {
        let searchInput = document.querySelector('.nav-search-input');
        if (searchInput) {
            console.log(searchInput);
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
    't': '.bpx-player-ctrl-wide',
    'v': '.mini-player-window.fixed-sidenav-storage-item'
};

document.addEventListener('keydown', (event) => {
    // 如果正在输入，则不处理按键事件
    if (isTyping) {
        return;
    }
    // 确保只处理单个按键按下，并且不处理修饰键
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
        return;
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

