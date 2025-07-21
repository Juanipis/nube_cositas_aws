Base de datos:
172.31.84.125

backend:
172.31.84.188

frontedn:
172.31.81.41

postgresql://todouser:todopass@172.31.84.125:5432/todoapp
psql -h 172.31.0.10 -U postgres -d mydb


curl -X 'GET' \
  'http://172.31.84.188:8000/todos?skip=0&limit=100' \
  -H 'accept: application/json'