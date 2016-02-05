--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

--
-- Name: generate_token(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION generate_token() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    insert into tokens("user_id")
    values(new.id);
    return new;
end;
$$;


ALTER FUNCTION public.generate_token() OWNER TO vt;

--
-- Name: member_joins_topic_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION member_joins_topic_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  PERFORM pg_notify('topic_events', json_build_object('event_type', 'joined', 'data', json_build_object('topic_id', NEW.topic_id, 'user', json_build_object('id', NEW.user_id, 'username', (SELECT username FROM users WHERE id=NEW.user_id)::text), 'subscribed_at', (extract(epoch from NEW.subscribed_at) * 1000)::int8))::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.member_joins_topic_notify() OWNER TO vt;

--
-- Name: member_leaves_topic_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION member_leaves_topic_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  PERFORM pg_notify('topic_events', json_build_object('event_type', 'left', 'data', json_build_object('topic_id', OLD.topic_id, 'user', json_build_object('id', OLD.user_id, 'username', (SELECT username FROM users WHERE id=OLD.user_id)::text), 'subscribed_at', (extract(epoch from OLD.subscribed_at) * 1000)::int8))::text);
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.member_leaves_topic_notify() OWNER TO vt;

--
-- Name: message_create_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION message_create_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'sent', 'data', json_build_object('id', NEW.id, 'stamp_id', NEW.stamp_id, 'topic_id', NEW.topic_id, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'reply_to', NEW.reply_to, 'body', NEW.body, 'attrs', NEW.attrs, 'sent_at', (extract(epoch from NEW.sent_at) * 1000)::int8, 'is_media', NEW.is_media, 'media_type', NEW.media_type, 'media_path', NEW.media_path, 'media_name', NEW.media_name, 'media_size', NEW.media_size))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'updated', 'data', json_build_object('id', NEW.id, 'stamp_id', NEW.stamp_id, 'topic_id', NEW.topic_id, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'reply_to', NEW.reply_to, 'body', NEW.body, 'attrs', NEW.attrs, 'sent_at', (extract(epoch from NEW.sent_at) * 1000)::int8, 'is_media', NEW.is_media, 'media_type', NEW.media_type, 'media_path', NEW.media_path, 'media_name', NEW.media_name, 'media_size', NEW.media_size))::text);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM pg_notify('message_events', json_build_object('event_type', 'deleted', 'data', json_build_object('id', OLD.id, 'stamp_id', OLD.stamp_id, 'topic_id', OLD.topic_id, 'owner', json_build_object('id', OLD.owner, 'username', (SELECT username FROM users WHERE id=OLD.owner)::text), 'reply_to', OLD.reply_to, 'body', OLD.body, 'attrs', OLD.attrs, 'sent_at', (extract(epoch from OLD.sent_at) * 1000)::int8, 'is_media', OLD.is_media, 'media_type', OLD.media_type, 'media_path', OLD.media_path, 'media_name', OLD.media_name, 'media_size', OLD.media_size))::text);
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.message_create_notify() OWNER TO vt;

--
-- Name: topic_close_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION topic_close_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   IF NOT (NEW.closed = OLD.closed) THEN
    NEW.closed_at = now() at time zone 'utc';
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'closed', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'closed', NEW.closed, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8, 'closed_at', (extract(epoch from NEW.closed_at) * 1000)::int8))::text);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.topic_close_notify() OWNER TO vt;

--
-- Name: topic_create_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION topic_create_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
  PERFORM pg_notify('topic_events', json_build_object('event_type', 'created', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'closed', NEW.closed, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8, 'closed_at', (extract(epoch from NEW.closed_at) * 1000)::int8))::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.topic_create_notify() OWNER TO vt;

--
-- Name: topic_move_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION topic_move_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   IF NOT (NEW.parent_room = OLD.parent_room) THEN
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'moved', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'closed', NEW.closed, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8, 'closed_at', (extract(epoch from NEW.closed_at) * 1000)::int8))::text);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.topic_move_notify() OWNER TO vt;

