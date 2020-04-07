describe('searchTeams', () => {
    let name, surname, age, city, username, password, token, ids, index, query

    ids = []
    for (let i = 0; i < 4; i++) {
        ids.push(Math.floor(Math.random() * 20))
    }

    const queryIds = ["Barcelona", "Ath", "Real", "Alaves"]

    beforeEach(() => {
        name = 'name-' + Math.random()
        surname = 'surname-' + Math.random()
        age = "age-" + Math.random()
        city = "city-" + Math.random()
        username = 'username-' + Math.random()
        password = 'password-' + Math.random()

        index = Math.floor(Math.random() * 4)
        query = queryIds[index]


        //query = Object.keys(queryIds).random()
        //ids = queryIds[query]
    })

    describe('when user already exists', () => {
        beforeEach(done => {

            call(`https://skylabcoders.herokuapp.com/api/v2/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, surname, age, city, username, password })
            }, (error, response) => {
                if (error) return done(error)

                if (response.content) {
                    const { error } = JSON.parse(response.content)

                    if (error) return done(new Error(error))
                }

                call(`https://skylabcoders.herokuapp.com/api/v2/users/auth`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                }, (error, response) => {
                    if (error) return done(error)

                    const { error: _error, token: _token } = JSON.parse(response.content)

                    if (_error) return done(new Error(_error))

                    token = _token

                    done()
                })
            })
        })

        it('should get results on matching ids but no favorites if not previously added', done => {

            searchTeams(query, token, (error, teams) => {
                expect(error).toBeUndefined()

                expect(teams).toBeDefined()
                expect(teams.length).toBeGreaterThan(0)

                teams.forEach(team => {
                    expect(typeof team.idTeam).toBe('string')
                    expect(typeof team.strStadium).toBe('string')
                    expect(typeof team.strAlternate).toBe('string')
                    expect(typeof team.strTeamBadge).toBe('string')
                    expect(team.isFavorited).toBeInstanceOf(Boolean)

                })

                done()
            })
        })

        it('should succeed on non-matching query returning an empty array', done => {
            searchTeams('asdasdfñlajsfklasldñkfjañlsjflasjflasjfñladjs', token, (error, results) => {
                expect(error).toBeDefined()

                expect(results).toBeUndefined()

                done()
            })
        })

        it('should fail on invalid token', done => {

            searchTeams(query, `${token}-wrong`, error => {
                expect(error).toBeInstanceOf(Error)
                //expect(error.message).toBe('invalid token')

                done()
            })
        })



    })


    describe('when fav teams already exists', () => {

        beforeEach(done => {
            call(`https://skylabcoders.herokuapp.com/api/v2/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, surname, age, city, username, password })
                }, (error, response) => {
                    if (error) return done(error)
    
                    if (response.content) {
                        const { error } = JSON.parse(response.content)
    
                        if (error) return done(new Error(error))
                    }

                    call(`https://skylabcoders.herokuapp.com/api/v2/users/auth`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    }, (error, response) => {
                        if (error) return done(error)

                        const { error: _error, token: _token } = JSON.parse(response.content)

                        if (_error) return done(new Error(_error))

                        token = _token
                        const favs = ids
            
                        call(`https://skylabcoders.herokuapp.com/api/v2/users/`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ favs })
                        }, (error, response) => {
                            if (error) return done(error)
            
                            if (response.content) {
                                const { error } = JSON.parse(response.content)
            
                                if (error) return done(new Error(error))
                            }
            
                            done()
                        })
                    })

                })


        })

        it('should get results on matching query with favs as previously added', done => {
            searchTeams(query, token, (error, teams) => {
                expect(error).toBeUndefined()

                expect(teams).toBeDefined()
                expect(teams.length).toBeGreaterThan(0)

                call(`https://skylabcoders.herokuapp.com/api/v2/users/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }, (error, response) => {
                    if (error) return done(error)

                    // retrieve user to check fav has been removed

                    const user = JSON.parse(response.content), { error: _error } = user

                    if (_error) return done(new Error(_error))

                    const { favs } = user

                    for (const fav of favs)
                        -                            expect(ids).toContain(fav)

                    teams.forEach(team => {
                        debugger
                        expect(typeof team.idTeam).toBe('string')
                        expect(typeof team.strStadium).toBe('string')
                        expect(typeof team.strAlternate).toBe('string')
                        expect(typeof team.strTeamBadge).toBe('string')
                        expect(typeof team.isFavorited).toBe('boolean')

                        expect(team.isFavorited).toBe(favs.includes(team.idTeam))
                    })

                    done()
                })
            })
        })
        afterEach(done => {
            call(`https://skylabcoders.herokuapp.com/api/v2/users`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            }, (error, response) => {
                if (error) return done(error)
    
                if (response.content) {
                    const { error } = JSON.parse(response.content)
    
                    if (error) return done(new Error(error))
                }
    
                done()
            })
        })
    })

        

          

        it('should fail on non-string query', () => {
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTNiZDhmZDE3YjgwOTFiYWFjMTIxMzgiLCJpYXQiOjE1ODA5ODA3NjEsImV4cCI6MTU4MDk4NDM2MX0.t8g49qXznSCYiK040NvOWHPXWqnj9riJ_6MD2vwIv3M'

            expect(() =>
                searchTeams(undefined, token, () => { })
            ).toThrowError(TypeError, 'undefined is not a string')

            expect(() =>
                searchTeams(1, token, () => { })
            ).toThrowError(TypeError, '1 is not a string')

            expect(() =>
                searchTeams(true, token, () => { })
            ).toThrowError(TypeError, 'true is not a string')

            expect(() =>
                searchTeams({}, token, () => { })
            ).toThrowError(TypeError, '[object Object] is not a string')
        })

        it('should fail on non-function callback', () => {
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTNiZDhmZDE3YjgwOTFiYWFjMTIxMzgiLCJpYXQiOjE1ODA5ODA3NjEsImV4cCI6MTU4MDk4NDM2MX0.t8g49qXznSCYiK040NvOWHPXWqnj9riJ_6MD2vwIv3M'

            expect(() =>
                searchTeams(query, token, undefined)
            ).toThrowError(TypeError, 'undefined is not a function')

            expect(() =>
                searchTeams(query, token, 1)
            ).toThrowError(TypeError, '1 is not a function')

            expect(() =>
                searchTeams(query, token, true)
            ).toThrowError(TypeError, 'true is not a function')

            expect(() =>
                searchTeams(query, token, {})
            ).toThrowError(TypeError, '[object Object] is not a function')
        })

})
