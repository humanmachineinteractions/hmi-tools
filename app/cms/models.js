var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
var CmsModels = require("../../../currentcms/lib/models");


exports = module.exports = {

  Schema: {
    meta: {
      plural: "Schemas",
      name: "<%= name %>",
      dashboard: false,
      workflow: true
    },
    schema: {
      name: String,
      description: String,
      fields: [{type: ObjectId, ref: "SchemaField"}]
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

  Domain: {
    meta: {
      plural: "Domains",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String
    }
  },

  Language: {
    meta: {
      plural: "Languages",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      code: String,
      description: String
    }
  },

  Product: {
    meta: {
      plural: "Products",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String,
      language: {type: ObjectId, ref: "Language"},
      persona: [{type: ObjectId, ref: "Persona"}],
      scripts: [{type: ObjectId, ref: "Script"}]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "description", cell: "char", filters: ["$regex", "="], order: "asc,desc"}
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "language", widget: "choose_create", options: {type: "Language", array: false, create: false}},
      {name: "persona", widget: "choose_create", options: {type: "Persona", array: true, create: false}},
      {name: "scripts", widget: "choose_create", options: {type: "Script", array: true}}
    ],
    formModules: [
      {name: "Work", widget: "work", options: {}, async: true},
      {name: "Create scripts", widget: "create_scripts", options: {}, async: true}
    ],
    includes: ["/js/service_work.js", "/css/work.css","/js/service_create_scripts.js"]

  },

  // DesignProperties: {
  //   meta: {
  //     plural: "Design Properties",
  //     name: "<%= name %>",
  //     dashboard: false,
  //     workflow: false
  //   },
  //   schema: {
  //     product: {type: ObjectId, ref: "Product"},
  //     totalLines: Number,
  //     domains: [{domain: {type: ObjectId, ref: "Domain"}, weight: Number}],
  //     resource: {type: ObjectId, ref: "Resource"}
  //   }
  // },

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
      utterances: [{type: ObjectId, ref: "Utterance"}]
    },
    browse: [
      {name: "name", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "description", cell: "char", filters: ["$regex", "="], order: "asc,desc"},
      {name: "modified", cell: "date", filters: ["$gt", "$lt", "="], order: "asc,desc"}
    ],
    form: [
      {name: "name", widget: "input", options: {className: "large"}},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "utterances", widget: "table", options: {fields: ['orthography', 'transcription'], type: "Utterance"}}
    ]
  },

  Utterance: {
    meta: {
      plural: "Utterances",
      name: "<%= orthography %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      orthography: String,
      transcription: String,
      meta:  mongoose.Schema.Types.Mixed,
      tags: String,
      description: String,
      language: {type: ObjectId, ref: "Language"},
      domain: {type: ObjectId, ref: "Domain"}
    },
    browse: [
      {name: "orthography", cell: "char", filters: ["$regex", "="], order: "asc,desc", options: {width:"70%"}},
      {name: "domain.name", cell: "char", filters: ["$regex", "="], order: "asc,desc", options: {width:"30%"}}
    ],
    form: [
      {name: "orthography", widget: "textarea", options: {className: "large"}},
      {name: "transcription", widget: "transcription", options: {className: "small"}},
      {name: "meta", widget: "annotator"},
      {name: "tags", widget: "input"},
      {name: "description", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "domain", widget: "choose_create", options: {type: "Domain", array: false}}
    ],
    includes: ["/js/field_annotator.js", "/css/annotator.css",
      "/js/field_transcription.js", "/css/transcription.css"]

  },

  Performance: {
    meta: {
      plural: "Performances",
      name: "<%= _id %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      persona: {type:ObjectId, ref: "Persona"},
      utterance: {type: ObjectId, ref: "Utterance"},
      transcription: String,
      wav: {type: ObjectId, ref: "Resource"},
      description: String
    },
    browse: [
      { name: 'persona.name', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'utterance.orthography', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' }
    ],
    form: [
      { name: 'persona', widget: 'choose_create', options: { type: 'Persona', array: false } },
      { name: 'utterance', widget: 'choose_create', options: { type: 'Utterance', array: false } },
      { name: 'transcription', widget: 'input' },
      { name: 'wav', widget: 'upload', options: { type: 'Resource', array: false } },
      { name: 'description', widget: 'rich_text' }
    ]
  },

  Persona: {
    meta: {
      plural: "Persona",
      name: "<%= name %>",
      dashboard: true,
      workflow: true
    },
    schema: {
      name: String,
      description: String
    },
    browse: [
      { name: 'name', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' },
      { name: 'description', cell: 'char', filters: [ '$regex', '=' ], order: 'asc,desc,default' }
    ],
    form: [
      { name: 'name', widget: 'input' },
      { name: 'description', widget: 'input' }
    ]
  },

  Work: {
    meta: {
      plural: "Work",
      name: "<%= _id %>",
      dashboard: false
    },
    schema: {
      type: String,
      kwargs: mongoose.Schema.Types.Mixed,
      jobId: String,
      userId: ObjectId,
      refType: String,
      refId: ObjectId,
      logs: [{message: String, timestamp: Date}],
      complete: {type: Boolean, value: false}
    }
  },

  Content: {
    meta: {
      plural: "Content",
      name: "<%= uri %>",
      dashboard: false
    },
    schema: {
      state: String,
      host: String,
      path: String,
      body: String,
      title: String,
      image: String,
      lang: String,
      indexed: Date
    },
    browse: [
      {name: "state", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "host", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "path", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "title", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "lang", cell: "char", filters: ["$regex", "="], order: "asc,desc,default"},
      {name: "indexed", cell: "date", filters: ["$gt", "$lt", "$gte", "$lte"], order: "asc,desc"},
    ],
    form: [
      {name: "state", widget: "input"},
      {name: "host", widget: "input"},
      {name: "path", widget: "input"},
      {name: "title", widget: "input"},
      {name: "image", widget: "input"},
      {name: "lang", widget: "input"},
      {name: "body", widget: "rich_text", options: {collapsable: true, collapsed: true}},
      {name: "indexed", widget: "date"}
    ]

  },


  Resource: CmsModels.ResourceInfo(),
  User: CmsModels.UserInfo()

}
