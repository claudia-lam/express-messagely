"use strict";

const { UnauthorizedError } = require("../expressError");
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");

const Router = require("express").Router;
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res) {
  const username = res.locals.user.username;
  const messageId = req.params.id;
  const message = await Message.get(messageId);

  if (
    message.to_user.username === username ||
    message.from_user.username === username
  ) {
    return res.json({ message });
  }
  throw new UnauthorizedError("You do not have access to this message!");
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function(req, res) {
  const from_username = res.locals.user.username;
  const {to_username, body} = req.body;
  const message = await Message.create({from_username, to_username, body});

  return res.json({message});
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function(req, res) {
  const toUsername = res.locals.user.username;
  const id = req.params.id;
  const messageData = await Message.get(id);

  if (messageData.to_user.username !== toUsername) {
    throw new UnauthorizedError('You cannot mark this message as read');
  }
  const message = await Message.markRead(id);
  return res.json({message});

})

module.exports = router;
