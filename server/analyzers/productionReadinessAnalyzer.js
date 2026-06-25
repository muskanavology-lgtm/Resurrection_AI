const fs = require("fs");
const path = require("path");

function productionReadinessAnalyzer(projectPath) {

  const report = {

    score: 100,

    productionReady: true,

    checks: {

      helmet: false,
      cors: false,
      logging: false,
      rateLimiting: false,
      envVariables: false

    },

    missing: []

  };

  function walk(dir) {

    const files =
      fs.readdirSync(dir);

    for (const file of files) {

      const fullPath =
        path.join(dir,file);

      const stat =
        fs.statSync(fullPath);

      if(stat.isDirectory()){

        walk(fullPath);

      }else{

        try{

          const content =
            fs.readFileSync(
              fullPath,
              "utf8"
            );

          if(content.includes("helmet("))
            report.checks.helmet=true;

          if(content.includes("cors("))
            report.checks.cors=true;

          if(content.includes("morgan("))
            report.checks.logging=true;

          if(
            content.includes("rateLimit(")
          )
            report.checks.rateLimiting=true;

          if(
            content.includes("process.env")
          )
            report.checks.envVariables=true;

        }
        catch(err){}

      }

    }

  }

  walk(projectPath);

  if(!report.checks.helmet){

    report.score-=10;

    report.missing.push(
      "Helmet Security"
    );

  }

  if(!report.checks.logging){

    report.score-=10;

    report.missing.push(
      "Morgan Logging"
    );

  }

  if(!report.checks.rateLimiting){

    report.score-=15;

    report.missing.push(
      "Rate Limiter"
    );

  }

  if(!report.checks.envVariables){

    report.score-=20;

    report.missing.push(
      "Environment Variables"
    );

  }

  report.productionReady =
    report.score >= 70;

  return report;

}

module.exports =
productionReadinessAnalyzer;