# POST http://localhost:8191/v1
# {
#     "cmd": "request.get",
#     "url": "https://mkvdrama.net/781538-perfect-crown",
#     "maxTimeout": 20000,
#     "waitInSeconds": 3,
#     "session": "mkvdrama"
# }

POST {{FLARESOLVERR_URL}}/v1
Authorization: {{FLARESOLVERR_AUTH_METHOD}} {{FLARESOLVERR_AUTH_VALUE}}
{
    "cmd": "request.get",
    "url": "https://mkvdrama.net/781538-perfect-crown/",
    "maxTimeout": 20000,
    "waitInSeconds": 3,
    "session": "mkvdrama"
}

# POST http://localhost:8191/v1
# {
#     "cmd": "sessions.create",
#     "session": "mkvdrama"
# }