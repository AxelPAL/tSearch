/**
 * Created by Anton on 31.12.2016.
 */
"use strict";

var messageStack = [];
require.config({
    baseUrl: './js',
    paths: {
        promise: './lib/promise.min'
    }
});
require([
    'promise',
    './module/utils'
], function (Promise, utils) {
    var changeIcon = function (storage, reset) {
        if (reset) {
            chrome.browserAction.setIcon({
                path: {
                    19: 'img/icon_19.png',
                    38: 'img/icon_38.png'
                }
            });
        }

        if (storage.invertIcon) {
            chrome.browserAction.setIcon({
                path: {
                    19: 'img/icon_19_i.png',
                    38: 'img/icon_38_i.png'
                }
            });
        }
    };

    var changeContextMenu = function (storage) {
        return new Promise(function (resolve) {
            chrome.contextMenus.removeAll(function () {
                if (storage.contextMenu) {
                    chrome.contextMenus.create({
                        type: "normal",
                        id: "tms",
                        title: chrome.i18n.getMessage('contextMenuTitle'),
                        contexts: ["selection"]
                    });
                }
                resolve();
            });
        });
    };

    var changeBrowserAction = function (storage, reset) {
        if (reset) {
            chrome.browserAction.setPopup({
                popup: 'popup.html'
            });
        }

        if (storage.disablePopup) {
            chrome.browserAction.setPopup({
                popup: ''
            });
        }
    };

    var load = function (reset) {
        return new Promise(function (resolve) {
            chrome.storage.local.get({
                invertIcon: false,
                contextMenu: true,
                disablePopup: false
            }, resolve)
        }).then(function (storage) {
            return Promise.all([
                changeContextMenu(storage),
                changeBrowserAction(storage, reset),
                changeIcon(storage, reset)
            ]);
        });
    };

    var updateTracker = function (tracker, force) {
        var updateRequest = null;
        var getContent = function (url) {
            return new Promise(function (resolve, reject) {
                if (updateRequest) {
                    updateRequest.abort();
                }
                updateRequest = utils.request({
                    url: url
                }, function (err, response) {
                    updateRequest = null;
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.body);
                    }
                });
            });
        };
        var checkVersion = function (url) {
            return getContent(url).then(function (body) {
                var meta = utils.parseMeta(body);
                var version = tracker.meta.version;
                if (!utils.isNewVersion(version, meta.version)) {
                    tracker.info.lastUpdate = parseInt(Date.now() / 1000);
                    throw new Error('C_ACTUAL');
                }
                return {
                    previewVersion: version,
                    version: meta.version,
                    meta: meta,
                    body: body
                };
            });
        };
        var checkUpdate = function () {
            var promise = Promise.resolve();
            if (tracker.meta.updateURL) {
                promise = promise.then(function () {
                    return checkVersion(tracker.meta.updateURL);
                }).then(function (result) {
                    return checkVersion(result.meta.downloadURL);
                });
            } else {
                promise = promise.then(function () {
                    return checkVersion(tracker.meta.downloadURL);
                });
            }
            return promise.then(function (result) {
                tracker.meta = result.meta;
                tracker.code = result.body;
                tracker.info.lastUpdate = parseInt(Date.now() / 1000);
                return {
                    previewVersion: result.previewVersion,
                    version: result.version
                }
            });
        };

        return new Promise(function (resolve) {
            if (!tracker.meta.downloadURL) {
                throw new Error('C_UNAVAILABLE');
            }
            var now = parseInt(Date.now() / 1000);
            var lastUpdate = tracker.info.lastUpdate || 0;
            if (now - lastUpdate > 24 * 60 * 60 || force) {
                resolve(checkUpdate());
            } else {
                throw new Error('C_TIMEOUT');
            }
        }).then(function (result) {
            return {success: true, trackerId: tracker.id, result: result};
        }).catch(function (err) {
            if (err.message === 'C_UNAVAILABLE') {
                return {success: false, trackerId: tracker.id, message: 'UNAVAILABLE'};
            } else
            if (err.message === 'C_TIMEOUT') {
                return {success: false, trackerId: tracker.id, message: 'TIMEOUT'};
            } else
            if (err.message === 'C_ACTUAL') {
                return {success: true, trackerId: tracker.id, message: 'ACTUAL', version: tracker.meta.version};
            } else {
                console.error('Update error', tracker.id, err);
                return {success: false, trackerId: tracker.id, message: 'ERROR'};
            }
        });
    };

    var updateInProgress = false;
    var update = function (message) {
        if (updateInProgress) {
            return Promise.resolve({success: false, message: 'OTHER_UPDATE_IN_PROGRESS'});
        }

        updateInProgress = true;
        return new Promise(function (resove) {
            chrome.storage.local.get({
                trackers: {}
            }, function (storage) {
                resove(storage);
            });
        }).then(function (storage) {
            var id = message.id;
            var promiseList = [];
            var trackers = storage.trackers;
            var found = false;
            for (var key in trackers) {
                if ((!id && !trackers[key].info.disableAutoUpdate) || id === trackers[key].id) {
                    found = true;
                    promiseList.push(updateTracker(trackers[key], message.force));
                }
            }
            if (id && !found && message.profileMeta) {
                var vTracker = {
                    id: id,
                    meta: message.profileMeta,
                    info: {},
                    code: ''
                };
                vTracker.meta.version = '0';
                promiseList.push(updateTracker(vTracker, message.force).then(function (result) {
                    if (result.success) {
                        trackers[id] = vTracker;
                    }
                    return result;
                }));
            }

            return Promise.all(promiseList).then(function (results) {
                var promise = Promise.resolve();
                var save = results.some(function (result) {
                    return result.success;
                });
                if (save) {
                    promise = promise.then(function () {
                        return new Promise(function (resolve) {
                            chrome.storage.local.set({
                                trackers: trackers
                            }, resolve);
                        })
                    });
                }
                return promise.then(function () {
                    updateInProgress = false;
                    return {success: true, results: results};
                });
            });
        });
    };

    var migrate = function () {
        var migrateProfiles = function (storage, oldStorage) {
            var idMap = {
                'nnm-club': 'nnmclub',
                'free-torrents': 'freeTorrents',
                'libertorrent': 'booktracker'
            };
            var profiles = storage.profiles;
            var profileList = oldStorage.profileList;
            Array.isArray(profileList) && profileList.forEach(function (profile) {
                try {
                    var trackers = [];
                    Array.isArray(profile.trackerList) && profile.trackerList.forEach(function (tracker) {
                        var id;
                        if (typeof tracker === 'object') {
                            id = tracker.id;
                        } else {
                            id = tracker;
                        }
                        id = idMap[id] || id;
                        trackers.push({id: id});
                    });
                    profiles.push({
                        id: profiles.length,
                        name: profile.name,
                        trackers: trackers
                    });
                } catch (err) {
                    console.error('Migrate profile error!', err);
                }
            });
        };
        var migrateCustomTrackers = function (storage, oldStorage) {
            var trackers = storage.trackers;
            var customTorrentList = oldStorage.customTorrentList;
            for (var id in customTorrentList) {
                var trackerObj = customTorrentList[id];
                try {
                    var code = utils.trackerObjToUserScript(trackerObj);
                    var meta = utils.parseMeta(code);
                    trackers[id] = {
                        id: id,
                        meta: meta,
                        info: {},
                        code: code
                    };
                } catch (err) {
                    console.error('Migrate tracker error!', err);
                }
            }
        };
        return new Promise(function (resolve) {
            chrome.storage.local.get({
                migrated: false
            }, resolve);
        }).then(function (storage) {
            return !storage.migrated && new Promise(function (resolve) {
                chrome.storage.local.get(null, resolve);
            }).then(function (oldStorage) {
                var storage = {
                    profiles: [],
                    trackers: {},
                    migrated: true
                };
                if (oldStorage.hasOwnProperty('contextMenu') && !oldStorage.contextMenu) {
                    storage.contextMenu = false;
                }
                if (oldStorage.hasOwnProperty('enableFavoriteSync') && !oldStorage.enableFavoriteSync) {
                    storage.favoriteSync = false;
                }
                if (oldStorage.hasOwnProperty('hidePeerColumn') && !oldStorage.hidePeerColumn) {
                    storage.hidePeerRow = false;
                }
                if (oldStorage.hasOwnProperty('hideSeedColumn') && oldStorage.hideSeedColumn) {
                    storage.hideSeedRow = true;
                }
                if (oldStorage.hasOwnProperty('invertIcon') && oldStorage.invertIcon) {
                    storage.invertIcon = true;
                }
                if (oldStorage.hasOwnProperty('kinopoiskFolderId') && typeof oldStorage.kinopoiskFolderId === 'string') {
                    storage.kpFolderId = oldStorage.kinopoiskFolderId;
                }
                if (oldStorage.hasOwnProperty('searchPopup') && !oldStorage.searchPopup) {
                    storage.disablePopup = true;
                }
                if (oldStorage.hasOwnProperty('subCategoryFilter') && !oldStorage.subCategoryFilter) {
                    storage.categoryWordFilter = false;
                }
                if (oldStorage.hasOwnProperty('trackerListHeight') && typeof oldStorage.trackerListHeight === 'number') {
                    storage.trackerListHeight = oldStorage.trackerListHeight;
                }
                if (oldStorage.hasOwnProperty('expCache_favorites') && oldStorage.expCache_favorites) {
                    storage.cache_favorites = oldStorage.expCache_favorites;
                }
                if (oldStorage.hasOwnProperty('useEnglishPosterName') && oldStorage.useEnglishPosterName) {
                    storage.originalPosterName = true;
                } else
                if (!/^ru-?/.test(chrome.i18n.getUILanguage())) {
                    storage.originalPosterName = true;
                }
                migrateCustomTrackers(storage, oldStorage);
                migrateProfiles(storage, oldStorage);
                return new Promise(function (resolve) {
                    chrome.storage.local.clear(function () {
                        chrome.storage.local.set(storage, resolve);
                    });
                });
            });
        });
    };

    var onMessage = function (message, sender, response) {
        if (message.action === 'reload') {
            load(true);
        }
        if (message.action === 'update') {
            update(message).catch(function (err) {
                console.error('Update error!', err);
            }).then(response);
            return true;
        }
    };

    var _stackEvents = messageStack;
    messageStack = {
        push: function (args) {
            onMessage(args[0], args[1], args[2])
        }
    };

    migrate().then(function () {
        load().then(function () {
            var event;
            while (event = _stackEvents.shift()) {
                messageStack.push(event);
            }
        });
    });
});

(function () {
    var param = function(params) {
        var args = [];
        for (var key in params) {
            var value = params[key];
            if (value !== null && value !== undefined) {
                args.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return args.join('&');
    };

    var hashParam = function (params) {
        var hashParams = {};
        var len = 0;
        for (var key in params) {
            len++;
            hashParams[key] = btoa(unescape(encodeURIComponent(params[key])));
        }
        if (len) {
            hashParams.base64 = true;
        }
        return param(hashParams);
    };

    chrome.contextMenus.onClicked.addListener(function (info) {
        if (info.menuItemId === 'tms') {
            var request = info.selectionText;
            var params = request && '#' + hashParam({
                    query: request
                });
            chrome.tabs.create({
                url: 'index.html' + params,
                selected: true
            });
        }
    });

    chrome.omnibox.onInputEntered.addListener(function (request) {
        var params = request && '#' + hashParam({
                query: request
            });
        chrome.tabs.create({
            url: 'index.html' + params,
            selected: true
        });
    });

    chrome.browserAction.onClicked.addListener(function () {
        chrome.tabs.create({
            url: 'index.html'
        });
    });

    chrome.runtime.onMessage.addListener(function (message, sender, response) {
        messageStack.push([message, sender, response]);
        return true;
    });
})();