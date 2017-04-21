/**
 * author: Stevin D Jimmy
 * name: url-parse
 * version: 0.1.0beta
 */

var currentUrlString = location.href,
    currentUrlParse = new urlParse(currentUrlString);

function urlParse(urlString) {
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
}
console.log("default url parse is currentUrlParse");