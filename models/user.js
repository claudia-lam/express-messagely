"use strict";
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError } = require("../expressError");

/** User of the site. */

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `
    INSERT INTO users (username, password, first_name, last_name, phone,
      join_at)
    VALUES
    ($1, $2, $3, $4, $5, $6)
    RETURNING username, password, first_name, last_name, phone
    `,
      [username, hashedPassword, first_name, last_name, phone, new Date()]
    );
    const user = results.rows[0];
    return user;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT password
        FROM users
        WHERE username=$1`,
      [username]
    );

    const user = results.rows[0];
    //TODO: possible refactor to throw error?
    return (await bcrypt.compare(password, user?.password)) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const timestamp = new Date();
    const results = await db.query(
      `INSERT INTO users (last_login_at)
        VALUE ($1)
        WHERE username=$2
        RETURNING username`,
      [timestamp, username]
    );

    const username = results.rows[0];

    if (!username) {
      throw new NotFoundError();
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY last_name, first_name`
    );

    const users = results.rows;
    if (!users[0]) throw new NotFoundError("No users found!");
    return users;
  }
  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = db.query(
      `
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM   users
      WHERE  username = $1
      `,
      [username]
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user found for ${username}!`);
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = db.query(
      `
      SELECT id, to_username, u.username, u.first_name, u.last_name, u.phone,
              body, sent_at, read_at
      FROM   messages as m
      JOIN   users as u
      ON     from_username = u.username
      WHERE  u.username = 'claudiaslam';
      `,
      [username]
    );

    const messages = result.rows;
    const toUsers = messages.map((message) => message.to_username); //[evanhesketh, testUser]
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
