import { isAdmin } from './isAdmin.js'

export function voteSystem(videoEle, voteList, vote_type) {
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