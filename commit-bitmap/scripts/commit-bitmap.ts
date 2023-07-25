import { execSync } from "child_process";

const run = async (
  gitUserName: string,
  gitUserEmail: string,
  wsdir: string,
  skipPush: boolean
): Promise<void> => {
  execSync(`git config --global user.name "${gitUserName}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });
  execSync(`git config --global user.email "${gitUserEmail}"`, {
    cwd: wsdir,
    shell: "/bin/bash",
  });
  execSync("git add .bitmap", { cwd: wsdir, shell: "/bin/bash" });

  try {
    execSync(
      'git commit -m "update .bitmap with new component versions (automated). [skip-ci]"',
      { cwd: wsdir, shell: "/bin/bash" }
    );
  } catch (error) {
    console.error(`Error while committing changes`);
  }

  if (!skipPush) {
    execSync("git push", { cwd: wsdir, shell: "/bin/bash" });
  }
};

export default run;
