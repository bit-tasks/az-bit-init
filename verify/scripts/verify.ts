import { execSync } from 'child_process';

const run = async (wsdir: string): Promise<void> => {
  execSync("bit status --strict",  { cwd: wsdir,  shell: '/bin/bash' });
  execSync("bit build",  { cwd: wsdir,  shell: '/bin/bash' });
};

export default run;
