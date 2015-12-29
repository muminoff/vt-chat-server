/* messages table */
create table "messages" (
  "id" bigserial primary key,
  "stamp_id" text,
  "topic_id" bigint not null references topics(id),
  "sender" bigint not null references users(id),
  "reply_to" bigint references messages(id),
  "body" text not null,
  "attrs" jsonb,
  "sent_at" timestamp without time zone default (now() at time zone 'utc')
);
