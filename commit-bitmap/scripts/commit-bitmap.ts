import { execSync } from "child_process";

const run = async (
  gitUserName: string,
  gitUserEmail: string,
  azureDevOpsPat: string,
  repositoryUrl: string,
  wsdir: string,
  skipPush: boolean,
): Promise<void> => {
  // Configure Git
  execSync(`git config --global user.name "${gitUserName}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });
  execSync(`git config --global user.email "${gitUserEmail}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });

  // Stage .bitmap file
  execSync("git add .bitmap", { cwd: wsdir, shell: "/bin/bash" });

  // Commit changes
  try {
    execSync(
      'git commit -m "update .bitmap with new component versions (automated). [skip-ci]"',
      { cwd: wsdir, shell: "/bin/bash" }
    );
  } catch (error) {
    console.error(`Error while committing changes: ${(error as Error).message}`);
  }

  // Push changes
  if (!skipPush) {
    const remoteUrl = `https://${gitUserName}:${azureDevOpsPat}@${repositoryUrl}`;
    execSync(`git remote set-url origin ${remoteUrl}`, { cwd: wsdir, shell: "/bin/bash" });
    execSync("git push origin HEAD:main", { cwd: wsdir, shell: "/bin/bash" });
  }
};

export default run;
