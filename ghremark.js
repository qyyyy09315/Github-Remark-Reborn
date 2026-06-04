
// 注入醒目备注样式
(function injectStyles() {
    var style = document.createElement('style');
    style.id = 'ghrk-style';
    style.textContent = [
        '.github-remarks {',
        '  color: #5b4a3a !important;',
        '  font-weight: 600;',
        '  font-size: 82%;',
        '  background: linear-gradient(135deg, #fdf2e9, #fadbd8);',
        '  padding: 3px 10px;',
        '  border-radius: 2em;',
        '  white-space: nowrap;',
        '  cursor: pointer;',
        '  box-shadow: 0 1px 3px rgba(180,140,120,0.18);',
        '  transition: all 0.25s ease;',
        '  letter-spacing: 0.02em;',
        '  vertical-align: middle;',
        '  display: inline-block;',
        '  margin-left: 6px;',
        '  animation: ghrk-pop-in 0.3s ease-out;',
        '  border: 1px solid #edbb99;',
        '}',
        '.github-remarks:hover {',
        '  background: linear-gradient(135deg, #fadbd8, #f5c6aa);',
        '  box-shadow: 0 2px 8px rgba(180,140,120,0.3);',
        '  transform: scale(1.06);',
        '}',
        '@keyframes ghrk-pop-in {',
        '  0% { opacity: 0; transform: scale(0.85); }',
        '  100% { opacity: 1; transform: scale(1); }',
        '}',
    ].join("\n");
    document.head.appendChild(style);
})();

function elementReady(selector) {
    return new Promise(function(resolve) {
        var el = document.querySelector(selector);
        if (el) {
            return resolve(el);
        }

        var observer = new MutationObserver(function() {
            var el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                var idx = _ghRemarkObservers.indexOf(observer);
                if (idx > -1) _ghRemarkObservers.splice(idx, 1);
                resolve(el);
            }
        });

        registerObserver(observer);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // 10 秒超时保护，防止永久内存泄漏
        setTimeout(function() {
            observer.disconnect();
            var idx = _ghRemarkObservers.indexOf(observer);
            if (idx > -1) _ghRemarkObservers.splice(idx, 1);
        }, 10000);
    });

}


// 全局 Observer 注册表，Turbo 导航时统一清理，防止内存泄漏
var _ghRemarkObservers = [];

function registerObserver(observer) {
    _ghRemarkObservers.push(observer);
    return observer;
}

function cleanupAll() {
    _ghRemarkObservers.forEach(function(obs) { obs.disconnect(); });
    _ghRemarkObservers = [];
    document.querySelectorAll('.github-remarks').forEach(function(el) { el.remove(); });
}

// 防抖函数，优化MutationObserver高频触发问题
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateRemark(userToken, username, remark) {
	webApi.updateRemark(userToken, username, remark, function (success) {
		if (success)
			showRemarks(userToken);
		else
			alert('更新失败！');
	});
}

// Mock fallback 备注数据，当 API 不可达时用于测试展示
var _mockRemarks = {
    "xtttttao": "大师兄",
    "GodCzy": "数学天才",
    "qiongzhang1225-alt": "张同学",
    "xiaziyi1314": "小紫衣",
    "stinnner": "海洋实验室",
    "furti-two": "42号",
};

function getRemark(userToken, username, callback) {
	webApi.getRemark(userToken, username, function(remark) {
		if (!remark || remark === "no remark") {
			// API 不可达时使用 mock 数据展示样式
			remark = _mockRemarks[username] || "no remark";
		}
		callback(remark);
	});
}

/**
 * page functions
 */
function getGithubLoginUsername() {
    // 优先使用更稳定的data属性选择器
	var doc = document.querySelector("meta[name='user-login'], meta[name~='login']");
	return doc == null ? null : doc.content;
}

function hasLoginFrame() {
	var loginBtn = document.querySelector('a[href="/login"], .HeaderMenu a[href*=login]');
	return loginBtn != null;
}

function getMasterOfPage(url) {
	var master = /github.com\/([^\/|^\?]+)/.exec(url);
	if (master !== null)
		master = master[1];
	return master;
}

