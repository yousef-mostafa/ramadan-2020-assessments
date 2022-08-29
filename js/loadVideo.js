import { isAdmin } from './isAdmin.js'
// func to load video posts from db

function dateFormat(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

  let day = days[date.getDay()];
  let month = months[date.getMonth()];
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes();

  return `${day} ${month} ${date.getDate()} ${year} at ${hour}:${minutes}`
}

function loadAdminFunc(id) {
  return `
    <div class="card-header d-flex flex-row justify-content-between">
      <div class="w-25">
        <select class="form-control mr-5" id="video_statue_${id}">
          <option value="new">NEW</option>
          <option value="planned">PLANNED</option>
          <option value="done">DONE</option>
        </select>
      </div>
      <div class="w-100 mx-5 input-group">
        <input type="text" name="videoID" id="videoID_${id}" class="form-control" placeholder="Enter your youtube video ID">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary px-4" id="save_videoID_${id}">Save</button>
          </div>
      </div>
      <div>
        <button class="btn btn-danger px-5" id="delete_${id}">Delete</button>
      </div>
    </div>`
}

export function loadVideo({
  _id: id,
  topic_title: title,
  topic_details: details,
  expected_result: result,
  video_ref: videoRef,
  votes,
  status,
  author_name,
  submit_date,
  target_level : level,
}) {
  let videoItem = document.createElement("div");
  videoItem.classList.add("card", "mb-3");
  let voteScore = votes.ups.length - votes.downs.length
  videoItem.innerHTML = `
              ${isAdmin ? loadAdminFunc(id): ""}
            
              <div class="card-body d-flex justify-content-between flex-row">
              <div class="d-flex flex-column">
                <h3>${title}</h3>
                <p class="text-muted mb-2">${details}</p>
                <p class="mb-0 text-muted">
                ${result && `<strong>Expected results: </strong> ${result}`}
                </p>
              </div>
              <div class="d-flex flex-row">
                <iframe id="iframe_${id}" width="300" height="115" src="" class="${videoRef.link ? "" : "d-none"}"></iframe>
                <div class="d-flex flex-column text-center mx-4">
                  <a id="vote_ups_${id}" class="btn btn-link">🔺</a>
                  <h3 id="voteScore_${id}">${voteScore}</h3>
                  <a id="vote_downs_${id}" class="btn btn-link">🔻</a>
                </div>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div>
                <span class="${status === "done" ? "text-success font-weight-bold" : "text-info"}" id="status_${id}">${status.toUpperCase()}</span>
                &bullet; added by <strong>${author_name}</strong> on
                <strong>${dateFormat(new Date(submit_date))}</strong> 
              </div>
              <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
                <div class="badge badge-success">
                  ${level}
                </div>
              </div>
            </div>
              `;
  return videoItem;
}
// TODO
// src = "https://www.youtube.com/embed/${videoRef.link}"