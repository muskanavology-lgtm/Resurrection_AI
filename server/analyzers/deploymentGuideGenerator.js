function deploymentGuideGenerator(analysis) {

  return {

    framework:
      analysis?.framework || "Unknown",

    steps: [

      "Install Dependencies",

      "Configure Environment Variables",

      "Connect Database",

      "Run Application",

      "Deploy To Production"

    ]

  };

}

module.exports =
deploymentGuideGenerator;