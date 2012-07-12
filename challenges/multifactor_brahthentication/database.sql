drop table if exists users cascade;
drop table if exists user_tokens cascade;

create table users (
  id serial,
  username varchar(25) unique not null,
  password varchar(100) not null,
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

insert into users (username, password) values
  ('admin', 'did you try to brute force this?'),
  ('pwnies', 'it''s probably not going to help'),
  ('lulzsec', 'hey i''m not encrypted'),
  ('dc949', 'come bribe us if you need a hint. We like Chipotle');

insert into user_tokens (user_id, token) values
  (1, 'e5fa44f2b31c1fb553b6021e7360d07d5d91ff5e'),
  (1, '7448d8798a4380162d4b56f9b452e2f6f9e24e7a'),
  (2, 'a3db5c13ff90a36963278c6a39e4ee3c22e2a436'),
  (3, '9c6b057a2b9d96a4067a749ee3b3b0158d390cf1'),
  (4, '5d9474c0309b7ca09a182d888f73b37a8fe1362c'),
  (4, 'ccf271b7830882da1791852baeca1737fcbe4b90');
