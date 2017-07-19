/**
 * Created by sylas on 02/04/17.
 */
module.exports = {
    init: function (){
        let nd = new Date();
        let y = nd.getFullYear().toString();
        let m = (nd.getMonth() + 1).toString();
        let d = nd.getDate().toString();
        m = m.length < 2 ? `0${m}` : `${m}`;
        d = d.length < 2 ? `0${d}` : `${d}`;
        date = y + m + d;
        return date
    }
}
