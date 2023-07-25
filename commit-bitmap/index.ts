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

    runScript(gitUserName, gitUserEmail, wsdir, skipPush);
    task.setResult(task.TaskResult.Succeeded, `Commit succesful!`);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
