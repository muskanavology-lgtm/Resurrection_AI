const repositorySearch =
require("./repositorySearchEngine.js");

async function copilotAnalyzer(
project,
question
){

let keywords=[];

const q=
question.toLowerCase();

if(q.includes("jwt")){

keywords.push(
"jwt",
"token",
"sign"
);

}

if(q.includes("auth")){

keywords.push(
"auth",
"login",
"bcrypt",
"middleware"
);

}

if(q.includes("database")){

keywords.push(
"mongoose",
"model",
"schema"
);

}

if(keywords.length===0){

keywords.push(question);

}

let findings=[];

for(const keyword of keywords){

const result =
repositorySearch(

project.extractedPath,
keyword

);

findings.push(...result);

}

return findings.slice(0,20);

}

module.exports =
copilotAnalyzer;