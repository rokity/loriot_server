#!/bin/sh
curl -X POST \
  https://eu1.loriot.io/1/rest \
-H 'Authorization: Bearer vnolYgAAAA1ldTEubG9yaW90LmlvDiJiwQnkwkVoNcNP-ZepCA==' \
-H 'Cache-Control: no-cache' \
-H 'Content-Type: application/json' \
-d '{
"cmd": "tx",
"EUI": "C0EE400001025558",
"port": 2,
"confirmed": false,
"data": "0c0303ffff06010c",
"appid": "BE7A2562"
}'
