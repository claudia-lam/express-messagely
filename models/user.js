"use strict";
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const {NotFoundError} = require("../expressError");

/** User of the site. */

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `
    INSERT INTO users (username, password, first_name, last_name, phone)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING username, password, first_name, last_name, phone
    `,
      [username, hashedPassword, first_name, last_name, phone]
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
    return await bcrypt.compare(password, user?.password) === true;
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

    if (!results.rows[0]) {
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

    return users;

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

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
