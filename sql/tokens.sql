/* tokens table */
create table tokens (
  "id" bigserial primary key,
  "username" character varying(16) not null unique references users(username),
  "auth_token" character varying(32) default replace(uuid_generate_v4()::text, '-', '')::text,
  "generated" timestamp without time zone default (now() at time zone 'utc'),
  "expires" timestamp without time zone default (now() at time zone 'utc' + 30 * interval '1 day')
)
