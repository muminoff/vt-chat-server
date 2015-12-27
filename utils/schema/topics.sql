/* topics table */
create table "topics" (
  "id" bigserial primary key,
  "title" character varying(32) not null,
  "body" text,
  "parent_room" bigint not null references rooms(id),
  "solved" bool default false,
  "archived" bool default false,
  "owner" bigint not null references users(id),
  "attrs" jsonb,
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);
