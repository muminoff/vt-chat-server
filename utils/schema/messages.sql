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
  IF (TG_OP = 'INSERT') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'sent', 'data', json_build_object('id', NEW.id, 'stamp_id', NEW.stamp_id, 'topic_id', NEW.topic_id, 'sender', NEW.sender, 'reply_to', NEW.reply_to, 'body', NEW.body, 'attrs', NEW.attrs, 'sent_at', (extract(epoch from NEW.sent_at) * 1000)::int8))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'updated', 'data', json_build_object('id', NEW.id, 'stamp_id', NEW.stamp_id, 'topic_id', NEW.topic_id, 'sender', NEW.sender, 'reply_to', NEW.reply_to, 'body', NEW.body, 'attrs', NEW.attrs, 'sent_at', (extract(epoch from NEW.sent_at) * 1000)::int8))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'deleted', 'data', json_build_object('id', OLD.id, 'stamp_id', OLD.stamp_id, 'topic_id', OLD.topic_id, 'sender', OLD.sender, 'reply_to', OLD.reply_to, 'body', OLD.body, 'attrs', OLD.attrs, 'sent_at', (extract(epoch from OLD.sent_at) * 1000)::int8))::text);
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* message_events publish */ 
create trigger trig_message_create_notify
  after insert on messages
  for each row
  execute procedure message_create_notify();
