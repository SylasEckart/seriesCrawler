const request = require('request')
, rp = require('request-promise-native')
, URL = require('url-parse')
, createArray = require('./helpers/createArray.js')
, initial = "http://api.tvmaze.com/singlesearch/shows?q="
, cheerio = require('cheerio')
, webtorrent = require('webtorrent')
, client = new webtorrent()
, fs = require('fs')
, subtitles = require('./subtitles.js')
, userPath = 'Vídeos'
let shows = ['preacher']
findId();

function findId() {
    if (shows.length > 0) {
        show = shows.shift()
        console.log(`baixando ${show}`)
        rp({uri: initial+show,json: true, simple:true})
        .then(body => getEpisodesbyseason(body.id))
        .catch(err => errorHandler(err));
    }
    else{
        console.log('Já baixei todas as séries')
        process.exit()
    }
    
}
function getEpisodesbyseason(specific){
    rp({uri: `http://api.tvmaze.com/shows/${specific}/episodes`,json: true})
    .then(body => {
        if(createArray.init(body).length === 0){
            console.log(`não saíram episódios novos`);
            process.exit();
        }
        else{
            listEpisodes(createArray.init(body))
        }
    })
    .catch(err =>  errorHandler(err));
}
function listEpisodes(episodesByseason){
    let episodeShow = episodesByseason.shift();
    let episodeSite = `https://1337x.to/search/${show} S${episodeShow.season}E${episodeShow.episode}/1/`
    console.log(episodeSite)
    rp({uri: episodeSite,transform: body => cheerio.load(body)})
    .then( $ => {
        let episodes = $('td.coll-1').children('.icon').next();
        if(episodes.length > 0){
            filterEpisodes(episodes,episodesByseason,episodeShow.season)
        }
        else if(episodesByseason.length > 0){
            console.log("erro na busca")
            listEpisodes(episodesByseason)
        }
        else {
            console.log('mais nenhum episódio pra baixar')
            findId()
        }
    })
    .catch(err => errorHandler(err));
}
function filterEpisodes(episodes,episodesByseason,season){
    let i = 0
    episodes.each(function (i) {
        if(this.attribs.href.indexOf('720p') === -1 && this.attribs.href.indexOf('1080p') === -1 && i < 1){
            let episode = this.attribs.href;
            episode = `https://1337x.to${episode}`;
            retrieveMagnet(episode,episodesByseason,season)
            i++
        }
    })
}
function retrieveMagnet(episode,episodesByseason,season){
    rp({uri: episode,transform: body => cheerio.load(body)})
    .then( $ => {
        let magnet = $('.btn-magnet').attr('href');
        torrentDownload(magnet,episodesByseason,season)
    })
    .catch(err => errorHandler(err));
}
function torrentDownload(magnet,episodesByseason,season){
    let pathtoSeries = `../vídeos/séries/${show}/temporada ${season}`
    client.add(magnet, { path: pathtoSeries}, function (torrent) {
        console.log(`Baixando o arquivo ${torrent.name}`);
        console.log(`Baixando a legenda pro arquivo ${torrent.name}`)
        console.log(torrent.files)
        subtitles.init(torrent.name, pathtoSeries)
        torrent.on('download', function (bytes) {
            console.log('download speed: ' + (torrent.downloadSpeed / 1048576).toFixed(3) + 'MB/sec')
            console.log('progress: ' + Math.floor(torrent.progress * 100)+'%')
        })
        torrent.on('done', function () {
            console.log(`${torrent.name} acabou de baixar`);
            if(episodesByseason.length === 0 ){
                findId()
            }
            else {
            listEpisodes(episodesByseason)
            }
        })
    })
}
function errorHandler(err){
    if(err.statusCode === 404){
        console.log(err.error.previous.message)
        console.log('página não encontrada')
        findId()
    }
}