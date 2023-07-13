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
        task.setResult(task.TaskResult.Failed, "Pull Request number is not found");
        throw new Error("GitHub token not found");
    }
  
    if (!org) {
        task.setResult(task.TaskResult.Failed, "Org is not found in Workspace.jsonc");
        throw new Error("Org not found");
    }
  
    if (!scope) {
        task.setResult(task.TaskResult.Failed, "Scope is not found in Workspace.jsonc");
        throw new Error("Scope not found");
    }
        
    const laneName = `pr-${prNumber?.toString()}` || "pr-testlane";
    const laneLink = `https://new.bit.cloud/${org}/${scope}/~lane/${laneName}`;

    runScript(laneName, org, scope, wsdir);
    task.setResult(task.TaskResult.Succeeded, `Successful: Check Lane: ${laneLink}`)
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
