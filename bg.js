/**
 * GithubRemark Background Service Worker
 * 兼容 Chrome 与 Microsoft Edge
 */

var KEY_STATUS = 'gh_record_status';

function updateBadge(enabled) {
    if (chrome.action) {
        if (!enabled) {
            chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
            chrome.action.setBadgeText({ text: 'OFF' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    }
}

// 初始化状态
chrome.storage.local.get([KEY_STATUS], function (res) {
    var enabled = !res || res[KEY_STATUS] !== 'off';
    updateBadge(enabled);
});

// 监听存储状态变更
chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (changes[KEY_STATUS]) {
        var enabled = changes[KEY_STATUS].newValue !== 'off';
        updateBadge(enabled);
    }
});

// 安装与更新时初始化右键菜单
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.removeAll(function () {
        chrome.contextMenus.create({
            id: 'ghrk_open_options',
            title: '管理所有 GitHub 备注',
            contexts: ['action']
        });
        chrome.contextMenus.create({
            id: 'ghrk_add_remark_link',
            title: '对此 GitHub 用户添加/编辑备注',
            contexts: ['link'],
            targetUrlPatterns: ['*://github.com/*']
        });
    });
});

// 右键菜单点击响应
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'ghrk_open_options') {
        chrome.runtime.openOptionsPage();
    } else if (info.menuItemId === 'ghrk_add_remark_link' && info.linkUrl && tab && tab.id) {
        // 从链接中提取用户名
        var match = /github\.com\/([a-zA-Z0-9\-_]+)(?:\/|$)/.exec(info.linkUrl);
        if (match && match[1]) {
            var username = match[1];
            // 排除 GitHub 保留路径
            var reserved = ['features', 'business', 'explore', 'marketplace', 'pricing', 'topics', 'trending', 'collections', 'events', 'settings', 'notifications', 'login', 'join', 'about', 'security', 'contact', 'terms', 'privacy'];
            if (reserved.indexOf(username.toLowerCase()) === -1) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'trigger_edit_user',
                    username: username
                }).catch(function () {
                    // 若页面未响应则直接打开选项页并聚焦
                    chrome.runtime.openOptionsPage();
                });
            }
        }
    }
});

// 监听运行时消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'get_status') {
        chrome.storage.local.get([KEY_STATUS], function (res) {
            sendResponse({ enabled: !res || res[KEY_STATUS] !== 'off' });
        });
        return true;
    } else if (message.action === 'toggle_status') {
        var newStatus = message.enabled ? 'on' : 'off';
        chrome.storage.local.set({ [KEY_STATUS]: newStatus }, function () {
            updateBadge(message.enabled);
            sendResponse({ success: true, enabled: message.enabled });
        });
        return true;
    } else if (message.action === 'open_options') {
        chrome.runtime.openOptionsPage();
        sendResponse({ success: true });
    }
});
