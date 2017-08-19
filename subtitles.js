const OpenSubtitles = require('opensubtitles-api')
, os = new OpenSubtitles('OSTestUserAgentTemp')
, http = require('http')
, fs = require('fs');

exports.init = async (file,path) => {
    try {
        let subtitles = await os.search({filename: file+'.mkv',sublanguageid: 'pob'})
        if (subtitles.pb) {
            console.log('Subtitle found:', subtitles);
            http.get(subtitles.pb.url,response =>{
                response.pipe(fs.createWriteStream(`${file}.srt`))
            })
        }
        else{
            console.log(`não achei legenda`)
        }       
    } catch (err) {
        errorHandler(err)
    }
    
}