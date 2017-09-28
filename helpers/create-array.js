const getDate = require('./get-date.js').init;

exports.init = (body,initialSeason,initialEpisode) => {
        let episodesByseason = []
        let initialDate;
        for (value of body) {
            let season = initialSeason.length === 2 && initialSeason < 10 ? `0${value.season.toString()}` : `${value.season.toString()}`;
            let episode = initialEpisode.length === 2 && initialEpisode < 10 ? `0${value.number.toString()}` : `${value.number.toString()}`;           
            if (season == initialSeason && episode == initialEpisode){
                initialDate = value.airdate.replace(/-/g,'');
            }
            let airDate = value.airdate.replace(/-/g,'');
            season = season.length < 2 ? `0${season}` : `${season}`;
            episode = episode.length < 2 ? `0${episode}` : `${episode}`;
            if (airDate >= initialDate && airDate <= getDate(new Date())) {
                episodesByseason.push({'season': season, 'episode': episode})
            }
        }
        return episodesByseason
    }

