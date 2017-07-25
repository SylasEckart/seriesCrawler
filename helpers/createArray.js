const getDate = require('./getDate.js');

module.exports = {
    init: function (body,initialSeason,initialEpisode) {
            let episodesByseason = []
            for (value of body) {
                let season = value.season.toString();
                let episode = value.number.toString();
                season = initialSeason.length === 2 ? `0${season}` : `${season}`;
                episode = initialEpisode.length === 2 ? `0${episode}` : `${episode}`;           
                if (season == initialSeason && episode == initialEpisode){
                    var initialDate = value.airdate.replace(/-/g,'');
                }
                let airDate = value.airdate.replace(/-/g,'');
                season = season.length < 2 ? `0${season}` : `${season}`;
                episode = episode.length < 2 ? `0${episode}` : `${episode}`;
                if (airDate >= initialDate && airDate <= getDate.init()) {
                    let obj = {'season': season, 'episode': episode};
                    episodesByseason.push(obj)
                }
            }
            return episodesByseason
    }
}

