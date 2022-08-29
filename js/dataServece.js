export default {
  getAllData: () => {
    return fetch("http://localhost:7777/video-request")
      .then((bolb) => bolb.json())
  },

  deleteVideo: (id) => {
    return fetch('http://localhost:7777/video-request', {
      method: 'DELETE',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then((bolb) => bolb.json())
  },

  updateVideoData: (id, status ,resVideo) =>{
    return fetch('http://localhost:7777/video-request', {
      method: 'PUT',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({id , status, resVideo })
    }).then((bolb) => bolb.json())
  },

  voteFunction: (id, vote_type , user_email )=>{
    return fetch('http://localhost:7777/video-request/vote', {
      method: 'PUT',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify({ id, vote_type, user_email})
    }).then((bolb) => bolb.json())
  },

  videoRequest: (dataForm) => {
    return fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: dataForm,
    })
  }
}