const http = require('http');
const fs = require('fs');
const path = require('path');

function getMatchRecords(matchGuid, cb) {
    const headers = {
        "authorization": "na",
        "content-type": "application/json"
    };

    const body = {
        "WedGUID": matchGuid,
        "CRUD": "R"
    };

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
                //.filter(record => record['GebType'] !== 60)
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
                        case 60:
                            return {type, period, minute, text: record['Text']};
                    }
                }));
        });
    });

    req.write(JSON.stringify(body));
    req.end();
}

function getPlayers(matchGuid, cb) {
    const headers = {
        "authorization": "na",
        "content-type": "application/json"
    };

    const body = {
        "WedGUID": matchGuid,
        "CRUD": "R"
    };

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

function getAllTemseMatches(cb) {
    const temseGuid = 'BVBL1047HSE  3';
    //const temseGuid = 'BVBL1047HSE  2'
    const options = {
        host: "vblcb.wisseq.eu",
        port: 80,
        path: '/VBLCB_WebService/data/TeamMatchesByGuid?teamGuid=' + temseGuid.replace(/ /g, '+'),
        method: 'GET'
    };

    const req = http.request(options, res => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const matches = JSON.parse(data)
                .map(m => {
                    const dateSplit = m.datumString.split('-').map(v => +v);
                    const timeSplit = m.beginTijd.split('.').map(v => +v);
                    const matchDate = new Date(dateSplit[2], dateSplit[1] - 1, dateSplit[0], timeSplit[0], timeSplit[1]);

                    const match = {
                        matchGuid: m.guid,
                        homeTeam: {
                            guid: m.tTGUID,
                            name: m.tTNaam
                        },
                        awayTeam: {
                            guid: m.tUGUID,
                            name: m.tUNaam
                        },
                        dateTime: matchDate.getTime(),
                        sportsHall: m.accNaam,
                        result: m.uitslag.replace(/ /g, ''),

                        enemyTeam: m.tTGUID === temseGuid ? m.tUNaam : m.tTNaam
                    };

                    if (match.result) {
                        const resultSplit = match.result.split('-');
                        const homeScore = +resultSplit[0];
                        const awayScore = +resultSplit[1];

                        match.didWeWin =
                            (match.homeTeam.guid === temseGuid && homeScore > awayScore) ||
                            (match.awayTeam.guid === temseGuid && awayScore > homeScore);
                    }

                    return match;
                });
            cb(matches);
        });
    });

    req.end();
}

function getMatchMetaData(matchGuid, cb) {
    const options = {
        host: "vblcb.wisseq.eu",
        port: 80,
        path: '/VBLCB_WebService/data/MatchByWedGuid?issguid=' + matchGuid,
        method: 'GET'
    };

    const req = http.request(options, res => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const sportsHall = JSON.parse(data)[0].doc.accommodatieDoc;
            cb({
                name: sportsHall.naam,
                address: {
                    postalCode: sportsHall.adres.postcode,
                    place: sportsHall.adres.plaats,
                    street: sportsHall.adres.straat,
                    houseNumber: sportsHall.adres.huisNr
                }
            });
        });
    });

    req.end();
}

function routeResource(request, response) {
    let filePath = './dist/basket-match-feed' + request.url;
    if (filePath === './dist/basket-match-feed/')
        filePath = './dist/basket-match-feed/index.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.ico':
            contentType = 'image/ico';
            break;
    }

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./dist/basket-match-feed/index.html', function (error, content) {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                });
            } else {
                console.log(filePath);
                console.log(error);
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end();
            }
        } else {
            response.writeHead(200, {'Content-Type': contentType});
            response.end(content, 'utf-8');
        }
    });
}

getAllTemseMatches(matches => {
    console.log('Fetched all matches');
    http.createServer((req, res) => {
        res.writeHead(200, {'Access-Control-Allow-Origin': '*'});

        const route = req.url.split('?')[0];

        if (!route.startsWith('/api')) {
            routeResource(req, res);
        } else {
            switch (route) {
                case '/api/all-matches':
                    res.write(JSON.stringify(matches));
                    res.end();
                    break;
                case '/api/match':
                    const matchGuid = req.url.split('?guid=')[1];
                    getPlayers(matchGuid, playerData => {
                        console.log('Fetched teams data');

                        getMatchRecords(matchGuid, records => {
                            console.log('Fetched match data');

                            const enrichedData = enrich(records, playerData);

                            res.write(JSON.stringify({matchData: matches, playerData, records: enrichedData}));
                            res.end();
                        });
                    });
                    break;
                case '/api/match-metadata':
                    const guid = req.url.split('?guid=')[1];
                    getMatchMetaData(guid, matchMetaData => {
                        console.log('Fetched match metadata');

                        res.write(JSON.stringify(matchMetaData));
                        res.end();
                    });
                    break;
                default:
                    break;
            }
        }
    }).listen(8081, () => console.log('Started server'));
});

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
