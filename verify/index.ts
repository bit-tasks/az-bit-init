import task = require('azure-pipelines-task-lib');
import runScript from './scripts/verify'; 

async function run() {
    try {
        const wsdir: string | undefined = task.getInput('wsdir', false) || task.getVariable('wsdir') || './';
        const skipBuild = task.getInput('skipbuild')?.toLowerCase() === 'true' || false;
        runScript(skipBuild, wsdir);
    }
    catch (err: any) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();