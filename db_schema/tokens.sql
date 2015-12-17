/* tokens table */
create table tokens (
  "id" bigserial primary key,
  "user_id" bigint not null references users(id),
  "token" character varying(32) default replace(gen_random_uuid()::text, '-', '')::text,
  "generated" timestamp without time zone default (now() at time zone 'utc')
);

create or replace function generate_token() returns trigger as
$body$
begin
    insert into tokens("user_id")
    values(new.id);
    return new;
end;
$body$
language plpgsql;

create trigger trig_generate_token
  after insert on users
  for each row
  execute procedure generate_token();
