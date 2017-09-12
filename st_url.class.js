'use strict';

(function(factory) {
    if (typeof define == 'function' && define.amd) {
        define(function() {
            return factory();
        });
    } else {
        window.stjUrlClass = factory();
    }
})(function() {
    function trim(spaceString) {
        return spaceString.replace(/^(\s)*|(\s*)$/, '');
    }

    function stjUrlClass(urlString) {
        if (!urlString) {
            urlString = location.href;
        } else {
            urlString = trim(urlString);
        }
        if (window.XMLHttpRequest) {
            this.xmlHttp = new XMLHttpRequest();
        } else {
            this.xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        this.full = urlString;
        this.hash = "#" + this.getHash(urlString);
        this.query = "?" + this.getQuery(urlString);
        this.domain = this.getDomain(urlString);
        this.protocol = this.getProtocol(urlString);
        this.fullPath = this.getFullPath(urlString);
        this.queryObj = this.makeQueryObj(this.getQuery(urlString));
        this.replaceQuery = this.addQuery;
        this.createMobileUrl = this.wap;
        this.createWebUrl = this.web;
    }

    stjUrlClass.prototype = {
        getHash: function(urlStr) {
            var hash = /\#([\w|=|&|%|\.]+)(\??)/gi.exec(urlStr);
            return hash ? hash[1] : null;
        },
        getQuery: function(urlStr) {
            var query = /\?([\w|%|=|&|\.]+)(#?)/gi.exec(urlStr);
            return query ? query[1] : null;
        },
        getProtocol: function(urlStr) {
            var protocol = urlStr.match(/^http(s?)\:\/\//);
            return protocol ? protocol[0] : "http://";
        },
        getDomain: function(urlStr) {
            var urlRemovedProtocolStr = urlStr.replace(/^http(s?)\:\/\//, ''),
                domain = urlRemovedProtocolStr.slice(0, urlRemovedProtocolStr.indexOf("/"));
            return domain;
        },
        getFullPath: function(urlStr) {
            var fullPath = urlStr.match(/([\:|\/|\w|\.])+([?|#])*/gi);
            fullPath = fullPath ? fullPath[0] : "./";
            if (fullPath.search(/(\?|\#)/) > 0) {
                fullPath = fullPath.slice(0, fullPath.search(/(\?|\#)/));
            }
            return fullPath;
        },
        makeQueryObj: function(queryStr) {
            if (!queryStr) {
                return {};
            }
            var queryDivide = queryStr.split("&"),
                queryDivideNum = queryDivide.length,
                queryObj = {};
            for (var qd = 0; qd < queryDivideNum; qd++) {
                var queryCouple = queryDivide[qd].split("=");
                queryObj[queryCouple[0]] = queryCouple[1];
            }

            if (queryObj.eid) {
                console.log(queryObj.eid);
                this.ajaxFunc(this.protocol + this.domain + "/index.php?get_eid=" + queryObj.eid, function(data) {
                    var replyModuleInfo = JSON.parse(data);
                    queryObj.m = replyModuleInfo.module;
                    queryObj.do = replyModuleInfo.do;
                }, true, "GET");
            }
            return queryObj;
        },
        makeUrl: function(hisDo, hisOtherQuery, plateform, hisFullDomain) {
            if (!hisFullDomain) {
                hisFullDomain = this.protocol + this.domain;
            }
            if (!plateform) {
                plateform = "app";
            }
            var hisFullUrl = hisFullDomain + "/" + plateform + "/index.php?do=" + hisDo + "&m=" + this.queryObj.m;
            if (this.queryObj.i) {
                hisFullUrl += "&i=" + this.queryObj.i;
            }
            if (this.queryObj.rid) {
                hisFullUrl += "&rid=" + this.queryObj.rid;
            }
            if (typeof hisOtherQuery == 'object') {
                for (var queryKey in hisOtherQuery) {
                    hisFullUrl += "&" + queryKey + "=" + hisOtherQuery[queryKey]
                }
            }
            return hisFullUrl;
        },
        wap: function(hisDo, hisOtherQuery, hisFullDomain) {
            var wapUrl = this.makeUrl(hisDo, hisOtherQuery, "app", hisFullDomain);
            return wapUrl;
        },
        web: function(hisDo, hisOtherQuery, hisFullDomain) {
            var webUrl = this.makeUrl(hisDo, hisOtherQuery, "web", hisFullDomain);
            return webUrl;
        },
        ajaxFunc: function(url, success, async, reqType) {
            var urlParsedObj = this;
            if (typeof async == "undefined") {
                async = true;
            }
            if (!reqType) {
                reqType = "POST";
            }
            this.xmlHttp.open(reqType, url, true);
            this.xmlHttp.send();
            this.xmlHttp.onreadystatechange = function() {
                if (urlParsedObj.xmlHttp.readyState == 4 && urlParsedObj.xmlHttp.status == 200) {
                    success(urlParsedObj.xmlHttp.responseText);
                }
            }
        },
        addQuery: function(addKey, addVal) {
            var urlParsedObj = this;
            if (typeof addKey == "object") {
                for (var key in addKey) {
                    urlParsedObj.queryObj[key] = addKey[key];
                }
            } else {
                urlParsedObj.queryObj[addKey] = addVal;
            }
            return urlParsedObj.rejoinUrl(urlParsedObj);
        },

        delQuery: function(delKey) {
            var urlParsedObj = this;
            if (typeof delKey == "string") {
                delete urlParsedObj.queryObj[delKey];
            } else {
                var delLen = delKey.length;
                for (var dk = 0; dk < delLen; dk++) {
                    delete urlParsedObj.queryObj[delKey[dk]];
                }
            }
            return urlParsedObj.rejoinUrl(urlParsedObj);
        },
        rejoinUrl: function(urlObj) {
            var hisQueryObj = urlObj.queryObj,
                hisQueryStr = '?';
            for (var qo in hisQueryObj) {
                hisQueryStr += qo + "=" + hisQueryObj[qo] + "&";
            }
            var hisUrlStr = urlObj.fullPath + hisQueryStr.slice(0, -1);
            return new stjUrlClass(hisUrlStr);
        },
        operateQuery: function(addQueryKeys, delQueryKeys) {
            var returnUrl = this.addQuery(addQueryKeys);
            if (delQueryKeys) {
                returnUrl = returnUrl.delQuery(delQueryKeys);
            }
            return returnUrl;
        }
    };

    return stjUrlClass;
});