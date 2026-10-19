/**
 * GithubRemark 统一存储管理层
 * 兼容 Chrome 与 Microsoft Edge 原生扩展规范
 * 优先采用 chrome.storage.sync（跨设备云同步），超额或无网络时自动降级 local
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
        return api.storage.sync || api.storage.local;
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
         */
        getAllRemarks: function () {
            return new Promise(function (resolve) {
                var storage = getStorageArea();
                if (!storage) {
                    return resolve({});
                }
                storage.get([KEY_REMARKS], function (res) {
                    if (api.runtime.lastError || !res || !res[KEY_REMARKS]) {
                        // 尝试从 local 兜底读取
                        if (api.storage.local && storage !== api.storage.local) {
                            api.storage.local.get([KEY_REMARKS], function (locRes) {
                                resolve(StorageManager._normalizeRemarks(locRes && locRes[KEY_REMARKS]));
                            });
                            return;
                        }
                        return resolve({});
                    }
                    resolve(StorageManager._normalizeRemarks(res[KEY_REMARKS]));
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
         * 保存或更新用户备注
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

                    var payload = { [KEY_REMARKS]: data };
                    storage.set(payload, function () {
                        if (api.runtime.lastError) {
                            // 空间超额或 sync 失败时写入 local 兜底
                            if (api.storage.local) {
                                api.storage.local.set(payload, function () {
                                    resolve(true);
                                });
                            } else {
                                resolve(false);
                            }
                        } else {
                            // 同步更新 local 保证双重可靠
                            if (api.storage.local && storage !== api.storage.local) {
                                api.storage.local.set(payload);
                            }
                            resolve(true);
                        }
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
                            if (api.storage.local && storage !== api.storage.local) {
                                api.storage.local.set({ [KEY_REMARKS]: saveData });
                            }
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
