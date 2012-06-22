drop table if exists teams;

create table teams (
  id serial,
  name varchar(20) not null unique,
  email varchar(255) not null unique,
  size integer default(0)
);
