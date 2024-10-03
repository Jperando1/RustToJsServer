//DOM objects
const getTimeBtn = document.getElementById('getTime');
const fileList = document.getElementById('fileSelect');
const fileMenu = document.getElementById('fileMenu');
const vidFrame = document.getElementById('vidFrame');
const actionBtn = document.getElementById('messageServer');
let myname = "hello";
let currentFiles = [];
let fileMenuElements = [];
let dirStack = ["/"];
//When page loads, initialize things
document.body.onload = async (e) => {
    getTime();
    await getFileList();
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
actionBtn.onclick = async (e) => {
  console.log(await getSubDir("sub"));
}

//Retrieve time from server
async function getTime(){
  fetch('http://127.0.0.1:8080/time')
  .then(response => response.json())
  .then(data => document.getElementById("time").innerHTML=data);
}

//Send request to server, not implemented well yet...
async function postMessage(name, msg){
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch("http://127.0.0.1:8080/action", {
    method: "POST",
    body: JSON.stringify({ name: name, msg: msg}),
    headers: myHeaders,
  });
  console.log(response);
}



//Retreive a json object containing files in 'public' directory
//TODO: Add support for sub-directories
async function getFileList(){
  const response = await fetch('http://127.0.0.1:8080/filelist');
  const json = await response.json();
  currentFiles = json;
  return await json;
}


async function getSubDir(dir){
  if(dir != ""){
    dirStack.push(dir + "/");
  }
  let fullDir = "";
  for(let i = 0; i < dirStack.length; i++){
    fullDir += dirStack[i];
  }
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const response = await fetch("http://127.0.0.1:8080/action", {
    method: "POST",
    body: JSON.stringify({ name: "cd", msg: fullDir}),
    headers: myHeaders,
  });
  const json = await response.json();
  console.log(json);
  currentFiles = json;
  fillList();
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
  fileMenu.innerHTML = "";
  list = currentFiles;
  console.log(list);
  let ul = document.getElementById("fileMenu");
  if(dirStack.length > 1){
    let backDir = document.createElement("li");
    backDir.setAttribute("onclick", "dirStack.pop(), getSubDir(\"\"), fillList()");
    backDir.appendChild(document.createTextNode("../" + dirStack[dirStack.length-1].slice(0, dirStack[dirStack.length-1].length-1)));
    backDir.setAttribute("id", "fileOption");
    backDir.setAttribute("id", "backDir");
    ul.appendChild(backDir);
  }
  for(let i = 0; i < list.length; i++){
    let realPath = '/files/' + list[i].path.slice(10);
    fileList.options[fileList.options.length] = new Option(list[i].path.slice(10), realPath);
    
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(list[i].path.split("/")[list[i].path.split("/").length-1]));
    li.setAttribute("id", "fileOption");
    li.setAttribute("onclick", "test(\""+realPath+"\", this.getAttribute('class'))");
    li.setAttribute("id", "fileLink");
    if(list[i].is_dir){
      li.setAttribute("class", "dir");
    }
    ul.appendChild(li);
    fileMenuElements.push(li);
  }
}

function test(path, className){
  console.log(className);
  if(className == "dir"){
    console.log("dir");
    let temp = path.split("/");
    temp = temp[temp.length-1];
    getSubDir(temp);
  }
  console.log(path);
}