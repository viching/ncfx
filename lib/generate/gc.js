const fs = require('fs'),
    path = require('path');
const util = require("../util");

module.exports = function generateClass(currentPath, fileName) {

    const className = camelName(fileName)
    const content = `export class ${className}{${"\r\n"}  constructor(){\r\n    \r\n  }${"\r\n"}}`;
    util.writeFile(path.join(currentPath, fileName), content);


    function camelName(fileName){
        fileName = fileName.split('.');
        let className = fileName.slice(0, fileName.length - 1).join("-");
        className = className.replace(/([^a-zA-Z0-9][a-zA-Z0-9])/g, function(){
            let str = arguments[1];
            if(str){
                return str.toUpperCase().charAt(1);
            }
        });
        return className;
    }
}