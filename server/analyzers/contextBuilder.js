const fs = require("fs");
const path = require("path");

function contextBuilder(
projectPath
){

const files = [];

function walk(dir){

const items =
fs.readdirSync(dir);

for(const item of items){

const fullPath =
path.join(dir,item);

const stat =
fs.statSync(fullPath);

if(stat.isDirectory()){

walk(fullPath);

}
else{

try{

const content =
fs.readFileSync(
fullPath,
"utf8"
);

files.push({

filePath:
fullPath,

content:
content.substring(
0,
15000
)

});

}
catch(err){}

}

}

}

walk(projectPath);

return files;

}

module.exports =
contextBuilder;