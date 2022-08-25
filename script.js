if (!localStorage.length) {
  window.location.replace("http://127.0.0.1:5500/login.html")
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
let sorted_topVoted = false, search_key = "";

// func to load video posts from db
function loadVideo(videoEle) {
  let submit_date = new Date(videoEle.submit_date)
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
                <h3 id="voteScore_${videoEle._id}">${videoEle.votes.ups.length - videoEle.votes.downs.length}</h3>
                <a id="vote_downs_${videoEle._id}" class="btn btn-link">🔻</a>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div>
                <span class="text-info">${videoEle.status}</span>
                &bullet; added by <strong>${videoEle.author_name}</strong> on
                <strong>${days[submit_date.getDay()]} ${months[submit_date.getMonth()]
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

// *to delay request server in search or validation until user write final letter
function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  }
}

function voteSystem(videoID, voteList, vote_type) {
  // to make vote_type optional
  if (!vote_type) {
    if (voteList.ups.includes(localStorage.getItem("email")))
      vote_type = "ups"
    else if (voteList.downs.includes(localStorage.getItem("email")))
      vote_type = "downs"
    else
      return;
  }
  let vote_up = document.getElementById(`vote_ups_${videoID}`);
  let vote_down = document.getElementById(`vote_downs_${videoID}`);

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

function getAllVideos(sorted_topVoted = false, search_key = "") {
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

      data.forEach((videoEle) => {
        videoList.append(loadVideo(videoEle));
        let vote = document.querySelector(`#voteScore_${videoEle._id}`);
        let vote_btns = document.querySelectorAll(`[id^=vote_][id$=_${videoEle._id}]`);
        voteSystem(videoEle._id, videoEle.votes)
        vote_btns.forEach(btn => {
          let [, vote_type, id] = btn.getAttribute("id").split("_");//
          btn.addEventListener("click", function () {
            fetch('http://localhost:7777/video-request/vote', {
              method: 'PUT',
              headers: { 'content-Type': 'application/json' },
              body: JSON.stringify({ id, vote_type, user_email: localStorage.getItem("email") })
            }).then((bolb) => bolb.json())
              .then((data) => {
                vote.innerHTML = `${data.ups.length - data.downs.length}`;
                voteSystem(id, data, vote_type)
              })
          })
        });
      })
    })
}

document.addEventListener("DOMContentLoaded", () => {

  let formVideo = document.querySelector("#submitVideo");
  let sort_topVote = document.querySelector("#sort_topVote");
  let sort_new = document.querySelector("#sort_new");
  let search = document.querySelector("#search");
  let logout_btn = document.querySelector("#logout");
  let username = document.querySelector("#username")
  getAllVideos(sorted_topVoted, search_key);

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
        getAllVideos(sorted_topVoted, search_key);
        search.value = "";
      });
    }
  });

  // for sort
  sort_topVote.addEventListener("click", function () {
    sorted_topVoted = true;
    getAllVideos(sorted_topVoted, search_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_new.classList.add("btn-secondary");
    sort_new.classList.remove("btn-primary");
  })
  sort_new.addEventListener("click", function () {
    sorted_topVoted = false
    getAllVideos(sorted_topVoted, search_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_topVote.classList.add("btn-secondary");
    sort_topVote.classList.remove("btn-primary");
  })

  // search by topic
  search.addEventListener("input", debounce(function (e) {
    search_key = e.target.value;
    getAllVideos(sorted_topVoted, search_key);
  }, 300))

  // logout to clear local storage
  logout_btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("http://127.0.0.1:5500/login.html")
  })

});
