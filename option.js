/**
 * GithubRemark Options Controller
 */
document.addEventListener('DOMContentLoaded', function () {
    var remarksBody = document.getElementById('remarksBody');
    var emptyTip = document.getElementById('emptyTip');
    var countText = document.getElementById('countText');
    var searchInput = document.getElementById('searchInput');
    var addUsername = document.getElementById('addUsername');
    var addRemark = document.getElementById('addRemark');
    var btnSaveRemark = document.getElementById('btnSaveRemark');
    var btnExport = document.getElementById('btnExport');
    var btnImportTrigger = document.getElementById('btnImportTrigger');
    var importFileInput = document.getElementById('importFileInput');
    var btnClearAll = document.getElementById('btnClearAll');

    var _allRemarks = {};

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function renderTable() {
        var query = (searchInput.value || '').trim().toLowerCase();
        var keys = Object.keys(_allRemarks);
        var filtered = keys.filter(function (u) {
            var r = _allRemarks[u];
            return u.toLowerCase().indexOf(query) !== -1 || r.toLowerCase().indexOf(query) !== -1;
        });

        countText.textContent = keys.length;
        remarksBody.innerHTML = '';

        if (filtered.length === 0) {
            emptyTip.style.display = 'block';
            return;
        }
        emptyTip.style.display = 'none';

        filtered.sort().forEach(function (username) {
            var remark = _allRemarks[username];
            var tr = document.createElement('tr');

            // 头像与用户单元格
            var tdUser = document.createElement('td');
            tdUser.innerHTML = [
                '<div class="user-cell">',
                '  <img class="avatar" src="https://github.com/' + escapeHtml(username) + '.png?size=48" alt="avatar" onerror="this.src=\'images/icon-48.png\'">',
                '  <a class="username-link" href="https://github.com/' + escapeHtml(username) + '" target="_blank">@' + escapeHtml(username) + '</a>',
                '</div>'
            ].join('');

            // 备注单元格
            var tdRemark = document.createElement('td');
            var spanRemark = document.createElement('span');
            spanRemark.className = 'remark-badge';
            spanRemark.textContent = remark;
            tdRemark.appendChild(spanRemark);

            // 操作单元格
            var tdActions = document.createElement('td');
            tdActions.innerHTML = [
                '<div class="table-actions">',
                '  <button class="btn btn-secondary btn-sm btn-edit-row">修改</button>',
                '  <button class="btn btn-danger btn-sm btn-del-row">删除</button>',
                '</div>'
            ].join('');

            // 修改事件
            tdActions.querySelector('.btn-edit-row').addEventListener('click', function () {
                var newRemark = prompt('为 @' + username + ' 修改备注名：', remark);
                if (newRemark !== null) {
                    var val = newRemark.trim();
                    if (val) {
                        StorageManager.setRemark(username, val).then(function () {
                            _allRemarks[username] = val;
                            renderTable();
                        });
                    } else {
                        StorageManager.deleteRemark(username).then(function () {
                            delete _allRemarks[username];
                            renderTable();
                        });
                    }
                }
            });

            // 删除事件
            tdActions.querySelector('.btn-del-row').addEventListener('click', function () {
                if (confirm('确定要删除针对 @' + username + ' 的备注吗？')) {
                    StorageManager.deleteRemark(username).then(function () {
                        delete _allRemarks[username];
                        renderTable();
                    });
                }
            });

            tr.appendChild(tdUser);
            tr.appendChild(tdRemark);
            tr.appendChild(tdActions);
            remarksBody.appendChild(tr);
        });
    }

    function loadData() {
        StorageManager.getAllRemarks().then(function (remarks) {
            _allRemarks = remarks || {};
            renderTable();
        });
    }

    // 搜索实时过滤
    searchInput.addEventListener('input', renderTable);

    // 新增备注
    btnSaveRemark.addEventListener('click', function () {
        var username = (addUsername.value || '').trim();
        var remark = (addRemark.value || '').trim();

        if (!username) {
            alert('请输入 GitHub 用户名');
            addUsername.focus();
            return;
        }
        if (!remark) {
            alert('请输入备注名');
            addRemark.focus();
            return;
        }

        StorageManager.setRemark(username, remark).then(function (success) {
            if (success) {
                _allRemarks[username.toLowerCase()] = remark;
                addUsername.value = '';
                addRemark.value = '';
                renderTable();
            } else {
                alert('保存失败，请重试');
            }
        });
    });

    // 导出备份 JSON
    btnExport.addEventListener('click', function () {
        StorageManager.exportJson().then(function (jsonStr) {
            var blob = new Blob([jsonStr], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            var dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.href = url;
            a.download = 'github_remarks_backup_' + dateStr + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // 导入备份 JSON
    btnImportTrigger.addEventListener('click', function () {
        importFileInput.value = '';
        importFileInput.click();
    });

    importFileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (ev) {
            var content = ev.target.result;
            StorageManager.importJson(content, true).then(function (res) {
                if (res.success) {
                    alert('成功导入 ' + res.count + ' 条备注数据！');
                    loadData();
                } else {
                    alert('导入失败：' + res.error);
                }
            });
        };
        reader.readAsText(file);
    });

    // 清空全部
    btnClearAll.addEventListener('click', function () {
        if (confirm('⚠️ 危险操作：确定要清空全部 GitHub 备注吗？\n该操作不可撤销，建议先导出备份！')) {
            if (confirm('请再次确认：真的要彻底清除所有备注记录吗？')) {
                var storage = (typeof chrome !== 'undefined' && chrome.storage) ? (chrome.storage.sync || chrome.storage.local) : null;
                if (storage) {
                    storage.set({ 'gh_remarks_v2': {} }, function () {
                        _allRemarks = {};
                        renderTable();
                        alert('已清空所有备注数据。');
                    });
                }
            }
        }
    });

    loadData();
});
