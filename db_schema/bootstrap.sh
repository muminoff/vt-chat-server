#!/usr/bin/env sh

# Database and roles
psql -c "drop database if exists vt"
psql -c "drop role if exists vt"
psql -c "create role vt with login password 'vt'"
psql -c "create database vt owner vt encoding 'utf-8'"
psql -c "grant all privileges on database vt to vt"

# Extensions
psql -d vt -c 'create extension "uuid-ossp"'
psql -d vt -c "create extension pgcrypto"

# Tables
psql -d vt -U vt <db_schema/users.sql
psql -d vt -U vt <db_schema/tokens.sql
psql -d vt -U vt <db_schema/rooms.sql
psql -d vt -U vt <db_schema/topics.sql
psql -d vt -U vt <db_schema/subscribers.sql
psql -d vt -U vt <db_schema/messages.sql

# Dummy users
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser1', '9989010000000')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser2', '9989010000001')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser3', '9989010000002')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser4', '9989010000003')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser5', '9989010000004')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser6', '9989010000005')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser7', '9989010000006')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser8', '9989010000007')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser9', '9989010000008')"
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser10', '9989010000009')"

# Dummy rooms
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 1', 'test room 1 description', 1)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 2', 'test room 2 description', 2)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 3', 'test room 3 description', 3)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 4', 'test room 4 description', 4)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 5', 'test room 5 description', 5)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 6', 'test room 6 description', 6)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 7', 'test room 7 description', 7)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 8', 'test room 8 description', 8)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 9', 'test room 9 description', 9)"
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('test room 10', 'test room 10 description', 10)"

# Dummy topics
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 1', 'test topic 1 question', 1, 10)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 2', 'test topic 2 question', 2, 9)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 3', 'test topic 3 question', 3, 8)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 4', 'test topic 4 question', 4, 7)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 5', 'test topic 5 question', 5, 6)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 6', 'test topic 6 question', 6, 5)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 7', 'test topic 7 question', 7, 4)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 8', 'test topic 8 question', 8, 3)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 9', 'test topic 9 question', 9, 2)"
psql -d vt -U vt -c "insert into topics (title, body, parent_room, owner) values('test topic 10', 'test topic 10 question', 10, 1)"

# Dummy messages
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 1, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 2, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 3, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 4, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 5, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 6, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 7, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 8, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 9, 'test message')"
psql -d vt -U vt -c "insert into messages (topic_id, sender, body) values(1, 10, 'test message')"
