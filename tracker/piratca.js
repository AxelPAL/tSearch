var tmp_num = tracker.length;
tracker[tmp_num] = function () {
    var name = 'Piratca';
    var filename = 'piratca';
    var id = null;
    var icon = 'data:image/x-icon;base64,AAABAAEAEBAAAAEACABoBQAAFgAAACgAAAAQAAAAIAAAAAEACAAAAAAAAAEAAAAAAAAAAAAAAAEAAAABAAAAAAAAAgQGAAQFBgAAAQgABQcKAAYJDgAEBRcACQsQAA8PEwABARsAAwUcAAULGQAHDBgABgkdAA0RFgALEBwAEhgeAAkOLQAMFSIADBsnABIbJwAUGycAEh4sAAgHOAAMET8AEiExABsnMAAQIT4AFys6ABgqOgAbKjwAJSsyACYuPgAoMj0ABwdPABQeRgAHB1MAGCdFABcvSgAcMUIAFzFOABowSQAcMUoAGjFPAB4yTQAeM1sAHj9cACEsQgAgMEMAITlPADA9SwArPlEAIDpZAAkJYQAKD2YACw1sABkcZQAJDXEAHB57ACA9cAAvRFUAJURZAClCWwA2R1EAMkdaACZEYAApSGcALkhlACZGbQA7WG0AL1R9ADJWeQA0Wn0AQUZPAEBKVABQXWkAVl5rAFtiZABUZWsAQWB+AFppdgBSbX8AZWhwAHJzcQAMEIUAExyLAA4XmwAkNIUACw6lAAwapQARF6EAExupAAYZuQAZIa0AFyKyACQtrgAxWosAPUuTADFTlgA/apAAOFyuAExQmABKbYQAUm+AAFhqggBfZ4gAWWCcAEhzkQBReJ8AVH6eAEBwqABFcbYASH+wAEt5vwBOfrwAVmrFAF2AnAB5iJIAToGvAFyEoQBMg7MAWYywAHONpQBhkLkAZZe/AGufwQB8td8AgJKqAJKYoACRn60AhqK8AIGXzgCEo8QAiqvCAIu+ygCesMcAnrTLAIq/3ACfxNYAr9/qALLp9QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8AAAAAAAAAcGMrSwAAAAAAAAAAAAAAdkISBxRQAAAAAAAAAABNdEIyMx4HHisAAAAAAAAAZz9Oimw0MAQcAAAAAAAAABAAe3tPFhkADQAAAAAAAC9FQUQrDhQFDRs4AAAAAAB6hnd+fRoND0JHJQAAAAAAh0AAPnlmBAAAK0kAAAAAAH+BUT5GSCcTMStLAAAAAACIi4yJeG5gJi4oPAAAAAAAal5dXVY5NhcKBhEAAAAAADpYc4NcWVU3NiIKAAAAAABXWl9hXFlVNzYkEQAAAAAAhWRbVFxZVTc2GCAAAAAAAACEcnJvYjstIx8AAAAAAAAAAACCbGs9IQAAAAAAAPw/AAD4HwAA4A8AAOAPAADgDwAAwAcAAMAHAADABwAAwAcAAMAHAADABwAAwAcAAMAHAADABwAA4A8AAPg/AAA%3D';
    var login_url = 'http://pirat.ca/login.php';
    var url = 'http://pirat.ca/tracker.php';
    var root_url = 'http://pirat.ca/';
    var about = 'Pirat.ca :: Скачать торрент бесплатно';
    /*
     * a = требует авторизации
     * l = русскоязычный или нет
     * rs= поддержка русского языка
    */
    var flags = {
        a : 1,
        l : 1,
        rs: 1
    }
    var xhr = null;
    var web = function () {
        var calculateCategory = function (f) {
            var groups_arr = [
            /* Сериалы */[2385,24,2462,1799,2341,998,888,1504,1492,1491,1493,1494,1500,2339,1495,1497,2338,1502,1503,2079,999,1506,26,2463,1800,2053,2054,2055,2057,2056,2058,1723],
            /* Музыка */[1880,2473,2070,1896,1893,1892,1891,1929,1883,2474,2444,2063,1905,1899,1898,1897,1881,2475,2071,1904,1902,1903,1901,1906,2476,2379,2378,2336,2477,1849,2478,1937,1936,1935,1934,1933,1928,1927,1926,1921,1920,1919,1918,1917,1916,1915,1850,2479,1945,1944,1943,1942,1941,1940,1939,1938,1851,2480,1949,1948,1947,1946,1852,2481,1954,1953,1952,1951,1950,1854,2482,1958,1957,1956,1955,1855,2483,1967,1965,1964,1963,1962,1961,1960,1959,2182,1856,2484,1973,1971,1970,2485,1857,2487,1976,1975,1974,1858,2488,1980,1979,1978,1859,2489,1983,1982,1981,1860,2490,1989,1985,1861,2491,1868,2492,1876,1875,1874,1873,1872,1871,1870,1869,1879,2493,1884,2494,1886,1885,1887,2495,1888,2496,1889,2497,1890,2498,1895,2499,1863,2500,1864,2501,1865,2502,2011,1866,2503],
            /* Игры */[618,2321,2538,2322,2323,2324,2326,2327,2325,2328,2330,2329,2331,2332,2333,2305,2539,370,2540,371,372,632,631,373,2541,374,2542,375,376,377,981,379,2543,380,2544,384,383,382,505,386,2545,387,2546,390,391,2547,392,2548,1783,2549,1784,1787,1786,1785,1788,1271,2550,499,2551,2352,389,395,706,708,394,707,1810,393,1778,1793,1794,1809,1791,1792,1811,2552,1815,1820,2304,1816,1817,1818,1819,1812,2553,1834,1833,1832,1831,2291,1830,1829,2265,2267,2268,1813,2554,1841,1840,1839,1814,2555],
            /* Фильмы */[2307,2451,2387,2389,2390,2391,2388,123,133,1765,2589,1766,2,2564,2459,1458,1457,1456,2034,2035,20,2565,190,21,23,2036,2037,2433,2566,2445,2567,2450,2449,2448,2447,2446,1459,2569,1462,1461,1460,2039,2038,2580,2582,2583,2587,964,2568,965,966,967,2574,978,979,976],
            /* Мультфтльмы */[2386,2584,2573,38,2469,546,483,41,1440,40,1441,1437,2470,2440,2442,2441,704,1668,1669,1439,1670,1671],
            /* Книги */[798,2527,800,799,802,1356,1359,1513,801,1358,1355,1357,803,243,2528,158,1361,1362,1363,1797,1672,1368,2529,1370,1369,1373,2530,1377,1375,1383,1386,1374,1364,2531,1366,1365,2438,2437,75,2532,1379,1528,1845,1385,1380,1381,2425,1382,1726,2426,2533,1120,1124,1123,1122,1121,2432,2535,728,746,2016,2512,216,2404,2278,672,2405,2279,218,2406,220,211,2407,492,2408,2409,2410,2411,2508,2513,2510,2509],
            /* ПО */[498,2556,311,312,313,415,414,318,319,321,322,323,324,302,2557,316,333,317,332,331,330,329,328,327,326,325,2131,304,2558,412,411,410,409,408,305,2559,424,423,422,315,314,682,421,420,419,418,417,416,413,2577,306,2560,480,2133,479,478,2132,477,2134,303,2561,2401,2398,2380,1107,702,703,336,335,2396,2255,683,2562,694,691,687,685,1847,1846,684,1843,1842,720,2563,977,724,725,726,729,727,2081,1634,1557,1635,1636,1538,1637,1555,1639,1539,1620,1621,2099,2192,1623,1624,1619,2191,1663,2505,1702,1701,2290,1700,1699,1698,1697,1696,1695,2399,1653,1665,2506,2504,2507,1654],
            /* Анимэ */[926,927,928,929,946,948,949,947,2072,2073,2074,2075,2076,938,939,941,993,990],
            /* Док. и юмор */[2585,2402,28,2468,2345,2434,2346,29,30,31,2348,2351,142,2347,2301,2296,705,1713,2299,2302,2350,35,37,2297,36,2349,2298,2193,355,2464,1448,1449,356,358,357,2111,2110,2108,2306,2109,785,2135],
            /* Спорт */[2586,42,2471,54,1465,2313,53,52,51,2308,50,49,48,47,2311,46,45,1512,922,44,2457],
            /* xxx */[132,2516,2051,854,853,2015,851,626,1666,2524,2526,852,2514,2521,1376,855,2575]
            ];
            for (var i=0;i<groups_arr.length;i++)
                if (jQuery.inArray(parseInt(f),groups_arr[i]) > -1) {
                    return i;
                }
            return -1;
        }
        var readCode = function (c) {
            c = view.contentFilter(c);
            var t = $(c);
            if (t.find('input[name="login_username"]').html() != null) {
                view.auth(0,id);
                return [];
            } else 
                view.auth(1,id);
            t = t.find('#main_content').find('#tor-tbl').children('tbody').children('tr');
            var l = t.length;
            var arr = [];
            var i = 0;
            for (i = 0;i<l;i++) {
                var td = t.eq(i).children('td');
                if (td.eq(4).children('a').attr('href') == null) continue;
                arr[arr.length] = {
                    'category' : {
                        'title' : td.eq(1).children('a').text(), 
                        'url': root_url+td.eq(1).children('a').attr('href'),
                        'id': calculateCategory(td.eq(1).children('a').attr('href').replace(/.*f=([0-9]*).*$/i,"$1"))
                    },
                    'title' : td.eq(2).children('a').text(),
                    'url' : root_url+td.eq(2).children('a').attr('href'),
                    'size' : td.eq(4).children('u').text(),
                    'dl' : root_url+td.eq(4).children('a').attr('href'),
                    'seeds' : td.eq(5).children('b.seedmed').text(),
                    'leechs' : td.eq(5).children('b.leechmed').text(),
                    'time' : td.eq(6).children('u').text()
                }
            }
            return arr;
        }
        var loadPage = function (text) {
            var t = text;
            if (xhr != null)
                xhr.abort();
            xhr = $.ajax({
                type: 'POST',
                url: url,
                cache : false,
                data: {
                    'max' : 1,
                    'to' : 1,
                    'nm' : text
                },
                success: function(data) {
                    view.result(id,readCode(data),t);
                },
                error:function (){
                    view.loadingStatus(2,id);
                }
            });
        }
        return {
            getPage : function (a) {
                return loadPage(a);
            }
        }
    }();
    var find = function (text) {
        return web.getPage(text);
    }
    return {
        find : function (a) {
            return find(a);
        },
        setId : function (a) {
            id = a;
        },
        id : id,
        login_url : login_url,
        name : name,
        icon : icon,
        about : about,
        url : root_url,
        filename : filename,
        flags : flags
    }
}();
engine.ModuleLoaded(tmp_num);