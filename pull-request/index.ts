import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/pull-request";

async function run() {
  try {
    const wsdir: string | undefined =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const org = task.getVariable("org");
    const scope = task.getVariable("scope");
    const prNumber = task.getVariable("System.PullRequest.PullRequestId");

    if (!prNumber) {
      task.setResult(
        task.TaskResult.Failed,
        "Pull Request number is not found"
      );
      throw new Error("Pull request number is not found");
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

    const laneName = `pr-${prNumber?.toString()}` || "pr-testlane";
    const laneLink = `https://bit.cloud/${org}/${scope}/~lane/${laneName}`;

    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";

    runScript(laneName, org, scope, wsdir);
    task.setResult(
      task.TaskResult.Succeeded,
      `Successful: Check Lane: ${laneLink}`
    );
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
