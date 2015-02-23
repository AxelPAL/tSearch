torrent_lib.bestrepack = function () {
    var name = 'BestRepack';
    var filename = 'bestrepack';
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAAAAABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAD6DZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAEBAQEBAQEBAQAAAAABAAABAAAAAAEAAAEAAAEBAQEBAQEBAQABAAABAAABAAEAAAEAAAEAAQAAAQAAAQABAAABAAABAAEAAAEAAAEAAQEBAQEBAQEBAAABAAABAAAAAAEAAAEAAAAAAQAAAQAAAAABAAABAAAAAAEAAAEAAAAAAQEBAQEBAQEBAAABAAAAAAAAAAEAAAAAAAAAAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AADgDwAA7+8AAO/vAADsAQAA7e0AAIAtAACtrQAAra0AAKANAAC9vQAAvb0AALwBAAC/vwAAgD8AAP//AAA%3D';
    var url = 'http://bestrepack.org/forum/tracker.php';
    var root_url = 'http://bestrepack.org/forum/';
    var about = 'bestrepack.org';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
     */
    var flags = {
        a: 1,
        l: 1,
        rs: 1,
        proxy: 1
    };
    var xhr = undefined;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
                /* Сериалы */[],
                /* Музыка */[138, 145, 144, 174],
                /* Игры */[122, 133, 128, 127, 130, 129, 132, 131, 126, 125, 25, 5, 6, 7, 53, 54, 61, 63, 8, 41, 51, 36, 50, 37, 52, 9, 56, 55, 10, 76, 39, 78, 81, 24, 48, 11, 12, 13, 57, 58, 62, 64, 15, 60, 59, 16, 171, 94, 14, 34, 42, 49, 35, 40, 79, 80, 167, 118, 83, 169, 99, 98, 95, 110, 115, 114, 113, 112, 111, 22, 18, 19, 20, 21, 23, 74, 155, 156, 159, 157, 158, 160],
                /* Фильмы */[],
                /* Мультфтльмы */[],
                /* Книги */[141]
            ];
            f = parseInt(f);
            for (var i = 0, len = groups_arr.length; i < len; i++) {
                if (groups_arr[i].indexOf(f) !== -1) {
                    return i;
                }
            }
            return -1;
        };
        var readCode = function (c) {
            c = engine.contentFilter(c);
            var t = engine.load_in_sandbox(c);
            t = t.find('#main_content').find('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            for (var i = 0; i < l; i++) {
                var td = t.eq(i).children('td');
                if (td.eq(5).children('a').attr('href') === undefined) {
                    continue;
                }
                arr.push({
                    category: {
                        title: td.eq(2).children('a').text(),
                        url: root_url + td.eq(2).children('a').attr('href'),
                        id: calculateCategory(td.eq(2).children('a').attr('href').replace(/.*f=([0-9]*).*$/i, "$1"))
                    },
                    title: td.eq(3).children('a').text(),
                    url: root_url + td.eq(3).children('a').attr('href'),
                    size: td.eq(5).children('u').text(),
                    dl: root_url + td.eq(5).children('a').attr('href'),
                    seeds: td.eq(6).text(),
                    leechs: td.eq(7).text(),
                    time: td.eq(9).children('u').text()
                });
            }
            return arr;
        };
        var loadPage = function (text, cb) {
            if (xhr !== undefined)
                xhr.abort();
            xhr = engine.ajax({
                tracker: filename,
                type: 'GET',
                url: url,
                cache: false,
                data: {
                    nm: text
                },
                success: function (data) {
                    cb(1, readCode(data));
                },
                error: function () {
                    cb(2, 2);
                }
            });
        };
        return {
            getPage: loadPage
        }
    }();
    return {
        find: web.getPage,
        stop: function(){
            if (xhr !== undefined) {
                xhr.abort();
            }
            //view.loadingStatus(1, filename);
        },
        name: name,
        icon: icon,
        about: about,
        url: root_url,
        filename: filename,
        flags: flags,
        tests: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}();