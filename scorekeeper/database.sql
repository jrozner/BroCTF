drop table flags;
drop table challenges;
drop table categories;
drop table users;

create table users (
  id serial,
  username varchar(30) unique,
  password varchar(100),
  primary key(id)
);

create table categories (
  id serial,
  name varchar(100) unique,
  primary key(id)
);

create table challenges (
  id serial,
  title varchar(100) unique,
  description text unique,
  value integer,
  flag varchar(100) unique,
  category_id integer references categories(id) on delete cascade,
  unique(value, category_id),
  primary key(id)
);

create table flags (
  id serial,
  user_id integer references users(id) on delete cascade,
  challenge_id integer references challenges(id) on delete cascade,
  unique(user_id, challenge_id),
  primary key(id)
);
