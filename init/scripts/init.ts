import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as toolLib from "azure-pipelines-tool-lib/tool";
import task = require("azure-pipelines-task-lib");

function removeSchemeUrl(inputString: string): string {
  const urlRegex: RegExp = /(https?:\/\/[^\s]+)/g;
  return inputString.replace(urlRegex, '",');
}

function removeComments(jsonc: string): string {
  return jsonc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
}

const run = async (wsdir: string): Promise<void> => {
  task.setVariable("wsdir", wsdir);
  const wsDirPath = path.resolve(wsdir);
  const wsFile = path.join(wsDirPath, "workspace.jsonc");
  const workspace = fs.readFileSync(wsFile).toString();

  // sets org and scope env for dependent tasks usage
  const workspaceJson = removeComments(removeSchemeUrl(workspace));
  const workspaceObject = JSON.parse(workspaceJson);
  const defaultScope =
    workspaceObject["teambit.workspace/workspace"].defaultScope;
  const [org, scope] = defaultScope.split(".");
  task.setVariable("org", org);
  task.setVariable("scope", scope);

  // install bvm and bit
  const engineVersionMatch = /"engine": "(.*)"/.exec(workspace);
  const bitEngineVersion = engineVersionMatch ? engineVersionMatch[1] : "";
  execSync("npm i -g @teambit/bvm", { shell: "/bin/bash" });
  execSync(`bvm install ${bitEngineVersion} --use-system-node`, {
    shell: "/bin/bash",
  });

  // sets path for current step
  toolLib.prependPath(path.join("/", "home", "vsts", "bin"));

  // config bit/npm for CI/CD
  execSync("bit config set analytics_reporting false", { shell: "/bin/bash" });
  execSync("bit config set anonymous_reporting false", { shell: "/bin/bash" });
  execSync("bit config set interactive false", { shell: "/bin/bash" });

  execSync("bit install", { cwd: wsdir, shell: "/bin/bash" });
};

export default run;
