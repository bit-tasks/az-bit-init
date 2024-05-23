import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/branch-lane";

async function run() {
  try {
    const wsdir: string =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const org = task.getVariable("org");
    const scope = task.getVariable("scope");
    const branchName = task.getVariable("Build.SourceBranchName");

    if (!branchName) {
      task.setResult(task.TaskResult.Failed, "Branch name is not found");
      throw new Error("Branch not found");
    }

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

    const laneLink = `https://new.bit.cloud/${org}/${scope}/~lane/${branchName}`;

    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";

    runScript(branchName, org, scope, wsdir);
    task.setResult(
      task.TaskResult.Succeeded,
      `Successful: Check Lane: ${laneLink}`
    );
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
