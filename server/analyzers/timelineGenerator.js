function generateTimeline(project) {

  const timeline = [];

  timeline.push({
    step: 1,
    title: "Application Startup",
    description:"Server starts and loads environment variables."
  });

  timeline.push({
    step: 2,
    title: "Database Connection",
    description:"MongoDB connection is established."
  });

  timeline.push({
    step: 3,
    title: "Middleware Registration",
    description:"Express middleware registered."
  });

  timeline.push({
    step: 4,
    title: "Routes Registration",
    description: `${project.routes.length} routes loaded`
  });

  timeline.push({
    step: 5,
    title: "Controller Execution",
    description:"Controllers process incoming requests."
  });

  timeline.push({
    step: 6,
    title: "Database Operations",
    description:"Models interact with database."
  });

  timeline.push({
    step: 7,
    title: "Response Sent",
    description:"Response returned to client."
  });

  return timeline;
}
module.exports = generateTimeline;
