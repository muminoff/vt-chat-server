/* rooms table */
create table "rooms" (
  "id" bigserial primary key,
  "subject" character varying(32) not null unique,
  "description" character varying(64),
  "created_by" character varying(16) not null references users(username),
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);
