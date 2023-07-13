import task = require('azure-pipelines-task-lib');
import runInit from './scripts/init'; 

async function run() {
    try {
        const wsdir: string | undefined = task.getInput('wsdir', false) || './';
        const bitToken = process.env.BIT_TOKEN;
        if (!bitToken) {
            task.setResult(task.TaskResult.Failed, 'BIT_TOKEN environment variable is not set');
            return;
        }
        runInit(bitToken, wsdir);
    }
    catch (err: any) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();