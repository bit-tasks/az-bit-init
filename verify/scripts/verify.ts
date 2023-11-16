import { execSync } from 'child_process';

const run = async (skipBuild: boolean, wsdir: string): Promise<void> => {
  execSync("bit status --strict",  { cwd: wsdir,  shell: '/bin/bash' });
  if (!skipBuild) {
    execSync("bit build",  { cwd: wsdir,  shell: '/bin/bash' });
  }
};

export default run;
