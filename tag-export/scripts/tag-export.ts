import { execSync } from 'child_process';

const run = async (wsdir: string): Promise<void> => {
  execSync('bit tag -m "CI"',  { cwd: wsdir,  shell: '/bin/bash' });
  execSync("bit export",  { cwd: wsdir,  shell: '/bin/bash' });
};

export default run;
