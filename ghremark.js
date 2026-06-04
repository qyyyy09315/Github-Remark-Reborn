
(function injectStyles() {
    var style = document.createElement('style');
    style.id = 'ghrk-style';
    style.textContent = [
        '.github-remarks {',
        '  color: #1a56db !important;',
        '  font-weight: 600;',
        '  font-size: 80%;',
        '  background: linear-gradient(135deg, #eff6ff, #dbeafe);',
        '  padding: 3px 10px;',
        '  border-radius: 2em;',
        '  white-space: nowrap;',
        '  cursor: pointer;',
        '  box-shadow: 0 1px 2px rgba(59,130,246,0.12);',
        '  transition: all 0.2s ease;',
        '  letter-spacing: 0.02em;',
        '  vertical-align: middle;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  gap: 4px;',
        '  margin-left: 6px;',
        '  animation: ghrk-pop-in 0.3s ease-out;',
        '  border: 1px solid #93c5fd;',
        '  user-select: none;',
        '}',
        '.github-remarks:hover {',
        '  background: linear-gradient(135deg, #dbeafe, #bfdbfe);',
        '  box-shadow: 0 2px 6px rgba(59,130,246,0.25);',
        '  transform: translateY(-1px);',
        '  border-color: #60a5fa;',
        '}',
        '.ghrk-edit-input {',
        '  color: #1e40af !important;',
        '  font-weight: 600;',
        '  font-size: 80%;',
        '  background: #fff;',
        '  border: 2px solid #3b82f6;',
        '  border-radius: 1em;',
        '  padding: 3px 10px;',
        '  outline: none;',
        '  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);',
        '  width: 100px;',
        '}',
        '.ghrk-btn {',
        '  font-size: 75%;',
        '  padding: 2px 8px;',
        '  border-radius: 1em;',
        '  border: 1px solid #93c5fd;',
        '  background: #eff6ff;',
        '  color: #2563eb;',
        '  cursor: pointer;',
        '  font-weight: 600;',
        '  margin-left: 3px;',
        '}',
        '.ghrk-btn:hover {',
        '  background: #dbeafe;',
        '  border-color: #60a5fa;',
        '}',
        '.ghrk-btn-remove {',
        '  color: #6b7280;',
        '  border-color: #d1d5db;',
        '  background: #f9fafb;',
        '}',
        '.ghrk-btn-remove:hover {',
        '  color: #ef4444;',
        '  border-color: #fca5a5;',
        '  background: #fef2f2;',
        '}',
        '@keyframes ghrk-pop-in {',
        '  0% { opacity: 0; transform: scale(0.8) translateY(4px); }',
        '  100% { opacity: 1; transform: scale(1) translateY(0); }',
        '}',
    ].join('\n');
    document.head.appendChild(style);
})();

var _ghRemarkObservers = [];
var _ghRemarkIntervals = [];

function elementReady(selector) {
    return new Promise(function(resolve) {
        var el = document.querySelector(selector);
        if (el) return resolve(el);
        var observer = new MutationObserver(function() {
            var el = document.querySelector(selector);
            if (el) { observer.disconnect(); resolve(el); }
        });
        _ghRemarkObservers.push(observer);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        setTimeout(function() { observer.disconnect(); }, 10000);
    });
}

function cleanupAll() {
    _ghRemarkObservers.forEach(function(o) { o.disconnect(); });
    _ghRemarkObservers = [];
    _ghRemarkIntervals.forEach(function(i) { clearInterval(i); });
    _ghRemarkIntervals = [];
    document.querySelectorAll('.github-remarks').forEach(function(e) { e.remove(); });
}

function updateRemark(userToken, username, remark) {
    webApi.updateRemark(userToken, username, remark, function(success) {
        if (!success) alert('更新失败！');
    });
}

function loadMockRemarks() {
    try {
        var s = localStorage.getItem('ghrk_mock_data');
        if (s) { var p = JSON.parse(s); for (var k in p) _mockRemarks[k] = p[k]; }
    } catch(e) {}
}
function saveMockRemarks() {
    try { localStorage.setItem('ghrk_mock_data', JSON.stringify(_mockRemarks)); } catch(e) {}
}

var _mockRemarks = {
    'xtttttao': '大师兄',
    'GodCzy': '数学天才',
    'qiongzhang1225-alt': '张同学',
    'xiaziyi1314': '小紫衣',
    'stinnner': '海洋实验室',
    'furti-two': '42号',
};

function getRemark(userToken, username, callback) {
    webApi.getRemark(userToken, username, function(remark) {
        if (!remark || remark === 'no remark') {
            remark = _mockRemarks[username];
            if (!remark) {
                try { remark = localStorage.getItem('ghrk_' + username); if (remark) _mockRemarks[username] = remark; } catch(e) {}
            }
            remark = remark || 'no remark';
        }
        callback(remark);
    });
}

function getGithubLoginUsername() {
    var m = document.querySelector("meta[name='user-login'], meta[name~='login']");
    return m ? m.content : null;
}

function getMasterOfPage(url) {
    var m = /github\.com\/([^\/|^\?]+)/.exec(url);
    return m ? m[1] : null;
}

function getCurrentTab() {
    if (/github\.com\/$/.test(location.href)) return 'homepage';
    var m = /[\?|\&]tab=([^\&]+)/.exec(location.href);
    var tab = m ? m[1] : null;
    if (/github\.com\/orgs\/[\S\s]+\/people/.test(location.href)) tab = 'orgs-people';
    if (/github\.com\/orgs\/[\S\s]+\/members/.test(location.href)) tab = 'orgs-members';
    return tab;
}

