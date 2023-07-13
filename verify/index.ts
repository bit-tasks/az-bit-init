import task = require('azure-pipelines-task-lib');
import runInit from './scripts/verify'; 

async function run() {
    try {
        const wsdir: string | undefined = task.getInput('wsdir', false) || task.getVariable('wsdir') || './';
        runInit(wsdir);
    }
    catch (err: any) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();