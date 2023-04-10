\echo 'Delete and recreate messagely db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely;
CREATE DATABASE messagely;
\connect messagely


CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

INSERT INTO users (username, password, first_name, last_name, phone, join_at)
VALUES
  ('claudiaslam', 'secretpassword', 'claudia', 'lam', '647-78990', '2018-09-08 12:20:07-07'),
  ('evanhesketh', 'secret', 'evan', 'hesketh', '658-68574', '2018-06-18 19:31:59-07'),
  ('testUser', 'password', 'user', 'userlastname', '58576-585', '2018-09-08 12:20:07-07');

INSERT INTO messages(from_username, to_username, body, sent_at)
VALUES
  ('claudiaslam', 'evanhesketh', 'hi', '2023-04-10 12:20:07-07'),
  ('claudiaslam', 'testUser', 'test message', '2023-04-10 12:20:07-07');


\echo 'Delete and recreate messagely_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE messagely_test;
CREATE DATABASE messagely_test;
\connect messagely_test

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  join_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE);

