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
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: vt
--

COPY topics (id, title, body, parent_room, closed, archived, owner, attrs, created_at, closed_at, archived_at) FROM stdin;
1	1-BASIC	1-BASIC	1	f	f	4	null	2016-02-10 16:08:21.878036	\N	\N
2	2-BASIC	2-BASIC	1	f	f	4	null	2016-02-10 16:08:42.999703	\N	\N
3	3-BASIC	3-BASIC	1	f	f	4	null	2016-02-10 16:09:00.218701	\N	\N
4	4-BASIC	4-BASIC	1	f	f	4	null	2016-02-10 16:09:09.934014	\N	\N
5	5-BASIC	5-BASIC	1	f	f	4	null	2016-02-10 16:09:18.280159	\N	\N
6	Администрация	Администрация	1	f	f	4	null	2016-02-10 16:09:32.11188	\N	\N
7	Эвакуаторы	Эвакуаторы	3	f	f	4	null	2016-02-10 16:15:54.325096	\N	\N
8	Такси	Такси	3	f	f	4	null	2016-02-10 16:16:12.312202	\N	\N
9	Сервисы	Сервисы	3	f	f	4	null	2016-02-10 16:16:22.306878	\N	\N
10	Салоны	Салоны	3	f	f	4	null	2016-02-10 16:16:31.80628	\N	\N
11	Нотариусы	Нотариусы	3	f	f	4	null	2016-02-10 16:17:09.634033	\N	\N
12	Мойки	Мойки	3	f	f	4	null	2016-02-10 16:17:17.310033	\N	\N
13	АЗС	АЗС	3	f	f	4	null	2016-02-10 16:18:06.51855	\N	\N
14	Автошколы	Автошколы	3	f	f	4	null	2016-02-10 16:18:15.309148	\N	\N
15	Услуги	Услуги	4	f	f	4	null	2016-02-10 16:20:32.981631	\N	\N
16	Запчасти	Запчасти	4	f	f	4	null	2016-02-10 16:20:45.085028	\N	\N
17	Аксессуары	Аксессуары	4	f	f	4	null	2016-02-10 16:21:19.163613	\N	\N
18	Авто	Авто	4	f	f	4	null	2016-02-10 16:21:30.343709	\N	\N
19	Юмор	Юмор	5	f	f	4	null	2016-02-10 16:22:58.439399	\N	\N
20	Твори добро	Твори добро	5	f	f	4	null	2016-02-10 16:23:07.50097	\N	\N
21	Разное	Разное	5	f	f	4	null	2016-02-10 16:23:14.656556	\N	\N
22	Работа	Работа	5	f	f	4	null	2016-02-10 16:23:24.12183	\N	\N
23	Опросы	Опросы	5	f	f	4	null	2016-02-10 16:23:32.449514	\N	\N
24	Даты	Даты	5	f	f	4	null	2016-02-10 16:23:39.589944	\N	\N
25	Предложения	Предложения	6	f	f	4	null	2016-02-10 16:26:14.279367	\N	\N
26	Жалобы	Жалобы	6	f	f	4	null	2016-02-10 16:26:21.963175	\N	\N
27	Migration	Migration	7	f	f	2	null	2016-02-11 00:26:05.51044	\N	\N
28	Issues	Issues	7	f	f	5	null	2016-02-11 01:17:47.061076	\N	\N
\.


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vt
--

SELECT pg_catalog.setval('topics_id_seq', 28, true);


--
-- PostgreSQL database dump complete
--

