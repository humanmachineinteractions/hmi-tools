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
      host: String,
      path: String,
      title: String,
      text: String,
      image: String,
      date: Date,
      audio: {Zoe: String}
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
      url: String
    }
  },


  Resource: CmsModels.ResourceInfo(),
  User: CmsModels.UserInfo()

}



