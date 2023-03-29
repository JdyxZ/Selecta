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
    model JSON,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS selecta_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE,
    objects JSON,
    people JSON,
    exits JSON,
    default_model JSON,
    playlist VARCHAR(255) NOT NULL,

    PRIMARY KEY (id)
);

-- CREATE ASSETS
INSERT IGNORE INTO selecta_user_assets(id, asset, animations)
VALUES(1, '{"folder": "girl2", "mesh": "girl2.wbin", "texture": "girl2.png", "scale": 0.3}' , '{"idle": "idle.skanim", "walking": "walking.skanim", "macarena": "macarena.skanim", "dance2": "dance2.skanim"}');

INSERT IGNORE INTO selecta_object_assets(id, asset, model)
VALUES(1, '{"object": "disco_room.gltf"}', '{"model": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}');

-- CREATE ROOMS
INSERT IGNORE INTO selecta_rooms (id, name, objects, people, exits, default_model, playlist)
VALUES (1, 'Studio 54', '{}', '{}', '{}', '{}', 'PLaXq35jqloUVY5tCNun4XiFFIxX9fJmns'); 

INSERT IGNORE INTO selecta_rooms (id, name, objects, people, exits, default_model, playlist) 
VALUES (2, 'Shadon', '{}', '{}', '{}', '{}', 'PLaXq35jqloUVY5tCNun4XiFFIxX9fJmns'); 