import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/verify";

async function run() {
  try {
    const wsdir: string | undefined =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const skipBuild =
      task.getInput("skipbuild")?.toLowerCase() === "true" || false;

    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";

    runScript(skipBuild, wsdir);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
