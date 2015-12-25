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
psql -d vt -U vt <utils/schema/users.sql
psql -d vt -U vt <utils/schema/tokens.sql
psql -d vt -U vt <utils/schema/rooms.sql
psql -d vt -U vt <utils/schema/topics.sql
psql -d vt -U vt <utils/schema/announcements.sql
psql -d vt -U vt <utils/schema/subscribers.sql
psql -d vt -U vt <utils/schema/messages.sql

# Dummy users
psql -d vt -U vt -c "insert into users (username, phone_number) values('testuser1', '9989010000000'), ('testuser2', '9989010000001'), ('testuser3', '9989010000002'), ('testuser4', '9989010000003'),
('testuser5', '9989010000004'), ('testuser6', '9989010000005'), ('testuser7', '9989010000006'), ('testuser8', '9989010000007'), ('testuser9', '9989010000008'), ('testuser10', '9989010000009')"

# Dummy rooms
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('Уведомления', 'Важные уведомления', 1), ('SOS', 'Нужна помощь', 2), ('Потеря', 'Ищем документы, и тд.', 3), ('Базар', 'Купля-продажа', 4), ('Днюхи', 'Поздравляем', 5), ('Оффтоп', 'Обо всем', 6)"
