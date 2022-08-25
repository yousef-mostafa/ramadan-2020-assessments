var VideoRequest = require('./../models/video-requests.model');

module.exports = {
  createRequest: (vidRequestData) => {
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (top) => {
    return VideoRequest.find({}).sort({ submit_date: '-1' }).limit(top);
  },

  searchRequests: (topic) => {
    return VideoRequest.find({ topic_title: topic })
      .sort({ addedAt: '-1' })
      .limit(top);
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, { new: true });
  },

  updateVoteForRequest: async (id, vote_type, author_email) => {
    const oldRequest = await VideoRequest.findById({ _id: id });
    const other_type = vote_type === 'ups' ? 'downs' : 'ups';

    let oldVoteList = oldRequest.votes[vote_type];
    let oldOtherList = oldRequest.votes[other_type];

    if (!oldVoteList.includes(author_email)){
      oldVoteList.push(author_email);
    }
    else{
      oldVoteList = oldVoteList.filter(item => item !== author_email);

    }
    if (oldOtherList.includes(author_email)) {
      oldOtherList = oldOtherList.filter(item => item !== author_email)
    }

    return VideoRequest.findByIdAndUpdate(
      { _id: id },
      {
        votes: {
          [vote_type]: oldVoteList,
          [other_type]: oldOtherList,
        },
      },
      {new :true}
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
