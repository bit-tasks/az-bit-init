import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/lane-branch";

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
    process.env.AZURE_DEVOPS_PAT = task.getVariable("AZURE_DEVOPS_PAT");
    process.env.GIT_USER_EMAIL = task.getVariable("GIT_USER_EMAIL");
    process.env.GIT_USER_NAME = task.getVariable("GIT_USER_NAME");

    const wsdir: string =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const skipPush: boolean =
      task.getInput("skippush")?.toLowerCase() === "true";

    const laneName = task.getInput("lanename")?.toLowerCase() || "";
    const branchName = task.getInput("branchname")?.toLowerCase() || laneName;
    const gitUserName = process.env.GIT_USER_NAME;
    const gitUserEmail = process.env.GIT_USER_EMAIL;

    if (!gitUserName) {
      task.setResult(
        task.TaskResult.Failed,
        "GIT_USER_NAME environment variable is not set for the pipeline"
      );
      throw new Error(
        "GIT_USER_NAME environment variable is not set for the pipeline"
      );
    }

    if (!gitUserEmail) {
      task.setResult(
        task.TaskResult.Failed,
        "GIT_USER_EMAIL environment variable is not set for the pipeline"
      );
      throw new Error(
        "GIT_USER_EMAIL environment variable is not set for the pipeline"
      );
    }

    if (!laneName) {
      task.setResult(task.TaskResult.Failed, "Lane name is not found");
      throw new Error("Lane name not found");
    }

    if (branchName === laneName) {
      console.log(`Using the lane name "${laneName}" as branch name`);
    }

    runScript(laneName, branchName, skipPush, gitUserName, gitUserEmail, wsdir);
    task.setResult(
      task.TaskResult.Succeeded,
      `Successful: Check Branch: ${branchName}`
    );
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
