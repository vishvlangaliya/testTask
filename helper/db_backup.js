const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron')

const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, `../env/${process.env.NODE_ENV}.env`)
});

/* mongodump --db=ams --archive=./ams.gzip --gzip */
/* mongorestore --db=ams --archive=./ams.gzip --gzip */

const ARCHIVE_PATH = path.join(__dirname, '../db/backup', `${process.env.DATABASE}.gzip`);

/* cronjob set */
cron.schedule('0 0 * * * ', () => {
    
    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ])

    child.stdout.on('data', (data) => {
        console.log("stdout:\n", data);
    })

    child.stderr.on('data', (data) => {
        console.log("stderr:\n", Buffer.from(data).toString());
    })

    child.on('error', (error) => {
        console.log("error:\n", error);
        cronjobStatus = false;
    })

    child.on("exit", (code, signal) => {
        if (code) console.log("Process exit with code", code);
        else if (signal) console.log("Process killed with signal", signal);
        else console.log("Backup successfull");
    })
});

/* cronjob set */

function create(req, res) {
    const child = spawn('mongodump', [
        `--db=${process.env.DATABASE}`,
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ])

    child.stdout.on('data', (data) => {
        console.log("stdout:\n", data);
    })

    child.stderr.on('data', (data) => {
        console.log("stderr:\n", Buffer.from(data).toString());
    })

    child.on('error', (error) => {
        console.log("error:\n", error);
        res.sendError(error.message);
    })

    child.on("exit", (code, signal) => {
        if (code) { console.log("Process exit with code", code); res.sendError(`Process exit with code ${code}`) }
        else if (signal) { console.log("Process killed with signal", signal); res.sendError(`Process exit with code ${signal}`) }
        else { console.log("Backup successfull"); res.sendSuccess("backup created successfully") }
    })
}

function restore(req, res) {
    const child = spawn('mongorestore', [
        `--db=${process.env.DATABASE}`,
        `--archive=${ARCHIVE_PATH}`,
        `--gzip`
    ])

    child.stdout.on('data', (data) => {
        console.log("stdout:\n", data);
    })

    child.stderr.on('data', (data) => {
        console.log("stderr:\n", Buffer.from(data).toString());
    })

    child.on('error', (error) => {
        console.log("error:\n", error);
        res.sendError(error.message);
    })

    return child.on("exit", (code, signal) => {
        if (code) { console.log("Process exit with code", code); res.sendError(`Process exit with code ${code}`) }
        else if (signal) { console.log("Process killed with signal", signal); res.sendError(`Process exit with code ${signal}`) }
        else { console.log("Restore successfull"); res.sendSuccess("Restore created successfully") }
    })
}


module.exports = {
    create,
    restore
}
