const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

// func to load video posts from db
    function loadVideos() {
      // get all request from  '/video-request' and list them
      fetch("http://localhost:7777/video-request")
        .then((blob) => blob.json())
        .then((data) => {
          let videoList = document.querySelector("#listOfRequests");
          videoList.innerHTML = "";
          data.forEach((element) => {
            let submit_date = new Date (element.submit_date)
            let videoItem = document.createElement("div");
            videoItem.classList.add("card", "mb-3");
            videoItem.innerHTML = `
                <div class="card-body d-flex justify-content-between flex-row">
                <div class="d-flex flex-column">
                  <h3>${element.topic_title}</h3>
                  <p class="text-muted mb-2">${element.topic_details}</p>
                  <p class="mb-0 text-muted">
                  ${element.expected_result && `<strong>Expected results: </strong> ${element.expected_result}`}
                  </p>
                </div>
                <div class="d-flex flex-column text-center">
                  <a class="btn btn-link">🔺</a>
                  <h3>${element.votes.ups - element.votes.downs}</h3>
                  <a class="btn btn-link">🔻</a>
                </div>
              </div>
              <div class="card-footer d-flex flex-row justify-content-between">
                <div>
                  <span class="text-info">${element.status}</span>
                  &bullet; added by <strong>${element.author_name}</strong> on
                  <strong>${days[submit_date.getDay()]} ${
              months[submit_date.getMonth()]
            } ${submit_date.getDate()} ${submit_date.getFullYear()} at ${submit_date.getHours()}:${submit_date.getMinutes()}</strong> 
                </div>
                <div
                  class="d-flex justify-content-center flex-column 408ml-auto mr-2"
                >
                  <div class="badge badge-success">
                    ${element.target_level}
                  </div>
                </div>
              </div>
                `;
            videoList.append(videoItem);
          });
        });
    }
document.addEventListener("DOMContentLoaded", () => {
    let formVideo = document.querySelector("#submitVideo");
  loadVideos();
  // submit request
  formVideo.addEventListener("submit", (e) => {
    e.preventDefault();
    let dataForm = new FormData(formVideo);
    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: dataForm,
    }).then(() => loadVideos());
  });

});
