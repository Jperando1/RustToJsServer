const getTimeBtn = document.getElementById("getTime");

document.onload = (event) => {
    getTime();
  };

  getTimeBtn.onclick = (e) => {
    getTime();
  };

  async function getTime(){
    fetch('http://127.0.0.1:8080/time') // api for the get request
    .then(response => response.json())
    .then(data => document.getElementById("time").innerHTML=data);
  }W