--
-- Name: topic_update_notify(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION topic_update_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   IF NOT (NEW.title = OLD.title) OR NOT (NEW.body = OLD.body) OR NOT (NEW.attrs = OLD.attrs) THEN
    PERFORM pg_notify('topic_events', json_build_object('event_type', 'updated', 'data', json_build_object('id', NEW.id, 'title', NEW.title, 'body', NEW.body, 'parent_room', NEW.parent_room, 'closed', NEW.closed, 'owner', json_build_object('id', NEW.owner, 'username', (SELECT username FROM users WHERE id=NEW.owner)::text), 'attrs', NEW.attrs, 'created_at', (extract(epoch from NEW.created_at) * 1000)::int8, 'closed_at', (extract(epoch from NEW.closed_at) * 1000)::int8))::text);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.topic_update_notify() OWNER TO vt;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: vt
--

CREATE FUNCTION update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    new.modified = now() at time zone 'utc';
    return new;	
end;

$$;


ALTER FUNCTION public.update_modified_column() OWNER TO vt;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE announcements (
    id bigint NOT NULL,
    title character varying(32) NOT NULL,
    body text,
    parent_room bigint NOT NULL,
    archived boolean DEFAULT false,
    owner bigint NOT NULL,
    attrs jsonb,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE announcements OWNER TO vt;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE announcements_id_seq OWNER TO vt;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE announcements_id_seq OWNED BY announcements.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE messages (
    id bigint NOT NULL,
    stamp_id text,
    topic_id bigint NOT NULL,
    owner bigint NOT NULL,
    reply_to bigint,
    body text NOT NULL,
    attrs jsonb,
    sent_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    has_media boolean DEFAULT false
);


ALTER TABLE messages OWNER TO vt;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE messages_id_seq OWNER TO vt;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE messages_id_seq OWNED BY messages.id;


--
-- Name: rooms; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE rooms (
    id bigint NOT NULL,
    subject character varying(32) NOT NULL,
    description character varying(64),
    owner bigint NOT NULL,
    attrs jsonb,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE rooms OWNER TO vt;

--
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE rooms_id_seq OWNER TO vt;

--
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE rooms_id_seq OWNED BY rooms.id;


--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE subscribers (
    topic_id bigint NOT NULL,
    user_id bigint NOT NULL,
    subscribed_at timestamp without time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE subscribers OWNER TO vt;

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(32) DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text),
    generated timestamp without time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE tokens OWNER TO vt;

--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tokens_id_seq OWNER TO vt;

--
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE tokens_id_seq OWNED BY tokens.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE topics (
    id bigint NOT NULL,
    title character varying(32) NOT NULL,
    body text,
    parent_room bigint NOT NULL,
    closed boolean DEFAULT false,
    archived boolean DEFAULT false,
    owner bigint NOT NULL,
    attrs jsonb,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    closed_at timestamp without time zone,
    archived_at timestamp without time zone
);


ALTER TABLE topics OWNER TO vt;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE topics_id_seq OWNER TO vt;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE topics_id_seq OWNED BY topics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE users (
    id bigint NOT NULL,
    username character varying(16) NOT NULL,
    phone_number character varying(15) NOT NULL,
    gcm_token text NOT NULL,
    device_type character varying(8) NOT NULL,
    roles jsonb,
    profile jsonb,
    vt jsonb,
    joined timestamp without time zone DEFAULT timezone('utc'::text, now()),
    modified timestamp without time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE users OWNER TO vt;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vt
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO vt;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vt
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY announcements ALTER COLUMN id SET DEFAULT nextval('announcements_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY messages ALTER COLUMN id SET DEFAULT nextval('messages_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY rooms ALTER COLUMN id SET DEFAULT nextval('rooms_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY tokens ALTER COLUMN id SET DEFAULT nextval('tokens_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY topics ALTER COLUMN id SET DEFAULT nextval('topics_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: vt
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: rooms_subject_key; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY rooms
    ADD CONSTRAINT rooms_subject_key UNIQUE (subject);


--
-- Name: tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: topics_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_username_key; Type: CONSTRAINT; Schema: public; Owner: vt; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: active_announcements; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX active_announcements ON announcements USING btree (id) WHERE (archived IS NOT TRUE);


--
-- Name: topics_id_idx; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX topics_id_idx ON topics USING btree (id) WHERE (archived IS NOT TRUE);


--
-- Name: topics_id_idx1; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX topics_id_idx1 ON topics USING btree (id) WHERE (closed IS NOT TRUE);


--
-- Name: users_device_type_idx; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX users_device_type_idx ON users USING btree (device_type);


--
-- Name: users_expr_idx; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX users_expr_idx ON users USING btree (((roles ->> 'admin'::text)));


--
-- Name: users_expr_idx1; Type: INDEX; Schema: public; Owner: vt; Tablespace: 
--

CREATE INDEX users_expr_idx1 ON users USING btree (((vt ->> 'sticker'::text)));


--
-- Name: trig_generate_token; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_generate_token AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE generate_token();


--
-- Name: trig_member_joins_topic_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_member_joins_topic_notify AFTER INSERT ON subscribers FOR EACH ROW EXECUTE PROCEDURE member_joins_topic_notify();


--
-- Name: trig_member_leaves_topic_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_member_leaves_topic_notify BEFORE DELETE ON subscribers FOR EACH ROW EXECUTE PROCEDURE member_leaves_topic_notify();


--
-- Name: trig_message_create_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_message_create_notify AFTER INSERT ON messages FOR EACH ROW EXECUTE PROCEDURE message_create_notify();


--
-- Name: trig_topic_close_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_topic_close_notify BEFORE UPDATE ON topics FOR EACH ROW EXECUTE PROCEDURE topic_close_notify();


--
-- Name: trig_topic_create_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_topic_create_notify AFTER INSERT ON topics FOR EACH ROW EXECUTE PROCEDURE topic_create_notify();


--
-- Name: trig_topic_move_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_topic_move_notify BEFORE UPDATE ON topics FOR EACH ROW EXECUTE PROCEDURE topic_move_notify();


--
-- Name: trig_topic_update_notify; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER trig_topic_update_notify BEFORE UPDATE ON topics FOR EACH ROW EXECUTE PROCEDURE topic_update_notify();


--
-- Name: update_modified_column_trigger; Type: TRIGGER; Schema: public; Owner: vt
--

CREATE TRIGGER update_modified_column_trigger BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


--
-- Name: announcements_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY announcements
    ADD CONSTRAINT announcements_owner_fkey FOREIGN KEY (owner) REFERENCES users(id);


--
-- Name: announcements_parent_room_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY announcements
    ADD CONSTRAINT announcements_parent_room_fkey FOREIGN KEY (parent_room) REFERENCES rooms(id);


--
-- Name: messages_reply_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES messages(id);


--
-- Name: messages_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_sender_fkey FOREIGN KEY (owner) REFERENCES users(id);


--
-- Name: messages_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY messages
    ADD CONSTRAINT messages_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES topics(id);


--
-- Name: rooms_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY rooms
    ADD CONSTRAINT rooms_owner_fkey FOREIGN KEY (owner) REFERENCES users(id);


--
-- Name: subscribers_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY subscribers
    ADD CONSTRAINT subscribers_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES topics(id);


--
-- Name: subscribers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY subscribers
    ADD CONSTRAINT subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY tokens
    ADD CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: topics_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY topics
    ADD CONSTRAINT topics_owner_fkey FOREIGN KEY (owner) REFERENCES users(id);


--
-- Name: topics_parent_room_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vt
--

ALTER TABLE ONLY topics
    ADD CONSTRAINT topics_parent_room_fkey FOREIGN KEY (parent_room) REFERENCES rooms(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: vt
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM vt;
GRANT ALL ON SCHEMA public TO vt;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

