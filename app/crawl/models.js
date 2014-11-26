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
      use_image: Boolean,
      date: Date,
      audio: {Zoe: Boolean}
    },
    browse: [
      { name: 'source', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'title', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'text', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'date', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'audio.Zoe', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' }
    ],
    form: [
      { name: 'source', widget: 'input' },
      { name: 'title', widget: 'input' },
      { name: 'image', widget: 'image_url' },
      { name: 'use_image', widget: 'boolean' },
      { name: 'text', widget: 'code', options: {lineWrapping: true, lineNumbers: true} },
      { name: 'date', widget: 'datetime' },
      { name: 'feed', widget: 'choose_create', options: { type: 'ReaderFeed', array: false } },
      { name: 'host', widget: 'input' },
      { name: 'path', widget: 'input' },
      { name: 'audio.Zoe', widget: 'input' }
    ],
    includes: ["/js/field_image_url.js"]

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



