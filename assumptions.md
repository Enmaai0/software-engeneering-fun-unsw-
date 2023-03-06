1) Only characters encoded in valid US-ASCII will be inputted into the functions contained within the backend 
   of UNSW Memes. That is characters that are encoded through Unicode (UTF-8, UTF-16, UTF-32), and other 
   similar encoding types will not inputted into any of the functions. Therefore accounting for these types 
   of characters in the functions is irrelevant, and errors caused by these characters being inputted can be
   ignored. 

2) We aren't limited in the implementation of our project by barriers such as time complexity (big O notation) 
   and memory storage. That is we have no restraints in regards to how long it takes for our functions and execute
   and how much storage our dataStore needs. 

3) The email address of a user is used for authentication and security purposes, meaning that all emails are
   unique and are associated with unique data.

4) We are able to utelise any type of npm package in the implementation of our project.

5) The unique identifier number (id) for a user or channel should lie between 0 and 9999999.

6) The auhUserId is the same as the id contained within a users object in the dataStore. That is a user who enters
   123 into a function, will relate that authUserId to user with id 123.
