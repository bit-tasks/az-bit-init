import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/tag-export";

async function run() {
  try {
    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";
    process.env.BIT_CONFIG_USER_TOKEN = task.getVariable(
      "BIT_CONFIG_USER_TOKEN"
    );
    process.env.BIT_CLOUD_ACCESS_TOKEN = task.getVariable(
      "BIT_CLOUD_ACCESS_TOKEN"
    );
    process.env.AZURE_DEVOPS_PAT = task.getVariable("AZURE_DEVOPS_PAT");
    process.env.GIT_USER_EMAIL = task.getVariable("GIT_USER_EMAIL");
    process.env.GIT_USER_NAME = task.getVariable("GIT_USER_NAME");

    const wsdir: string =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const persist = task.getInput("persist")?.toLowerCase() === "true" || false;

    runScript(persist, wsdir);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
