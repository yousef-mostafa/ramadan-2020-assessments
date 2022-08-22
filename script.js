const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
let sorted_topVoted = false , search_key = "";
// func to load video posts from db
  function loadVideo(videoEle) {
          let submit_date = new Date (videoEle.submit_date)
          let videoItem = document.createElement("div");
          videoItem.classList.add("card", "mb-3");
          videoItem.innerHTML = `
              <div class="card-body d-flex justify-content-between flex-row">
              <div class="d-flex flex-column">
                <h3>${videoEle.topic_title}</h3>
                <p class="text-muted mb-2">${videoEle.topic_details}</p>
                <p class="mb-0 text-muted">
                ${videoEle.expected_result && `<strong>Expected results: </strong> ${videoEle.expected_result}`}
                </p>
              </div>
              <div class="d-flex flex-column text-center">
                <a id="vote_ups_${videoEle._id}" class="btn btn-link">🔺</a>
                <h3 id="vote_${videoEle._id}">${videoEle.votes.ups - videoEle.votes.downs}</h3>
                <a id="vote_downs_${videoEle._id}" class="btn btn-link">🔻</a>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div>
                <span class="text-info">${videoEle.status}</span>
                &bullet; added by <strong>${videoEle.author_name}</strong> on
                <strong>${days[submit_date.getDay()]} ${
            months[submit_date.getMonth()]
          } ${submit_date.getDate()} ${submit_date.getFullYear()} at ${submit_date.getHours()}:${submit_date.getMinutes()}</strong> 
              </div>
              <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
              >
                <div class="badge badge-success">
                  ${videoEle.target_level}
                </div>
              </div>
            </div>
              `;
          return videoItem;
  }

// to delay request server in search until user write final letter
function debounce(fn , time){
  let timeout ;
  return function(...args){
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this , args), time);
  }
}
function getAllVideos(sorted_topVoted=false , search_key="") {
  let videoList = document.querySelector("#listOfRequests");
  videoList.innerHTML = "";
  // get all request from  '/video-request' and list them
  fetch("http://localhost:7777/video-request")
    .then((bolb) => bolb.json())
    .then((data) => {
      // data filtration
      if (sorted_topVoted)
        data = data.sort((prev , next) => {return (next.votes.ups - next.votes.downs) - (prev.votes.ups - prev.votes.downs) });
      
      if(search_key !== ""){
        const regExp =  new RegExp(search_key,'gi');
        data = data.filter(item => item.topic_title.match(regExp))
      }
      
      data.forEach((videoEle) => {
        videoList.append(loadVideo(videoEle));
        let vote_up = document.getElementById(`vote_ups_${videoEle._id}`);
        let vote_down = document.getElementById(`vote_downs_${videoEle._id}`);
        let vote
        vote_up.addEventListener("click" , () =>{
          vote = document.querySelector(`#vote_${videoEle._id}`);
          fetch('http://localhost:7777/video-request/vote',{
            method: 'PUT',
            headers: {'content-Type' :'application/json'},
            body:JSON.stringify({
              id: videoEle._id,
              vote_type: "ups"
            })
          }).then((bolb) => bolb.json())
          .then((data) => {
            vote.innerHTML = `${data.ups - data.downs}`
          })
        })
    
        vote_down.addEventListener("click" , () =>{
          vote = document.querySelector(`#vote_${videoEle._id}`);
          fetch('http://localhost:7777/video-request/vote',{
            method: 'PUT',
            headers: {'content-Type' :'application/json'},
            body:JSON.stringify({
              id: videoEle._id,
              vote_type: "downs"
            })
          }).then((bolb) => bolb.json())
          .then((data) => {
            vote.innerHTML = `${data.ups - data.downs }`
          })
        })
    })  
  })
}

document.addEventListener("DOMContentLoaded", () => {
  let formVideo = document.querySelector("#submitVideo");
  let sort_topVote = document.querySelector("#sort_topVote");
  let sort_new = document.querySelector("#sort_new");
  let search = document.querySelector("#search")
  getAllVideos(sorted_topVoted , search_key);
  
  // submit request
  formVideo.addEventListener("submit", (e) => {
    e.preventDefault();
    let dataForm = new FormData(formVideo);
    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: dataForm,
    }).then(() => {
      getAllVideos(sorted_topVoted , search_key);
      search.value = "";
    });
  });

  // for sort
  sort_topVote.addEventListener("click" , function(){
    sorted_topVoted = true;
    getAllVideos(sorted_topVoted , search_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-success");
    sort_new.classList.add("btn-success");
    sort_new.classList.remove("btn-primary");
  })
  sort_new.addEventListener("click" , function(){
    sorted_topVoted = false
    getAllVideos(sorted_topVoted , search_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-success");
    sort_topVote.classList.add("btn-success");
    sort_topVote.classList.remove("btn-primary");
  })

  search.addEventListener("input" , debounce(function(e) {
    search_key= e.target.value;
    getAllVideos(sorted_topVoted , search_key);
  } , 300))
});
