/* messages table */
create table "messages" (
  "id" bigserial primary key,
  "topic_id" bigint not null references topics(id),
  "sender" character varying(16) not null references users(username),
  "reply_to" bigint references messages(id),
  "body" text not null,
  "sent_at" timestamp without time zone default (now() at time zone 'utc')
);
