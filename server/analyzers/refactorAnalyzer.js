const fs = require("fs");
const path = require("path");

function refactorAnalyzer(projectPath){

const report = [];

function walk(dir){

const files =
fs.readdirSync(dir);

for(const file of files){

const fullPath =
path.join(dir,file);

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

const lines =
content.split("\n");

if(lines.length > 500){

report.push({

file,

severity:"HIGH",

issue:"Large File",

recommendation:
"Split into modules"

});

}

const functions =
content.match(
/function\s+[a-zA-Z0-9_]+/g
) || [];

if(functions.length > 15){

report.push({

file,

severity:"HIGH",

issue:"God File",

recommendation:
"Move logic into services"

});

}

}
catch(err){}

}

}

}

walk(projectPath);

return report;

}

module.exports =
refactorAnalyzer;