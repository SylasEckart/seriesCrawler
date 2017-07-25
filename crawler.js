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
, inquirer = require('inquirer');

var questions = [
  {
    type: 'input',
    name: 'show',
    message: 'Quer baixar qual serie?'
  },
  {
    type: 'input',
    name: 'initialSeason',
    message: 'Quer baixar a partir de qual temporada ?'
  },
  {
    type: 'input',
    name: 'initialEpisode',
    message: 'E a partir de qual episódio?',
  }
];

iterateEpisodes(questions);
async function iterateEpisodes(questions) {
    let answers = await inquirer.prompt(questions)
    let response = await rp({uri: initial+answers.show,json: true, simple:true})
    response = await rp({uri: `http://api.tvmaze.com/shows/${response.id}/episodes`,json: true})
    let episodes = await createArray.init(response,answers.initialSeason,answers.initialEpisode)
    if(episodes.length > 0){ 
        let episodesByseason = [] 
        for (episodeShow of episodes){ 
            episodesByseason.push(`https://1337x.to/search/${answers.show} S${episodeShow.season}E${episodeShow.episode}/1/`) 
        } 
        listEpisodes(episodesByseason) 
    } 
    else{ 
            console.log('não tem episódio pra baixar') 
    } 
}
function listEpisodes(episodesByseason){
    let episodeSite = episodesByseason.shift()
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
            iterateEpisodes()
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
        let magnet = $("a:contains('Magnet Download')").attr('href');
        console.log(magnet)
        torrentDownload(magnet,episodesByseason,season)
    })
    .catch(err => errorHandler(err));
}
function torrentDownload(magnet,episodesByseason,season){
    let pathtoSeries = `../vídeos/séries/nomedaserie/temporada ${season}`
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
                console.log('não tem mais episódio pra baixar')
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
        console.log('não tem mais episódio pra baixar')
    }
}