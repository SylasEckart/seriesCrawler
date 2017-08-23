const OpenSubtitles = require('opensubtitles-api')
, os = new OpenSubtitles('OSTestUserAgentTemp')
, http = require('http')
, fs = require('fs')
,errorHandler = require('./helpers/error-handler.js').init;

exports.init = async (file,pathToSeries) => {
    try {
        let subtitles = await os.search({filename: file+'.mkv',sublanguageid: 'pob'})
        if (subtitles.pb) {
            console.log('Subtitle found:', subtitles);
            http.get(subtitles.pb.url,response =>{response.pipe(fs.createWriteStream(`${pathToSeries}/${file}.srt`))})
        }
        else{
            console.log(`não achei legenda`)
        }       
    } catch (err) {
        errorHandler(err)
    }
    
}