function insertAfter(newEl, targetEl) {
    var p = targetEl.parentNode;
    if (p.lastChild === targetEl) p.appendChild(newEl);
    else p.insertBefore(newEl, targetEl.nextSibling);
}

function generateRemarkSpan(className, userToken, username, remark) {
    var span = document.createElement('span');
    span.className = className;
    span.textContent = remark;
    span.title = '双击编辑备注';
    span.setAttribute('data-ghrk-user', username);
    span.addEventListener('dblclick', function(e) {
        e.stopPropagation(); e.preventDefault();
        startInlineEdit(span, userToken, username, remark);
    });
    return span;
}

function startInlineEdit(span, userToken, username, oldRemark) {
    if (span.querySelector('.ghrk-edit-input')) return;
    var wrap = document.createElement('span');
    wrap.style.cssText = 'display:inline-flex;align-items:center;gap:3px;';
    var inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'ghrk-edit-input'; inp.value = oldRemark;
    var ok = document.createElement('button');
    ok.className = 'ghrk-btn'; ok.textContent = 'OK';
    var cx = document.createElement('button');
    cx.className = 'ghrk-btn ghrk-btn-remove'; cx.textContent = 'X';
    var rm = document.createElement('button');
    rm.className = 'ghrk-btn ghrk-btn-remove'; rm.textContent = 'Del'; rm.title = '删除备注';
    wrap.append(inp, ok, cx, rm);

    function save() {
        var v = inp.value.trim();
        if (!v || v === oldRemark) { cancel(); return; }
        _mockRemarks[username] = v;
        try { localStorage.setItem('ghrk_' + username, v); } catch(e) {}
        saveMockRemarks();
        updateRemark(userToken, username, v);
        wrap.replaceWith(generateRemarkSpan(span.className, userToken, username, v));
    }
    function cancel() { wrap.replaceWith(span); }
    function remove() {
        delete _mockRemarks[username];
        try { localStorage.removeItem('ghrk_' + username); } catch(e) {}
        saveMockRemarks(); wrap.remove();
    }
    ok.onclick = function(e) { e.stopPropagation(); save(); };
    cx.onclick = function(e) { e.stopPropagation(); cancel(); };
    rm.onclick = function(e) { e.stopPropagation(); remove(); };
    inp.onkeydown = function(e) { if (e.key==='Enter') { e.stopPropagation(); save(); } if (e.key==='Escape') { e.stopPropagation(); cancel(); } };
    inp.onclick = function(e) { e.stopPropagation(); };
    span.replaceWith(wrap);
    setTimeout(function() { inp.focus(); inp.select(); }, 50);
}

function clearRemarkOfCurrentNode(div) {
    var r = div.querySelector('.github-remarks');
    if (r) r.remove();
}

function showRemarkInLeftPannel(userToken) {
    elementReady('h1[class*="vcard"] .vcard-username, .ProfileHeader-name + span, [data-testid="profile-login"], .js-profile-editable-username').then(function(el) {
        if (!el) return;
        clearRemarkOfCurrentNode(el.parentNode);
        var uname = getMasterOfPage(location.href);
        getRemark(userToken, uname, function(remark) {
            if (!remark || remark === 'no remark') return;
            el.parentNode.appendChild(generateRemarkSpan('d-inline-block ml-2 github-remarks', userToken, uname, remark));
        });
    });
}

var _ghRemarkInited = false;
var _ghRemarkGlobalObserver = null;
var _ghRemarkLastScan = 0;

function globalScan(userToken) {
    var now = Date.now();
    if (now - _ghRemarkLastScan < 2000) return;
    _ghRemarkLastScan = now;
    if (!userToken) return;
    var tab = getCurrentTab();
    document.querySelectorAll('a[data-hovercard-type=user]').forEach(function(el) {
        var uname = getMasterOfPage(el.href);
        if (!uname) return;
        if (el.parentNode && el.parentNode.querySelector('.github-remarks')) return;
        if (el.querySelector('.github-remarks')) return;
        getRemark(userToken, uname, function(remark) {
            if (!remark || remark === 'no remark') return;
            var span = generateRemarkSpan('pl-1 github-remarks', userToken, uname, remark);
            if (tab === 'following' || tab === 'followers') el.appendChild(span);
            else insertAfter(span, el);
        });
    });
}

function globalSetup() {
    if (_ghRemarkInited) return;
    _ghRemarkInited = true;
    loadMockRemarks();
    var uname = getGithubLoginUsername();
    if (!uname) return;
    console.log('GithubRemark inject');
    _ghRemarkGlobalObserver = new MutationObserver(function() { globalScan(uname); });
    _ghRemarkGlobalObserver.observe(document.documentElement, { childList: true, subtree: true });
    showRemarkInLeftPannel(uname);
    globalScan(uname);
    setTimeout(function() { globalScan(uname); }, 500);
    setTimeout(function() { globalScan(uname); }, 1500);
    setTimeout(function() { globalScan(uname); }, 3000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', globalSetup);
} else {
    globalSetup();
}

document.addEventListener('turbo:before-render', function() { _ghRemarkLastScan = 0; });
document.addEventListener('turbo:load', function() {
    _ghRemarkLastScan = 0;
    var uname = getGithubLoginUsername();
    if (uname) {
        showRemarkInLeftPannel(uname);
        globalScan(uname);
        setTimeout(function() { globalScan(uname); }, 500);
        setTimeout(function() { globalScan(uname); }, 1500);
    }
});
