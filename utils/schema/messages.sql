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

/* message_create_notify */
CREATE OR REPLACE FUNCTION message_create_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('message_events', json_build_object('data', NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* message_events publish */ 
create trigger trig_message_create_notify
  after insert on messages
  for each row
  execute procedure message_create_notify();
