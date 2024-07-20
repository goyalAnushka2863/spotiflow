let currFolder;
let songs;
async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playNow">
                                <span>Play now</span>
                                <img src="img/play.svg" class="invert" alt="">
                            </div>
                        </li>`
    }
    // var audio = new Audio(songs[0]);
    // // audio.play();
    // audio.addEventListener("loadeddata",()=>{
    //     let duration = audio.duration
    //     console.log(duration)
    // })
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}
let currentSong = new Audio()

const playmusic = (track, pause=false)=>{
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")    
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder)
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()  ;   
            console.log(response)   
        
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div class="card" data-folder="${folder}">
                <div class="play">
                    <div class="playy">
                        <svg style="width: 25px; height: 25px;" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
            Array.from(document.getElementsByClassName("card")).forEach(e=>{
                e.addEventListener("click", async item=>{
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                    playmusic(songs[0])
                })
            })
        }            
    }
}

async function main(){
    await getSongs("songs/ncs")
    playmusic(songs[0], true)

    displayAlbums()

    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 + "%"
    })
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/ e.target.getBoundingClientRect().width)* 100
        document.querySelector(".circle").style.left =  percent + "%"
        currentSong.currentTime = (currentSong.duration) * percent/100
    })
    document.querySelector(".hamburger").addEventListener("click", e=>{
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close").addEventListener("click", e=>{
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click",e=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(index-1 >= 0){
            playmusic(songs[index-1])
        }``
    })
    
    next.addEventListener("click",e=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(index+1<songs.length){
            playmusic(songs[index+1])
        }
        console.log(length)
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",e=>{
        console.log(e)
        currentSong.volume = parseInt(e.target.value)/100
    })
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}
main()