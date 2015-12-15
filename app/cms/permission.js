var workflow = require('./workflow');

exports = module.exports = {
}

// form guards
function is_creator(user, object, next) {
  var err = (object.creator != user._id);
  if (err) {
    next('permission error');
    return;
  }
  next();
}

function is_user(user, object, next) {
  var err = (object._id != user._id);
  if (err) {
    next('permission error');
    return;
  }
  next();
}

// browse constraints
function condition_mine(user) {
  return {creator: user._id};
}

function condition_me(user) {
  return {_id: user._id};
}

function condition_published(user) {
  return {$or: [{state: workflow.PUBLISHED}, {creator: user._id}]};
}

// if there be cases where a condition is not sufficient,
//  you will have to create an indexed field that you compute when relevant - solr style.
