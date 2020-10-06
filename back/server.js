const http = require('http');

const headers = {
    "authorization": "na",
    "content-type": "application/json"
};

const body = {
    "WedGUID": "BVBL20219130OVHSE41AJC",
    "CRUD": "R"
};

function getMatchRecords(cb) {
    const options = {
        host: "vblcb.wisseq.eu",
        port: 80,
        path: '/VBLCB_WebService/data/DwfVgngByWedGuid',
        method: 'PUT',
        headers
    };

    const req = http.request(options, res => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            cb(JSON
                .parse(data)['GebNis']
                .filter(record => record['GebType'] !== 60)
                .map(record => {
                    const type = record['GebType'];
                    const period = record['Periode'];
                    const minute = record['Minuut'];
                    const playerNumber = +record['RugNr'];
                    const homeOrAway = record['TofU'] === 'T' ? 'home' : 'away';

                    switch (type) {
                        case 10: // score
                            const textSplit = record['Text'].split(' ');
                            const pointsMade = textSplit[0];
                            const scoreString = textSplit[1];
                            const score = {
                                home: scoreString.slice(1, scoreString.indexOf('-')),
                                away: scoreString.slice(scoreString.indexOf('-') + 1, scoreString.length - 1)
                            };

                            return {type, period, minute, playerNumber, pointsMade, score, homeOrAway};
                        case 20: // timeout
                            return {type, period, minute, homeOrAway};
                        case 30: // fault
                            return {type, period, minute, playerNumber, homeOrAway};
                        case 40: // period start
                            return {type, period, minute};
                        case 50: // in or out
                            return {type, period, minute, playerNumber, homeOrAway, inOrOut: record['Text']};
                    }
                }));
        });
    });

    req.write(JSON.stringify(body));
    req.end();
}

function getPlayers(cb) {
    const options = {
        host: "vblcb.wisseq.eu",
        port: 80,
        path: '/VBLCB_WebService/data/DwfDeelByWedGuid',
        method: 'PUT',
        headers
    };

    const req = http.request(options, res => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const d = JSON.parse(data);

            const homePlayers = d['TtDeel']
                .filter(p => p['Functie'] === 'S')
                .map(p => ({name: p['Naam'], number: +p['RugNr']}));

            const awayPlayers = d['TuDeel'].filter(p => p['Functie'] === 'S')
                .map(p => ({name: p['Naam'], number: +p['RugNr']}));

            cb({homePlayers, awayPlayers});
        });
    });

    req.write(JSON.stringify(body));
    req.end();

}

function log(record, text) {
    const time = (record.period - 1) * 10 + record.minute;
    console.log(`${record.homeOrAway.toUpperCase()}\t${time} min\t${text}`);
}

function enrich(records, playerData) {
    return records.map(record => {
        if (record.type === 10 || record.type === 30 || record.type === 50) {
            const playerName = record.playerNumber ? playerData[record.homeOrAway + 'Players'].filter(pd => pd.number === record.playerNumber)[0].name : '';
            return Object.assign({}, record, {playerName});
        } else {
            return Object.assign({}, record);
        }
    });
}

getPlayers(playerData => {
    console.log('Fetched teams data');

    getMatchRecords(records => {
        console.log('Fetched match data');

        const enrichedData = enrich(records, playerData);

        http.createServer((req, res) => {
            res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
            res.write(JSON.stringify({playerData, records: enrichedData}));
            res.end();
        }).listen(8080, () => console.log('Started server'));
    });
});
