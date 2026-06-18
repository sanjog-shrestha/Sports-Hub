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