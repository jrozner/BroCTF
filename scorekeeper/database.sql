drop table if exists flags;
drop table if exists challenges;
drop table if exists categories;
drop table if exists users;

create table users (
  id serial,
  username varchar(30) unique,
  password varchar(100),
  primary key(id)
);

create unique index users_username_idx on users (username);
create index users_password_idx on users (password);

create table challenges (
  id serial,
  title varchar(100) unique,
  description text unique,
  tier integer,
  flag varchar(40) unique,
  unique(value, category_id),
  primary key(id)
);

create index challenges_flag_idx on challenges(flag);

create table flags (
  id serial,
  user_id integer references users(id) on delete cascade,
  challenge_id integer references challenges(id) on delete cascade,
  unique(user_id, challenge_id),
  primary key(id)
);

create index flags_user_id_idx on flags (user_id);
create index flags_challenge_id_idx on flags (challenge_id);

create table bonuses (
  id serial,
  user_id integer references users(id) on delete cascade,
  value integer,
  primary key(id)
);

create index bonuses_user_id_idx on bonuses (user_id);
