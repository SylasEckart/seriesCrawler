exports.init = err =>{
    if(err.statusCode === 404){
        console.log(err.error.previous.message)
        console.log('página não encontrada')
        console.log('não tem mais episódio pra baixar')
    }
    else{
        debugger;
        console.log(err)
    }
}