/* subscribers table */
create table "subscribers" (
  "topic_id" bigint not null references topics(id),
  "user_id" bigint not null references users(id),
  "subscribed_at" timestamp without time zone default (now() at time zone 'utc'),
  "moderator" bool default false
);

/* on topic create subscibe all function */
CREATE FUNCTION on_topic_create_subscribe_all() RETURNS trigger AS $$
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


create trigger trig_on_topic_create_subscribe_all
  after insert on topics
  for each row
  execute procedure on_topic_create_subscribe_all();

/* on user create subscibe all function */
CREATE FUNCTION on_user_create_subscribe_all() RETURNS trigger AS $$
DECLARE
this_topic RECORD;
BEGIN

  FOR this_topic IN SELECT id FROM topics LOOP
    RAISE NOTICE 'Subscriber function executing for user %...', this_user.id;
    insert into subscribers (topic_id, "user_id") values(this_topic.id, new.id);
  END LOOP;

  RETURN new;
END;
$$ LANGUAGE plpgsql;


create trigger trig_on_user_create_subscribe_all
  after insert on users
  for each row
  execute procedure on_user_create_subscribe_all();
