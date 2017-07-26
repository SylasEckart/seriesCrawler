const request = require('request')
, rp = require('request-promise-native')
, URL = require('url-parse')
, createArray = require('./helpers/createArray.js')
, initial = "http://api.tvmaze.com/singlesearch/shows?q="
, cheerio = require('cheerio')
, webtorrent = require('webtorrent')
, client = new webtorrent()
, subtitles = require('./subtitles.js')
, inquirer = require('inquirer')
,ProgressBar = require('progress')

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

populateEpisodes(questions);

async function populateEpisodes(questions) {
    let answers = await inquirer.prompt(questions)
    let response = await rp({uri: initial+answers.show,json: true, simple:true})
    response = await rp({uri: `http://api.tvmaze.com/shows/${response.id}/episodes`,json: true})
    let episodes = await createArray.init(response,answers.initialSeason,answers.initialEpisode)
    if(episodes.length > 0){ 
        let episodesByseason = [] 
        for (episodeShow of episodes){ 
            episodesByseason.push({'episode': episodeShow.episode, 'season': episodeShow.season,'site':`https://1337x.to/search/${answers.show} S${episodeShow.season}E${episodeShow.episode}/1/`}) 
        } 
        retrieveMagnets(episodesByseason,answers.show) 
    } 
    else{ 
            console.log('não tem episódio pra baixar') 
    } 
}
async function retrieveMagnets(episodesByseason,show){
    let episodeObj = episodesByseason.shift()
    let $ = await rp({uri: episodeObj.site,transform: body => cheerio.load(body)})
    let episodes = $('td.coll-1').children('.icon').next();
    if(episodes.length > 0){
        let episode = $("a:contains('HDTV')").attr('href')
        episode = `https://1337x.to${episode}`
        $ = await rp({uri: episode,transform: body => cheerio.load(body)})
        let magnet = $("a:contains('Magnet Download')").attr('href');
        torrentDownload(magnet,episodesByseason,show,episodeObj.season,episodeObj.episode)
    }
    else if(episodesByseason.length > 0){
        console.log("erro na busca")
        retrieveMagnets(episodesByseason,show)
    }
    else {
        console.log('mais nenhum episódio pra baixar')
        populateEpisodes(questions)
    }
}

function torrentDownload(magnet,episodesByseason,show,season,episode){
    ////pathtoSeries é totalmente relevante somente a minha máquina, navegue pelo folder pra escolher melhor lugar pra salvar
    let pathtoSeries = `../../../../../Vídeos/séries/${show}/temporada ${season}/${episode}`
    client.add(magnet, { path: pathtoSeries}, torrent => {
        console.log(`Baixando o arquivo ${torrent.name}`);
        console.log(`Baixando a legenda pro arquivo ${torrent.name}`)
        console.log(torrent.files)
        subtitles.init(torrent.name, pathtoSeries)
        let bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: 10000000000
        });
        torrent.on('download',bytes => {
            // console.log('progress: ' + Math.floor(torrent.progress * 100)+'%')
        })
        torrent.on('done', () => {
            console.log(`${torrent.name} acabou de baixar`);
            if(episodesByseason.length === 0 ){
                console.log('não tem mais episódio pra baixar')
                populateEpisodes(questions)
            }
            else {
            retrieveMagnets(episodesByseason,show)
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