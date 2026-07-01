const { buildFileTree } = require("../utils/fileTreeCache");

function databaseAnalyzer(projectPathOrTree) {
  const result = {
    collections: [],
    tables: [],
    type: "Unknown",
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const mongoRegex = /mongoose\.model\s*\(\s*["'`](.*?)["'`]/g;
  const sqlCreateRegex = /CREATE\s+TABLE\s+(?:IF NOT EXISTS\s+)?[`"']?([a-zA-Z0-9_]+)[`"']?/gi;
  // Laravel migrations: Schema::create('table_name', ...)
  const laravelSchemaRegex = /Schema::create\s*\(\s*['"]([a-zA-Z0-9_]+)['"]/g;
  // Eloquent models: protected $table = 'table_name';
  const eloquentTableRegex = /\$table\s*=\s*['"]([a-zA-Z0-9_]+)['"]/g;

  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;
    let match;

    while ((match = mongoRegex.exec(content))) {
      result.collections.push(match[1]);
      result.type = "MongoDB";
    }

    while ((match = sqlCreateRegex.exec(content))) {
      result.tables.push(match[1]);
      if (result.type === "Unknown") result.type = "SQL";
    }

    while ((match = laravelSchemaRegex.exec(content))) {
      result.tables.push(match[1]);
      result.type = "MySQL (Laravel)";
    }

    while ((match = eloquentTableRegex.exec(content))) {
      result.tables.push(match[1]);
      if (result.type === "Unknown") result.type = "MySQL (Laravel)";
    }
  }

  result.collections = [...new Set(result.collections)];
  result.tables = [...new Set(result.tables)];

  return result;
}

module.exports = databaseAnalyzer;
