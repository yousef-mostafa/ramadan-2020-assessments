let isAdmin = false;
if (!localStorage.length) {
  window.location.replace("http://127.0.0.1:5500/login.html")
}
else if (localStorage.getItem("email") === "y1182001@gmail.com" && localStorage.getItem("name")=== "admin" ){
  isAdmin = true
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
let sorted_topVoted = false, search_key = "", filter_key = "ALL";

// func to load video posts from db
function loadVideo(videoEle) {
  let submit_date = new Date(videoEle.submit_date)
  let videoItem = document.createElement("div");
  videoItem.classList.add("card", "mb-3");
  videoItem.innerHTML = `
              ${isAdmin ? `<div class="card-header d-flex flex-row justify-content-between">
              <div class="w-25">
                <select class="form-control mr-5" id="video_statue_${videoEle._id}">
                <option value="new">NEW</option>
                <option value="planned">PLANNED</option>
                <option value="done">DONE</option>
                </select>
              </div>
              <div class="w-100 mx-5 input-group">
                <input type="text" name="videoID" id="videoID_${videoEle._id}" class="form-control" placeholder="Enter your youtube video ID">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary px-4" id="save_videoID_${videoEle._id}">Save</button>
                </div>
              </div>
              <div>
                <button class="btn btn-danger px-5" id="delete_${videoEle._id}">Delete</button>
              </div>
            </div>`:""}
            
              <div class="card-body d-flex justify-content-between flex-row">
              <div class="d-flex flex-column">
                <h3>${videoEle.topic_title}</h3>
                <p class="text-muted mb-2">${videoEle.topic_details}</p>
                <p class="mb-0 text-muted">
                ${videoEle.expected_result && `<strong>Expected results: </strong> ${videoEle.expected_result}`}
                </p>
              </div>
              <div class="d-flex flex-row">
                <iframe id="iframe_${videoEle._id}" width="300" height="115" src="https://www.youtube.com/embed/${videoEle.video_ref.link}" class="${videoEle.video_ref.link ? "": "d-none"}"></iframe>
                <div class="d-flex flex-column text-center mx-4">
                  <a id="vote_ups_${videoEle._id}" class="btn btn-link">🔺</a>
                  <h3 id="voteScore_${videoEle._id}">${videoEle.votes.ups.length - videoEle.votes.downs.length}</h3>
                  <a id="vote_downs_${videoEle._id}" class="btn btn-link">🔻</a>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div>
                <span class="${videoEle.status === "done" ? "text-success font-weight-bold" : "text-info"}" id="status_${videoEle._id}">${videoEle.status.toUpperCase()}</span>
                &bullet; added by <strong>${videoEle.author_name}</strong> on
                <strong>${days[submit_date.getDay()]} ${months[submit_date.getMonth()]
    } ${submit_date.getDate()} ${submit_date.getFullYear()} at ${submit_date.getHours()}:${submit_date.getMinutes()}</strong> 
              </div>
              <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
                <div class="badge badge-success">
                  ${videoEle.target_level}
                </div>
              </div>
            </div>
              `;
  return videoItem;
}

// *to delay request server in search or validation until user write final letter
function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  }
}

function voteSystem(videoEle, voteList, vote_type) {
  let vote_up = document.getElementById(`vote_ups_${videoEle._id}`);
  let vote_down = document.getElementById(`vote_downs_${videoEle._id}`);

  if (isAdmin || videoEle.status === "done") {
    vote_up.style.cursor = "not-allowed"
    vote_down.style.cursor = "not-allowed"
    vote_up.style.opacity = 0.5
    vote_down.style.opacity = 0.5;
    return;
  }

  // to make vote_type optional
  if (!vote_type) {
    if (voteList.ups.includes(localStorage.getItem("email")))
      vote_type = "ups"
    else if (voteList.downs.includes(localStorage.getItem("email")))
      vote_type = "downs"
    else
      return;
  }
  let vote_dir = vote_type === "ups" ? vote_up : vote_down;
  let vote_other_dir = vote_type === "ups" ? vote_down : vote_up;
  
  if (voteList[vote_type].includes(localStorage.getItem("email"))) {
    vote_dir.style.opacity = 1
    vote_other_dir.style.opacity = 0.5
  }
  else {
    vote_dir.style.opacity = 1
    vote_other_dir.style.opacity = 1
  }
}

