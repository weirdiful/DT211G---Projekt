const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
};
fetch("https://www.dnd5eapi.co/api/2014/monsters", requestOptions).then((response)=>response.text()).then((result)=>console.log(result)).catch((error)=>console.error(error));

//# sourceMappingURL=index.d4a8b14f.js.map
