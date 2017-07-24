const OpenSubtitles = require('opensubtitles-api')
, os = new OpenSubtitles('OSTestUserAgentTemp')
, http = require('http')
, fs = require('fs');

module.exports = {
    init: function(file,path){
        os
        .search({filename: file+'.mkv',sublanguageid: 'pob'})
        .then(subtitles => {
            if (subtitles.pb) {
                console.log('Subtitle found:', subtitles);
                let episode = fs.createWriteStream(`${file}.srt`);
                http.get(subtitles.pb.url,response =>{response.pipe(episode)})
            }
            else {
                console.log(`Não achei legenda`);
            }
        })          
        .catch(err => console.log(err));
    }
}