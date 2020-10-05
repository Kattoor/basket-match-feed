const http = require('http');

const headers = {
    "authorization": "na",
    "content-type": "application/json"
};

const body = {
    "WedGUID": "BVBL20219130OVHSE41AJC",
    "CRUD": "R"
};

function stuff(cb) {
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
                            const newScore = textSplit[1];

                            return {type, period, minute, playerNumber, pointsMade, newScore, homeOrAway};
                        case 20: // timeout
                            return {type, period, minute, homeOrAway};
                        case 30: // fault
                            return {type, period, minute, playerNumber, homeOrAway};
                        case 40: // period start
                            return {type, period, minute, homeOrAway};
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

getPlayers(playerData => {
    stuff(records => {
        records.forEach(record => {
            const playerName = record.playerNumber ? playerData[record.homeOrAway + 'Players'].filter(pd => pd.number === record.playerNumber)[0].name : '';

            switch (record.type) {
                case 10:
                    log(record, `${playerName} scored ${record.pointsMade} points, score: ${record.newScore}`);
                    break;
                case 20:
                    log(record, `Timeout requested`);
                    break;
                case 30:
                    log(record, `!!!!! Fault by ${playerName}`);
                    break;
                case 40:
                    console.log();
                    console.log(`Period ${record.period} started!`);
                    break;
                case 50:
                    if (record.inOrOut === 'in')
                        log(record, `${playerName} entered the field`);
                    else
                        log(record, `${playerName} left the field`);
                    break;
            }
        });
    });
});
