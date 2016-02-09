--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: vt
--

COPY rooms (id, subject, description, owner, attrs, created_at) FROM stdin;
2	SOS	Нужна помощь	1	\N	2016-01-01 00:00:00
6	Обратная связь	Ваши отзывы	1	\N	2016-01-01 00:00:00
5	Беседка	Место для оффтопа	1	\N	2016-02-05 00:00:00
1	Обсуждение	Сообщения сообщества	1	\N	2016-01-01 00:00:00
4	Гараж	Ремонт авто	1	\N	2016-01-01 00:00:00
7	Разработчики	Ваши пожелания	1	\N	2016-01-01 00:00:00
3	Справочник	Номера телефонов	1	\N	2016-01-01 00:00:00
\.


--
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vt
--

SELECT pg_catalog.setval('rooms_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

