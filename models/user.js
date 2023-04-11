"use strict";
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError } = require("../expressError");
const db = require("../db");

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
      join_at, last_login_at)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    RETURNING username, password, first_name, last_name, phone
    `,
      [username, hashedPassword, first_name, last_name, phone, new Date(), new Date()]
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
    User.updateLoginTimestamp(username);
    //TODO: possible refactor to throw error?
    return (await bcrypt.compare(password, user?.password)) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const timestamp = new Date();
    const results = await db.query(
      `UPDATE users
        SET last_login_at=$1
        WHERE username=$2
        RETURNING username`,
      [timestamp, username]
    );

    const user = results.rows[0];

    if (!user) {
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
    const result = await db.query(
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
    const mResults = await db.query(
      `
      SELECT m.id, m.to_username, u.username, u.first_name, u.last_name, u.phone,
              m.body, m.sent_at, m.read_at
      FROM   messages as m
      JOIN   users as u
      ON     m.to_username = u.username
      WHERE  from_username = $1;`,
      [username]
    );

    const messages = mResults.rows;
    const userMessages = messages.map((m) => {
      const { username, first_name, last_name, phone } = m;
      return {
        id: m.id,
        to_user: { username, first_name, last_name, phone},
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    });

    return userMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const mResults = await db.query(
      `
      SELECT m.id, m.to_username, u.username, u.first_name, u.last_name, u.phone,
              m.body, m.sent_at, m.read_at
      FROM   messages as m
      JOIN   users as u
      ON     m.from_username = u.username
      WHERE  to_username = $1;`,
      [username]
    );

    const messages = mResults.rows;
    const userMessages = messages.map((m) => {
      const { username, first_name, last_name, phone } = m;
      return {
        id: m.id,
        from_user: { username, first_name, last_name, phone },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      };
    });

    return userMessages;
  }
}

module.exports = User;
