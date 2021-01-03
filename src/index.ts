import yargs from "yargs";
import {ChildProcessWithoutNullStreams, spawn, spawnSync} from "child_process";
import {getLogger} from "log4js";
import commandExists from "command-exists";
import fs from "fs";
const logger = getLogger("index");
logger.level = "debug";
async function isGitRepo(): Promise<boolean>{
    const gitExists = await commandExists("git");
    if(!gitExists){
        throw new Error(`Need to have git installed.`)
    }
    const projectRoot = process.env.PROJECT_ROOT;
    if(projectRoot === undefined){
        throw new Error(`Need project root set to begin saving`);
    }
    try {
        const s = spawnSync("git", ["rev-parse", "--is-inside-work-tree", projectRoot]);
        if(s.error){
            console.error(`Couldn't spawn git command, error: ${s.error}`)
            return false;
        }
        return true;
    }catch(e) {
        return false;
    }
}
try {
    fs.readFileSync(".env");
}catch(e){
    throw new Error(`Couldn't find .env file, need project root set in order to save, error: ${e}`);
}
require("dotenv").config();

logger.info(process.env.PROJECT_ROOT);
const argv = yargs(process.argv.slice(2))
.option("r", {
    demandOption: false,
    alias: "root"
})
.argv;

console.log(argv.root);

(async () => {
    if(!(await isGitRepo())){
        throw new Error(`Directory needs to be a git repo.`);
    }
    await spawnPromise(spawn("git", ["add", "."]));
    await spawnPromise(spawn("git", ["commit", "-m", "save"]));
    await spawnPromise(spawn("git", ["push"]))
})();
async function spawnPromise(childProcess: ChildProcessWithoutNullStreams){
    childProcess.stdout.on("data", (data) => {
        logger.info(`${childProcess.spawnfile}: ${data}`);
    });
    childProcess.stderr.on("data", (data) => {
        logger.error(`${childProcess.spawnfile}: ${data}`);
    })
    return await new Promise((res) => {
        childProcess.on("close", (code) => {
            logger.info(`Command: ${childProcess.spawnfile}, with args: ${childProcess.spawnargs} ran successfully.`);
            res(code)
        });
    })
}