function getCurrentTab() {
	var homepage = /github.com\/$/.exec(location.href);
	if (homepage !== null)
		return 'homepage';
	var tab = /[\?|\&]tab=([^\&]+)/.exec(location.href);
	if (tab !== null)
		tab = tab[1];
    if(/https:\/\/github.com\/orgs\/([\S\s]+)\/people/.exec(location.href))
        tab = 'orgs-people';
    if(/https:\/\/github.com\/orgs\/([\S\s]+)\/members/.exec(location.href))
        tab = 'orgs-members';
	return tab;
}

function insertAfter(newEl, targetEl) {
	var parentEl = targetEl.parentNode;
	if (parentEl.lastChild == targetEl) {
		parentEl.appendChild(newEl);
	} else {
		parentEl.insertBefore(newEl, targetEl.nextSibling);
	}
}

function generateRemarkSpan(className, userToken, username, remark){
    var span = document.createElement('span');
	span.className = className;
	span.textContent = '【'+remark+'】';
	span.title = remark;
    span.addEventListener('dblclick', function (event) {
        event.stopPropagation(); // 防止触发GitHub原生点击事件
        const newRemark = changeRemarks(userToken, username, remark);
        if(newRemark!==remark){
            span.replaceWith(generateRemarkSpan(
                className,userToken, username,newRemark
            ));
        }
    }, false);
    return span;
}

function clearRemarkOfCurrentNode(div){
    const existingRemark = div.querySelector('span.github-remarks');
    if (existingRemark) {
        div.removeChild(existingRemark);
    }
}

// 通用用户元素处理函数，减少重复代码
function processUserElements(selector, userToken, getUsernameFunc) {
    const users = document.querySelectorAll(selector);
    if (!users) return;
    
    users.forEach(element => {
        // 避免重复注入
        if (element.parentNode.querySelector('.github-remarks')) return;
        
        const username = getUsernameFunc ? getUsernameFunc(element) : getMasterOfPage(element.href);
        if (!username) return;
        
        getRemark(userToken, username, function (remark) {
            if (!remark || remark === 'no remark') return;
            const remarkEl = generateRemarkSpan('pl-1 github-remarks', userToken, username, remark);
            insertAfter(remarkEl, element);
        });
    });

}

/**
 * Show remark functions, adapted for each page
 */
function showRemarkInHomepage(userToken) {
    const debouncedProcess = debounce(() => {
        // 使用稳定的data-hovercard-type选择器，不依赖类名
        processUserElements('a[data-hovercard-type="user"]', userToken);
    }, 300);
    
    // 监听整个容器的变化，适配动态加载的内容
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('#dashboard, main'), { 
        childList: true, 
        subtree: true 
    });
    
    // 首次执行
    debouncedProcess();
}

function showRemarkInLeftPannel(userToken) {
    // 兼容新版GitHub个人主页结构
    elementReady('h1[class*="vcard"] .vcard-username, .ProfileHeader-name + span, [data-testid="profile-login"], .js-profile-editable-username').then(vcard => {
        if (!vcard) return;
        
        clearRemarkOfCurrentNode(vcard.parentNode);
        const username = getMasterOfPage(location.href);
        getRemark(userToken, username, function (remark) {
            if (!remark || remark === 'no remark') return;
            vcard.parentNode.appendChild(generateRemarkSpan('d-inline-block ml-2 github-remarks', userToken, username, remark));
        });
    });
}

function showRemarkInStarsTab(userToken) {
    const debouncedProcess = debounce(() => {
        processUserElements('h3 a[data-hovercard-type="user"]', userToken);
    }, 300);
    
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('main'), { 
        childList: true, 
        subtree: true 
    });
    
    debouncedProcess();
}

function showRemarkInFollowersTab(userToken) {
    const debouncedProcess = debounce(() => {
        // 适配新版关注/粉丝页结构，用户名在.Link--secondary子元素内
        document.querySelectorAll('a[data-hovercard-type="user"]').forEach(el => {
            // 避免重复注入
            if (el.parentNode.querySelector('.github-remarks') || el.querySelector('.github-remarks')) return;
            
            const username = getMasterOfPage(el.href);
            if (!username) return;
            
            getRemark(userToken, username, function (remark) {
                if (!remark || remark === 'no remark') return;
                const remarkEl = generateRemarkSpan('pl-1 github-remarks', userToken, username, remark);
                // 插入到a标签内部的最后，紧跟用户名
                el.appendChild(remarkEl);
            });
        });
    }, 300);
    
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('main, #user-profile-frame'), { 
        childList: true, 
        subtree: true 
    });
    
    debouncedProcess();
}

