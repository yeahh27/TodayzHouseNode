/**
 * http://usejsdoc.org/
 */
const express = require("express");
const router = express.Router();

/*
 * 채팅 방 조회
 */
/*router.get("/", (req, res) => {
  const email = req.query.email;
  const name = req.query.name;
  
  req.session.USER = {
		  id: email,
		  name: name
  }
  
  const connectMember = req.app.get("connectMember");
  res.render("chat/chat", {rooms: connectMember.rooms,user:req.session.USER});
});

router.post("/", (req, res) => {
  const roomName = req.body.room_name;
  const user = req.session.USER;

  res.render("chat/chat2", {
    "data": {
      "room_name": roomName,
      "me": user
    }
  });
});

router.get("/:roomName", (req, res) => {
  const roomName = req.params.roomName;
  const me = req.session.USER;

  res.render("chat/chat2", {
    "data": {
      "room_name": roomName,
      "me": me
    }
  });

});*/

router.get("/", (req, res) => {
	const email = req.query.email;
	const name = req.query.name;
	
	req.session.USER = {
		id: email,
		name: name
	}
	
	const me = req.session.USER;
	
	const connectMember = req.app.get("connectMember");
	res.render("chat/chat", {
	    "data": {
	      "room_name": 1,
	      "me": me
	    }
	});
})


exports.router = router;
