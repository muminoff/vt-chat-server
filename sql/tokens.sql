/* tokens table */
create table tokens (
  "id" bigserial primary key,
  "username" character varying(16) not null unique references users(username),
  "token" character varying(32) default replace(uuid_generate_v4()::text, '-', '')::text,
  "generated" timestamp without time zone default (now() at time zone 'utc'),
  "expires" timestamp without time zone default (now() at time zone 'utc' + 30 * interval '1 day')
);

create or replace function generate_token() returns trigger as
$body$
begin
    insert into tokens("username")
    values(new.username);
    return new;
end;
$body$
language plpgsql;

create trigger trig_generate_token
  after insert on users
  for each row
  execute procedure generate_token();
