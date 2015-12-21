/* users table */
create table users (
  "id" bigserial primary key,
  "username" character varying(16) not null unique,
  "phone_number" character varying(15) not null unique,
  "roles" jsonb,
  "profile" jsonb,
  "vt" jsonb,
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

/* create view user_profiles as */
/* select id, username, phone_number, roles, profile, vt, extract(epoch from joined)::int as joined, extract(epoch from modified)::int as modified */
/* from users; */
