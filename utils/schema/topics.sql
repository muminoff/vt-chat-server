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

/* topic_create_notify */
CREATE OR REPLACE FUNCTION topic_create_notify() RETURNS trigger AS $$
DECLARE
id bigint;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    id = NEW.id;
  ELSE
    id = OLD.id;
  END IF;
  PERFORM pg_notify('topic_events', json_build_object('topic_id', id)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* topic_events publish */ 
create trigger trig_topic_create_notify
  after insert on topics
  for each row
  execute procedure topic_create_notify();
