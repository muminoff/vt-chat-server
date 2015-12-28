#!/usr/bin/env sh

# Database and roles
psql -U postgres -c "drop database if exists vt"
psql -U postgres -c "drop role if exists vt"
psql -U postgres -c "create role vt with login password 'vt'"
psql -U postgres -c "create database vt owner vt encoding 'utf-8'"
psql -U postgres -c "grant all privileges on database vt to vt"

# Extensions
psql -U postgres -d vt -c 'create extension "uuid-ossp"'
psql -U postgres -d vt -c "create extension pgcrypto"

# Tables
psql -d vt -U vt <utils/schema/users.sql
psql -d vt -U vt <utils/schema/tokens.sql
psql -d vt -U vt <utils/schema/rooms.sql
psql -d vt -U vt <utils/schema/topics.sql
psql -d vt -U vt <utils/schema/announcements.sql
psql -d vt -U vt <utils/schema/subscribers.sql
psql -d vt -U vt <utils/schema/messages.sql

# VT Robot
psql -d vt -U vt -c "insert into users (username, phone_number, gcm_token) values('VTRobot', '777', 'vtrobot_gcm_token')"

# Dummy rooms
psql -d vt -U vt -c "insert into rooms (subject, description, owner) values('Уведомления', 'Важные уведомления', 1), ('SOS', 'Нужна помощь', 1), ('Потеря', 'Ищем документы, и тд.', 1), ('Базар', 'Купля-продажа', 1), ('Днюхи', 'Поздравляем', 1), ('Оффтоп', 'Обо всем', 1)"
