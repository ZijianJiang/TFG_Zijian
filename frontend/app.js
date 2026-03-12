async function generate(){

const data = {
  niche: document.getElementById("niche").value,
  audience: document.getElementById("audience").value,
  platform: document.getElementById("platform").value,
  goal: document.getElementById("goal").value,
  style: document.getElementById("style").value
}

const response = await fetch("http://localhost:3000/generate-script",{
  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  body: JSON.stringify(data)
})

const result = await response.json()

console.log(result) // para ver que llega

document.getElementById("result").innerText = result.script

}