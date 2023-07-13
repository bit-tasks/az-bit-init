import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as toolLib from 'azure-pipelines-tool-lib/tool';
import task = require('azure-pipelines-task-lib');

function removeSchemeUrl(inputString: string): string {
  const urlRegex: RegExp = /(https?:\/\/[^\s]+)/g;
  return inputString.replace(urlRegex, '",');
}

function removeComments(jsonc: string): string {
  return jsonc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
}

const run = async (bitToken: string, wsdir: string): Promise<void> => {

  task.setVariable('wsdir', wsdir);
  const wsDirPath = path.resolve(wsdir);
  const wsFile = path.join(wsDirPath, "workspace.jsonc");
  const workspace = fs.readFileSync(wsFile).toString();
  const workspaceJson = removeComments(removeSchemeUrl(workspace));
  const workspaceObject = JSON.parse(workspaceJson);
  const defaultScope = workspaceObject['teambit.workspace/workspace'].defaultScope;
  const [org, scope ] = defaultScope.split(".");
  task.setVariable('org', org);
  task.setVariable('scope', scope);

  execSync("npx @teambit/bvm install", { shell: '/bin/bash' });
  toolLib.prependPath(path.join('/', 'home', 'vsts', 'bin'));

  execSync("bit config set interactive false", { shell: '/bin/bash' });
  execSync("bit config set analytics_reporting false", { shell: '/bin/bash' });
  execSync("bit config set anonymous_reporting false", { shell: '/bin/bash' });
  execSync(`bit config set user.token ${bitToken}`, { shell: '/bin/bash' });
  execSync("npm config set '@bit:registry' https://node-registry.bit.cloud", { shell: '/bin/bash' });
  execSync("npm config set '@teambit:registry' https://node-registry.bit.cloud", { shell: '/bin/bash' });
  execSync(`npm config set //node-registry.bit.cloud/:_authToken ${bitToken}`, { shell: '/bin/bash' });

  execSync("bit install", { cwd: wsdir,  shell: '/bin/bash' });
};

export default run;
