/* topics table */
create table "topics" (
  "id" bigserial primary key,
  "title" character varying(32) not null,
  "body" text,
  "parent_room" bigint not null references rooms(id),
  "owner" character varying(16) not null references users(username),
  "is_archived" bool default false,
  "created_at" timestamp without time zone default (now() at time zone 'utc'),
  "data" hstore
);

/* topics table index */
create index active_topics on topics (id) where is_archived is not true;
