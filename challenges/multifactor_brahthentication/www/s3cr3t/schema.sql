drop table if exists users cascade;
drop table if exists user_tokens cascade;

create table users (
  id serial,
  username varchar(25) unique not null,
  password varchar(40) not null,
  primary key(id)
);

create index users_username_idx on users(username);
create index users_password_idx on users(password);

create table user_tokens (
  id serial,
  user_id integer not null references users(id) on delete cascade,
  token varchar unique not null,
  primary key(id)
);

create index user_tokens_user_id_idx on user_tokens(user_id);
