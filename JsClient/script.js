//DOM objects
const getTimeBtn = document.getElementById('getTime');
const fileList = document.getElementById('fileSelect');
const vidFrame = document.getElementById('vidFrame');
const actionBtn = document.getElementById('messageServer');
let myname = "hello";

//When page loads, initialize things
document.body.onload = (e) => {
    getTime();
    fillList();
};

//Update the video when dropdown value changes
fileList.onchange = (e) => { 
  vidFrame.setAttribute("src", fileList.value);
}

//update the time and refresh file list on press
getTimeBtn.onclick = (e) => {
  getTime();
  fillList();
};

//send a request to the server on buton press
actionBtn.onclick = (e) => {
  postMessage();
}

//Retrieve time from server
async function getTime(){
  fetch('http://127.0.0.1:8080/time')
  .then(response => response.json())
  .then(data => document.getElementById("time").innerHTML=data);
}

//Send request to server, not implemented well yet...
async function postMessage(){
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch("http://127.0.0.1:8080/action", {
    method: "POST",
    body: JSON.stringify({ name: "example", path: "/sub"}),
    headers: myHeaders,
  });
  const json = await response;
  console.log(json);
}


//Retreive a json object containing files in 'public' directory
//TODO: Add support for sub-directories
async function getFileList(){
  const response = await fetch('http://127.0.0.1:8080/filelist');
  const json = await response.json();
  return await json;
}

//Populate the dropdown menu
/*async function fillList(){
  fileList.innerHTML = "";
  let list = await getFileList();
  console.log(list);
  for(let i = 0; i < list.length; i++){
    let realPath = '/files/' + list[i].path.slice(10);
    fileList.options[fileList.options.length] = new Option(list[i].path.slice(10), realPath);
  }
}*/

//Populate the dropdown menu
async function fillList(){
  fileList.innerHTML = "";
  let list = await getFileList();
  console.log(list);
  for(let i = 0; i < list.length; i++){
    let realPath = '/files/' + list[i].path.slice(10);
    fileList.options[fileList.options.length] = new Option(list[i].path.slice(10), realPath);
    let ul = document.getElementById("fileMenu");
    let li = document.createElement("li");
    let a = document.createElement("a");
    li.appendChild(document.createTextNode(list[i].path.slice(10)));
    li.setAttribute("id", "fileOption");
    li.setAttribute("onclick", "test(\""+realPath+"\")");
    li.setAttribute("id", "fileLink");
    li.appendChild(a);
    ul.appendChild(li);
  }
}

function test(path){
  console.log(path);
}