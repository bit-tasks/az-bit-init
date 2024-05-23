import { execSync } from "child_process";

const run = async (
  lane: string,
  org: string,
  scope: string,
  wsdir: string
): Promise<void> => {
  try {
    execSync(
      `bit lane remove ${org}.${scope}/${lane} --remote --silent --force`,
      { cwd: wsdir, shell: "/bin/bash" }
    );
  } catch (error) {
    console.error(
      `Error while removing bit lane: ${error}. Lane may not exist`
    );
  }

  let statusRaw = "";

  try {
    statusRaw = execSync("bit status --json", {
      cwd: wsdir,
      shell: "/bin/bash",
    }).toString();
  } catch (error) {
    console.error(`Error executing 'bit status --json': ${error}`);
    throw error;
  }

  const status = JSON.parse(statusRaw.trim());

  if (status.newComponents?.length || status.modifiedComponents?.length) {
    console.log(
      "New or modified components found, proceeding with lane operations."
    );

    execSync("bit status --strict", { cwd: wsdir, shell: "/bin/bash" });
    execSync(`bit lane create ${lane}`, { cwd: wsdir, shell: "/bin/bash" });
    execSync('bit snap -m "CI"', { cwd: wsdir, shell: "/bin/bash" });
    execSync("bit export", { cwd: wsdir, shell: "/bin/bash" });
    // Set the LANE_NAME variable and display the message
    execSync(`echo "##vso[task.setvariable variable=LANE_NAME]${lane}"`, {
      shell: "/bin/bash",
    });
    const message = `⚠️ Please review the changes in the Bit lane: ${lane}`;
    execSync(`echo "##vso[task.logissue type=info]${message}"`, {
      shell: "/bin/bash",
    });
  } else {
    console.log(
      "No new or modified components found. Skipping lane operations."
    );
  }
};

export default run;
