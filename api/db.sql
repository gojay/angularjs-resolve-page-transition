CREATE TABLE `phones` (
  `phone_id` bigint(20) unsigned NOT NULL auto_increment,
  `phone_parent` tinyint(3) unsigned default '0',
  `phone_type` varchar(255) NOT NULL,
  `phone_name` varchar(255) NOT NULL,
  `phone_slug` varchar(255) NOT NULL,
  `phone_image` varchar(255) default NULL,
  `phone_description` text NOT NULL,
  `phone_order` tinyint(4) default '0',
  `phone_date` datetime NOT NULL,
  `phone_status` char(1) NOT NULL,
  PRIMARY KEY  (`phone_id`),
  UNIQUE KEY `phone_id` (`phone_id`)
);

CREATE TABLE `phonemeta` (
  `meta_id` bigint(20) unsigned NOT NULL auto_increment,
  `meta_name` varchar(255) NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY  (`meta_id`,`meta_name`)
);

CREATE TABLE `images` (
  `image_id` bigint(20) unsigned NOT NULL auto_increment,
  `phone_id` bigint(20) unsigned NOT NULL,
  `filename` varchar(255) NOT NULL,
  PRIMARY KEY  (`image_id`),
  UNIQUE KEY `image_id` (`image_id`),
  KEY `phone_id` (`phone_id`)
);