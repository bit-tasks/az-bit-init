import task = require("azure-pipelines-task-lib");
import { execSync } from "child_process";
import runScript from "./scripts/commit-bitmap";

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
    const gitUserName = process.env.GIT_USER_NAME;
    const gitUserEmail = process.env.GIT_USER_EMAIL;
    const azureDevOpsPat = process.env.AZURE_DEVOPS_PAT;
    const skipPush = !!task.getInput("skippush") || false;

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

    if (!azureDevOpsPat) {
      task.setResult(
        task.TaskResult.Failed,
        "AZURE_DEVOPS_PAT environment variable is not set for the pipeline"
      );
      throw new Error(
        "AZURE_DEVOPS_PAT environment variable is not set for the pipeline"
      );
    }

    const getRepositoryUrl = (wsdir: string): string => {
      try {
        const result = execSync("git config --get remote.origin.url", {
          cwd: wsdir,
          encoding: "utf-8",
        });
        return result.trim();
      } catch (error) {
        throw new Error(
          `Failed to get repository URL: ${(error as Error).message}`
        );
      }
    };

    // Get the Git repository URL
    const repositoryUrl = getRepositoryUrl(wsdir);

    runScript(
      gitUserName,
      gitUserEmail,
      azureDevOpsPat,
      repositoryUrl,
      wsdir,
      skipPush
    );
    task.setResult(task.TaskResult.Succeeded, `Commit succesful!`);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
