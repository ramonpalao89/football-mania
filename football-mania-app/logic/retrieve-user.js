/**
 * @param {string} token - User's authorization token.
 * @param {function} callback - Callback to execute after retrieving user's information. It returns error and an object
 * @throws Will throw an error if an argument doesn't match it's type
 */

function retrieveUser(token, callback) {
    if (typeof token !== 'string') throw new TypeError(`token ${token} is not a string`)

    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) throw new Error('invalid token')

    const { sub } = JSON.parse(atob(payload))

    if (!sub) throw new Error('no user id in token')

    if (typeof callback !== 'function') throw new TypeError(`callback ${callback} is not a function`)

    call(`https://skylabcoders.herokuapp.com/api/v2/users/${sub}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (error, response) => {
        if (error) return callback(error)

        const data = JSON.parse(response.content), { error: _error } = data

        if (_error) return callback(new Error(_error))

        const { name, surname, age, city, username, flag } = data
        
        if (!flag || flag !== 'football-mania-app') return callback(new Error("Access denied!"))

        callback(undefined, { name, surname, age, city, username })
    })
}