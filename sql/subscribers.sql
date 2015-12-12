/* subscribers table */
create table "subscribers" (
  "topic_id" bigint not null references topics(id),
  "username" character varying(16) not null references users(username),
  "subscribed_at" timestamp without time zone default (now() at time zone 'utc'),
  "is_moderator" bool default false
);
