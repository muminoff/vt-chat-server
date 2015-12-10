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


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: users; Type: TABLE; Schema: public; Owner: vt; Tablespace: 
--

CREATE TABLE users (
    id bigint NOT NULL,
    username character varying(16) NOT NULL,
    phone_number character varying(15) NOT NULL
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

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vt
--

COPY users (id, username, phone_number) FROM stdin;
1	sardor	998931234567
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vt
--

SELECT pg_catalog.setval('users_id_seq', 1, true);


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
-- Name: public; Type: ACL; Schema: -; Owner: sardor
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM sardor;
GRANT ALL ON SCHEMA public TO sardor;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

