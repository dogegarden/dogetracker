CREATE DATABASE dogestats;

CREATE TABLE IF NOT EXISTS users (
 uuid VARCHAR(36) NOT NULL PRIMARY KEY,
 isBot BOOLEAN NOT NULL DEFAULT FALSE,
 username TEXT(15),
 bio TEXT(160),
 numFollowers INT NOT NULL DEFAULT 0,
 numFollowing INT NOT NULL DEFAULT 0,
 displayName TEXT(50) NOT NULL,
 avatar TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
     id VARCHAR(36) NOT NULL PRIMARY KEY,
     creatorId TEXT NOT NULL,
     description TEXT,
     insertedAt TIMESTAMP NOT NULL,
     roomName TEXT NOT NULL,
     numPeopleInside INT NOT NULL DEFAULT 0
);