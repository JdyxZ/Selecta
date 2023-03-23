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
    asset JSON,
    animations JSON,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_object_assets (
    id INT NOT NULL AUTO_INCREMENT,
    asset JSON,

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
INSERT IGNORE INTO selecta_user_assets(id, asset, animations)
VALUES(1, '{folder:girl2, mesh:girl2.WBIN, texture:girl2.png, scale:0.3}' , '{animation1:idle.skanim, animation2:walking.skanim, animation3:macarena.skanim, animation4:dance2.skanim}')

INSERT IGNORE INTO selecta_object_assets(id, asset)
VALUES(1, '{object:disco_room.gltf, scaling:80, position:[0,-.01,0]}')
-- CREATE ROOMS
INSERT IGNORE INTO selecta_rooms (id, name, objects, exits, people, defaultPosition)
VALUES (1, 'Studio 54', '{}', '{}', '{}', '{}'); -- TODO

INSERT IGNORE INTO selecta_rooms (id, name, objects, exits, people, defaultPosition) 
VALUES (2, 'Shadon', '{}', '{}', '{}', '{}'); -- TODO