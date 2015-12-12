/* topics table */
create table "topics" (
  "id" bigserial primary key,
  "name" character varying(32) not null,
  "parent_room" bigint not null references rooms(id),
  "is_archived" bool default false,
  "created_by" character varying(16) not null references users(username),
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);

/* topics table index */
create index active_topics on topics (id) where is_archived is not true;
