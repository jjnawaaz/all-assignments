
const obj = {
    method: "GET"
}

function printbody(json){
    console.log(json)
}
function callbackfn(value){
    value.json().then(printbody)
}

fetch('http://localhost:3000/calculatesum?counter=10',obj).then(callbackfn)