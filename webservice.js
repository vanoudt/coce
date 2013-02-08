var express = require('express');
var app = express();
var coce = require('./coce');


app.listen(coce.config.port);

app.get('/', function(req, res) {
    res.send('Welcome to coce');
});

app.get('/cover', function(req, res) {
    var ids = req.query.id;
    if (ids === undefined || ids.length < 8) {
        res.send("id parameter is missing");
        return;
    }
    ids = ids.split(',');
    var providers = req.query.provider;
    providers = providers == undefined ? Coce.config.providers : providers.split(',');

    var repo = new coce.UrlRepo(ids, providers);
    repo.fetch();
    console.log("fin boucle => count: " + repo.count);
    
    repo.waitFetching(5, 1000, function() {
        console.log( repo.full() ? 'On a tout' : 'Pas tout' );
        if ( req.query.all !== undefined ) {
            res.send(repo.url);
            return;
        }
        // URL are picked up by provider priority order (request provider parameter)
        var ret = {};
        for (var id in repo.url) {
            for (var j=0, provider; provider = providers[j]; j++) {
                var url = repo.url[id][provider];
                if (url !== undefined) { ret[id] = url; break; }
            }
        }
        var callback = req.query.callback;
        res.send(callback == undefined
                 ? ret
                 : callback + '(' + JSON.stringify(ret) + ')' );
    });
});

