/**
 * GithubRemark 统一存储管理层
 * 兼容 Chrome 与 Microsoft Edge 原生扩展规范
 * 纯本地存储：chrome.storage.local，数据不出设备；旧版本 sync 数据首次读取时自动迁移
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.StorageManager = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var api = (typeof chrome !== 'undefined' && chrome.storage)
        ? chrome
        : ((typeof browser !== 'undefined' && browser.storage) ? browser : null);

    var KEY_REMARKS = 'gh_remarks_v2';
    var KEY_STATUS = 'gh_record_status';
    var KEY_CONFIG = 'gh_custom_config';

    function getStorageArea() {
        if (!api) return null;
        return api.storage.local || null;
    }

    var StorageManager = {
        /**
         * 获取当前插件开启状态 (默认为 true)
         */
        getStatus: function () {
            return new Promise(function (resolve) {
                if (!api) return resolve(true);
                api.storage.local.get([KEY_STATUS], function (res) {
                    if (api.runtime.lastError || !res) {
                        return resolve(true);
                    }
                    resolve(res[KEY_STATUS] !== 'off');
                });
            });
        },

        /**
         * 设置当前插件开启状态
         */
        setStatus: function (enabled) {
            return new Promise(function (resolve) {
                if (!api) return resolve(false);
                var val = enabled ? 'on' : 'off';
                api.storage.local.set({ [KEY_STATUS]: val }, function () {
                    resolve(true);
                });
            });
        },

        /**
         * 获取所有备注数据
         * 返回标准化字典: { [username]: string }
         * 本地为空而 sync 存有旧版本数据时，执行一次性迁移
         */
        getAllRemarks: function () {
            return new Promise(function (resolve) {
                var storage = getStorageArea();
                if (!storage) {
                    return resolve({});
                }
                storage.get([KEY_REMARKS], function (res) {
                    if (api.runtime && api.runtime.lastError) { /* 读取失败视为空 */ }
                    if (res && res[KEY_REMARKS]) {
                        return resolve(StorageManager._normalizeRemarks(res[KEY_REMARKS]));
                    }
                    // 一次性迁移：旧版本曾把数据存放在 chrome.storage.sync
                    if (api.storage.sync) {
                        api.storage.sync.get([KEY_REMARKS], function (syncRes) {
                            if (api.runtime && api.runtime.lastError) { /* 忽略 */ }
                            var legacy = syncRes && syncRes[KEY_REMARKS];
                            if (legacy && Object.keys(legacy).length) {
                                storage.set({ [KEY_REMARKS]: legacy }, function () {
                                    resolve(StorageManager._normalizeRemarks(legacy));
                                });
                                return;
                            }
                            resolve({});
                        });
                        return;
                    }
                    resolve({});
                });
            });
        },

        /**
         * 标准化备注对象
         */
        _normalizeRemarks: function (raw) {
            var result = {};
            if (!raw || typeof raw !== 'object') return result;
            for (var u in raw) {
                if (Object.prototype.hasOwnProperty.call(raw, u)) {
                    var item = raw[u];
                    var uname = u.trim().toLowerCase();
                    if (!uname) continue;
                    if (typeof item === 'string') {
                        result[uname] = item.trim();
                    } else if (item && typeof item === 'object' && item.remark) {
                        result[uname] = String(item.remark).trim();
                    }
                }
            }
            return result;
        },

        /**
         * 获取单个用户的备注
         */
        getRemark: function (username) {
            var self = this;
            return new Promise(function (resolve) {
                if (!username) return resolve(null);
                var key = username.trim().toLowerCase();
                self.getAllRemarks().then(function (remarks) {
                    resolve(remarks[key] || null);
                });
            });
        },

        /**
         * 保存或更新用户备注（仅写本地存储）
         */
        setRemark: function (username, remark) {
            return new Promise(function (resolve) {
                if (!username) return resolve(false);
                var uname = username.trim().toLowerCase();
                var cleanRemark = (remark || '').trim();

                var storage = getStorageArea();
                if (!storage) return resolve(false);

                storage.get([KEY_REMARKS], function (res) {
                    var data = (res && res[KEY_REMARKS]) || {};
                    if (!cleanRemark) {
                        delete data[uname];
                    } else {
                        data[uname] = {
                            remark: cleanRemark,
                            rawUser: username.trim(),
                            updatedAt: Date.now()
                        };
                    }

                    storage.set({ [KEY_REMARKS]: data }, function () {
                        resolve(!api.runtime.lastError);
                    });
                });
            });
        },

        /**
         * 删除备注
         */
        deleteRemark: function (username) {
            return this.setRemark(username, '');
        },

        /**
         * 导出数据为 JSON 字符串
         */
        exportJson: function () {
            var self = this;
            return new Promise(function (resolve) {
                self.getAllRemarks().then(function (remarks) {
                    var exportData = {
                        version: '1.0',
                        generator: 'GithubRemarkReborn',
                        exportedAt: new Date().toISOString(),
                        total: Object.keys(remarks).length,
                        remarks: remarks
                    };
                    resolve(JSON.stringify(exportData, null, 2));
                });
            });
        },

        /**
         * 导入 JSON 数据
         */
        importJson: function (jsonStr, merge) {
            var self = this;
            return new Promise(function (resolve) {
                try {
                    var parsed = JSON.parse(jsonStr);
                    var incoming = parsed.remarks || parsed;
                    if (typeof incoming !== 'object' || Array.isArray(incoming)) {
                        return resolve({ success: false, error: '无效的数据格式：必须为对象字典或包含 remarks 字段' });
                    }

                    self.getAllRemarks().then(function (current) {
                        var target = merge ? Object.assign({}, current) : {};
                        var count = 0;
                        for (var u in incoming) {
                            if (Object.prototype.hasOwnProperty.call(incoming, u)) {
                                var val = incoming[u];
                                var rk = typeof val === 'string' ? val : (val && val.remark ? val.remark : '');
                                if (rk && u.trim()) {
                                    target[u.trim().toLowerCase()] = rk.trim();
                                    count++;
                                }
                            }
                        }

                        var storage = getStorageArea();
                        if (!storage) return resolve({ success: false, error: '存储引擎不可用' });

                        var saveData = {};
                        for (var k in target) {
                            saveData[k] = {
                                remark: target[k],
                                updatedAt: Date.now()
                            };
                        }

                        storage.set({ [KEY_REMARKS]: saveData }, function () {
                            resolve({ success: true, count: count });
                        });
                    });
                } catch (e) {
                    resolve({ success: false, error: '解析 JSON 失败: ' + e.message });
                }
            });
        },

        /**
         * 监听存储变化（实现多标签页跨页面即时联动）
         */
        onChanged: function (callback) {
            if (!api || !api.storage || !api.storage.onChanged) return;
            api.storage.onChanged.addListener(function (changes, areaName) {
                if (changes[KEY_REMARKS]) {
                    var newRemarks = StorageManager._normalizeRemarks(changes[KEY_REMARKS].newValue);
                    callback({ type: 'remarks', data: newRemarks });
                }
                if (changes[KEY_STATUS]) {
                    callback({ type: 'status', enabled: changes[KEY_STATUS].newValue !== 'off' });
                }
            });
        }
    };

    return StorageManager;
});
