tmdb_to_http_map = {
    # 3  => Authentication failed (could also be invalid credentials) => 401 Unauthorized
    3: 401,

    # 6  => Invalid id, or the resource is not found => 404 Not Found
    6: 404,

    # 7  => Invalid API key => 401 Unauthorized
    7: 401,

    # 10 => Suspended API key => 403 Forbidden (the key is no longer allowed)
    10: 403,

    # 11 => Internal error => 500 Internal Server Error
    11: 500,

    # 14 => Authentication failed (another variant) => 401 Unauthorized
    14: 401,

    # 16 => Device denied => 403 Forbidden (client not allowed access)
    16: 403,

    # 17 => Session denied => 403 Forbidden (client not allowed access)
    17: 403,

    # 22 => Invalid page => 400 Bad Request
    22: 400,

    # 24 => Invalid repeat value => 400 Bad Request
    24: 400,

    # 25 => You haven't included a search query => 400 Bad Request
    25: 400,

    # 26 => Your request to the endpoint is not valid => 400 Bad Request
    26: 400,

    # 28 => Your request was blocked => 403 Forbidden
    28: 403,

    # 34 => Resource not found => 404 Not Found
    34: 404,
}
