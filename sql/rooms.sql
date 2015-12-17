/* rooms table */
create table "rooms" (
  "id" bigserial primary key,
  "subject" character varying(32) not null unique,
  "description" character varying(64),
  "owner" bigint not null references users(id),
  "attrs" jsonb,
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);
