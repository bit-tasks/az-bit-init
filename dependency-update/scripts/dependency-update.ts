import { execSync } from "child_process";

const run = async (
  wsdir: string,
  allow: string[],
  versionUpdatePolicy: string,
  packagePatterns: string,
  componentPatterns: string,
  envPatterns: string,
  gitUserName: string,
  gitUserEmail: string,
  azureDevOpsPat: string, 
  repositoryUrl: string  
): Promise<void> => {
  const branchName = "bit-dependency-update";
  const commitMessage =
    "Update Bit envs, outdated (direct) external dependencies, and workspace components according to the defined CI task parameter --allow";

  // Construct the remote URL
  const remoteUrl = `https://${gitUserName}:${azureDevOpsPat}@${repositoryUrl}`;

  // Execute Bit commands based on the allow parameter
  if (allow.includes("all") || allow.includes("workspace-components")) {
    execSync(`bit checkout head --all "${componentPatterns}"`, {
      cwd: wsdir,
      shell: "/bin/bash",
    });
  }

  if (allow.includes("all") || allow.includes("envs")) {
    execSync(`bit envs update "${envPatterns}"`, {
      cwd: wsdir,
      shell: "/bin/bash",
    });
  }

  if (allow.includes("all") || allow.includes("external-dependencies")) {
    const semverOption = versionUpdatePolicy ? `--${versionUpdatePolicy}` : "";
    execSync(`bit update -y ${semverOption} "${packagePatterns}"`, {
      cwd: wsdir,
      shell: "/bin/bash",
    });
  }

  // Check for changes in Git workspace
  let statusOutput = "";
  try {
    statusOutput = execSync("git status --porcelain", {
      cwd: wsdir,
      shell: "/bin/bash",
    }).toString();
  } catch (error) {
    console.error("Error checking git status:", (error as Error).message);
    throw error;
  }

  if (statusOutput) {
    // Git configuration
    try {
      execSync(`git config --global user.name "${gitUserName}"`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });
      execSync(`git config --global user.email "${gitUserEmail}"`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });

      // Create new branch and commit changes
      execSync(`git checkout -b ${branchName}`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });
      execSync("git add .", {
        cwd: wsdir,
        shell: "/bin/bash",
      });
      execSync(`git commit -m "${commitMessage}"`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });

      // Set the remote URL using the constructed remoteUrl parameter
      execSync(`git remote set-url origin "${remoteUrl}"`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });

      // Push changes to remote branch
      execSync(`git push origin "${branchName}" --force`, {
        cwd: wsdir,
        shell: "/bin/bash",
      });

      console.log(`Successfully pushed changes to branch: ${branchName}`);
    } catch (error) {
      console.error(
        `Error during git operations: ${(error as Error).message}`
      );
      throw error;
    }
  } else {
    console.log("No changes detected in Git workspace.");
  }
};

export default run;
