/* messages table */
create table "messages" (
  "id" bigserial primary key,
  "topic_id" bigint not null references topics(id),
  "sender" bigint not null references users(id),
  "reply_to" bigint references messages(id),
  "body" text not null,
  "attrs" jsonb,
  "sent_at" timestamp without time zone default (now() at time zone 'utc')
);

/* message statuses table */
create table "message_statuses" (
  "message_id" bigint not null references messages(id),
  "user_id" bigint not null references users(id),
  "delivered" bool default true,
  "read" bool default false,
  unique("message_id", "user_id")
);

/* message statuses table */
create table "message_attributes" (
  "message_id" bigint not null references messages(id),
  "likes" bigint default 0,
  "hates" bigint default 0
);
