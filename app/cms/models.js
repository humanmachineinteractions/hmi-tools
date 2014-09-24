var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var cms_models = require("../../../currently13/app/modules/cms/models");


exports = module.exports = {

  Schema: {
    meta: {
      plural: "Schemas",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String,
      fields: [{type: ObjectId, ref: 'SchemaField'}]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "description", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "fields", widget: "choose_create", options: {type: "SchemaField", array: true}},
    ]
  },

  SchemaField: {
    meta: {
      singular: "Schema Field",
      plural: "Schema Fields",
      name: "<%= name %>",
      dashboard: false,
      workflow: false
    },
    schema: {
      name: String,
      code: String,
      description: String
   },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "code", cell: "char", filters: ["$regex", "="], order: "asc,desc"}
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "code", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: false}}
    ]
  },

  Corpus: {
    meta: {
      plural: "Corpora",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String,
      scheme: {type: ObjectId, ref: 'Schema'},
      scripts: [{type: ObjectId, ref: 'Script'}]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "description", cell: "char", filters: ["$regex", "="], order: "asc,desc"}
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "scheme", widget: "choose_create", options: {type: "Schema", array: false, create: false}},
      {name: "scripts", widget: "choose_create", options: {type: "Script", array: true}}
    ],
    formModules: [
      {name: "Train NER", widget: "train_ner", options: {}, async: true}
    ],
    includes: ["/js/service_train_ner.js"]

  },

  Script: {
    meta: {
      plural: "Scripts",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String,
      segments: [{type: ObjectId, ref: 'Segment'}]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "description", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "modified", cell: "date", filters: ["$gt", "$lt", "="], order: "asc,desc"}
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "segments", widget: "choose_create", options: {type: "Segment", array: true}}
    ]
  },

  Segment: {
    meta: {
      plural: "Segments",
      name: "<%= text %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      text: String,
      tags: String,
      description: String,
      annotation:  mongoose.Schema.Types.Mixed
    },
    browse: [
      {name: "text", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "tags", cell: "char", filters: ["$regex", "="], order: "asc,desc"}
    ],
    form: [
      {name: "text", widget: "input", options: {className: "large"}},
      {name: "annotation", widget: "annotator"},
      {name: "tags", widget: "input"},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}}
    ],
    includes: ["/js/field_annotator.js", "/css/annotator.css"]

  },

  Content: {
    meta: {
      plural: "Content",
      name: "<%= uri %>",
      dashboard: true
    },
    schema: {
      state: String,
      url: String,
      body: String,
      title: String,
      image: String,
      lang: String,
      indexed: Date
    },
    browse: [
      {name: "state", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "url", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "lang", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "indexed", cell: "date", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
    ],
    form: [
      {name: "state", widget: "input"},
      {name: "url", widget: "input"},
      {name: "title", widget: "input"},
      {name: "image", widget: "input"},
      {name: "lang", widget: "input"},
      {name: "body", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "indexed", widget: "date"}
    ]

  },

  /* news */
  News: {
    meta: {
      plural: "News",
      name: "<%= title %>",
      dashboard: true
    },
    schema: {
      title: String,
      subtitle: String,
      body: String,
      release_date: Date
    },
    browse: [
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "release_date", cell: "date", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
      {name: "modified", cell: "int", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"}
    ],
    form: [
      {name: "title", widget: "input"},
      {name: "subtitle", widget: "input"},
      {name: "body", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "release_date", widget: "date"}
    ]
  },

  Resource: cms_models.ResourceInfo(),
  User: cms_models.UserInfo()

}



