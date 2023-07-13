import * as path from 'path';
import { execSync } from 'child_process';
import * as toolLib from 'azure-pipelines-tool-lib/tool';

const run = async (bitToken: string, wsdir: string): Promise<void> => {
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