function getAllVideos(sorted_topVoted = false, search_key = "", filter_key ="ALL") {
  let videoList = document.querySelector("#listOfRequests");
  videoList.innerHTML = "";
  // get all request from  '/video-request' and list them
  fetch("http://localhost:7777/video-request")
    .then((bolb) => bolb.json())
    .then((data) => {
      // data filtration
      if (sorted_topVoted)
        data = data.sort((prev, next) => { return (next.votes.ups.length - next.votes.downs.length) - (prev.votes.ups.length - prev.votes.downs.length) });

      if (search_key !== "") {
        const regExp = new RegExp(search_key, 'gi');
        data = data.filter(item => item.topic_title.match(regExp))
      }
      if (filter_key !== "ALL"){
        const regExp = new RegExp(filter_key, 'gi');
        data = data.filter(item => item.status.match(regExp))
      }

      data.forEach((videoEle) => {
        videoList.append(loadVideo(videoEle));
        // for vote function
        let vote = document.querySelector(`#voteScore_${videoEle._id}`);
        let vote_btns = document.querySelectorAll(`[id^=vote_][id$=_${videoEle._id}]`);
        voteSystem(videoEle, videoEle.votes)
        // all admin functions
        if (isAdmin){
          let delete_btn = document.querySelector(`#delete_${videoEle._id}`);
          let video_ID = document.querySelector(`#videoID_${videoEle._id}`);
          let save_video_ID = document.querySelector(`#save_videoID_${videoEle._id}`);
          let video_statue = document.querySelector(`#video_statue_${videoEle._id}`);
          let status_span = document.querySelector(`#status_${videoEle._id}`);
          let video_frame = document.querySelector(`#iframe_${videoEle._id}`)
          // to set values from db on load
          video_statue.value = videoEle.status;
          video_ID.value = videoEle.video_ref.link;           

          delete_btn.addEventListener("click" , ()=>{
            fetch('http://localhost:7777/video-request', {
              method: 'DELETE',
              headers: { 'content-Type': 'application/json' },
              body: JSON.stringify({ id: videoEle._id})
            }).then((bolb) => bolb.json())
              .then((data) => {
                console.log(data);
                getAllVideos(sorted_topVoted, search_key , filter_key);
              })
          })

          save_video_ID.addEventListener("click" , function(){
            if (video_ID.value){
              video_ID.classList.remove("is-invalid")
              fetch('http://localhost:7777/video-request', {
                method: 'PUT',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify({ 
                  id: videoEle._id,
                  status: "done" ,
                  resVideo: video_ID.value
                })
              }).then((bolb) => bolb.json())
              .then((data) => {
                video_ID.value = data.video_ref.link;
                status_span.classList.remove("text-info")
                status_span.classList.add("text-success","font-weight-bold")
                status_span.innerHTML = data.status.toUpperCase();
                video_statue.value = data.status;
                video_frame.classList.remove("d-none")
                video_frame.src = `https://www.youtube.com/embed/${data.video_ref.link}`;
              })
            }
            else{
              video_ID.classList.add("is-invalid");
              video_ID.addEventListener("input", function () {
                this.classList.remove("is-invalid")
              });
            }
          })

          video_statue.addEventListener("change" , function(e){
            fetch('http://localhost:7777/video-request', {
              method: 'PUT',
              headers: { 'content-Type': 'application/json' },
              body: JSON.stringify({
                id: videoEle._id,
                status: e.target.value,
                resVideo: e.target.value !== "done" ? "": "videoEle.video_ref.link"
              })
            }).then((bolb) => bolb.json())
              .then((data) => {
                if (data.status !== "done"){
                  status_span.classList.add("text-info")
                  status_span.classList.remove("text-success","font-weight-bold")
                }
                status_span.innerHTML = data.status.toUpperCase();
                video_ID.value = "";
                video_frame.classList.add("d-none")
            })
          })
        }
        // all user functions
        else{
        vote_btns.forEach(btn => {
          let [, vote_type, id] = btn.getAttribute("id").split("_");//
          btn.addEventListener("click", function () {
            if (!isAdmin && videoEle.status !== "done"){
              fetch('http://localhost:7777/video-request/vote', {
                method: 'PUT',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify({ id, vote_type, user_email: localStorage.getItem("email") })
              }).then((bolb) => bolb.json())
                .then((data) => {
                  vote.innerHTML = `${data.ups.length - data.downs.length}`;
                  voteSystem(videoEle, data, vote_type)
                })
            }
          })
        });
        }
      })
    })
}

