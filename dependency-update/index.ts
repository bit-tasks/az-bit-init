import task = require("azure-pipelines-task-lib");
import { execSync } from "child_process";
import runScript from "./scripts/dependency-update";

async function run() {
  try {
    // Initialize environment variables for Bit CLI
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

    // Retrieve input parameters
    const wsdir: string =
      task.getInput("wsdir", false) || task.getVariable("wsdir") || "./";
    const allow: string[] = task
      .getInput("allow", false)
      ?.replace(/\s+/g, "")
      .split(",") || ["all"];
    const versionUpdatePolicy: string =
      task.getInput("version-update-policy") || "";
    const packagePatterns: string = task.getInput("package-patterns") || "";
    const componentPatterns: string = task.getInput("component-patterns") || "";
    const envPatterns: string = task.getInput("env-patterns") || "";
    const azureDevOpsPat = process.env.AZURE_DEVOPS_PAT;
    const gitUserName = process.env.GIT_USER_NAME;
    const gitUserEmail = process.env.GIT_USER_EMAIL;

    // Validate required environment variables
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

    const repositoryUrl = getRepositoryUrl(wsdir);

    // Run the script with the new and existing parameters
    runScript(
      wsdir,
      allow,
      versionUpdatePolicy,
      packagePatterns,
      componentPatterns,
      envPatterns,
      gitUserName,
      gitUserEmail,
      azureDevOpsPat,
      repositoryUrl
    );

    // Task succeeded message
    task.setResult(task.TaskResult.Succeeded, `Successful: Dependency Update!`);
  } catch (err: any) {
    task.setResult(task.TaskResult.Failed, err.message);
  }
}

run();
