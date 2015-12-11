create table "users" (
  "id" bigserial primary key,
  "username" character varying(16) not null unique,
  "phone_number" character varying(15) not null unique,
  "auth_token" character varying(32) not null unique,
  "joined" timestamp without time zone default (now() at time zone 'utc'),
  "updated" timestamp without time zone default (now() at time zone 'utc'),
  "photo_url" character varying(255)
);

create table "tokens" (
  "user_id" bigint not null unique references users(id),
  "user_username" character varying(16) references users(username),
  "token" character varying(32) not null unique,
  "generated_at" timestamp without time zone default (now() at time zone 'utc'),
  "expires_at" timestamp without time zone default (current_timestamp at time zone 'utc' + 30 * interval '1 day')
);

create or replace function generate_token() returns trigger as
$body$
begin
    insert into tokens("user_id", "user_username", token)
    values(new.id, new.username, md5(concat('', new.id::text, random()::text)));
    return new;
end;
$body$
language plpgsql;

create trigger trig_generate_token
  after insert on users
  for each row
  execute procedure generate_token();

create table "rooms" (
  "id" bigserial primary key,
  "subject" character varying(32) not null unique,
  "created_by" bigint not null references users(id),
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);

create table "topics" (
  "id" bigserial primary key,
  "name" character varying(32) not null,
  "description" character varying(64),
  "parent_room" bigint not null references rooms(id),
  "is_archived" bool default false,
  "created_by" bigint not null references users(id),
  "created_at" timestamp without time zone default (now() at time zone 'utc')
);

create index active_topics on topics (id) where is_archived is not true;

create table "subscribers" (
  "topic_id" bigint not null references topics(id),
  "user_id" bigint not null references users(id),
  "subscribed_at" timestamp without time zone default (now() at time zone 'utc'),
  "is_moderator" bool default false
);

create table "messages" (
  "id" bigserial primary key,
  "topic_id" bigint not null references topics(id),
  "sender_id" bigint not null references users(id),
  "reply_to" bigint references messages(id),
  "body" text not null,
  "sent_at" timestamp without time zone default (now() at time zone 'utc')
);

create table "message_statuses" (
  "message_id" bigint not null references messages(id),
  "receiver_id" bigint not null references users(id),
  "is_delivered" bool default false,
  "is_read" bool default false,
  unique("message_id", "receiver_id")
);

create table "message_attributes" (
  "message_id" bigint not null references messages(id),
  "likes" bigint default 0,
  "hates" bigint default 0
);

create index not_delivered_messages on message_statuses (message_id) where is_delivered is not true;
create index unread_messages on message_statuses (message_id) where is_read is not true;
create index top_liked_messages on message_attributes (likes) where likes > 100;
create index top_hated_messages on message_attributes (hates) where hates > 100;

create table "blacklist" (
  "message_id" bigint not null references messages(id),
  "user_id" bigint not null references users(id),
  "blacklisted_at" timestamp without time zone default (now() at time zone 'utc'),
  "blacklisted_until" timestamp without time zone default (current_timestamp at time zone 'utc' + 3 * interval '1 day')
);
