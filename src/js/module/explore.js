/**
 * Created by Anton on 02.05.2015.
 */
"use strict";
define([
    'promise',
    './utils',
    './dom',
    './dialog'
], function (Promise, utils, dom, Dialog) {
    var defaultSections = [
        'favorites',
        'kpFavorites', 'kpInCinema', 'kpPopular', 'kpSerials',
        'imdbInCinema', 'imdbPopular', 'imdbSerials',
        'ggGamesTop', 'ggGamesNew'
    ];

    var insertDefaultSections = function (idSectionMap, sections) {
        defaultSections.forEach(function (id) {
            if (!idSectionMap[id]) {
                var source = contentSource[id];
                var item = {
                    id: id,
                    enable: true,
                    show: true,
                    width: source.defaultWidth,
                    lines: source.defaultLines
                };
                sections.push(idSectionMap[id] = item);
            }
        });
    };

    var contentSource = {
        favorites: {
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            noAutoUpdate: 1
        },
        kpFavorites: {
            rootUrl: 'http://www.kinopoisk.ru',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'https://www.kinopoisk.ru/mykp/movies/list/type/%category%/page/%page%/sort/default/vector/desc/vt/all/format/full/perpage/25/',
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/',
            noAutoUpdate: 1
        },
        kpInCinema: {//new in cinema
            rootUrl: 'http://www.kinopoisk.ru',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: [
                'http://www.kinopoisk.ru/afisha/new/page/0/',
                'http://www.kinopoisk.ru/afisha/new/page/1/',
                'http://www.kinopoisk.ru/afisha/new/page/2/'
            ],
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kpPopular: {
            rootUrl: 'http://www.kinopoisk.ru',
            defaultLines: 2,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/popular/day/now/perpage/200/',
            keepAlive: [0, 3],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        kpSerials: {
            rootUrl: 'http://www.kinopoisk.ru',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'http://www.kinopoisk.ru/top/lists/45/',
            keepAlive: [0],
            baseUrl: 'http://www.kinopoisk.ru/film/',
            imgUrl: 'http://st.kinopoisk.ru/images/film/'
        },
        imdbInCinema: {
            rootUrl: 'http://www.imdb.com',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'http://www.imdb.com/movies-in-theaters/',
            keepAlive: [2, 4, 6],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdbPopular: {
            rootUrl: 'http://www.imdb.com',
            defaultLines: 2,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=feature',
            keepAlive: [0, 2],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        imdbSerials: {
            rootUrl: 'http://www.imdb.com',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: 'http://www.imdb.com/search/title?count=100&title_type=tv_series',
            keepAlive: [0],
            baseUrl: 'http://www.imdb.com/title/',
            imgUrl: 'http://ia.media-imdb.com/images/'
        },
        ggGamesTop: {//best
            rootUrl: 'http://gameguru.ru',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: [
                'http://gameguru.ru/pc/games/rated/list.html',
                'http://gameguru.ru/pc/games/rated/page2/list.html',
                'http://gameguru.ru/pc/games/rated/page3/list.html',
                'http://gameguru.ru/pc/games/rated/page4/list.html',
                'http://gameguru.ru/pc/games/rated/page5/list.html'
            ],
            keepAlive: [0],
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        },
        ggGamesNew: {//new
            rootUrl: 'http://gameguru.ru',
            defaultLines: 1,
            defaultWidth: 100,
            maxWidth: 120,
            url: [
                'http://gameguru.ru/pc/games/released/list.html',
                'http://gameguru.ru/pc/games/released/page2/list.html',
                'http://gameguru.ru/pc/games/released/page3/list.html',
                'http://gameguru.ru/pc/games/released/page4/list.html',
                'http://gameguru.ru/pc/games/released/page5/list.html'
            ],
            keepAlive: [2, 4],
            baseUrl: 'http://gameguru.ru/pc/games/',
            imgUrl: 'http://gameguru.ru/f/games/'
        }
    };
    var contentParser = (function () {
        var searchJs = /javascript/ig;
        var blockHref = /\/\//;
        var blockSrc = /src=(['"]?)/ig;
        var blockSrcSet = /srcset=(['"]?)/ig;
        var blockOnEvent = /on(\w+)=/ig;

        var deImg = /data:image\/gif,base64#blockurl#/g;
        var deUrl = /about:blank#blockurl#/g;
        var deJs = /tms-block-javascript/g;

        var API_sanitizeHtml = function (str) {
            return str.replace(searchJs, 'tms-block-javascript')
                .replace(blockHref, '//about:blank#blockurl#')
                .replace(blockSrc, 'src=$1data:image/gif,base64#blockurl#')
                .replace(blockSrcSet, 'data-block-attr-srcset=$1')
                .replace(blockOnEvent, 'data-block-event-$1=');
        };

        var API_deSanitizeHtml = function (str) {
            return str.replace(deImg, '')
                .replace(deUrl, '')
                .replace(deJs, 'javascript');
        };
        
        var API_getDom = function (html) {
            var fragment = document.createDocumentFragment();
            var div = document.createElement('html');
            div.innerHTML = html;
            var el;
            while (el = div.firstChild) {
                fragment.appendChild(el);
            }
            return fragment;
        };

        var spaceReplace = function (text) {
            return text.replace(/[\s\xA0]/g, ' ');
        };

        var checkResult = function (obj) {
            for (var key in obj) {
                obj[key] = obj[key] && spaceReplace(API_deSanitizeHtml(obj[key])).trim();
                if (typeof obj[key] !== 'string' || !obj[key]) {
                    if (key === 'title_en') {
                        // console.debug('Original title is not found!', obj);
                        obj[key] = undefined;
                        continue;
                    }
                    return false;
                }
            }
            return true;
        };

        var kpGetImgFileName = function (url) {
            var m = /film\/(\d+)/.exec(url);
            return m && m[1] + '.jpg' || url;
        };
        var imdbGetImgFilename = function (url) {
            var m = url.match(/images\/(.+)_V1/);
            return m && m[1] + '_V1_SX120_.jpg' || url;
        };

        var kpGetYear = function (text) {
            var m = /\s+\(.*([1-2]\d{3}).*\)/.exec(text);
            return m && parseInt(m[1]);
        };
        var kpRmYear = function (text) {
            return text.replace(/(.*)\s+\(.*([1-2]\d{3}).*\).*/, '$1').trim();
        };
        var kpRmDesc = function (text) {
            return text.replace(/(.*)\s+\(.*\)$/, '$1').trim();
        };
        var kpRmMin = function (text) {
            return text.replace(/\s\d+\s.{3}\.$/, '');
        };
        var gg_games_new = function (content) {
            var dom = API_getDom(API_sanitizeHtml(content));

            var arr = [];
            var nodes = dom.querySelectorAll('.cnt-box-td .enc-tab1 .enc-box-list > .enc-item');
            [].slice.call(nodes).forEach(function (el) {
                var img = el.querySelector('.im img');
                img = img && img.getAttribute('src');
                img = img && img.replace('/f/games/', '');

                var title = el.querySelector('.e-title a');
                title = title && title.textContent.trim();

                var url = el.querySelector('.e-title a');
                url = url && url.getAttribute('href');

                var obj = {
                    img: img,
                    title: title,
                    url: url
                };

                if (checkResult(obj)) {
                    arr.push(obj);
                } else {
                    console.debug("Explorer gg_games_new have problem!");
                }
            });
            return arr;
        };
        return {
            kpFavorites: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));
                if (dom.querySelector('.login > .js-external-login-action')) {
                    return {requireAuth: 1};
                }
                var nodes = dom.querySelectorAll('#itemList > li.item');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('img.poster[title]');
                    img = img && img.getAttribute('title');
                    img = img && kpGetImgFileName(img);

                    var title = el.querySelector('div.info > a.name');
                    title = title && title.textContent.trim();

                    var titleEn = el.querySelector('div.info > span');
                    titleEn = titleEn && titleEn.textContent.trim();

                    var url = el.querySelector('div.info > a.name');
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    var serialTitle = kpRmDesc(obj.title);
                    if (obj.title !== serialTitle) {
                        // isSerial
                        obj.title = serialTitle;
                        obj.title_en = obj.title_en && kpRmYear(obj.title_en);
                    } else
                    if (obj.title_en) {
                        var year = kpGetYear(obj.title_en);
                        if (year) {
                            obj.title_en = kpRmYear(obj.title_en);
                            obj.title_en += ' ' + year;
                            obj.title += ' ' + year;
                        }
                    }

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer kp_favorites have problem!");
                    }
                });
                return arr;
            },
            kpInCinema: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var threeD = dom.querySelectorAll('div.filmsListNew > div.item div.threeD');
                for (var i = 0, el; el = threeD[i]; i++) {
                    var parent = el.parentNode;
                    parent && parent.removeChild(el);
                }

                var nodes = dom.querySelectorAll('div.filmsListNew > div.item');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('div > a > img');
                    img = img && img.getAttribute('src');
                    img = img && kpGetImgFileName(img);

                    var title = el.querySelector('div > div.name > a');
                    title = title && title.textContent.trim();

                    var titleEn = el.querySelector('div > div.name > span');
                    titleEn = titleEn && titleEn.textContent.trim();
                    titleEn = titleEn && kpRmMin(titleEn);
                    if (/^\(([1-2]\d{3})\)$/.test(titleEn)) {
                        titleEn = '';
                    }

                    var url = el.querySelector('div > div.name > a');
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (obj.title_en) {
                        var year = kpGetYear(obj.title_en);
                        if (year) {
                            obj.title_en = kpRmYear(obj.title_en);
                            obj.title_en += ' ' + year;
                            obj.title += ' ' + year;
                        }
                    }

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer kp_in_cinema have problem!");
                    }
                });
                return arr;
            },
            kpPopular: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var nodes = dom.querySelectorAll('div.stat > div.el');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelectorAll('a')[1];
                    img = img && img.getAttribute('href');
                    img = img && kpGetImgFileName(img);

                    var title = el.querySelectorAll('a')[1];
                    title = title && title.textContent.trim();

                    var titleEn = el.querySelector('i');
                    titleEn = titleEn && titleEn.textContent.trim();

                    var url = el.querySelectorAll('a')[1];
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    var year = kpGetYear(obj.title);
                    if (year) {
                        obj.title = kpRmYear(obj.title);
                        obj.title += ' ' + year;
                        if (obj.title_en) {
                            obj.title_en += ' ' + year;
                        }
                    }

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer kp_popular have problem!");
                    }
                });
                return arr;
            },
            kpSerials: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var nodes = dom.querySelectorAll('#itemList > tbody > tr');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('td > div > a');
                    img = img && img.getAttribute('href');
                    img = img && kpGetImgFileName(img);

                    var title = el.querySelector('td~td > div > a');
                    title = title && title.textContent.trim();
                    title = title && kpRmDesc(title);

                    var titleEn = el.querySelector('td > div > span');
                    titleEn = titleEn && titleEn.textContent.trim();
                    titleEn = titleEn && kpRmYear(titleEn);

                    var url = el.querySelector('td > div > a');
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        title_en: titleEn,
                        url: url
                    };

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer kp_serials have problem!");
                    }
                });
                return arr;
            },
            imdbInCinema: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var nodes = dom.querySelectorAll('table.nm-title-overview-widget-layout');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('div.image img');
                    img = img && img.getAttribute('src');
                    img = img && imdbGetImgFilename(img);

                    var title = el.querySelector('*[itemprop="name"] a');
                    title = title && title.textContent.trim();

                    var year = kpGetYear(title);
                    if (year) {
                        title = kpRmYear(title);
                        title += ' ' + year;
                    }

                    var url = el.querySelector('*[itemprop="name"] a');
                    url = url && url.getAttribute('href');
                    url = url && url.replace(/\?ref.*$/, '');

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer imdb_in_cinema have problem!");
                    }
                });
                return arr;
            },
            imdbPopular: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var nodes = dom.querySelectorAll('.lister-list > .lister-item');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('.lister-item-image img');
                    img = img && img.getAttribute('loadlate');
                    img = img && imdbGetImgFilename(img);

                    var title = el.querySelector('.lister-item-header > a');
                    title = title && title.textContent.trim();

                    var url = el.querySelector('.lister-item-header > a');
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer imdb_popular have problem!");
                    }
                });
                return arr;
            },
            imdbSerials: function (content) {
                var dom = API_getDom(API_sanitizeHtml(content));

                var nodes = dom.querySelectorAll('.lister-list > .lister-item');
                var arr = [];
                [].slice.call(nodes).forEach(function (el) {
                    var img = el.querySelector('.lister-item-image img');
                    img = img && img.getAttribute('loadlate');
                    img = img && imdbGetImgFilename(img);

                    var title = el.querySelector('.lister-item-header > a');
                    title = title && title.textContent.trim();

                    var url = el.querySelector('.lister-item-header > a');
                    url = url && url.getAttribute('href');

                    var obj = {
                        img: img,
                        title: title,
                        url: url
                    };

                    if (checkResult(obj)) {
                        arr.push(obj);
                    } else {
                        console.debug("Explorer imdb_serials have problem!");
                    }
                });
                return arr;
            },
            ggGamesTop: gg_games_new,
            ggGamesNew: gg_games_new
        };
    })();

    var Explore = function (storage, exploreNode) {
        var movebleStyleList = {};
        var sections = storage.eSections;
        var idSectionMap = {};
        sections.forEach(function (item) {
            idSectionMap[item.id] = item;
        });
        insertDefaultSections(idSectionMap, sections);
        var activeSectionSetup = null;

        var sectionWrappers = [];
        var sectionWrapperIdMap = {};

        var updateCategoryContent = function (sectionWrapper) {
            sectionWrapper.bodyNode.style.minHeight = '';
            sectionWrapper.minHeight = 0;
            setContent(sectionWrapper, sectionWrapper.currentPage, 1);
        };

        var onResize = function () {
            var section;
            for (var i = 0, sectionWrapper; sectionWrapper = sectionWrappers[i]; i++) {
                section = sectionWrapper.section;
                if (section.enable && section.show && sectionWrapper.displayItemCount !== getCategoryDisplayItemCount(section)) {
                    updateCategoryContent(sectionWrapper);
                }
            }
        };

        var onResizeThrottle = utils.throttle(onResize, 100);

        var saveSections = function () {
            chrome.storage.local.set({eSections: sections});
        };

        var updateKpFavorites = function () {
            var _this = this;

            _this.node.classList.add('section-loading');
            loadKpFavorites(_this).then(function () {
                _this.node.classList.remove('section-loading');

                var storageDate = {};
                storageDate[_this.cacheKey] = _this.cache;
                chrome.storage.local.set(storageDate);

                setContent(_this);
            });
        };

        var getSetupBody = function (sectionWrapper) {
            var section = sectionWrapper.section;
            var source = sectionWrapper.source;

            var saveRangeThrottle = utils.throttle(function () {
                updateCategoryContent(sectionWrapper);
                saveSections();
            }, 250);

            var range;
            var select;
            return dom.el('div', {
                class: ['section__setup'],
                append: [
                    range = dom.el('input', {
                        type: 'range',
                        class: ['setup__size_range'],
                        min: 20,
                        max: source.maxWidth,
                        value: section.width,
                        on: ['input', function () {
                            section.width = parseInt(this.value);
                            calculateSize(sectionWrapper);

                            saveRangeThrottle();
                        }]
                    }),
                    dom.el('a', {
                        class: ['setup__size_default'],
                        href: '#size_default',
                        title: chrome.i18n.getMessage('default'),
                        on: ['click', function (e) {
                            e.preventDefault();
                            range.value = source.defaultWidth;
                            range.dispatchEvent(new CustomEvent('input'));
                        }]
                    }),
                    select = dom.el('select', {
                        class: ['setup__lines'],
                        append: (function () {
                            var options = [];
                            for (var i = 1; i < 7; i++) {
                                options.push(dom.el('option', {
                                    text: i,
                                    value: i
                                }));
                            }
                            return options;
                        })(),
                        on: ['change', function () {
                            section.lines = parseInt(this.value);
                            updateCategoryContent(sectionWrapper);
                            saveSections();
                        }],
                        selectedIndex: section.lines - 1
                    })
                ]
            });
        };

        var sectionSetup = function () {
            if (activeSectionSetup && activeSectionSetup !== this) {
                activeSectionSetup.setupNode.parentNode.removeChild(activeSectionSetup.setupNode);
                activeSectionSetup.setupNode = null;
            }

            if (this.setupNode) {
                activeSectionSetup = null;
                this.setupNode.parentNode.removeChild(this.setupNode);
                this.setupNode = null;
            } else {
                activeSectionSetup = this;
                this.setupNode = getSetupBody(this);
                this.actionsNode.appendChild(this.setupNode);
            }
        };

        var saveFavorites = function () {
            var sectionWrapper = sectionWrapperIdMap.favorites;
            var storage = {};
            storage[sectionWrapper.cacheKey] = sectionWrapper.cache;
            chrome.storage.local.set(storage);
            if (storage.favoriteSync) {
                chrome.storage.sync.set(storage);
            }
        };

        var sectionFavorite = function (index) {
            var poster = this.cache.content[index];
            var source = this.source;

            var _item = {
                img: addRootUrl(poster.img, source.imgUrl),
                url: addRootUrl(poster.url, source.rootUrl),
                title: getCategoryItemTitle(poster)
            };

            var favoritesSectionWrapper = sectionWrapperIdMap.favorites;
            if (!favoritesSectionWrapper.cache.content) {
                favoritesSectionWrapper.cache.content = [];
            }

            favoritesSectionWrapper.cache.content.push(_item);

            updateCategoryContent(favoritesSectionWrapper);

            saveFavorites();
        };

        var sectionRmFavorite = function (index) {
            this.cache.content.splice(index, 1);

            updateCategoryContent(this);

            saveFavorites();
        };

        var sectionEdit = function (index) {
            var _this = this;
            var poster = this.cache.content[index];

            var dialog = new Dialog();
            dom.el(dialog.body, {
                class: ['dialog-poster_edit'],
                append: [
                    dom.el('span', {
                        class: 'dialog__label',
                        text: chrome.i18n.getMessage('title')
                    }),
                    dialog.addInput(dom.el('input', {
                        class: ['input__input'],
                        name: 'title',
                        type: 'text',
                        value: poster.title
                    })),
                    dom.el('span', {
                        class: 'dialog__label',
                        text: chrome.i18n.getMessage('imageUrl')
                    }),
                    dialog.addInput(dom.el('input', {
                        class: ['input__input'],
                        name: 'img',
                        type: 'text',
                        value: poster.img
                    })),
                    dom.el('span', {
                        class: 'dialog__label',
                        text: chrome.i18n.getMessage('descUrl')
                    }),
                    dialog.addInput(dom.el('input', {
                        class: ['input__input'],
                        name: 'url',
                        type: 'text',
                        value: poster.url
                    })),
                    dom.el('div', {
                        class: ['dialog__button_box'],
                        append: [
                            dom.el('a', {
                                class: ['button', 'button-save'],
                                href: '#save',
                                text: chrome.i18n.getMessage('save'),
                                on: ['click', function (e) {
                                    e.preventDefault();
                                    var values = dialog.getValues();
                                    for (var key in values) {
                                        poster[key] = values[key];
                                    }

                                    updateCategoryContent(_this);

                                    saveFavorites();

                                    dialog.destroy();
                                }]
                            }),
                            dom.el('a', {
                                class: ['button', 'button-cancel'],
                                href: '#cancel',
                                text: chrome.i18n.getMessage('cancel'),
                                on: ['click', function (e) {
                                    e.preventDefault();
                                    dialog.destroy();
                                }]
                            })
                        ]
                    })
                ]
            });
            dialog.show();
        };

        var sectionCollapse = function () {
            if (this.section.show) {
                this.section.show = false;
                this.node.classList.add('section-collapsed');
            } else {
                this.section.show = true;
                this.node.classList.remove('section-collapsed');
                getSectionContent(this);
            }
            saveSections();
        };

        /**
         * @typedef {Object} section
         * @property {String} id
         * @property {Boolean} enable
         * @property {Boolean} show
         * @property {number} width
         * @property {number} lines
         */

        var getCacheDate = function (keepAlive) {
            if (keepAlive) {
                var date = new Date();
                var day = date.getDay();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                var lastDay = 0;
                keepAlive.forEach(function (num) {
                    if (day >= num) {
                        lastDay = num;
                    }
                });
                day = day - lastDay;
                day = day * 24 * 60 * 60;
                hours = hours * 60 * 60;
                minutes = minutes * 60;
                return parseInt(date.getTime() / 1000) - day - hours - minutes - seconds;
            }
        };

        var getCategoryDisplayItemCount = function (section) {
            var lineCount = section.lines;
            var width = document.body.clientWidth - 175;
            var itemCount = Math.ceil(width / (section.width + 10 * 2)) - 1;
            return itemCount * lineCount;
        };

        var getCategoryItemTitle = function (item) {
            var title;
            if (item.title_en && storage.originalPosterName) {
                title = item.title_en;
            } else {
                title = item.title;
            }
            return title;
        };

        var calculateMoveble = function (el, width) {
            var styleEl = null;

            var elWidth = el.offsetWidth;
            if (elWidth <= width) {
                return;
            }
            elWidth = Math.ceil(elWidth / 10);
            if (elWidth > 10) {
                if (elWidth < 100) {
                    var t1 = Math.round(elWidth / 10);
                    if (t1 > elWidth / 10) {
                        elWidth = t1 * 10 * 10;
                    } else {
                        elWidth = (t1 * 10 + 5) * 10;
                    }
                } else {
                    elWidth = elWidth * 10;
                }
            } else {
                elWidth = elWidth * 10;
            }

            var timeCalc = Math.round(parseInt(elWidth) / parseInt(width) * 3.5);
            var moveName = 'moveble' + '_' + width + '_' + elWidth;
            if (!movebleStyleList['style.' + moveName]) {
                var keyFrames = ''
                    + '{'
                    + '0%{margin-left:2px;}'
                    + '50%{margin-left:-' + (elWidth - width) + 'px;}'
                    + '90%{margin-left:6px;}'
                    + '100%{margin-left:2px;}'
                    + '}';
                movebleStyleList['style.' + moveName] = styleEl = dom.el('style', {
                    class: moveName,
                    text: ''
                    + '@keyframes a_' + moveName
                    + keyFrames
                    + 'div.' + moveName + ':hover > span {'
                    + 'overflow: visible;'
                    + 'animation:a_' + moveName + ' ' + timeCalc + 's;'
                    + '}'
                });
            }
            el.parentNode.classList.add(moveName);

            if (styleEl) {
                document.body.appendChild(styleEl);
            }
        };

        var addRootUrl = function (url, root) {
            if (root && !/^https?:\/\//.test(url)) {
                url = root + url;
            }
            return url;
        };

        var onSetPage = function (page) {
            if (this.currentPage !== page) {
                this.currentPage = page;
                this.currentPageEl && this.currentPageEl.classList.remove('item-active');
                var activePage = this.pagesNode.querySelector('li[data-page="' + page + '"]');
                activePage && activePage.classList.add('item-active');
                this.currentPageEl = activePage;

                var height = this.bodyNode.clientHeight;
                if (this.minHeight < height) {
                    this.bodyNode.style.minHeight = height + 'px';
                    this.minHeight = height;
                }

                if (this.cache.content) {
                    setContent(this, page);
                }
            }
        };

        var setPages = function (sectionWrapper, content, page) {
            var coefficient = content.length / sectionWrapper.displayItemCount;
            var pageCount = Math.floor(coefficient);
            if (coefficient % 1 === 0) {
                pageCount--;
            }
            if (pageCount === Infinity) {
                pageCount = 0;
            }

            var pageItems = document.createDocumentFragment();
            for (var i = 0; i <= pageCount; i++) {
                var isActive = page === i;
                var node = dom.el('li', {
                    class: ['pages__item'],
                    data: {
                        page: i
                    },
                    text: i + 1
                });
                if (isActive) {
                    node.classList.add('item-active');
                    sectionWrapper.currentPageEl = node;
                    sectionWrapper.currentPage = i;
                }
                pageItems.appendChild(node);
            }

            sectionWrapper.pagesNode.textContent = '';
            sectionWrapper.pagesNode.appendChild(pageItems);

            if (pageCount === 0) {
                sectionWrapper.pagesNode.classList.add('pages-hide');
            } else {
                sectionWrapper.pagesNode.classList.remove('pages-hide');
            }

            sectionWrapper.hasPages = true;
        };

        var setContent = function (sectionWrapper, page, update_pages) {
            var sourceOptions = sectionWrapper.source;
            var id = sectionWrapper.id;
            page = page || 0;
            var content = sectionWrapper.cache.content || [];

            var displayItemCount = sectionWrapper.displayItemCount = getCategoryDisplayItemCount(sectionWrapper.section);
            var from = displayItemCount * page;

            var contentBody = document.createDocumentFragment();
            var items = content.slice(from, from + displayItemCount);
            items.forEach(function (item, index) {
                index = index + from;
                var title = getCategoryItemTitle(item);
                var search_link = 'index.html#' + utils.hashParam({
                        query: title
                    });
                var imgUrl = addRootUrl(item.img, sourceOptions.imgUrl);
                var readMoreUrl = addRootUrl(item.url, sourceOptions.rootUrl);

                var actionList = document.createDocumentFragment();
                if (id === 'favorites') {
                    dom.el(actionList, {
                        append: [
                            dom.el('div', {
                                class: 'action__rmFavorite',
                                title: chrome.i18n.getMessage('removeFromFavorite')
                            }),
                            dom.el('div', {
                                class: 'action__move',
                                title: chrome.i18n.getMessage('move')
                            }),
                            dom.el('div', {
                                class: 'action__edit',
                                title: chrome.i18n.getMessage('edit')
                            })
                        ]
                    });
                } else {
                    actionList.appendChild(dom.el('div', {
                        class: 'action__favorite',
                        title: chrome.i18n.getMessage('addInFavorite')
                    }));
                }

                contentBody.appendChild(dom.el('li', {
                    class: ['section__poster', 'poster'],
                    data: {
                        index: index
                    },
                    append: [
                        dom.el('div', {
                            class: 'poster__image',
                            append: [
                                actionList,
                                dom.el('a', {
                                    class: 'image__more_link',
                                    href: readMoreUrl,
                                    target: '_blank',
                                    title: chrome.i18n.getMessage('readMore')
                                }),
                                dom.el('a', {
                                    class: 'image__search_link',
                                    href: search_link,
                                    title: title,
                                    append: dom.el('img', {
                                        class: ['image__image'],
                                        src: imgUrl,
                                        on: ['error', function () {
                                            this.src = 'img/no_poster.png';
                                        }]
                                    })
                                })
                            ]
                        }),
                        dom.el('div', {
                            class: 'poster__title',
                            append: dom.el('span', {
                                append: dom.el('a', {
                                    class: 'poster__search_link',
                                    href: search_link,
                                    text: title,
                                    title: title
                                }),
                                on: ['mouseenter', function title__mouseEnter(e) {
                                    this.removeEventListener('mouseenter', title__mouseEnter);
                                    calculateMoveble(this, sectionWrapper.section.width);
                                }]
                            })
                        })
                    ]
                }));
            });

            if (!contentBody.childNodes.length) {
                if (page > 0) {
                    return setContent(sectionWrapper, --page, update_pages);
                }
                if (id === 'favorites') {
                    sectionWrapper.node.classList.add('section-empty');
                }
            } else
            if (id === 'favorites' && sectionWrapper.node.classList.contains('section-empty')) {
                sectionWrapper.node.classList.remove('section-empty');
            }

            if (!sectionWrapper.hasPages || update_pages) {
                setPages(sectionWrapper, content, page);
            }

            sectionWrapper.bodyNode.textContent = '';
            sectionWrapper.bodyNode.appendChild(contentBody);
        };

        var loadContent = function (sectionWrapper) {
            sectionWrapper.requestList.splice(0).forEach(function (request) {
                request.abort();
            });
            var urlList = sectionWrapper.source.url;
            if (!Array.isArray(urlList)) {
                urlList = [urlList];
            }
            var promiseList = [];
            urlList.forEach(function (url) {
                promiseList.push(new Promise(function (resolve, reject) {
                    var request = utils.request({
                        url: url
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response.body);
                        }
                    });
                    sectionWrapper.requestList.push({
                        abort: function () {
                            request.abort();
                            reject(new Error('ABORTED'));
                        }
                    });
                }).then(function (body) {
                    var content = contentParser[sectionWrapper.id](body);
                    if (!content) {
                        throw new Error("ERROR");
                    }
                    return content;
                }));
            });

            var cache = sectionWrapper.cache;
            return Promise.all(promiseList).then(function (contentList) {
                var content = [].concat.apply([], contentList);
                if (!content.length) {
                    throw new Error("Content is empty!");
                }
                cache.content = content;
                return {success: true};
            }).catch(function (err) {
                console.error('Error', err);
                cache.keepAlive = null;
                cache.errorTimeout = parseInt(Date.now() / 1000 + 60 * 60 * 2);
                sectionWrapper.node.classList.add('section-error');
                return {success: false, error: err};
            });
        };

        var loadKpFavorites = function (sectionWrapper) {
            var cache = sectionWrapper.cache;
            sectionWrapper.requestList.splice(0).forEach(function (request) {
                request.abort();
            });

            var limit = 20;
            var unicUrlList = [];
            var contentList = [];

            var urlTemplate = sectionWrapper.source.url.replace('%category%', storage.kpFolderId);
            var loadPage = function (page) {
                return new Promise(function(resolve, reject) {
                    var request = utils.request({
                        url: urlTemplate.replace('%page%', page)
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response.body);
                        }
                    });

                    sectionWrapper.requestList.push({
                        abort: function () {
                            request.abort();
                            reject(new Error('ABORTED'));
                        }
                    });
                }).then(function (body) {
                    var content = contentParser[sectionWrapper.id](body);
                    if (!content) {
                        throw new Error("ERROR");
                    }
                    if (content.requireAuth) {
                        throw new Error("AUTH");
                    }

                    var newCount = 0;
                    for (var i = 0, item; item = content[i]; i++) {
                        if (unicUrlList.indexOf(item.url) === -1) {
                            unicUrlList.push(item.url);
                            contentList.push(item);
                            newCount++;
                        }
                    }

                    if (newCount && limit--) {
                        return loadPage(++page);
                    }
                });
            };

            sectionWrapper.node.classList.remove('section-login');
            sectionWrapper.node.classList.remove('section-error');

            return loadPage(1).then(function () {
                cache.content = contentList;
                return {success: true};
            }).catch(function (err) {
                if (err.message === 'AUTH') {
                    sectionWrapper.node.classList.add('section-login');
                } else {
                    sectionWrapper.node.classList.add('section-error');
                }
                return {success: false, error: err};
            });
        };

        var getSectionContent = function (sectionWrapper, onReady) {
            var next = function (syncStorage) {
                chrome.storage.local.get(sectionWrapper.cacheKey, function (storage) {
                    var cache = null;
                    if (syncStorage) {
                        cache = syncStorage[sectionWrapper.cacheKey];
                    }
                    if (!cache) {
                        cache = storage[sectionWrapper.cacheKey] || {};
                    }

                    sectionWrapper.node.classList.remove('section-error');
                    sectionWrapper.cache = cache;
                    var source = sectionWrapper.source;
                    var date = getCacheDate(source.keepAlive);
                    if (source.noAutoUpdate) {
                        setContent(sectionWrapper);
                    } else
                    if (cache.errorTimeout && cache.errorTimeout > parseInt(Date.now() / 1000)) {
                        sectionWrapper.node.classList.add('section-error');
                    } else
                    if (cache.keepAlive === date || !navigator.onLine) {
                        setContent(sectionWrapper);
                    } else {
                        sectionWrapper.node.classList.add('section-loading');
                        cache.keepAlive = date;
                        loadContent(sectionWrapper).then(function () {
                            sectionWrapper.node.classList.remove('section-loading');

                            var storageDate = {};
                            storageDate[sectionWrapper.cacheKey] = cache;
                            chrome.storage.local.set(storageDate);

                            setContent(sectionWrapper);
                        });
                    }

                    onReady && onReady();
                });
            };
            if (sectionWrapper.id === 'favorites' && storage.favoriteSync) {
                chrome.storage.sync.get(sectionWrapper.cacheKey, function (syncStorage) {
                    next(syncStorage);
                });
            } else {
                next();
            }
        };

        var width2fontSize = function (sectionWrapper) {
            var min = 10;
            var max = 13.5;
            var width = sectionWrapper.section.width;
            var maxWidth = sectionWrapper.source.maxWidth;
            if (width >= 60) {
                width -= 60;
                maxWidth -= 60;
            } else {
                return;
            }
            var coefficient = width / maxWidth * 100;
            return (min + ((max - min) / 100 * coefficient)).toFixed(6);
        };

        var calculateSize = function (sectionWrapper) {
            var styleNode = sectionWrapper.styleNode;
            var section = sectionWrapper.section;
            var fontSize = width2fontSize(sectionWrapper);

            var base = 'ul.explore li[data-id=' + JSON.stringify(sectionWrapper.id) + '] > ul.section__body > li';

            var imgSize = base + '{width: ' + section.width + 'px;}';

            var fontStyle = base + ' > div.poster__title{' + (fontSize ? 'font-size:' + fontSize + 'px;' : 'display:none;') + '}';

            if (!styleNode) {
                styleNode = sectionWrapper.styleNode = dom.el('style', {
                    class: ['section-style', 'section-style--' + sectionWrapper.id]
                });
                document.body.appendChild(styleNode);
            }
            styleNode.textContent = imgSize + fontStyle;
        };

        var createSection = function (/**section*/section, onReady) {
            var sectionWrapper = {};
            sectionWrapper.id = section.id;
            sectionWrapper.source = contentSource[section.id];
            sectionWrapper.section = section;
            sectionWrapper.cacheKey = 'cache_' + section.id;
            sectionWrapper.setup = sectionSetup;
            sectionWrapper.collapse = sectionCollapse;
            sectionWrapper.requestList = [];
            sectionWrapper.setupNode = null;

            sectionWrapper.cache = {};
            sectionWrapper.currentPage = null;
            sectionWrapper.currentPageEl = null;
            sectionWrapper.minHeight = 0;
            sectionWrapper.displayItemCount = null;
            sectionWrapper.hasPages = false;
            sectionWrapper.setPage = onSetPage;

            if (section.id === 'favorites') {
                sectionWrapper.rmFavorite = sectionRmFavorite;
                sectionWrapper.edit = sectionEdit;
            } else {
                sectionWrapper.favorite = sectionFavorite;
            }

            if (section.id === 'kpFavorites') {
                sectionWrapper.update = updateKpFavorites;
            }

            sectionWrapper.node = dom.el('li', {
                class: ['section', 'section-' + section.id],
                data: {
                    id: section.id
                },
                append: [
                    dom.el('div', {
                        class: ['section__head'],
                        append: [
                            sectionWrapper.moveNode = dom.el('div', {
                                class: ['section__move']
                            }),
                            dom.el('div', {
                                class: ['section__title'],
                                text: chrome.i18n.getMessage(section.id)
                            }),
                            sectionWrapper.actionsNode = dom.el('div', {
                                class: ['section__actions'],
                                append: [
                                    section.id !== 'kpFavorites' ? '' : dom.el('a', {
                                        class: 'action__open',
                                        target: '_blank',
                                        title: chrome.i18n.getMessage('goToTheWebsite'),
                                        href: sectionWrapper.source.url.replace('%page%', 1).replace('%category%', storage.kpFolderId)
                                    }),
                                    !sectionWrapper.update ? '' : sectionWrapper.updateBtnNode = dom.el('div', {
                                        class: 'action__update',
                                        title: chrome.i18n.getMessage('update'),
                                        on: ['click', function (e) {
                                            e.preventDefault();
                                            sectionWrapper.update();
                                        }]
                                    }),
                                    sectionWrapper.setupBtnNode = dom.el('div', {
                                        class: 'action__setup',
                                        title: chrome.i18n.getMessage('setupView'),
                                        on: ['click', function (e) {
                                            e.preventDefault();
                                            sectionWrapper.setup();
                                        }]
                                    })
                                ]
                            }),
                            sectionWrapper.collapsesNode = dom.el('div', {
                                class: ['section__collapses'],
                                on: ['click', function (e) {
                                    e.preventDefault();
                                    sectionWrapper.collapse();
                                }]
                            })
                        ],
                        on: ['click', function (e) {
                            var node = dom.closestNode(this, e.target);
                            if (e.target === this || node && node.classList.contains('section__title')) {
                                sectionWrapper.collapse();
                            }
                        }]
                    }),
                    sectionWrapper.pagesNode = dom.el('ul', {
                        class: ['section__pages'],
                        on: ['mouseover', function (e) {
                            var node = dom.closestNode(this, e.target);
                            if (node) {
                                sectionWrapper.setPage(parseInt(node.dataset.page));
                            }
                        }]
                    }),
                    sectionWrapper.bodyNode = dom.el('ul', {
                        class: ['section__body']
                    })
                ]
            });

            if (!section.show) {
                sectionWrapper.node.classList.add('section-collapsed');
                onReady();
            } else {
                getSectionContent(sectionWrapper, onReady);
            }

            calculateSize(sectionWrapper);

            return sectionWrapper;
        };

        var init = function () {
            exploreNode.classList.add('explore-hidden');

            var promiseList = [];
            sections.forEach(function (/**section*/item) {
                promiseList.push(new Promise(function (resolve) {
                    var sectionWrapper = createSection(item, resolve);
                    sectionWrappers.push(sectionWrapper);
                    sectionWrapperIdMap[sectionWrapper.id] = sectionWrapper;
                    if (item.enable) {
                        exploreNode.appendChild(sectionWrapper.node);
                    }
                }));
            });
            Promise.all(promiseList).then(function () {
                exploreNode.classList.remove('explore-hidden');
                setTimeout(function () {
                    onResize();
                }, 0);
                promiseList = null;
            });

            exploreNode.addEventListener('click', function (e) {
                var target = e.target;
                var section = dom.closest('.section', target);
                var sectionWrapper = sectionWrapperIdMap[section.dataset.id];
                if (sectionWrapper) {
                    var poster = dom.closest('.poster', target);
                    if (poster) {
                        var posterIndex = poster && parseInt(poster.dataset.index);
                        if (target.classList.contains('action__favorite')) {
                            e.preventDefault();
                            return sectionWrapper.favorite(posterIndex);
                        }
                        if (target.classList.contains('action__rmFavorite')) {
                            e.preventDefault();
                            return sectionWrapper.rmFavorite(posterIndex);
                        }
                        if (target.classList.contains('action__edit')) {
                            e.preventDefault();
                            return sectionWrapper.edit(posterIndex);
                        }
                    }
                    /*if (el.classList.contains('quality')) {
                        return this.onClickQuality(el, item, e);
                    }*/
                }
            });

            (function () {
                var favoritesSW = sectionWrapperIdMap.favorites;
                chrome.storage.onChanged.addListener(function(changes) {
                    var key;
                    var change = changes[favoritesSW.cacheKey];
                    if (change) {
                        var newValue = change.newValue;
                        if (JSON.stringify(favoritesSW.cache) !== JSON.stringify(newValue)) {
                            for (key in favoritesSW.cache) {
                                delete favoritesSW.cache[key];
                            }
                            for (key in newValue) {
                                favoritesSW.cache[key] = newValue[key];
                            }
                            if (favoritesSW.section.enable && favoritesSW.section.show) {
                                updateCategoryContent(favoritesSW);
                            }
                        }
                    }
                });
            })();

            setTimeout(function () {
                require(['jquery'], function () {
                    require(['jqueryUi'], function () {
                        var $exploreNode = $(exploreNode);
                        $exploreNode.sortable({
                            axis: 'y',
                            handle: '.section__move',
                            scroll: false,
                            start: function() {
                                window.scrollTo(0,0);

                                exploreNode.classList.add('explore-sort');

                                $exploreNode.sortable("refreshPositions");
                            },
                            stop: function() {
                                exploreNode.classList.remove('explore-sort');

                                var prevSections = sections.splice(0);
                                [].slice.call(exploreNode.childNodes).forEach(function (sectionNode) {
                                    var id = sectionNode.dataset.id;
                                    sections.push(sectionWrapperIdMap[id].section);
                                });

                                prevSections.forEach(function (section) {
                                    if (sections.indexOf(section) === -1) {
                                        sections.push(section);
                                    }
                                });

                                saveSections();
                            }
                        });

                        var $favoritesBodyNode = $(sectionWrapperIdMap.favorites.bodyNode);
                        $favoritesBodyNode.sortable({
                            handle: '.action__move',
                            items: '.poster',
                            opacity: 0.8,
                            stop: function(e, ui) {
                                var posterNode = ui.item[0];
                                var index = parseInt(posterNode.dataset.index);

                                var prevIndex = null;
                                var prevPosterNode = posterNode.previousElementSibling;
                                if (prevPosterNode) {
                                    prevIndex = parseInt(prevPosterNode.dataset.index);
                                }

                                var nextIndex = null;
                                var nextPosterNode = posterNode.nextElementSibling;
                                if (nextPosterNode) {
                                    nextIndex = parseInt(nextPosterNode.dataset.index);
                                }

                                var sectionWrapper = sectionWrapperIdMap.favorites;
                                var content = sectionWrapper.cache.content;

                                var poster = content.splice(index, 1)[0];
                                if (!nextPosterNode && !prevPosterNode) {
                                    content.push(poster);
                                } else
                                if (nextPosterNode) {
                                    if (index < nextIndex) {
                                        nextIndex--;
                                    }
                                    content.splice(nextIndex, 0, poster);
                                } else {
                                    content.splice(prevIndex, 0, poster);
                                }

                                updateCategoryContent(sectionWrapper);

                                saveFavorites();
                            }
                        });
                    });
                });
            }, 50);
        };

        this.show = function () {
            exploreNode.classList.remove('explore-hide');
            if (init) {
                init && init();
                init = null;
            } else {
                onResizeThrottle();
            }
            window.addEventListener('resize', onResizeThrottle);
        };
        this.hide = function () {
            window.removeEventListener('resize', onResizeThrottle);
            exploreNode.classList.add('explore-hide');
        };
    };

    Explore.prototype.insertDefaultSections = insertDefaultSections;

    return Explore;
});