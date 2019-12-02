CREATE TABLE users_t (
  id int(11) NOT NULL AUTO_INCREMENT,
  uname varchar(50),
  email varchar(50),
  fname varchar(50),
  lname varchar(50),
  age int(3),
  experience varchar(50),
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

INSERT INTO users_t (id, uname, email, fname, lname, age, experience) VALUES
(1, 'user1', 'Default@gmail.com', 'User', 'hello', 30, 'novice');
