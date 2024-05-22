import task = require("azure-pipelines-task-lib");
import runScript from "./scripts/commit-bitmap";

async function run() {
  try {
    const wsdir: string | undefined =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const gitUserName = task.getInput("gitusername");
    const gitUserEmail = task.getInput("gituseremail");
    const skipPush = !!task.getInput("skippush") || false;

    if (!gitUserName) {
      task.setResult(task.TaskResult.Failed, "Git user name not found");
      throw new Error("Git user name not found");
    }

    if (!gitUserEmail) {
      task.setResult(task.TaskResult.Failed, "Git user email not found");
      throw new Error("Git user email not found");
    }

    // Initialize environment variables for bit cli
    process.env.BIT_CONFIG_ANALYTICS_REPORTING = "false";
    process.env.BIT_CONFIG_ANONYMOUS_REPORTING = "false";
    process.env.BIT_CONFIG_INTERACTIVE = "false";
    process.env.BIT_DISABLE_CONSOLE = "true";
    process.env.BIT_DISABLE_SPINNER = "true";

    runScript(gitUserName, gitUserEmail, wsdir, skipPush);
    task.setResult(task.TaskResult.Succeeded, `Commit succesful!`);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
