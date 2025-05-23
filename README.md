[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/WkLPf7o5)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=11168133&assignment_repo_type=AssignmentRepo)

how to use api key - https://spoonacular.com/food-api/docs#Authentication

what we changed:
- changed User post req to Register path
- added Login, Logout req
- added (get,post,delete) favorites to api
- added sql tables

to discuss:

decisions:
- template -> api
- local recipes will have an id that may conflic with spoonacular ids so 
the tables will have a referance of the source of the recipe and the server will
broadcast id's as L(id) for locally saved recipes and S(id) for spoonacular recipes
keeping thee uniqueness of the ids

TODO:
- hash or smt the api key as it is not safe to save it in plaintext
- check what to do with the errors
- fix comments
- resplit the files
- sort the gets by the date or smth

Done: 
- Register user
- Login?
- Logout?
- Get full recipe from spoon and local db
- Created dbs 
- added watched, favorites and likes