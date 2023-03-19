-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS Selecta_DB;
USE Selecta_DB;

-- CREATE TABLES
CREATE TABLE IF NOT EXISTS selecta_users (
    id INT NOT NULL AUTO_INCREMENT,
    social JSON,
    name VARCHAR(255) UNIQUE DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    model JSON, -- MODEL MATRIX
    asset INT,
    room INT,

    -- DEFINE FOREIGN KEYS FOR ASSET AND ROOM

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_user_assets (
    id INT NOT NULL AUTO_INCREMENT,
    mesh VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    skeleton VARCHAR(255) DEFAULT NULL,
    animations JSON,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_object_assets (
    id INT NOT NULL AUTO_INCREMENT,
    type VARCHAR(255) DEFAULT NULL,
    mesh VARCHAR(255) DEFAULT NULL,
    texture VARCHAR(255) DEFAULT NULL,
    bounding_box JSON,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    objects JSON,
    exits JSON,
    people JSON,
    defaultPosition JSON, -- MODEL MATRIX

    PRIMARY KEY (id)
);

-- CREATE ASSETS

-- TODO

-- CREATE ROOMS
INSERT IGNORE INTO selecta_rooms (id, name, objects, exits, people, defaultPosition)
VALUES (1, 'Studio 54', '{}', '{}', '{}', '{}'); -- TODO

INSERT IGNORE INTO selecta_rooms (id, name, objects, exits, people, defaultPosition) 
VALUES (2, 'Shadon', '{}', '{}', '{}', '{}'); -- TODO