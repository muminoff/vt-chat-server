CREATE OR REPLACE FUNCTION generate_random_number(INTEGER, INTEGER) RETURNS INTEGER AS $$
DECLARE
    start_int ALIAS FOR $1;
    end_int ALIAS FOR $2;
BEGIN
    RETURN trunc(random() * (end_int-start_int) + start_int);
END;
$$ LANGUAGE 'plpgsql' STRICT;


create table "users" (
  "id" bigserial primary key,
  "username" character varying(16) not null unique,
  "phone_number" character varying(15) not null unique,
  "auth_token" character varying(32),
  "auth_token_expires" timestamp without time zone default (current_timestamp at time zone 'utc' + 30 * interval '1 day'),
  "activated" bool default false,
  "code" smallint default generate_random_number(1000, 9999),
  "imei" character varying(32),
  "is_admin" bool default false,
  "joined" timestamp without time zone default (now() at time zone 'utc'),
  "updated" timestamp without time zone default (now() at time zone 'utc'),
  "photo_url" character varying(255)
);

create unique index on users(auth_token);