document.addEventListener("DOMContentLoaded", () => {
  getAllVideos(sorted_topVoted, search_key, filter_key);

  let formVideo = document.querySelector("#submitVideo");
  let sort_topVote = document.querySelector("#sort_topVote");
  let sort_new = document.querySelector("#sort_new");
  let search = document.querySelector("#search");
  let logout_btn = document.querySelector("#logout");
  let username = document.querySelector("#username");
  let filter = document.querySelector("#filter").classList.remove("d-none");
  let filter_btn = document.querySelectorAll("#filter button");

  filter_btn.forEach(btn => {
    btn.addEventListener("click", function () {
      // to remove active color 
      filter_btn.forEach(btn => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary")
      })
      // to add active color
      this.classList.add("btn-primary");
      this.classList.remove("btn-secondary");
      filter_key = btn.innerHTML
      getAllVideos(sorted_topVoted, search_key , filter_key);
    })
  })

  isAdmin ? formVideo.classList.add("d-none") : "";

  // to load username
  username.innerHTML = localStorage.getItem("name");

  // submit request
  formVideo.addEventListener("submit", (e) => {
    e.preventDefault();
    let dataForm = new FormData(formVideo);
    dataForm.append("author_name", localStorage.getItem("name"))
    dataForm.append("author_email", localStorage.getItem("name"))

    // clint-side validation
    let validationArray = []
    let input_text = formVideo.querySelector("input[type=text]");
    let first_input_textArea = formVideo.querySelector("textarea");

    function isEmpty(field) {
      if (field.value === "") {
        field.classList.add("is-invalid");
        return false;
      }
      else {
        field.classList.remove("is-invalid");
        return true;
      }
    }

    validationArray.push(isEmpty(first_input_textArea));

    // not empty && special validation for topic name < 100
    validationArray.push(isEmpty(input_text));
    if (isEmpty(input_text)) {
      let feedback_topic = formVideo.querySelector("input[name = topic_title] + div");
      if (input_text.value.length > 100) {
        feedback_topic.innerHTML = "please enter topic name less than 100 letter!"
        input_text.classList.add("is-invalid");
        validationArray.push(false);
      }
      else {
        feedback_topic.innerHTML = "please enter your topic name!";
        input_text.classList.remove("is-invalid");
        validationArray.push(true);
      }
    };

    // * to remove invalid massage on fill 
    let allInvalidEle = formVideo.querySelectorAll(".is-invalid");
    if (allInvalidEle.length) {
      allInvalidEle.forEach(element => {
        element.addEventListener("input", function () {
          this.classList.remove("is-invalid")
        });
        return;
      })
    }

    // check total validation && send data to DB
    if (validationArray.every(item => item === true)) {
      fetch("http://localhost:7777/video-request", {
        method: "POST",
        body: dataForm,
      }).then(() => {
        getAllVideos(sorted_topVoted, search_key, filter_key);
        search.value = "";
        // TODO clear inputs after submit
        // dataForm.forEach(item => item.value = "")
      });
    }
  });

  // for sort
  sort_topVote.addEventListener("click", function () {
    sorted_topVoted = true;
    getAllVideos(sorted_topVoted, search_key, filter_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_new.classList.add("btn-secondary");
    sort_new.classList.remove("btn-primary");
  })
  sort_new.addEventListener("click", function () {
    sorted_topVoted = false
    getAllVideos(sorted_topVoted, search_key , filter_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_topVote.classList.add("btn-secondary");
    sort_topVote.classList.remove("btn-primary");
  })

  // search by topic
  search.addEventListener("input", debounce(function (e) {
    search_key = e.target.value;
    getAllVideos(sorted_topVoted, search_key , filter_key);
  }, 300))

  // logout to clear local storage
  logout_btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("http://127.0.0.1:5500/login.html")
  })

});
