/**
 * author: Stevin D Jimmy
 * name: url-parse
 * version: 0.1.2beta
 */

var currentUrlString = location.href,
    currentUrlParse = new urlParse(currentUrlString),
    nowUrl = currentUrlParse;
//
function differPath(importedString, webPath, appPath, originPath) {
    var exportString;
    switch (importedString) {
        case 'web':
            exportString = webPath;
            break;
        case 'appPath':
            exportString = appPath;
            break;
        default: //case undefined
            exportString = originPath;
            break;
    }
    return exportString;
}
//
function urlParse(urlString) {
    this.version = '0.1.2beta';
    this.full = urlString;
    this.query = urlString.slice(urlString.indexOf("?") + 1);
    this.queryFunc = function() {
        var queryArray = this.query.split("&"),
            queryNums = queryArray.length,
            urlObj = {};
        for (var q = 0; q < queryNums; q++) {
            var queryCouple = queryArray[q].split("=");
            urlObj[queryCouple[0]] = queryCouple[1];
        }
        return urlObj;
    }
    this.urlObj = this.queryFunc();
    this.protocol = urlString.slice(0, urlString.indexOf("/")) + "//";
    this.host = urlString.slice(this.protocol.length).slice(0, urlString.slice(this.protocol.length).indexOf("/"));
    this.firstHostName = this.host.slice(0, this.host.indexOf("."));
    this.secondHostName = this.host.slice(this.firstHostName.length + 1).slice(0, this.host.slice(this.firstHostName.length + 1).indexOf("."));
    this.thirdHostName = this.host.slice(this.firstHostName.length + 2 + this.secondHostName.length).slice(0);
    this.path = urlString.slice(0, urlString.indexOf("?"));
    this.filePath = this.path.slice(this.protocol.length + this.host.length);
    this.replacer = function(replacer) {
        var replaceString = this.query,
            replacedNewURL,
            replacedNewUrlParse;
        for (var rep in replacer) {
            var matchRegExp = new RegExp(rep + "=(\\w+)", "gi"),
                matchExpression = replaceString.match(matchRegExp);
            replaceString = replaceString.replace(matchExpression, rep + "=" + replacer[rep]);
        }
        return replaceString;
    };
    this.adder = function(adder) {

        var addeeString;
        if (this.query.search(/#$/g) == -1) {
            addeeString = this.query;
        } else {
            addeeString = this.query.slice(0, this.query.length - 1);
        }
        for (var add in adder) {
            addeeString += "&" + add + "=" + adder[add];
        }
        return addeeString;
    };
    this.deleter = function(deleter) {
        var deleteString = this.query,
            deleteResult, deleterPosition;
        if (typeof(deleter) === 'string') {
            deleterPosition = this.query.indexOf(deleter);
            var matchExp, matcher;
            if (deleterPosition == 0) {
                matchExp = new RegExp(deleter + "=(\\w+)&", "gi");
            } else {
                matchExp = new RegExp("&" + deleter + "=(\\w+)", "gi");
            }
            matcher = deleteString.match(matchExp);
            deleteResult = deleteString.replace(matcher, "");
        } else {
            for (var del in deleter) {
                var thisString = del + "=" + deleter[del],
                    thisMatchExp;
                deleterPosition = this.query.search(thisString);
                if (deleterPosition == 0) {
                    thisMatchExp = new RegExp(thisString + "&", "gi")
                } else {
                    thisMatchExp = new RegExp("&" + thisString, "gi");
                }
                deleteString = deleteString.replace(thisMatchExp, "");
            }
            deleteResult = deleteString;
        }
        return deleteResult;
    };
    this.pbUrl = {
        app: this.protocol + this.host + "/app/index.php?",
        web: this.protocol + this.host + "/web/index.php?"
    };
    this.combine = function(queryString, pathString) {
        var combinedUrlString,
            combinedUrlParse;
        combinedUrlString = pathString + "?" + queryString;
        combinedUrlParse = new urlParse(combinedUrlString);
        return combinedUrlParse;

    };
    this.byReplacer = function(replaceReference, webOrApp) {
        var newQuery = this.replacer(replaceReference),
            replacedPathString = differPath(webOrApp, this.pbUrl.web, this.pbUrl.app, this.path),
            newUrlParse = this.combine(newQuery, replacedPathString);
        return newUrlParse;
    };
    this.byAdder = function(adderReference, webOrApp) {
        var addedQuery = this.adder(adderReference),
            addedPathString = differPath(webOrApp, this.pbUrl.web, this.pbUrl.app, this.path),
            addedUrlParse = this.combine(addedQuery, addedPathString);
        return addedUrlParse;
    }
    this.byDeleter = function(deleterReference, webOrApp) {
        var deletedQuery = this.deleter(deleterReference),
            deletedPathString = differPath(webOrApp, this.pbUrl.web, this.pbUrl.app, this.path),
            deletedUrlParse = this.combine(deletedQuery, deletedPathString);
        return deletedUrlParse;
    }
}
console.log("default url parse is currentUrlParse");