function showRemarkInRepoStargazersPage(userToken) {
    const debouncedProcess = debounce(() => {
        processUserElements('h3 a[data-hovercard-type="user"]', userToken);
    }, 300);
    
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('main'), { 
        childList: true, 
        subtree: true 
    });
    
    debouncedProcess();
}

function showRemarkInRepoDetailPage(userToken) {
    // 仅处理仓库页面（/owner/repo 格式），避免在 settings 等页面创建无效 Observer
    var isRepoPage = /github\.com\/[^\/]+\/[^\/]+/.test(location.href) && !/github\.com\/(settings|notifications|explore|marketplace|codespaces|sponsors|account|pulls|issues)/.test(location.href);
    if (!isRepoPage) return;
    // 仓库作者
    elementReady('span.author a, .react-FileHeader a[data-hovercard-type="user"]').then(authorEl => {
        if (!authorEl || authorEl.parentNode.querySelector('.github-remarks')) return;
        
        const username = getMasterOfPage(location.href);
        getRemark(userToken, username, function (remark) {
            if (!remark || remark === 'no remark') return;
            const remarkEl = generateRemarkSpan('ml-1 github-remarks', userToken, username, remark);
            insertAfter(remarkEl, authorEl);
        });
    });
    
    // 星标/关注者页面
	var repoDetail = /\/(stargazers|watchers)(\/you_know)?$/.exec(location.href);
	if (repoDetail !== null) {
		switch (repoDetail[1]) {
			case 'watchers':
			case 'stargazers':
				showRemarkInRepoStargazersPage(userToken);
				break;
		}
	}
}

function showRemarkInOrgPeople(userToken){
    const debouncedProcess = debounce(() => {
        processUserElements('a[data-hovercard-type="user"]', userToken);
    }, 300);
    
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('main'), { 
        childList: true, 
        subtree: true 
    });
    
    debouncedProcess();
}

function showRemarkInOrgMembers(userToken){
    const debouncedProcess = debounce(() => {
        processUserElements('ul.member-listing a[data-hovercard-type="user"]', userToken);
    }, 300);
    
    var observer = registerObserver(new MutationObserver(debouncedProcess));
    observer.observe(document.querySelector('main'), { 
        childList: true, 
        subtree: true 
    });
    
    debouncedProcess();
}

function changeRemarks(userToken, username, oldValue) {
	var newValue = window.prompt("请输入新备注", oldValue);
	if (newValue !== null && newValue !== oldValue) {
		updateRemark(userToken, username, newValue);
        return newValue;
	}
    return oldValue;
}

function showRemarks(userToken) {
    try {
        showRemarkInLeftPannel(userToken);
        var tab = getCurrentTab();
        switch (tab) {
            case 'homepage':
                showRemarkInHomepage(userToken);
                break;
            case 'repositories':
                break;
            case 'stars':
                showRemarkInStarsTab(userToken);
                break;
            case 'following':
            case 'followers':
                showRemarkInFollowersTab(userToken);
                break;
            case 'orgs-members':
                showRemarkInOrgMembers(userToken);
                break;
            case 'orgs-people':
                showRemarkInOrgPeople(userToken);
                break;
            default:
                showRemarkInRepoDetailPage(userToken);
                break;
        }
        console.log(tab, 'Show remarks');
    } catch (e) {
        console.error('GithubRemark 加载失败:', e);
    }
}

// 适配Turbo单页导航，参考Refined GitHub的事件监听方案
function init() {
	console.log('GithubRemark inject');
	var username = getGithubLoginUsername();
	if (username !== null && username != '') {
		showRemarks(username);
	} else if (hasLoginFrame()) {
		alert('你还未登陆github，请先登录你的github账户！');
	}
}

// 支持Turbo框架的单页导航，在页面切换时重新初始化
if (window.Turbo) {
    document.addEventListener('turbo:load', init);
} else {
    // 兼容旧版页面
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// 监听Turbo页面替换事件，清理旧的观察者
document.addEventListener('turbo:before-render', function() {
    // 清理所有 Observer 和注入的备注元素，避免 DOM 冲突和内存泄漏
    cleanupAll();
});
