function apiDocsGenerator(routes = []) {

  return routes.map(route => {

    return {
      method:
        route.method,

      endpoint:
        route.path,

      description:
        "Auto Generated API Documentation"
    };

  });

}

module.exports =
apiDocsGenerator; 