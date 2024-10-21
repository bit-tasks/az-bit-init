import { execSync } from "child_process";
import { archiveLane } from "./graphql";

const run = async (
  laneName: string,
  archive: boolean,
  org: string,
  scope: string,
  bitToken: string,
  wsdir: string
): Promise<void> => {
  try {
    if (archive) {
      console.log(`Archiving bit lane: ${org}.${scope}/${laneName}`);
      await archiveLane(`${org}.${scope}/${laneName}`, bitToken);
    } else {
      execSync(
        `bit lane remove ${org}.${scope}/${laneName} --remote --silent --force`, {
          cwd: wsdir,
          shell: "/bin/bash",
        });
    }
  } catch (error) {
    console.log(`Cannot remove bit lane: ${error}. Lane may not exist`);
  }
};

export default run;
