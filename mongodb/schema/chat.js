/**
 * http://usejsdoc.org/
 */
const mongo = require("mongoose");

const chat = mongo.Schema({
  room_name: String,
  members: [{
    id: String,
    name: String,
    point: Number
  }],
  chat: [{
    from: {
      id: String,
      name: String,
      point: Number
    },
    message: String
  }]
});

module.exports = mongo.model("chat", chat);
