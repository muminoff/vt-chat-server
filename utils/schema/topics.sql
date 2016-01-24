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

/* topic index */
CREATE INDEX ON topics (id) WHERE archived IS NOT TRUE;
CREATE INDEX ON topics (id) WHERE solved IS NOT TRUE;

/* topic_create_notify */
CREATE OR REPLACE FUNCTION topic_create_notify() RETURNS trigger AS $$
DECLARE
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'created', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'solved', NEW.solved, 'archived', NEW.archived, 'owner', (SELECT username FROM users WHERE id=NEW.owner)::text, 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'updated', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'solved', NEW.solved, 'archived', NEW.archived, 'owner', (SELECT username FROM users WHERE id=NEW.owner)::text, 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'deleted', 'data', json_build_object('id', OLD.id, 'title', OLD.title, 'body', OLD.body, 'parent_room', OLD.parent_room, 'solved', OLD.solved, 'archived', OLD.archived, 'owner', (SELECT username FROM users WHERE id=OLD.owner)::text, 'attrs', OLD.attrs, 'created_at', (extract(epoch from OLD.created_at) * 1000)::int8))::text);
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* topic_events publish */ 
create trigger trig_topic_create_notify
  after insert on topics
  for each row
  execute procedure topic_create_notify();
