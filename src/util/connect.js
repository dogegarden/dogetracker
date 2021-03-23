'use strict';

const http = require('http');

const defaultOptions = {
    // "port": ,
    "host": "http://localhost",
    "method": `GET`,
    "path": `/v1`,
    "headers": {
        "Content-Type": `application/json`,
        "Accept": `application/json`,
    }
};

function request ( options = {} ) {
    const promise = new Promise(( resolve, reject ) => {
        let {
            method = `GET`,
            path,
            body,
        } = options;

        if ( !path ) {
            throw new Error(`Missing path or index + action for DB connection`);
        }

        const reqOpts = {
            ...defaultOptions,
            method,
            path,
        };

        if ( isDev ) {
            // console.table(reqOpts);
            console.log(path);
        }

        const req = http.request(reqOpts, ( res ) => {

            const bufferArray = [];

            // res.setEncoding(`utf8`);

            res.on(`data`, ( chunk ) => {
                bufferArray[ bufferArray.length ] = chunk;
            });

            res.on(`end`, () => {
                const data = Buffer.concat(bufferArray);
                const obj = JSON.parse(data);
                resolve(obj);
            });
        });

        req.on('error', ( e ) => {
            reject(`Request to elasticsearch failed: ${e.message}`);
        });

        req.end(typeof body === `object` ? JSON.stringify(body) : body || undefined);
    });

    return promise //.catch(e => console.trace(e));
}