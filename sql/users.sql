/* verification code generator function */
create or replace function generate_random_number(integer, integer) returns integer as $$
declare
    start_int alias for $1;
    end_int alias for $2;
begin
    return trunc(random() * (end_int-start_int) + start_int);
end;
$$ language 'plpgsql' strict;

/* users table */
create table users (
  "id" bigserial primary key,
  "username" character varying(16) not null unique,
  "phone_number" character varying(15) not null unique,
  "verification_code" smallint default generate_random_number(1000, 9999),
  "device_id" character varying(32) not null unique,
  "activated" bool default false,
  "is_admin" bool default false,
  "joined" timestamp without time zone default (now() at time zone 'utc'),
  "modified" timestamp without time zone default (now() at time zone 'utc')
);

/* modified column update function */
create or replace function update_modified_column()	
returns trigger as $$
begin
    new.modified = now() at time zone 'utc';
    return new;	
end;

$$ language 'plpgsql';

/* modified column update trigger */
create trigger update_modified_column_trigger 
before update on users 
for each row 
  execute procedure update_modified_column();
