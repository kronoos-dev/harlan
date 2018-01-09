/* global self, file, require, queue */

import moment from 'moment';

import fileReaderStream from 'filereader-stream';
import {CPF} from 'cpf_cnpj';
import {CNPJ} from 'cpf_cnpj';
import csv from 'csv';
import concat from 'concat-stream';
import async from 'async';
import request from 'request';
import pad from 'pad';

const UPDATE_INTERVAL = 500;

self.onmessage = message => {
    let loaded = 0;
    let parsed = 0;

    const queue = async.queue(({record}, callback) => {
        request.post({
            url: 'https://irql.bipbop.com.br/',
            form: {
                q: 'INSERT INTO \'DIVE\'.\'ENTITY\'',
                apiKey: message.data.apiKey,
                documento: record[0],
                birthday: record[1]
            }
        }, (err, httpResponse, body) => {
            callback();

            if (err) {
                self.postMessage({
                    method: 'error',
                    data: {
                        record,
                        response: {
                            httpResponse,
                            body,
                            error: err
                        }
                    }
                });
                return;
            }

            loaded++;
        });
        /* MAKE */

    }, 5);

    const updateInterval = setInterval(() => {
        self.postMessage({
            method: 'progress',
            data: loaded / parsed
        });
    }, UPDATE_INTERVAL);

    const end = () => {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        self.postMessage(null); /* EOF */
    };

    queue.drain = end;

    fileReaderStream(message.data.file)
        .pipe(csv.parse())
        .pipe(csv.transform(record => {
            if (record[0].length < 11) {
                record[0] = pad(11, record[0], '0');
            } else if (record[0].length < 15 && record[0].length > 11) {
                record[0] = pad(15, record[0], '0');
            }

            if (!(CPF.isValid(record[0]) || CNPJ.isValid(record[0]))) {
                return;
            }

            const birthday = moment(record[1], ['DD/MM/YYYY',
                'YYYY-MM-DD',
                'YY-MM-DD',
                'DD/MM/YY'
            ]);

            // if (moment().diff(birthday, 'years') < 16) {
            //     /* menores de 16 anos não */
            //     return;
            // }

            parsed++;
            if ((birthday.isValid())) {
                record[1] = birthday.format('DD/MM/YYYY');
            }
            queue.push({
                record
            });
        })).on('finish', () => {
            if (!parsed) {
                end();
            }
        });
};
