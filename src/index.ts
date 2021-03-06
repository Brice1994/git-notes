import yargs from "yargs";
import {ChildProcessWithoutNullStreams, spawn, spawnSync} from "child_process";
import {getLogger} from "log4js";
import commandExists from "command-exists";
import chokidar from "chokidar";
import _ from "lodash";
import fs from "fs";

try {
    const gitIgnore = fs.readFileSync(".gitignore");
}catch(e){
    console.log(`No .gitignore found, watching everything!`);
}
const logger = getLogger("index");
logger.level = "debug";

async function isGitRepo(): Promise<boolean>{
    const gitExists = await commandExists("git");
    if(!gitExists){
        throw new Error(`Need to have git installed.`)
    }
    const projectRoot = __dirname;
    console.log(projectRoot);
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

const argv = yargs(process.argv.slice(2))
.option("r", {
    demandOption: false,
    alias: "root"
})
.argv;
if(argv.root){
    logger.info(`Setting notes root to: ${argv.root}`);

}

async function saveGitRepo(){
    await spawnPromise(spawn("git", ["add", "."]));
    await spawnPromise(spawn("git", ["commit", "-m", "save"]));
    await spawnPromise(spawn("git", ["push"]))
}
const watcher = chokidar.watch(".").on("change",  _.debounce(saveGitRepo, 2000));

async function spawnPromise(childProcess: ChildProcessWithoutNullStreams){
    childProcess.stdout.on("data", (data) => {
        logger.info(`${childProcess.spawnfile}, ${childProcess.spawnargs}: ${data}`);
    });
    return await new Promise((res) => {
        childProcess.on("close", (code) => {
            logger.info(`Command: ${childProcess.spawnfile}, with args: ${childProcess.spawnargs} finished with code: ${code}.`);
            res(code)
        });
    })
}