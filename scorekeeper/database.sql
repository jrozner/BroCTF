drop table if exists bonuses cascade;
drop table if exists user_flags cascade;
drop table if exists challenges cascade;
drop table if exists users cascade;

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
  tier integer not null,
  flag varchar(40) unique,
  value integer not null,
  primary key(id)
);

create index challenges_flag_idx on challenges(flag);

create table user_flags (
  id serial,
  user_id integer not null references users(id) on delete cascade,
  challenge_id integer not null references challenges(id) on delete cascade,
  time_submitted timestamp with time zone not null default now(),
  unique(user_id, challenge_id),
  primary key(id)
);

create index user_flags_user_id_idx on user_flags (user_id);
create index user_flags_challenge_id_idx on user_flags (challenge_id);

create table bonuses (
  id serial,
  user_id integer not null references users(id) on delete cascade,
  value integer not null,
  primary key(id)
);

create index bonuses_user_id_idx on bonuses (user_id);
