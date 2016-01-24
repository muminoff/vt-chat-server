#!/usr/bin/env sh

# Truncate tables
psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "TRUNCATE announcements;"
psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "TRUNCATE subscribers CASCADE;"
psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "TRUNCATE messages CASCADE;"
psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "TRUNCATE topics CASCADE;"
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt <utils/schema/rooms.sql
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt <utils/schema/topics.sql
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt <utils/schema/announcements.sql
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt <utils/schema/subscribers.sql
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt <utils/schema/messages.sql

# VT Robot
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "insert into users (username, phone_number, gcm_token) values('VTRobot', '777', 'vtrobot_gcm_token')"
 
# Predefined rooms
# psql -h vt.cgsrhj75wyom.us-west-2.rds.amazonaws.com -d vt -U vt -c "insert into rooms (subject, description, owner) values('Уведомления', 'Важные уведомления', 1), ('SOS', 'Нужна помощь', 1), ('Потеря', 'Ищем документы, и тд.', 1), ('Базар', 'Купля-продажа', 1), ('Днюхи', 'Поздравляем', 1), ('Оффтоп', 'Обо всем', 1)"
