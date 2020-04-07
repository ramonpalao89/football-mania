function ResultsEvents({ events, onToResults, detail }) {
    const { future, past } = events
    const { strAlternate } = detail
    
    return <div>
        {/* <a href="" onClick={event => {
            event.preventDefault()
            onToResults()
        }}>Go back to Results</a> */}

        <Breadcrumb items={[{ title: 'Results', breadcrumbClick: onToResults }, { title: strAlternate, breadcrumbClick: undefined }]} />

        <h2>Past Events</h2>
        {past && <div className="events">
            {past.map((item, index) => <ItemEvents key={index} item={item} />)}
        </div>}

        <h2>Next Events</h2>
        {future && <div className="events">
            {future.map((item, index) => <ItemEvents key={index} item={item} />)}
        </div>}
    </div>
}