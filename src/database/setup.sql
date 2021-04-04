CREATE DATABASE IF NOT EXISTS dogestats;

USE dogestats;

-- CREATE TABLE IF NOT EXISTS users (
--  uuid VARCHAR(36) NOT NULL PRIMARY KEY,
--  isBot BOOLEAN NOT NULL DEFAULT FALSE,
--  username TEXT(15),
--  bio TEXT(160),
--  numFollowers INT NOT NULL DEFAULT 0,
--  numFollowing INT NOT NULL DEFAULT 0,
--  displayName TEXT(50) NOT NULL,
--  avatar TEXT,
--  inRoom BOOLEAN NOT NULL DEFAULT FALSE
-- );

CREATE TABLE IF NOT EXISTS rooms (
     id VARCHAR(36) NOT NULL PRIMARY KEY,
     creatorId TEXT NOT NULL,
     roomDescription TEXT,
     insertedAt TIMESTAMP NOT NULL,
     roomName TEXT NOT NULL,
     numPeopleInside INT NOT NULL DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS stats (
     id INT(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
     totalRooms INT(11) NOT NULL DEFAULT 0,
     totalScheduledRooms INT(11) NOT NULL DEFAULT 0,
     totalOnline INT(11) NOT NULL DEFAULT 0,
     totalBotsOnline INT(11) NOT NULL DEFAULT 0,
     totalBotsSendingTelemetry INT(11) NOT NULL DEFAULT 0,
     topRoomID VARCHAR(36),
     newestRoomID VARCHAR(36),
     longestRoomID VARCHAR(36),
     statsTime TIMESTAMP NOT NULL
);