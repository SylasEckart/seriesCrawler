exports.init = nd => {
        let m = (nd.getMonth() + 1).toString()
        let d = nd.getDate().toString()
        m = m.length < 2 ? `0${m}` : `${m}`;
        d = d.length < 2 ? `0${d}` : `${d}`;
        console.log(nd.getFullYear().toString()+m+d)
        return nd.getFullYear().toString()+m+d
    }
