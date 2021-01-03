import yargs from "yargs";
import {ChildProcessWithoutNullStreams, spawn} from "child_process";
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