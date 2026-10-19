/**
 * GithubRemark Popup Controller
 */
document.addEventListener('DOMContentLoaded', function () {
    var toggleStatus = document.getElementById('toggleStatus');
    var totalRemarksCount = document.getElementById('totalRemarksCount');
    var statusIndicator = document.getElementById('statusIndicator');
    var inputUsername = document.getElementById('inputUsername');
    var inputRemark = document.getElementById('inputRemark');
    var btnQuickAdd = document.getElementById('btnQuickAdd');
    var btnOpenOptions = document.getElementById('btnOpenOptions');
    var tipMsg = document.getElementById('tipMsg');

    function showTip(text, isError) {
        tipMsg.textContent = text;
        tipMsg.className = 'tip-msg ' + (isError ? 'error' : 'success');
        setTimeout(function () {
            tipMsg.textContent = '';
            tipMsg.className = 'tip-msg';
        }, 2500);
    }

    function refreshData() {
        Promise.all([
            StorageManager.getStatus(),
            StorageManager.getAllRemarks()
        ]).then(function (res) {
            var isEnabled = res[0];
            var remarks = res[1] || {};

            toggleStatus.checked = isEnabled;
            statusIndicator.textContent = isEnabled ? '已开启' : '已暂停';
            statusIndicator.style.color = isEnabled ? '#10b981' : '#64748b';

            var count = Object.keys(remarks).length;
            totalRemarksCount.textContent = count + ' 位';
        });
    }

    // 开关状态切换
    toggleStatus.addEventListener('change', function () {
        var enabled = toggleStatus.checked;
        StorageManager.setStatus(enabled).then(function () {
            chrome.runtime.sendMessage({
                action: 'toggle_status',
                enabled: enabled
            });
            statusIndicator.textContent = enabled ? '已开启' : '已暂停';
            statusIndicator.style.color = enabled ? '#10b981' : '#64748b';
        });
    });

    // 快捷添加
    btnQuickAdd.addEventListener('click', function () {
        var username = (inputUsername.value || '').trim();
        var remark = (inputRemark.value || '').trim();

        if (!username) {
            showTip('请输入 GitHub 用户名', true);
            inputUsername.focus();
            return;
        }
        if (!remark) {
            showTip('请输入备注内容', true);
            inputRemark.focus();
            return;
        }

        StorageManager.setRemark(username, remark).then(function (success) {
            if (success) {
                showTip('添加成功！', false);
                inputUsername.value = '';
                inputRemark.value = '';
                refreshData();
            } else {
                showTip('保存失败，请稍后重试', true);
            }
        });
    });

    // 打开选项页
    btnOpenOptions.addEventListener('click', function (e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    refreshData();
});
