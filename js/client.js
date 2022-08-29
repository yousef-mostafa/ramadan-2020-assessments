import { isAdmin } from './isAdmin.js'
import dataServer from './dataServece.js'
import { debounce } from './debounce.js'
import { loadVideo } from './loadVideo.js'
import { voteSystem } from './voteSystem.js'


let sorted_topVoted = false, search_key = "", filter_key = "ALL";

function getAllVideos(sorted_topVoted = false, search_key = "", filter_key = "ALL") {
  let videoList = document.querySelector("#listOfRequests");
  videoList.innerHTML = "";
  // get all request from  '/video-request' and list them
  dataServer.getAllData()
    .then((data) => {
      // data filtration
      if (sorted_topVoted)
        data = data.sort((prev, next) => { return (next.votes.ups.length - next.votes.downs.length) - (prev.votes.ups.length - prev.votes.downs.length) });

      if (search_key !== "") {
        const regExp = new RegExp(search_key, 'gi');
        data = data.filter(item => item.topic_title.match(regExp))
      }
      if (filter_key !== "ALL") {
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
        if (isAdmin) {
          let delete_btn = document.querySelector(`#delete_${videoEle._id}`);
          let video_ID = document.querySelector(`#videoID_${videoEle._id}`);
          let save_video_ID = document.querySelector(`#save_videoID_${videoEle._id}`);
          let video_statue = document.querySelector(`#video_statue_${videoEle._id}`);
          let status_span = document.querySelector(`#status_${videoEle._id}`);
          let video_frame = document.querySelector(`#iframe_${videoEle._id}`)
          // to set values from db on load
          video_statue.value = videoEle.status;
          video_ID.value = videoEle.video_ref.link;

          delete_btn.addEventListener("click", () => {
            dataServer.deleteVideo(videoEle._id)
              .then(() => {
                getAllVideos(sorted_topVoted, search_key, filter_key);
              })
          })

          save_video_ID.addEventListener("click", function () {
            if (video_ID.value) {
              video_ID.classList.remove("is-invalid")
              dataServer.updateVideoData(videoEle._id, "done", video_ID.value)
                .then((data) => {
                  video_ID.value = data.video_ref.link;
                  status_span.classList.remove("text-info")
                  status_span.classList.add("text-success", "font-weight-bold")
                  status_span.innerHTML = data.status.toUpperCase();
                  video_statue.value = data.status;
                  video_frame.classList.remove("d-none")
                  // TODO
                  // video_frame.src = `https://www.youtube.com/embed/${data.video_ref.link}`;
                })
            }
            else {
              video_ID.classList.add("is-invalid");
              video_ID.addEventListener("input", function () {
                this.classList.remove("is-invalid")
              });
            }
          })

          video_statue.addEventListener("change", function (e) {
            dataServer.updateVideoData(videoEle._id, e.target.value, e.target.value !== "done" ? "" : `${videoEle.video_ref.link}`)
              .then((data) => {
                if (data.status !== "done") {
                  status_span.classList.add("text-info")
                  status_span.classList.remove("text-success", "font-weight-bold")
                }
                status_span.innerHTML = data.status.toUpperCase();
                video_ID.value = "";
                video_frame.classList.add("d-none")
              })
          })
        }
        // all user functions
        else {
          vote_btns.forEach(btn => {
            let [, vote_type, id] = btn.getAttribute("id").split("_");//
            btn.addEventListener("click", function () {
              if (!isAdmin && videoEle.status !== "done") {
                dataServer.voteFunction(id, vote_type, localStorage.getItem("email"))
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
  let username = document.querySelector("#username");
  let sort_topVote = document.querySelector("#sort_topVote");
  let sort_new = document.querySelector("#sort_new");
  let search = document.querySelector("#search");
  let logout_btn = document.querySelector("#logout");
  let filter = document.querySelector("#filter").classList.remove("d-none");
  let filter_btn = document.querySelectorAll("#filter button");

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
      dataServer.videoRequest(dataForm)
        .then(() => {
          getAllVideos(sorted_topVoted, search_key, filter_key);
          search.value = "";
          // TODO clear inputs after submit
          // dataForm.forEach(item => item.value = "")
        });
    }
  });

  // filter videos based on statue
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
      getAllVideos(sorted_topVoted, search_key, filter_key);
    })
  });

  // for sort
  sort_topVote.addEventListener("click", function () {
    sorted_topVoted = true;
    getAllVideos(sorted_topVoted, search_key, filter_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_new.classList.add("btn-secondary");
    sort_new.classList.remove("btn-primary");
  });
  sort_new.addEventListener("click", function () {
    sorted_topVoted = false
    getAllVideos(sorted_topVoted, search_key, filter_key);
    this.classList.add("btn-primary");
    this.classList.remove("btn-secondary");
    sort_topVote.classList.add("btn-secondary");
    sort_topVote.classList.remove("btn-primary");
  });

  // search by topic
  search.addEventListener("input", debounce(function (e) {
    search_key = e.target.value;
    getAllVideos(sorted_topVoted, search_key, filter_key);
  }, 300))

  // logout to clear local storage
  logout_btn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("http://127.0.0.1:5500/login.html")
  })

});
