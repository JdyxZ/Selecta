/***************** DATABASE LAYOUT *****************/

-- CREATE USER
CREATE USER IF NOT EXISTS 'Selecta'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Cacahuete200$';
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES, RELOAD on *.* TO 'Selecta'@'localhost' WITH GRANT OPTION;

FLUSH PRIVILEGES;

SELECT * FROM mysql.USER;

-- DROP USER IF EXISTS 'mysql'@'localhost';

-- CREATE DATABASE

-- DROP DATABASE IF EXISTS Selecta_DB;

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

-- INSERTS

USE Selecta_DB;

INSERT IGNORE INTO selecta_users (id, name, password, position, avatar, room)
VALUES (1, 'javi', 'Cacahuete', 0, 'media/images/char2.png', 1);

INSERT IGNORE INTO selecta_users (id, name, password, position, avatar, room)
VALUES (2, 'eric', 'Avocado', 0, 'media/images/char2.png', 1);

USE Selecta_DB;

INSERT IGNORE INTO selecta_rooms (id, name, background, exits, people, range_left, range_right)
VALUES (1, 'Camping', 'media/images/background.png', '{"exit1": [-1,-260,2,1]}', '{}', -260, 200);

INSERT IGNORE INTO selecta_rooms (id, name, background, exits, people, range_left, range_right)
VALUES (2, 'Forest', 'media/images/forest.png', '{"exit1": [1,200,1,1]}', '{}', -300, 240);

-- UPDATE USERS

USE Selecta_DB;

INSERT into selecta_users (id, name, position, avatar, room)
VALUES (1, 'Haylo', 30, '1', 'Hall'), (2, 'Sr.OjeteSucio', 30, '2', 'Hall')
ON DUPLICATE KEY UPDATE name = VALUES(name), position = VALUES(position), avatar = VALUES(avatar), room = VALUES(room);

-- JSON QUERIES

USE Selecta_DB;
SELECT * FROM selecta_users WHERE JSON_EXTRACT(social, '$.id') = 1 AND JSON_EXTRACT(social, '$.provider') = 'google';

-- TABLE SHOW
USE Selecta_DB;

SHOW TABLES;

USE Selecta_DB;

TABLE selecta_users;
TABLE selecta_rooms;
TABLE selecta_sessions;

-- TABLE DELETE CONTENT

USE Selecta_DB;

DELETE FROM selecta_sessions;

USE Selecta_DB;

DELETE FROM selecta_users;

DELETE FROM selecta_rooms;

-- TABLE DROP

USE Selecta_DB;

DROP TABLE selecta_users;

DROP TABLE selecta_rooms;

USE Selecta_DB;

DROP TABLE selecta_sessions;


