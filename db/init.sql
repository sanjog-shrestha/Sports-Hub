-- Runs automatically on first container start (only when the postgres data volume is empty). Add further seed/migration SQL here as needed.

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    league VARCHAR(50) NOT NULL,
    city VARCHAR(100)
);

INSERT INTO teams (name, league, city) VALUES 
    ('Lakers','NBA','Los Angeles'),
    ('Celtics','NBA','Boston'),
    ('Chiefs','NFL','Kansas City'),
    ('49ers','NFL','San Francisco'),
    ('Arsenal','EPL','London'),
    ('Chelsea','EPL','London'),
    ('Yankees','MLB','New York'),
    ('Red Sox','MLB','Boston'),
    ('Royal Challengers Bangalore', 'IPL', 'Bangalore'),
    ('Rajasthan Royals','IPL','Rajasthan');

CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    jersey_number INTEGER,

    CONSTRAINT fk_team
        FOREIGN KEY(team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE 
);

INSERT INTO players (
    team_id, 
    name, 
    position, 
    jersey_number) VALUES 
    (1, 'Lebron James', 'SF', 23),
    (1, 'Luka Doncic', 'PG', 77),
    (1, 'Austin Reaves','SG',15),

    (2, 'Jayson Tatum','SF', 0),
    (2, 'Jaylen Brown', 'SG', 7),
    (2, 'Derrick White', 'PG', 9);