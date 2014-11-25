var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var CmsModels = require('../../../currentcms/lib/models');

exports = module.exports = {

  ReaderContent: {
    meta: {
      plural: "Reader Content",
      name: "<%= host %> <%= path %>",
      dashboard: true,
      workflow: false
    },
    schema: {
      feed: {type: ObjectId, ref: 'ReaderFeed'},
      host: String,
      path: String,
      source: String,
      title: String,
      text: String,
      image: String,
      date: Date,
      audio: {Zoe: Boolean}
    }
  },

  ReaderFeed: {
    meta: {
      plural: "Reader Feed",
      name: "<%= name %>",
      dashboard: true,
      workflow: false
    },
    schema: {
      name: String,
      url: String,
      image: {type: ObjectId, ref: 'Resource'},
      channel: {type: ObjectId, ref: 'Channel'}
    }
  },

  Channel: {
    meta: {
      plural: "Channels",
      name: "<%= name %>",
      dashboard: true,
      workflow: false
    },
    schema: {
      name: String,
      description: String,
      image: {type: ObjectId, ref: 'Resource'}
    }
  },


  Resource: CmsModels.ResourceInfo(),
  User: CmsModels.UserInfo()

}



