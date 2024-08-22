import { execSync } from "child_process";

const run = async (
  laneName: string,
  branchName: string,
  skipPush: boolean,
  gitUserName: string,
  gitUserEmail: string,
  wsdir: string
): Promise<void> => {
  execSync("bit import -x", { cwd: wsdir, shell: "/bin/bash" });
  execSync(`bit lane import "${laneName}"`, { cwd: wsdir, shell: "/bin/bash" });

  execSync("bit init import --reset-lane-new", {
    cwd: wsdir,
    shell: "/bin/bash",
  });

  // Git operations
  execSync(`git config --global user.name "${gitUserName}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });
  execSync(`git config --global user.email "${gitUserEmail}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });

  execSync(`git checkout -b ${branchName}`, { cwd: wsdir, shell: "/bin/bash" });
  execSync("git add .", { cwd: wsdir, shell: "/bin/bash" });

  try {
    execSync(
      `git commit -m "Commiting the latest updates from lane: ${laneName} to the Git branch: ${branchName} (automated) [skip-ci]`,
      { cwd: wsdir, shell: "/bin/bash" }
    );
  } catch (error) {
    console.error(
      `Error while committing changes: ${(error as Error).message}`
    );
  }

  // Push changes
  if (!skipPush) {
    execSync(`git push origin "${branchName}" -f`, {
      cwd: wsdir,
      shell: "/bin/bash",
    });
  } else {
    console.log("WARNING - Skipped pushing to GitHub!");
  }
};

export default run;
