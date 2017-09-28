const rp = require('request-promise-native')
, createArray = require('./helpers/create-array.js').init
, errorHandler = require('./helpers/error-handler.js').init
, initial = "http://api.tvmaze.com/singlesearch/shows?q="
, load = require('cheerio').load
, client = require('webtorrent')()
, subtitles = require('./subtitles.js').init
, inquirer = require('inquirer').prompt
, ProgressBar = require('progress');

let questions = [
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
    try {
        let answers = await inquirer(questions)
        let response = await rp({uri: initial+answers.show,json: true, simple:true,headers: {'User-Agent': 'seriesCrawler'}})
        response = await rp({uri: `https://oneom.tk/search/serial?tvmaze_id=${response.id}`, json: true,simple:true, headers: {'User-Agent': 'seriesCrawler'}})
        response = await rp({uri: `https://oneom.tk/serial/${response.serials[0].id}`, json: true,simple:true, headers: {'User-Agent': 'seriesCrawler'}})
        console.log(response);
        let episodes = createArray(response,answers.initialSeason,answers.initialEpisode)
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
    } catch (err) {errorHandler(err)}
     
}
async function retrieveMagnets(episodesByseason,show){
    try {
        let episodeObj = episodesByseason.shift()
        let $ = await rp({uri: episodeObj.site,transform: body => load(body)}) 
        let episodes = $('td.coll-1').children('.icon').next();
        if(episodes.length > 0){
            let episode = $("a:contains('HDTV')").attr('href')
            episode = `https://1337x.to${episode}`
            $ = await rp({uri: episode,transform: body => load(body)})
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
    } catch (err) {errorHandler(err)}
}

function torrentDownload(magnet,episodesByseason,show,season,episode){
    ////pathtoSeries é totalmente relevante somente a minha máquina, navegue pelo folder pra escolher melhor lugar pra salvar
    let pathtoSeries = `../../../../../Vídeos/séries/${show}/temporada ${season}/${episode}`
    client.add(magnet, { path: pathtoSeries}, torrent => {
        console.log(`Baixando o arquivo ${torrent.name}`)
        console.log(`Baixando a legenda pro arquivo ${torrent.name}`)
        subtitles(torrent.name, pathtoSeries)
        let bar = new ProgressBar('  downloading [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: torrent.length
        });

        torrent.on('download',bytes => {
             bar.tick(bytes);
             
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

