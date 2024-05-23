import * as tl from "azure-pipelines-task-lib/task";
import { execSync } from "child_process";

const createTagMessageText = (): string => {
  let messageText = "CI"; // Default value

  const orgUrl = tl.getVariable("System.TeamFoundationCollectionUri");
  const project = tl.getVariable("System.TeamProject");
  const repo = tl.getVariable("Build.Repository.Name");
  const owner = tl.getVariable("Build.Repository.ID");

  if (!orgUrl || !project || !repo || !owner) {
    throw new Error("Azure DevOps information not available.");
  }

  try {
    const response = execSync(
      `az repos pr list --organization ${orgUrl} --project ${project} --repository ${repo} --status completed --top 1 --query '[0]' --output json`,
      { encoding: "utf-8" }
    );

    const lastMergedPullRequest = JSON.parse(response);
    if (!lastMergedPullRequest) {
      tl.warning("No pull requests found.");
      return messageText; // No need to change the default value
    }

    const prTitle = lastMergedPullRequest.title;
    const prNumber = lastMergedPullRequest.pullRequestId;

    tl.debug(`PR title: ${prTitle}`);
    tl.debug(`PR number: ${prNumber}`);

    if (prTitle) {
      messageText = prTitle;
    } else if (prNumber) {
      const commitsResponse = execSync(
        `az repos pr list --organization ${orgUrl} --project ${project} --repository ${repo} --pull-request-id ${prNumber} --top 1 --query '[0]' --output json`,
        { encoding: "utf-8" }
      );

      const lastCommitMessage = JSON.parse(commitsResponse).comment;
      tl.debug(`Last commit message: ${lastCommitMessage}`);

      messageText = lastCommitMessage;
    }

    tl.debug(`Tag message Text: ${messageText}`);
    return messageText;
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    tl.warning(
      `Failed to fetch pull request data from Azure DevOps API. ${errorMessage}`
    );
    return messageText; // Return the default value in case of an error
  }
};

function getVersionKeyword(
  text: string,
  fullMatch: boolean = false
): string | null {
  const keywords = ["patch", "major", "minor", "pre-release"];

  return (
    keywords.find(
      (keyword) =>
        (fullMatch && text === keyword) || text.includes(`[${keyword}]`)
    ) || null
  );
}

function fetchVersionFromLatestCommitPR(): string | null {
  const orgUrl = tl.getVariable("System.TeamFoundationCollectionUri");
  const project = tl.getVariable("System.TeamProject");
  const repo = tl.getVariable("Build.Repository.Name");
  const ref = tl.getVariable("Build.SourceBranch");

  const branch = ref ? ref.replace("refs/heads/", "") : "";

  if (!orgUrl || !project || !repo || !branch) {
    tl.debug("Repo information or commit message is not available.");
    return null;
  }

  try {
    const commitResponse = execSync(
      `az repos commit list --organization ${orgUrl} --project ${project} --repository ${repo} --searchCriteria.itemVersion=GB${branch} --top 1 --query '[0]' --output json`,
      { encoding: "utf-8" }
    );

    const commitMessage = JSON.parse(commitResponse).comment;
    tl.debug(`Commit Message: ${commitMessage}`);

    const prNumberMatch = /Merge pull request #(\d+)/.exec(commitMessage);
    if (prNumberMatch) {
      const prNumber = prNumberMatch[1];
      tl.debug(`PR Number: ${prNumber}`);

      const prResponse = execSync(
        `az repos pr show --organization ${orgUrl} --project ${project} --repository ${repo} --id ${prNumber} --query '[title, labels]' --output json`,
        { encoding: "utf-8" }
      );

      const [title, labels] = JSON.parse(prResponse);

      // 1. Check PR Labels
      const labelVersion = labels
        .map((label: any) => getVersionKeyword(label.name, true))
        .find((v: any) => v);
      if (labelVersion) {
        return labelVersion;
      }

      // 2. Fallback to PR title
      const prTitleVersion = getVersionKeyword(title);
      if (prTitleVersion) {
        return prTitleVersion;
      }
    }

    // 3. Last Fallback: Check the commit message
    return getVersionKeyword(commitMessage);
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    tl.debug(
      `Failed to fetch commit data from Azure DevOps API. ${errorMessage}`
    );
    return null;
  }
}

const run = async (persist: boolean, wsdir: string): Promise<void> => {
  try {
    const version = fetchVersionFromLatestCommitPR();
    const tagMessageText = createTagMessageText();

    let command = `bit tag -m "${tagMessageText}" --build`;

    if (version) {
      command += ` --${version}`;
    }

    if (persist) {
      command += " --persist";
    }

    execSync(command, { cwd: wsdir, shell: "/bin/bash" });
    execSync("bit export", { cwd: wsdir, shell: "/bin/bash" });
  } catch (error) {
    const errorMessage: string = (error as Error).message;
    tl.setResult(tl.TaskResult.Failed, errorMessage);
  }
};

export default run;
