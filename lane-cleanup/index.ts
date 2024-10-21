import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/lane-cleanup";

async function run() {
  try {
    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";
    process.env.BIT_CONFIG_USER_TOKEN =
    task.getVariable("BIT_CONFIG_USER_TOKEN") ||
    task.getVariable("BIT_CLOUD_ACCESS_TOKEN");

    const wsdir: string =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const archive: boolean = task.getInput("archive")?.toLowerCase() === "true";
    const laneName = task.getInput("lanename")?.toLowerCase() || "";
    const org = task.getVariable("org");
    const scope = task.getVariable("scope");
    const bitToken =  process.env.BIT_CONFIG_USER_TOKEN || "";

    if (!org) {
      task.setResult(
        task.TaskResult.Failed,
        "Org is not found in Workspace.jsonc"
      );
      throw new Error("Org not found");
    }

    if (!scope) {
      task.setResult(
        task.TaskResult.Failed,
        "Scope is not found in Workspace.jsonc"
      );
      throw new Error("Scope not found");
    }

    if (!laneName) {
      task.setResult(task.TaskResult.Failed, "Lane name is not found");
      throw new Error("Lane name not found");
    }

    runScript(laneName, archive, org, scope, bitToken, wsdir);
    task.setResult(
      task.TaskResult.Succeeded,
      `Successful: Clean Lane: ${laneName}`
    );
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
