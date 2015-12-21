/* subscribers table */
create table "subscribers" (
  "topic_id" bigint not null references topics(id),
  "user_id" bigint not null references users(id),
  "subscribed_at" timestamp without time zone default (now() at time zone 'utc'),
  "moderator" bool default false
);

/* create or replace function subscribe_to_all_topics() returns trigger as declare */
/* this_user record; */
/* $body$ */
/* begin */
/*   insert into subscribers(topic_id, "user_id") */
/*   values(new.id, this_user_id); */
/*   return new; */
/* end; */
/* $body$ */
/* language plpgsql; */

CREATE FUNCTION subscribe_all() RETURNS trigger AS $$
DECLARE
this_user RECORD;
BEGIN

  FOR this_user IN SELECT id FROM users LOOP
    RAISE NOTICE 'Subscriber function executing for user %...', this_user.id;
    insert into subscribers (topic_id, "user_id") values(new.id, this_user.id);
  END LOOP;

  RETURN new;
END;
$$ LANGUAGE plpgsql;


create trigger trig_subscribe_all
  after insert on topics
  for each row
  execute procedure subscribe_all();
