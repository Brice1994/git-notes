import yargs from "yargs";
import {ChildProcessWithoutNullStreams, spawn, spawnSync} from "child_process";
import commandExists from "command-exists";
import fs from "fs";

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
        console.dir(s.error);
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

console.log(process.env.PROJECT_ROOT);
// const argv = yargs(process.argv.slice(2))
// .option("f", {
//     alias: "file",
//     type: "string",
//     nargs: 1,
//     demand: true,
// })
// .argv;

// console.log(argv.file);

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
        console.log(`${childProcess.spawnfile}: ${data}`);
    });
    childProcess.stderr.on("data", (data) => {
        console.error(`${childProcess.spawnfile}: ${data}`);
    })
    return await new Promise((res) => {
        childProcess.on("close", (code) => {
            res(code)
        });
    })
}