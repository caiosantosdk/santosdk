const js2xmlparser = require("js2xmlparser");
const xml2js       = require('xml2js');

export const parse = (xml:string):any => new Promise((resolve,reject) => xml2js.parseString(xml,(err:any,result:any)=>err?reject(err):resolve(result)));

export const stringify = (root: string, obj: Object) => {
    const options = {
        declaration : { encoding : "UTF-8" },
        format : { doubleQuotes: true }
    };
    return js2xmlparser.parse(root, obj, options);
}
