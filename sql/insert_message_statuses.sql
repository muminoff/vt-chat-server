insert into message_statuses ("message_id", "receiver_id", is_delivered, is_read) values(1, 1, true, true),
(1, 2, true, true), (1, 3, true, false), (2, 1, true, false), (2, 2, true, false),
(2, 3, true, false), (3, 1, false, false), (3, 2, true, false), (3, 3, false, false);
