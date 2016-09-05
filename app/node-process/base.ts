/* eslint-env node */

import { log } from "./logging";
import Connection from "./connection";
import DomainManager from "./domain-manager";

// emulate ws for now
const EventEmitter = require("events");
const ws = new EventEmitter();
Connection.setEmitter(ws);

// load the base domain
DomainManager.loadDomainModulesFromPaths(["./BaseDomain"], false);

const MessageHandlers: { [type: string]: (obj: any) => void } = {
    refreshInterface: () => {
        process.send && process.send({
            type: "refreshInterface",
            spec: DomainManager.getDomainDescriptions()
        });
    },
    message: ({ message }) => {
        ws.emit("message", message);
    }
};

process.on("message", async function(obj: any) {
    const type: string = obj.type;
    if (MessageHandlers[type]) {
        MessageHandlers[type](obj);
    } else {
        log.warn(`no handler for ${type}`);
    }
});

process.on("uncaughtException", (err: Error) => {
    log.error(`uncaughtException: ${err.stack}`);
    process.exit(1);
});
