const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../database.sqlite");

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    NOT NULL DEFAULT '',
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    full_name   TEXT    NOT NULL DEFAULT '',
    avatar_url  TEXT    NOT NULL DEFAULT 'https://i.sstatic.net/l60Hf.png',
    status      INTEGER NOT NULL DEFAULT 0,
    role_id     INTEGER REFERENCES roles(id),
    login_count INTEGER NOT NULL DEFAULT 0,
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log("SQLite connected:", DB_PATH);

module.exports = db;
