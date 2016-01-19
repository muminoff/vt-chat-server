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
BEGIN
  PERFORM pg_notify('topic_events', json_build_object('data', NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* topic_events publish */ 
create trigger trig_topic_create_notify
  after insert on topics
  for each row
  execute procedure topic_create_notify();
