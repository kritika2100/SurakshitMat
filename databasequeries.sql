create database IntegratedProject;
use IntegratedProject;
CREATE TABLE voter (
    uid INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(30) NOT NULL,
    mname VARCHAR(20),
    lname VARCHAR(30) NOT NULL,
    dob DATE NOT NULL,
    mobileno BIGINT(10),
    aadharid VARCHAR(20) UNIQUE,
    pass VARCHAR(255) NOT NULL,
    nationality VARCHAR(6) NOT NULL,
    email VARCHAR(100) NOT NULL,
	state VARCHAR(10) DEFAULT '',
    district VARCHAR(10) DEFAULT '',
    status TINYINT(1) DEFAULT 0,
    softdelete TINYINT(1) DEFAULT 1,
    voterstatus tinyint(1) default 0,
    voted_candidate_id INT DEFAULT NULL, -- New column added to store the ID of the candidate the voter voted for
    FOREIGN KEY (voted_candidate_id) REFERENCES candidates(candidate_id) -- Foreign key constraint
);

create table admin(
 uid INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(30) NOT NULL,
    lname VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    mobileno BIGINT(10),
    pass VARCHAR(255) NOT NULL,
	username VARCHAR(20),
    status INT(1),
    softdelete INT(1)
    );
 CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    full_name VARCHAR(255) NOT NULL ,
    party_name VARCHAR(255) NOT NULL ,
    dob DATE NOT NULL,
    nationality VARCHAR(100) NOT NULL,
   state VARCHAR(10) DEFAULT '',
   district VARCHAR(10) DEFAULT '',
	email VARCHAR(100),
    party_logo_path VARCHAR(255) ,
    votes INT NOT NULL DEFAULT 0
);
-- drop table candidates;
-- drop table voter;
 select * from voter;
--     select * from admin;
--     select * from candidates;
--     -- delete  from candidates where candidate_id=4;
--     delete from voter where uid=2;
    insert into admin values(1,"Kritika","Sharma","2105ksharma@gmail.com",7814038691,"Kritika#2003@","Kritika21",1,1);