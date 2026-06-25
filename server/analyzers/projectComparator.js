function projectComparator(
projectA,
projectB
){

const scoreA =
(projectA.repositoryHealth?.healthScore || 0);

const scoreB =
(projectB.repositoryHealth?.healthScore || 0);

let winner = "Tie";

if(scoreA > scoreB){

winner =
projectA.projectName;

}
else if(scoreB > scoreA){

winner =
projectB.projectName;

}

return {

projectA:{

name:
projectA.projectName,

health:
scoreA,

architecture:
projectA.architecture,

quality:
projectA.qualityReport,

security:
projectA.securityReport?.length || 0

},

projectB:{

name:
projectB.projectName,

health:
scoreB,

architecture:
projectB.architecture,

quality:
projectB.qualityReport,

security:
projectB.securityReport?.length || 0

},

winner,

reason:

scoreA > scoreB
? "Project A has better repository health"

: scoreB > scoreA
? "Project B has better repository health"

: "Both projects are similar"

};

}

module.exports =
projectComparator;