/**
 * GithubRemarkReborn - Content Script
 * 针对视觉清晰度、多余头像挂载、未备注用户快速添加入口做深度优化
 */
(function () {
    'use strict';

    if (window.__GH_REMARK_INITIALIZED__) return;
    window.__GH_REMARK_INITIALIZED__ = true;

    // 内置极简高清矢量 SVG 图标
    var ICONS = {
        TAG: '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" style="flex-shrink:0;"><path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/></svg>',
        EDIT: '<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM9.75 4.81l-6.97 6.971a.249.249 0 0 0-.064.108l-.558 1.953 1.953-.558a.248.248 0 0 0 .108-.064l6.97-6.971-1.439-1.44Z"/></svg>',
        DELETE: '<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>',
        CHECK: '<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>',
        PLUS: '<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>'
    };

    var RESERVED_PATHS = [
        'about', 'pricing', 'features', 'security', 'enterprise', 'customer-stories',
        'solutions', 'readme', 'organizations', 'settings', 'notifications', 'login',
        'join', 'session', 'dashboard', 'explore', 'topics', 'trending', 'collections',
        'events', 'sponsors', 'marketplace', 'pulls', 'issues', 'discussions', 'actions',
        'projects', 'codespaces', 'stars', 'site', 'search', 'orgs', 'contact'
    ];

    var _remarksCache = {};
    var _isEnabled = true;
    var _profileUser = null;

    // 注入高对比度、清晰利落的样式
    function injectStyles() {
        if (document.getElementById('ghrk-injected-style')) return;
        var style = document.createElement('style');
        style.id = 'ghrk-injected-style';
        style.textContent = [
            '/* ===== GithubRemark 核心高对比度样式 ===== */',
            ':root {',
            '  --ghrk-badge-bg: #e0f2fe;',
            '  --ghrk-badge-border: #38bdf8;',
            '  --ghrk-badge-text: #0c4a6e;',
            '  --ghrk-badge-hover-bg: #bae6fd;',
            '  --ghrk-badge-hover-border: #0284c7;',
            '  --ghrk-input-bg: #ffffff;',
            '  --ghrk-input-border: #0284c7;',
            '  --ghrk-input-text: #0c4a6e;',
            '  --ghrk-btn-edit-bg: #bae6fd;',
            '  --ghrk-btn-edit-text: #0369a1;',
            '  --ghrk-btn-del-bg: #fee2e2;',
            '  --ghrk-btn-del-text: #dc2626;',
            '  --ghrk-add-btn-bg: #f8fafc;',
            '  --ghrk-add-btn-border: #cbd5e1;',
            '  --ghrk-add-btn-text: #334155;',
            '  --ghrk-bar-bg: #ffffff;',
            '  --ghrk-bar-border: #d0d7de;',
            '  --ghrk-bar-shadow: 0 6px 18px rgba(31, 35, 40, 0.16), 0 1px 3px rgba(31, 35, 40, 0.08);',
            '}',
            '/* 仅在 GitHub 明确处于深色模式时切换为暗色高亮配色 (严禁使用 data-dark-theme 等常驻属性) */',
            'html[data-color-mode="dark"], [data-color-mode="dark"] body {',
            '  --ghrk-badge-bg: rgba(56, 189, 248, 0.16);',
            '  --ghrk-badge-border: rgba(56, 189, 248, 0.5);',
            '  --ghrk-badge-text: #7dd3fc;',
            '  --ghrk-badge-hover-bg: rgba(56, 189, 248, 0.28);',
            '  --ghrk-badge-hover-border: #38bdf8;',
            '  --ghrk-input-bg: #0f172a;',
            '  --ghrk-input-border: #38bdf8;',
            '  --ghrk-input-text: #f8fafc;',
            '  --ghrk-btn-edit-bg: rgba(56, 189, 248, 0.25);',
            '  --ghrk-btn-edit-text: #7dd3fc;',
            '  --ghrk-btn-del-bg: rgba(239, 68, 68, 0.2);',
            '  --ghrk-btn-del-text: #f87171;',
            '  --ghrk-add-btn-bg: rgba(30, 41, 59, 0.6);',
            '  --ghrk-add-btn-border: #334155;',
            '  --ghrk-add-btn-text: #94a3b8;',
            '  --ghrk-bar-bg: #21262d;',
            '  --ghrk-bar-border: #30363d;',
            '  --ghrk-bar-shadow: 0 6px 18px rgba(1, 4, 9, 0.6), 0 1px 3px rgba(1, 4, 9, 0.5);',
            '}',
            '/* 备注徽章基础样式 - 字迹大而清晰、对比度极高 */',
            '.github-remarks {',
            '  display: inline-flex !important;',
            '  align-items: center;',
            '  gap: 4px;',
            '  padding: 2px 9px;',
            '  margin-left: 6px;',
            '  border-radius: 9999px;',
            '  font-size: 13px !important;',
            '  font-weight: 700 !important;',
            '  line-height: 1.3;',
            '  letter-spacing: 0.01em;',
            '  color: var(--ghrk-badge-text) !important;',
            '  background: var(--ghrk-badge-bg);',
            '  border: 1px solid var(--ghrk-badge-border);',
            '  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);',
            '  vertical-align: middle;',
            '  white-space: nowrap;',
            '  cursor: default;',
            '  user-select: none;',
            '  transition: all 0.12s ease-in-out;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;',
            '}',
            '.github-remarks:hover {',
            '  background: var(--ghrk-badge-hover-bg);',
            '  border-color: var(--ghrk-badge-hover-border);',
            '}',
            '/* 个人主页大号徽章 */',
            '.github-remarks.ghrk-profile-badge {',
            '  font-size: 14px !important;',
            '  padding: 3px 12px;',
            '  margin-top: 6px;',
            '  margin-left: 0;',
            '}',
            '/* 个人主页常驻「+ 添加备注」胶囊按钮 */',
            '.ghrk-add-remark-btn {',
            '  display: inline-flex !important;',
            '  align-items: center;',
            '  gap: 5px;',
            '  font-size: 13px !important;',
            '  font-weight: 600;',
            '  padding: 3px 12px;',
            '  margin-top: 6px;',
            '  border-radius: 9999px;',
            '  color: var(--ghrk-add-btn-text) !important;',
            '  background: var(--ghrk-add-btn-bg);',
            '  border: 1px dashed var(--ghrk-add-btn-border);',
            '  cursor: pointer;',
            '  user-select: none;',
            '  transition: all 0.15s ease;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;',
            '}',
            '.ghrk-add-remark-btn:hover {',
            '  background: var(--ghrk-badge-bg);',
            '  color: var(--ghrk-badge-text) !important;',
            '  border-color: var(--ghrk-badge-hover-border);',
            '  border-style: solid;',
            '}',
            '/* 列表页未备注用户的悬停显式「+」微胶囊 */',
            '.ghrk-inline-add-btn {',
            '  display: inline-flex !important;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 3px;',
            '  padding: 1px 7px;',
            '  margin-left: 5px;',
            '  height: 20px;',
            '  border-radius: 10px;',
            '  font-size: 11px !important;',
            '  font-weight: 600;',
            '  color: var(--ghrk-add-btn-text);',
            '  background: var(--ghrk-add-btn-bg);',
            '  border: 1px dashed var(--ghrk-add-btn-border);',
            '  cursor: pointer;',
            '  opacity: 0;',
            '  pointer-events: none;',
            '  vertical-align: middle;',
            '  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;',
            '  user-select: none;',
            '}',
            '/* 鼠标悬停在用户所在行或父容器时，微按钮显形 */',
            '*:hover > .ghrk-inline-add-btn,',
            '*:hover > * > .ghrk-inline-add-btn,',
            '.ghrk-inline-add-btn:hover {',
            '  opacity: 0.85;',
            '  pointer-events: auto;',
            '}',
            '.ghrk-inline-add-btn:hover {',
            '  opacity: 1;',
            '  color: var(--ghrk-badge-text) !important;',
            '  background: var(--ghrk-badge-bg);',
            '  border-color: var(--ghrk-badge-hover-border);',
            '  border-style: solid;',
            '}',
            '/* 徽章内部文字与工具栏 */',
            '.ghrk-label {',
            '  display: inline-block;',
            '  max-width: 180px;',
            '  overflow: hidden;',
            '  text-overflow: ellipsis;',
            '  white-space: nowrap;',
            '  vertical-align: middle;',
            '  font-size: 13px !important;',
            '  font-weight: 700 !important;',
            '  color: var(--ghrk-badge-text) !important;',
            '}',
            '/* 悬浮操作条：挂载于 body 固定定位，完全不参与父容器布局，避免悬停抖动 */',
            '.ghrk-float-bar {',
            '  position: fixed;',
            '  z-index: 2147483000;',
            '  display: none;',
            '  align-items: center;',
            '  gap: 5px;',
            '  padding: 3px 5px;',
            '  border-radius: 9999px;',
            '  background: var(--ghrk-bar-bg);',
            '  border: 1px solid var(--ghrk-bar-border);',
            '  box-shadow: var(--ghrk-bar-shadow);',
            '  animation: ghrk-bar-in 0.12s ease-out;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;',
            '}',
            '.ghrk-bar-btn {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  width: 20px;',
            '  height: 20px;',
            '  border-radius: 50%;',
            '  border: none;',
            '  padding: 0;',
            '  cursor: pointer;',
            '  outline: none;',
            '  transition: transform 0.1s ease, background 0.1s ease;',
            '}',
            '.ghrk-bar-btn:hover { transform: scale(1.12); }',
            '.ghrk-bar-btn.edit {',
            '  background: var(--ghrk-btn-edit-bg);',
            '  color: var(--ghrk-btn-edit-text);',
            '}',
            '.ghrk-bar-btn.delete {',
            '  background: var(--ghrk-btn-del-bg);',
            '  color: var(--ghrk-btn-del-text);',
            '}',
            '@keyframes ghrk-bar-in {',
            '  from { opacity: 0; transform: translateY(2px) scale(0.94); }',
            '  to { opacity: 1; transform: translateY(0) scale(1); }',
            '}',
            '/* 内联编辑区 */',
            '.ghrk-edit-area {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 3px;',
            '  vertical-align: middle;',
            '}',
            '.ghrk-edit-input {',
            '  font-size: 13px !important;',
            '  font-weight: 600;',
            '  padding: 2px 8px;',
            '  border-radius: 5px;',
            '  border: 1.5px solid var(--ghrk-input-border);',
            '  background: var(--ghrk-input-bg);',
            '  color: var(--ghrk-input-text);',
            '  outline: none;',
            '  width: 110px;',
            '  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.18);',
            '}',
            '.ghrk-edit-mode > .ghrk-label, .ghrk-edit-mode > .ghrk-tag-icon {',
            '  display: none !important;',
            '}',
            '.ghrk-btn-save, .ghrk-btn-cancel {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 1px 5px;',
            '  border-radius: 3px;',
            '  font-size: 11px;',
            '  border: none;',
            '  cursor: pointer;',
            '}',
            '.ghrk-btn-save { background: #0969da; color: #fff; }',
            '.ghrk-btn-save:hover { background: #0550ae; }',
            '.ghrk-btn-cancel { background: #d0d7de; color: #24292f; }',
            '.ghrk-btn-cancel:hover { background: #afb8c1; }'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    // 从页面路径判断是否处于他人个人主页
    function detectProfileUsername() {
        var path = window.location.pathname.replace(/^\/|\/$/g, '');
        if (!path) return null;
        var parts = path.split('/');
        if (parts.length === 1) {
            var candidate = parts[0].toLowerCase();
            if (RESERVED_PATHS.indexOf(candidate) === -1) {
                return parts[0];
            }
        }
        return null;
    }

    // 从链接中提取用户名
    function extractUsernameFromLink(el) {
        if (!el || !el.href) return null;
        try {
            var url = new URL(el.href, window.location.origin);
            if (url.hostname !== 'github.com') return null;
            var parts = url.pathname.replace(/^\/|\/$/g, '').split('/');
            if (parts.length >= 1) {
                var candidate = parts[0];
                if (RESERVED_PATHS.indexOf(candidate.toLowerCase()) === -1) {
                    return candidate;
                }
            }
        } catch (e) {}
        return null;
    }

    // 获取当前登录用户
    function getLoggedInUser() {
        var meta = document.querySelector('meta[name="user-login"]');
        return meta ? meta.getAttribute('content') : null;
    }

    // 开启内联编辑
    function startInlineEditing(container, username, oldRemark, isProfile, onSaveCallback) {
        container.classList.add('ghrk-edit-mode');

        var editArea = document.createElement('span');
        editArea.className = 'ghrk-edit-area';
        editArea.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); });

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'ghrk-edit-input';
        input.value = oldRemark || '';
        input.placeholder = '输入备注...';

        var btnSave = document.createElement('button');
        btnSave.className = 'ghrk-btn-save';
        btnSave.innerHTML = ICONS.CHECK;
        btnSave.title = '保存 (Enter)';

        var btnCancel = document.createElement('button');
        btnCancel.className = 'ghrk-btn-cancel';
        btnCancel.innerHTML = ICONS.DELETE;
        btnCancel.title = '取消 (Esc)';

        editArea.appendChild(input);
        editArea.appendChild(btnSave);
        editArea.appendChild(btnCancel);
        container.appendChild(editArea);

        function doSave() {
            var newRemark = input.value.trim();
            editArea.remove();
            container.classList.remove('ghrk-edit-mode');
            if (newRemark !== oldRemark) {
                if (newRemark) {
                    _remarksCache[username.toLowerCase()] = newRemark;
                    StorageManager.setRemark(username, newRemark);
                } else {
                    delete _remarksCache[username.toLowerCase()];
                    StorageManager.deleteRemark(username);
                }
            }
            if (onSaveCallback) onSaveCallback(newRemark);
            refreshAllBadgesForUser(username, newRemark);
        }

        function doCancel() {
            editArea.remove();
            container.classList.remove('ghrk-edit-mode');
            if (onSaveCallback) onSaveCallback(oldRemark);
        }

        btnSave.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            doSave();
        });

        btnCancel.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            doCancel();
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.stopPropagation(); e.preventDefault();
                doSave();
            } else if (e.key === 'Escape') {
                e.stopPropagation(); e.preventDefault();
                doCancel();
            }
        });

        setTimeout(function () {
            input.focus();
            input.select();
        }, 50);
    }

    // ===== 悬浮操作条（挂载于 body，零布局位移，杜绝悬停抖动/裁剪/消失） =====
    var _floatBar = null;
    var _floatTimer = null;
    var _floatBadge = null;

    function ensureFloatBar() {
        if (_floatBar && document.body.contains(_floatBar)) return _floatBar;
        var bar = document.createElement('div');
        bar.className = 'ghrk-float-bar';
        bar.setAttribute('role', 'toolbar');
        bar.addEventListener('mouseenter', cancelHideFloatBar);
        bar.addEventListener('mouseleave', scheduleHideFloatBar);
        document.body.appendChild(bar);
        _floatBar = bar;
        return bar;
    }

    function cancelHideFloatBar() {
        if (_floatTimer) {
            clearTimeout(_floatTimer);
            _floatTimer = null;
        }
    }

    function hideFloatBar() {
        cancelHideFloatBar();
        _floatBadge = null;
        if (_floatBar) {
            _floatBar.style.display = 'none';
            _floatBar.innerHTML = '';
        }
    }

    function scheduleHideFloatBar() {
        cancelHideFloatBar();
        // 延迟隐藏，给指针在徽章与操作条之间移动留出缓冲，避免闪烁
        _floatTimer = setTimeout(hideFloatBar, 180);
    }

    function positionFloatBar(bar, badge) {
        var rect = badge.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) return false;
        var barRect = bar.getBoundingClientRect();
        var barW = barRect.width || 64;
        var barH = barRect.height || 26;
        // 默认贴在徽章右侧垂直居中；右侧空间不足则改到下方，避免溢出视口
        var left = rect.right + 6;
        var top = rect.top + (rect.height - barH) / 2;
        if (left + barW > window.innerWidth - 8) {
            left = Math.max(8, Math.min(rect.left, window.innerWidth - barW - 8));
            top = rect.bottom + 6;
        }
        if (top + barH > window.innerHeight - 8) {
            top = Math.max(8, rect.top - barH - 6);
        }
        bar.style.left = Math.round(left) + 'px';
        bar.style.top = Math.round(top) + 'px';
        return true;
    }

    function showFloatBar(badge, username, labelEl) {
        if (!badge || !document.body.contains(badge) || !labelEl) return;
        // 编辑状态下不再弹出操作条，避免与输入框叠层
        if (badge.classList.contains('ghrk-edit-mode')) return;
        var bar = ensureFloatBar();
        cancelHideFloatBar();
        _floatBadge = badge;
        bar.innerHTML = '';

        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'ghrk-bar-btn edit';
        editBtn.title = '修改备注';
        editBtn.innerHTML = ICONS.EDIT;
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            hideFloatBar();
            startInlineEditing(badge, username, labelEl.textContent, badge.classList.contains('ghrk-profile-badge'), function (updated) {
                if (updated) {
                    labelEl.textContent = updated;
                } else {
                    badge.remove();
                }
            });
        });

        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'ghrk-bar-btn delete';
        delBtn.title = '删除备注';
        delBtn.innerHTML = ICONS.DELETE;
        delBtn.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
            hideFloatBar();
            if (confirm('确定要删除「' + username + '」的备注吗？')) {
                delete _remarksCache[username.toLowerCase()];
                StorageManager.deleteRemark(username);
                refreshAllBadgesForUser(username, '');
            }
        });

        bar.appendChild(editBtn);
        bar.appendChild(delBtn);
        bar.style.display = 'inline-flex';
        if (!positionFloatBar(bar, badge)) {
            bar.style.display = 'none';
        }
    }

    // 创建通用备注徽章 DOM
    function createRemarkBadgeElement(username, remark, isProfile) {
        var wrap = document.createElement('span');
        wrap.className = 'github-remarks' + (isProfile ? ' ghrk-profile-badge' : '');
        wrap.setAttribute('data-ghrk-owner', username.toLowerCase());
        wrap.addEventListener('click', function (e) {
            e.stopPropagation(); e.preventDefault();
        });

        var iconSpan = document.createElement('span');
        iconSpan.className = 'ghrk-tag-icon';
        iconSpan.innerHTML = ICONS.TAG;
        wrap.appendChild(iconSpan);

        var label = document.createElement('span');
        label.className = 'ghrk-label';
        label.textContent = remark;
        wrap.appendChild(label);

        // 悬停时在 body 上弹出固定定位的操作条，徽章自身尺寸保持不变
        wrap.addEventListener('mouseenter', function () {
            showFloatBar(wrap, username, label);
        });
        wrap.addEventListener('mouseleave', function () {
            scheduleHideFloatBar();
        });

        return wrap;
    }

    // 刷新页面中该用户的所有徽章
    function refreshAllBadgesForUser(username, remark) {
        var key = username.toLowerCase();
        var existingBadges = document.querySelectorAll('.github-remarks[data-ghrk-owner="' + key + '"]');
        if (!remark) {
            hideFloatBar();
            existingBadges.forEach(function (b) { b.remove(); });
            if (_profileUser && _profileUser.toLowerCase() === key) {
                // 清空个人主页容器后重建，避免残留空容器导致添加入口无法再次出现
                var staleContainer = document.querySelector('.ghrk-profile-container');
                if (staleContainer) staleContainer.remove();
                renderProfileSection();
            }
        } else {
            existingBadges.forEach(function (b) {
                var label = b.querySelector('.ghrk-label');
                if (label) label.textContent = remark;
            });
            if (_profileUser && _profileUser.toLowerCase() === key) {
                var oldContainer = document.querySelector('.ghrk-profile-container');
                if (oldContainer) oldContainer.remove();
                renderProfileSection();
            }
        }
        // 重置扫描标记让新增/删除立即展现
        document.querySelectorAll('.ghrk-processed-link').forEach(function (el) {
            el.classList.remove('ghrk-processed-link');
        });
        scheduleScan();
    }

    // 挂载个人主页常驻备注区域
    function renderProfileSection() {
        var username = detectProfileUsername();
        _profileUser = username;
        if (!username || !_isEnabled) {
            var oldProfileEl = document.querySelector('.ghrk-profile-container');
            if (oldProfileEl) oldProfileEl.remove();
            return;
        }

        // 定位个人资料名字挂载点
        var nameContainer = document.querySelector('.vcard-names-container') ||
            document.querySelector('.vcard-names') ||
            document.querySelector('h1.vcard-names');
        if (!nameContainer) return;

        var existingContainer = document.querySelector('.ghrk-profile-container');
        if (existingContainer) {
            if (existingContainer.getAttribute('data-for-user') === username.toLowerCase()) {
                return;
            }
            existingContainer.remove();
        }

        var container = document.createElement('div');
        container.className = 'ghrk-profile-container';
        container.setAttribute('data-for-user', username.toLowerCase());

        var currentRemark = _remarksCache[username.toLowerCase()];
        if (currentRemark) {
            var badge = createRemarkBadgeElement(username, currentRemark, true);
            container.appendChild(badge);
        } else {
            // 未备注：渲染常驻「+ 添加备注」胶囊按钮
            var addBtn = document.createElement('button');
            addBtn.className = 'ghrk-add-remark-btn';
            addBtn.innerHTML = ICONS.PLUS + '<span>添加备注</span>';
            addBtn.addEventListener('click', function (e) {
                e.stopPropagation(); e.preventDefault();
                addBtn.style.display = 'none';
                startInlineEditing(container, username, '', true, function (newRemark) {
                    if (!newRemark) {
                        addBtn.style.display = 'inline-flex';
                    } else {
                        renderProfileSection();
                    }
                });
            });
            container.appendChild(addBtn);
        }

        nameContainer.appendChild(container);
    }

    // 扫描页面中所有的用户链接并附加徽章或悬停快速添加按钮
    function scanAndAttachBadges() {
        if (!_isEnabled) {
            hideFloatBar();
            document.querySelectorAll('.github-remarks, .ghrk-profile-container, .ghrk-inline-add-btn').forEach(function (e) {
                e.remove();
            });
            return;
        }

        renderProfileSection();

        // 扫描全局用户链接 (包括关注列表、粉丝列表、成员列表、Issue作者等)
        var links = document.querySelectorAll('a[data-hovercard-type="user"], a.author, a[rel="author"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            // 1. 过滤：如果是纯头像图片链接，坚决不插入徽章（防止头像下方重复多出徽章）
            if (link.querySelector('img') || link.classList.contains('avatar') || link.querySelector('.avatar')) {
                continue;
            }

            // 2. 过滤：纯空内容或个人资料主容器内部
            var linkText = (link.textContent || '').trim();
            if (!linkText || link.closest('.ghrk-profile-container')) {
                continue;
            }

            var uname = extractUsernameFromLink(link);
            if (!uname) continue;

            var key = uname.toLowerCase();
            var remark = _remarksCache[key];

            var parent = link.parentNode;
            if (!parent) continue;

            // 检查是否已经存在该用户的徽章或按钮
            var existingBadge = parent.querySelector('.github-remarks[data-ghrk-owner="' + key + '"]');
            var existingAddBtn = parent.querySelector('.ghrk-inline-add-btn[data-for-user="' + key + '"]');

            // 自愈：仅当节点仍真实存在时才跳过；若 GitHub 局部重绘移除了我们的节点，则重新补挂
            if (link.classList.contains('ghrk-processed-link') && (existingBadge || existingAddBtn)) {
                continue;
            }
            link.classList.remove('ghrk-processed-link');

            if (remark) {
                // 已有备注：移除临时添加按钮（如果有），挂载清晰徽章
                if (existingAddBtn) existingAddBtn.remove();
                if (!existingBadge) {
                    var badge = createRemarkBadgeElement(uname, remark, false);
                    if (link.nextSibling) {
                        parent.insertBefore(badge, link.nextSibling);
                    } else {
                        parent.appendChild(badge);
                    }
                }
            } else {
                // 未设置备注：在链接旁挂载悬停显式的微型「+ 备注」按钮
                if (existingBadge) existingBadge.remove();
                if (!existingAddBtn) {
                    var addBtn = document.createElement('button');
                    addBtn.className = 'ghrk-inline-add-btn';
                    addBtn.setAttribute('data-for-user', key);
                    addBtn.title = '为 @' + uname + ' 添加备注';
                    addBtn.innerHTML = ICONS.PLUS + '<span>备注</span>';
                    
                    (function (u, btnEl, pNode) {
                        btnEl.addEventListener('click', function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            btnEl.style.display = 'none';

                            var inlineWrap = document.createElement('span');
                            inlineWrap.className = 'github-remarks';
                            pNode.insertBefore(inlineWrap, btnEl);

                            startInlineEditing(inlineWrap, u, '', false, function (savedRemark) {
                                inlineWrap.remove();
                                if (!savedRemark) {
                                    btnEl.style.display = 'inline-flex';
                                } else {
                                    refreshAllBadgesForUser(u, savedRemark);
                                }
                            });
                        });
                    })(uname, addBtn, parent);

                    if (link.nextSibling) {
                        parent.insertBefore(addBtn, link.nextSibling);
                    } else {
                        parent.appendChild(addBtn);
                    }
                }
            }
            link.classList.add('ghrk-processed-link');
        }
    }

    // 初始化防抖扫描机制
    var _scanTimer = null;
    function scheduleScan() {
        if (_scanTimer) clearTimeout(_scanTimer);
        _scanTimer = setTimeout(function () {
            scanAndAttachBadges();
        }, 60);
    }

    // 初始化
    function init() {
        injectStyles();

        Promise.all([
            StorageManager.getStatus(),
            StorageManager.getAllRemarks()
        ]).then(function (results) {
            _isEnabled = results[0];
            _remarksCache = results[1] || {};
            scanAndAttachBadges();
        });

        // 监听存储变动 (多标签页跨页面即时秒级同步)
        StorageManager.onChanged(function (change) {
            if (change.type === 'status') {
                _isEnabled = change.enabled;
                scanAndAttachBadges();
            } else if (change.type === 'remarks') {
                _remarksCache = change.data || {};
                hideFloatBar();
                document.querySelectorAll('.ghrk-processed-link').forEach(function (el) {
                    el.classList.remove('ghrk-processed-link');
                });
                scheduleScan();
            }
        });

        // 监听来自后台/右键菜单的消息
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
                if (msg.action === 'trigger_edit_user' && msg.username) {
                    var targetUser = msg.username;
                    var current = _remarksCache[targetUser.toLowerCase()] || '';
                    var promptVal = prompt('给 GitHub 用户「' + targetUser + '」设置备注：', current);
                    if (promptVal !== null) {
                        var trimmed = promptVal.trim();
                        if (trimmed) {
                            StorageManager.setRemark(targetUser, trimmed);
                        } else {
                            StorageManager.deleteRemark(targetUser);
                        }
                    }
                    sendResponse({ ok: true });
                }
            });
        }

        // 监听 DOM 变动与 Turbo 单页导航
        var observer = new MutationObserver(function () {
            scheduleScan();
        });
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });

        // 滚动与缩放时收起悬浮操作条，避免其位置与徽章错位
        window.addEventListener('scroll', hideFloatBar, true);
        window.addEventListener('resize', hideFloatBar);

        document.addEventListener('turbo:load', function () {
            document.querySelectorAll('.ghrk-processed-link').forEach(function (el) {
                el.classList.remove('ghrk-processed-link');
            });
            scheduleScan();
        });
        document.addEventListener('turbo:render', scheduleScan);
        window.addEventListener('popstate', scheduleScan);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
