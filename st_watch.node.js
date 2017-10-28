const FILE_SYSTEM = require("fs"),
    PATH = require('path'),
    COMMAND = require('child_process'),
    RESOURCE_FOLDER = __dirname + "/",
    SOURCE_FOLDER = __dirname.replace(/resource$/, 'src/');
let stResource = {
    root: RESOURCE_FOLDER,
    compiler: {
        inPath: PATH.resolve(RESOURCE_FOLDER, 'compile') + "/",
        outPath: SOURCE_FOLDER,
        runAll: () => {
            console.log("open watching");
            var dirTree = stResource.getDirTree(stResource.compiler.inPath),
                branchNum = dirTree.length;
            stResource.compiler.watchers = [];
            for (let d = 0; d < branchNum; d++) {
                let relativePath = dirTree[d],
                    absolutePath = PATH.resolve(stResource.compiler.inPath, relativePath);
                stResource.compiler.watchers[d] = FILE_SYSTEM.watch(absolutePath, (eventType, file) => {
                    if (eventType == 'change') {
                        stResource.compiler.convert(file, relativePath, false);
                    } else {
                        console.log(`${absolutePath}/${file} is on ${eventType}`);
                        stResource.compiler.restart();
                    }
                });
            }
        },
        restart: () => {
            stResource.compiler.stop(function() {
                stResource.compiler.runAll();
            });
        },
        stop: (callback) => {
            let watchers = stResource.compiler.watchers,
                wLen = watchers.length;
            for (let w = 0; w < wLen; w++) {
                watchers[w].close();
            }
            if (typeof callback == 'function') {
                callback();
            }
        },
        convert: (file, dir, isAbsoulteDir = false) => {
            stResource.compiler.compileLess(file, dir, isAbsoulteDir);
            stResource.compiler.compileES6(file, dir, isAbsoulteDir);
        },
        compileES6: (file, dir, isAbsoulteDir = false) => {
            let fileAbsolutePath = '',
                compileCommand = '',
                comiledDirPath = '',
                comiledFilePath = '',
                comiledFileName = stResource.isES6Resource(file);
            if (!dir.match(/[\/\\]$/)) {
                dir = dir + "/";
            }
            if (comiledFileName) {
                if (isAbsoulteDir) {
                    fileAbsolutePath = '';
                } else {
                    fileAbsolutePath = PATH.resolve(stResource.compiler.inPath, dir, file); //stResource.compiler.inPath + dir + file;
                    comiledDirPath = PATH.resolve(stResource.compiler.outPath, dir.replace(/^es(6{0,1})\//, 'js/'));
                    comiledFilePath = PATH.resolve(comiledDirPath, comiledFileName);
                    compileCommand = `npx babel ${fileAbsolutePath} --out-file ${comiledFilePath}`;
                    stResource.createSource(comiledFilePath, function() {
                        stResource.compiler.execute(compileCommand);
                    });
                }
            } else {
                return false;
            }
        },
        compileLess: (file, dir, isAbsoulteDir = false) => {
            let fileAbsolutePath = '',
                compileCommand = '',
                comiledDirPath = '',
                comiledFilePath = '',
                comiledFileName = stResource.isLessResource(file);
            if (!dir.match(/[\/\\]$/)) {
                dir = dir + "/";
            }
            if (comiledFileName) {
                if (isAbsoulteDir) {
                    fileAbsolutePath = '';
                } else {
                    fileAbsolutePath = PATH.resolve(stResource.compiler.inPath, dir, file);
                    comiledDirPath = PATH.resolve(stResource.compiler.outPath, dir.replace(/^less\//, 'css/'));
                    comiledFilePath = PATH.resolve(comiledDirPath, comiledFileName);
                    compileCommand = `lessc ${fileAbsolutePath} ${comiledFilePath}`;
                    stResource.compiler.execute(compileCommand);
                }
            } else {
                return false;
            }
        },
        execute: (cmd, debug = false) => {
            if (debug) {
                console.log(cmd);
                return;
            }
            COMMAND.exec(cmd, (err, stdOut, stdErr) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("\n\n");
                    console.log(cmd);
                    console.log("\ncmd run successfully==>to next command\n\n");
                }
            });
        }
    },
    init: () => {
        stResource.dirTree = stResource.getDirTree();
        // console.log(stResource.dirTree);
    },
    isLessResource: (file) => {
        let res = file.match(/([\w\.]+)\.c\.less$/);
        if (res) {
            return res[1] + ".css";
        } else {
            return false;
        }
    },
    isES6Resource: (file) => {
        let res = file.match(/([\w\.]+)\.c\.es6$/);
        if (res) {
            return res[1] + ".js";
        } else {
            return false;
        }
    },
    createSource: (params1, params2, params3) => {
        let sourceFile = params1,
            notAbsolute = true,
            callback = null;
        if (typeof params2 == 'function') {
            callback = params2;
        } else {
            if (typeof params2 == 'string') {
                notAbsolute = params2;
            }
            if (typeof params3 == 'function') {
                callback == params3;
            }
        }
        if (notAbsolute) {
            sourceFile = PATH.resolve(notAbsolute, sourceFile);
        }
        if (FILE_SYSTEM.existsSync(sourceFile)) {
            console.log(`${sourceFile} is  existing`);
        } else {
            stResource.mkdir(PATH.dirname(sourceFile), true);
        }
        if (callback) {
            callback();
        }
    },
    mkdir: (dir, isAbsolute = false) => {
        if (!isAbsolute) {
            dir = PATH.resolve(stResource.root, dir);
        }
        if (FILE_SYSTEM.existsSync(dir)) {
            return;
        }
        let dirSplits = dir.split("/"),
            dirLen = dirSplits.length,
            completeDir = '';
        for (let d = 0; d < dirLen; d++) {
            if (dirSplits[d] == '') {
                dirSplits[d] = "/";
            } else {
                dirSplits[d] += "/";
            }
            completeDir += dirSplits[d];
            if (FILE_SYSTEM.existsSync(completeDir)) {
                continue;
            } else {
                FILE_SYSTEM.mkdirSync(completeDir);
            }
        }
    },
    getDirTree: (absolutePath) => {
        if (!absolutePath) {
            absolutePath = __dirname;
        }
        let sons = FILE_SYSTEM.readdirSync(absolutePath),
            len = sons.length,
            dirTree = [];
        for (let s = 0; s < len; s++) {
            if (sons[s] != 'node_modules') {
                let sonAbsolutePath = absolutePath + sons[s];
                if (FILE_SYSTEM.lstatSync(sonAbsolutePath).isDirectory()) {
                    dirTree.push(sons[s]);
                    sonAbsolutePath += "/";
                    let grandsons = stResource.getDirTree(sonAbsolutePath),
                        grandLen = grandsons.length;
                    for (let g = 0; g < grandLen; g++) {
                        dirTree.push(sons[s] + "/" + grandsons[g]);
                    }
                }
            }
        }
        return dirTree;
    }
};

stResource.compiler.runAll();